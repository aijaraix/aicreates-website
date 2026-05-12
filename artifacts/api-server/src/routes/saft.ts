import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import {
  db,
  commitmentsTable,
  saftSubmissionsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { renderSaftPdf } from "../lib/saftPdf";
import { getRoundLabel } from "../lib/rounds";

const router: IRouter = Router();

interface SaftBody {
  legalName?: string;
  entityType?: "individual" | "entity";
  email?: string;
  phone?: string;
  address?: string;
  jurisdiction?: string;
  dobOrFormation?: string;
  taxId?: string;
  walletAddress?: string;
  paymentMethod?: "card" | "ach" | "wire" | "crypto";
  accreditationCategory?: string;
  investmentExperience?: string;
  relationshipToCompany?: string;
  acknowledgments?: Record<string, boolean>;
  riskAcknowledgments?: Record<string, boolean>;
  walletChain?: string;
  signatureName?: string;
  signatureIntent?: boolean;
}

const REQUIRED_RISK_KEYS = [
  "regulatoryRisk",
  "marketRisk",
  "technologyRisk",
  "executionRisk",
  "concentrationRisk",
  "noRecoveryRisk",
  "noGuaranteedReturns",
  "noListingPromise",
  "jurisdictionRestrictions",
];

const REQUIRED_ACK_KEYS = [
  "highRisk",
  "noOwnership",
  "consumptiveUse",
  "illiquidity",
  "vestingLockup",
  "noGeneralSolicitation",
  "confidentiality",
  "taxResponsibility",
];

const ACK_TEXT: Record<string, string> = {
  highRisk:
    "I understand this is a high-risk early-stage investment and I may lose all funds.",
  noOwnership:
    "I understand SAFT tokens do not represent equity or ownership in AICreatesAI.",
  consumptiveUse:
    "I am acquiring AICA for consumptive use within the AICreatesAI ecosystem.",
  illiquidity:
    "I understand AICA tokens may be illiquid and have no established secondary market.",
  vestingLockup:
    "I understand and accept the vesting schedule and lockup terms.",
  noGeneralSolicitation:
    "I was not solicited through general advertising or public communication.",
  confidentiality:
    "I will keep all materials, terms, and code names confidential.",
  taxResponsibility:
    "I am solely responsible for the tax treatment of any tokens received.",
};

router.get("/saft/:commitId", requireAuth, async (req, res) => {
  const id = req.params["commitId"] as string | undefined;
  if (!id) {
    res.status(400).json({ error: "commitId required" });
    return;
  }
  const rows = await db
    .select()
    .from(commitmentsTable)
    .where(
      and(
        eq(commitmentsTable.id, id),
        eq(commitmentsTable.userId, req.appUser!.id),
      ),
    )
    .limit(1);
  const commitment = rows[0];
  if (!commitment) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const submissions = await db
    .select({
      id: saftSubmissionsTable.id,
      status: saftSubmissionsTable.status,
      payload: saftSubmissionsTable.payload,
      signatureName: saftSubmissionsTable.signatureName,
      signedAt: saftSubmissionsTable.signedAt,
      version: saftSubmissionsTable.version,
    })
    .from(saftSubmissionsTable)
    .where(eq(saftSubmissionsTable.commitmentId, commitment.id))
    .limit(1);
  res.json({
    commitment,
    submission: submissions[0] ?? null,
    requiredAcknowledgments: ACK_TEXT,
  });
});

router.post("/saft/:commitId", requireAuth, async (req, res) => {
  const id = req.params["commitId"] as string | undefined;
  if (!id) {
    res.status(400).json({ error: "commitId required" });
    return;
  }
  const body = (req.body ?? {}) as SaftBody;

  const errors: string[] = [];
  const requireStr = (k: string, v: unknown, max = 200) => {
    if (typeof v !== "string" || !v.trim() || v.length > max) {
      errors.push(`${k} required`);
      return "";
    }
    return v.trim();
  };

  const legalName = requireStr("legalName", body.legalName);
  const entityType =
    body.entityType === "entity" ? "entity" : "individual";
  const email = requireStr("email", body.email, 254);
  const address = requireStr("address", body.address, 500);
  const jurisdiction = requireStr("jurisdiction", body.jurisdiction, 80);
  const taxId = requireStr("taxId", body.taxId, 32);
  const accreditationCategory = requireStr(
    "accreditationCategory",
    body.accreditationCategory,
    120,
  );
  const signatureName = requireStr("signatureName", body.signatureName, 200);
  const paymentMethod =
    body.paymentMethod === "card" ||
    body.paymentMethod === "ach" ||
    body.paymentMethod === "wire" ||
    body.paymentMethod === "crypto"
      ? body.paymentMethod
      : null;
  if (!paymentMethod) errors.push("paymentMethod required");
  if (body.signatureIntent !== true) errors.push("signatureIntent required");
  const acks = body.acknowledgments ?? {};
  const missingAcks = REQUIRED_ACK_KEYS.filter((k) => acks[k] !== true);
  if (missingAcks.length) {
    errors.push(`acknowledgments required: ${missingAcks.join(", ")}`);
  }
  const riskAcks = body.riskAcknowledgments ?? {};
  const missingRisk = REQUIRED_RISK_KEYS.filter((k) => riskAcks[k] !== true);
  if (missingRisk.length) {
    errors.push(`riskAcknowledgments required: ${missingRisk.join(", ")}`);
  }
  // Wallet mapping is optional at SAFT signing — investors may defer wallet
  // setup until before TGE. If an address is provided, a chain must accompany
  // it; a chain alone (default selection) without an address is treated as
  // "skip / map later".
  const walletAddressTrimmed = body.walletAddress?.trim() ?? "";
  const walletChain = walletAddressTrimmed
    ? (body.walletChain?.trim() || null)
    : null;
  if (walletAddressTrimmed && !walletChain) {
    errors.push("walletChain required when walletAddress is provided");
  }
  if (
    signatureName &&
    legalName &&
    signatureName.trim().toLowerCase() !== legalName.trim().toLowerCase()
  ) {
    errors.push("signatureName must match legalName");
  }
  if (errors.length || !paymentMethod) {
    res.status(400).json({ error: "Validation failed", errors });
    return;
  }

  const rows = await db
    .select()
    .from(commitmentsTable)
    .where(
      and(
        eq(commitmentsTable.id, id),
        eq(commitmentsTable.userId, req.appUser!.id),
      ),
    )
    .limit(1);
  const commitment = rows[0];
  if (!commitment) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (commitment.state === "funded" || commitment.status === "succeeded") {
    res
      .status(400)
      .json({ error: "Cannot re-sign a funded commitment" });
    return;
  }

  const signedAt = new Date();
  const signerIp: string | null =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    null;
  const ua = (req.headers["user-agent"] as string | undefined) ?? "";

  const pdfBytes = await renderSaftPdf({
    commitmentId: commitment.id,
    amountUsd: Math.round(commitment.amountCents / 100),
    roundLabel: getRoundLabel(commitment.roundSlug),
    tokenAllocation: commitment.tokenAllocation,
    legalName,
    entityType,
    email,
    address,
    jurisdiction,
    taxIdLast4: taxId.replace(/\D/g, "").slice(-4),
    walletAddress: body.walletAddress?.trim() || undefined,
    paymentMethod,
    accreditationCategory,
    acknowledgments: REQUIRED_ACK_KEYS.map((k) => ACK_TEXT[k] ?? k),
    signatureName,
    signedAt: signedAt.toISOString(),
    signerIp,
  });

  // Strip taxId before persisting payload (only last4 is kept).
  const safePayload = {
    legalName,
    entityType,
    email,
    phone: body.phone?.trim() || null,
    address,
    jurisdiction,
    dobOrFormation: body.dobOrFormation?.trim() || null,
    taxIdLast4: taxId.replace(/\D/g, "").slice(-4),
    walletAddress: body.walletAddress?.trim() || null,
    paymentMethod,
    accreditationCategory,
    investmentExperience: body.investmentExperience?.trim() || null,
    relationshipToCompany: body.relationshipToCompany?.trim() || null,
    acknowledgments: REQUIRED_ACK_KEYS.reduce<Record<string, boolean>>(
      (acc, k) => {
        acc[k] = true;
        return acc;
      },
      {},
    ),
    riskAcknowledgments: REQUIRED_RISK_KEYS.reduce<Record<string, boolean>>(
      (acc, k) => {
        acc[k] = true;
        return acc;
      },
      {},
    ),
    walletChain,
  };

  await db.transaction(async (tx) => {
    const submissionKey = `saft/${commitment.id}.pdf`;
    const insertedRows = await tx
      .insert(saftSubmissionsTable)
      .values({
        commitmentId: commitment.id,
        userId: req.appUser!.id,
        status: "draft",
        payload: safePayload,
        signatureName,
        signedAt,
        signerIp,
        signerUserAgent: ua,
        pdfBytes,
      })
      .onConflictDoUpdate({
        target: saftSubmissionsTable.commitmentId,
        set: {
          status: "draft",
          payload: safePayload,
          signatureName,
          signedAt,
          signerIp,
          signerUserAgent: ua,
          pdfBytes,
        },
      })
      .returning();
    void insertedRows;
    await tx
      .update(commitmentsTable)
      .set({
        state: "pending_payment",
        status: "pending_payment",
        paymentMethod,
        saftSignedAt: signedAt,
        saftPdfKey: submissionKey,
        walletAddress: body.walletAddress?.trim() || commitment.walletAddress,
        accreditationStatus: accreditationCategory,
        kycStatus:
          commitment.kycStatus === "none" ? "declared" : commitment.kycStatus,
        updatedAt: new Date(),
      })
      .where(eq(commitmentsTable.id, commitment.id));
  });

  res.json({ ok: true, commitmentId: commitment.id });
});

/**
 * Live PDF preview from in-progress form data. Does NOT persist anything —
 * used by the Signature step in /invest/saft/:commitId so investors see
 * exactly what they are about to sign.
 */
router.post("/saft/:commitId/preview", requireAuth, async (req, res) => {
  const id = req.params["commitId"] as string | undefined;
  if (!id) {
    res.status(400).json({ error: "commitId required" });
    return;
  }
  const rows = await db
    .select()
    .from(commitmentsTable)
    .where(
      and(
        eq(commitmentsTable.id, id),
        eq(commitmentsTable.userId, req.appUser!.id),
      ),
    )
    .limit(1);
  const commitment = rows[0];
  if (!commitment) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const body = (req.body ?? {}) as SaftBody;
  const safeStr = (v: unknown, fb = "(pending)") =>
    typeof v === "string" && v.trim() ? v.trim() : fb;
  const taxIdLast4 = (body.taxId ?? "").replace(/\D/g, "").slice(-4);
  const pdfBytes = await renderSaftPdf({
    commitmentId: commitment.id,
    amountUsd: Math.round(commitment.amountCents / 100),
    roundLabel: getRoundLabel(commitment.roundSlug),
    tokenAllocation: commitment.tokenAllocation,
    legalName: safeStr(body.legalName, "(your legal name)"),
    entityType: body.entityType === "entity" ? "entity" : "individual",
    email: safeStr(body.email, "(your email)"),
    address: safeStr(body.address, "(your address)"),
    jurisdiction: safeStr(body.jurisdiction, "(your jurisdiction)"),
    taxIdLast4,
    walletAddress: body.walletAddress?.trim() || undefined,
    paymentMethod: safeStr(body.paymentMethod, "(to be selected)"),
    accreditationCategory: safeStr(
      body.accreditationCategory,
      "(to be selected)",
    ),
    acknowledgments: REQUIRED_ACK_KEYS.map((k) => ACK_TEXT[k] ?? k),
    signatureName: safeStr(body.signatureName, "(unsigned draft)"),
    signedAt: new Date().toISOString(),
    signerIp: null,
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="saft-preview-${commitment.id}.pdf"`,
  );
  res.send(Buffer.from(pdfBytes));
});

router.get("/saft/:commitId/pdf", requireAuth, async (req, res) => {
  const id = req.params["commitId"] as string | undefined;
  if (!id) {
    res.status(400).json({ error: "commitId required" });
    return;
  }
  const rows = await db
    .select({
      pdfBytes: saftSubmissionsTable.pdfBytes,
      userId: saftSubmissionsTable.userId,
    })
    .from(saftSubmissionsTable)
    .innerJoin(
      commitmentsTable,
      eq(commitmentsTable.id, saftSubmissionsTable.commitmentId),
    )
    .where(
      and(
        eq(saftSubmissionsTable.commitmentId, id),
        eq(commitmentsTable.userId, req.appUser!.id),
      ),
    )
    .limit(1);
  const sub = rows[0];
  if (!sub || !sub.pdfBytes) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="aica-saft-${id}.pdf"`,
  );
  res.send(sub.pdfBytes);
});

export default router;
