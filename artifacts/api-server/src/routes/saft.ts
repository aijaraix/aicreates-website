import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import {
  db,
  commitmentsTable,
  saftSubmissionsTable,
  commitmentAllocationsTable,
  investorProfilesTable,
} from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { renderSaftPdf, type SaftAllocationLine, type SaftProfileForPdf } from "../lib/saftPdf";
import { ROUND_BY_SLUG, getRoundLabel } from "../lib/rounds";

const router: IRouter = Router();

interface SaftBody {
  walletAddress?: string;
  walletChain?: string;
  paymentMethod?: "card" | "ach" | "wire" | "crypto";
  accreditationCategory?: string;
  investmentExperience?: string;
  relationshipToCompany?: string;
  acknowledgments?: Record<string, boolean>;
  riskAcknowledgments?: Record<string, boolean>;
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

async function loadAllocationsForCommitment(
  commitmentId: string,
  legacy: { roundSlug: string; tokens: number; amountCents: number },
): Promise<SaftAllocationLine[]> {
  const lines = await db
    .select()
    .from(commitmentAllocationsTable)
    .where(eq(commitmentAllocationsTable.commitmentId, commitmentId))
    .orderBy(asc(commitmentAllocationsTable.createdAt));
  if (lines.length === 0) {
    // Legacy fallback: synthesize a single-line allocation from parent.
    const round = ROUND_BY_SLUG.get(legacy.roundSlug);
    return [
      {
        roundSlug: legacy.roundSlug,
        roundLabel: getRoundLabel(legacy.roundSlug),
        tokens: legacy.tokens,
        pricePerTokenMillicents: round?.pricePerTokenMillicents ?? 0,
        usdCents: legacy.amountCents,
      },
    ];
  }
  return lines.map((l) => ({
    roundSlug: l.roundSlug,
    roundLabel: getRoundLabel(l.roundSlug),
    tokens: l.tokens,
    pricePerTokenMillicents: l.pricePerTokenMillicents,
    usdCents: l.usdCents,
  }));
}

function expectedSignerName(profile: typeof investorProfilesTable.$inferSelect): string {
  if (profile.kind === "business") {
    return (profile.signatoryName ?? "").trim();
  }
  return `${profile.legalFirstName ?? ""} ${profile.legalLastName ?? ""}`
    .trim()
    .replace(/\s+/g, " ");
}

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
  const allocations = await db
    .select()
    .from(commitmentAllocationsTable)
    .where(eq(commitmentAllocationsTable.commitmentId, commitment.id))
    .orderBy(asc(commitmentAllocationsTable.createdAt));
  const profileRows = await db
    .select()
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, req.appUser!.id))
    .limit(1);
  res.json({
    commitment,
    submission: submissions[0] ?? null,
    requiredAcknowledgments: ACK_TEXT,
    allocations: allocations.map((a) => ({
      roundSlug: a.roundSlug,
      roundLabel: getRoundLabel(a.roundSlug),
      tokens: a.tokens,
      usdCents: a.usdCents,
      pricePerTokenMillicents: a.pricePerTokenMillicents,
    })),
    profile: profileRows[0] ?? null,
  });
});

router.post("/saft/:commitId", requireAuth, async (req, res) => {
  const id = req.params["commitId"] as string | undefined;
  if (!id) {
    res.status(400).json({ error: "commitId required" });
    return;
  }
  const body = (req.body ?? {}) as SaftBody;

  // Profile must exist; identity is sourced from it (no longer in body).
  const profileRows = await db
    .select()
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, req.appUser!.id))
    .limit(1);
  const profile = profileRows[0];
  if (!profile) {
    res.status(403).json({
      error: "Investor profile required before signing the SAFT.",
      code: "profile_required",
    });
    return;
  }

  const errors: string[] = [];
  const accreditationCategory =
    typeof body.accreditationCategory === "string" &&
    body.accreditationCategory.trim()
      ? body.accreditationCategory.trim().slice(0, 120)
      : "";
  if (!accreditationCategory) errors.push("accreditationCategory required");
  const signatureName =
    typeof body.signatureName === "string" ? body.signatureName.trim() : "";
  if (!signatureName) errors.push("signatureName required");
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
  const walletAddressTrimmed = body.walletAddress?.trim() ?? "";
  const walletChain = walletAddressTrimmed
    ? (body.walletChain?.trim() || null)
    : null;
  if (walletAddressTrimmed && !walletChain) {
    errors.push("walletChain required when walletAddress is provided");
  }
  // Signature must match the legal name from the profile.
  const expectedName = expectedSignerName(profile);
  if (
    signatureName &&
    expectedName &&
    signatureName.toLowerCase() !== expectedName.toLowerCase()
  ) {
    errors.push(
      `signatureName must match profile legal name (${expectedName})`,
    );
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

  const allocations = await loadAllocationsForCommitment(commitment.id, {
    roundSlug: commitment.roundSlug,
    tokens: commitment.tokenAllocation,
    amountCents: commitment.amountCents,
  });

  const signedAt = new Date();
  const signerIp: string | null =
    (req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")[0]
      ?.trim() ||
    req.socket.remoteAddress ||
    null;
  const ua = (req.headers["user-agent"] as string | undefined) ?? "";

  const profileForPdf: SaftProfileForPdf = {
    kind: profile.kind === "business" ? "business" : "individual",
    email: profile.email,
    phone: profile.phone,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    city: profile.city,
    region: profile.region,
    postalCode: profile.postalCode,
    country: profile.country,
    legalFirstName: profile.legalFirstName,
    legalLastName: profile.legalLastName,
    dateOfBirth: profile.dateOfBirth,
    taxIdLast4: profile.taxIdLast4,
    legalEntityName: profile.legalEntityName,
    entityType: profile.entityType,
    jurisdictionOfFormation: profile.jurisdictionOfFormation,
    einLast4: profile.einLast4,
    signatoryName: profile.signatoryName,
    signatoryTitle: profile.signatoryTitle,
  };

  const pdfBytes = await renderSaftPdf({
    commitmentId: commitment.id,
    profile: profileForPdf,
    allocations,
    walletAddress: walletAddressTrimmed || undefined,
    walletChain,
    paymentMethod,
    accreditationCategory,
    acknowledgments: REQUIRED_ACK_KEYS.map((k) => ACK_TEXT[k] ?? k),
    signatureName,
    signedAt: signedAt.toISOString(),
    signerIp,
  });

  const safePayload = {
    profileSnapshot: profileForPdf,
    allocations,
    walletAddress: walletAddressTrimmed || null,
    walletChain,
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
  };

  await db.transaction(async (tx) => {
    const submissionKey = `saft/${commitment.id}.pdf`;
    await tx
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
      });
    await tx
      .update(commitmentsTable)
      .set({
        state: "pending_payment",
        status: "pending_payment",
        paymentMethod,
        saftSignedAt: signedAt,
        saftPdfKey: submissionKey,
        walletAddress: walletAddressTrimmed || commitment.walletAddress,
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
 * Live PDF preview from in-progress form data. Does NOT persist anything.
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
  const profileRows = await db
    .select()
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, req.appUser!.id))
    .limit(1);
  const profile = profileRows[0];
  if (!profile) {
    res.status(403).json({ error: "profile_required" });
    return;
  }
  const allocations = await loadAllocationsForCommitment(commitment.id, {
    roundSlug: commitment.roundSlug,
    tokens: commitment.tokenAllocation,
    amountCents: commitment.amountCents,
  });
  const body = (req.body ?? {}) as SaftBody;
  const safeStr = (v: unknown, fb = "(pending)") =>
    typeof v === "string" && v.trim() ? v.trim() : fb;
  const profileForPdf: SaftProfileForPdf = {
    kind: profile.kind === "business" ? "business" : "individual",
    email: profile.email,
    phone: profile.phone,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    city: profile.city,
    region: profile.region,
    postalCode: profile.postalCode,
    country: profile.country,
    legalFirstName: profile.legalFirstName,
    legalLastName: profile.legalLastName,
    dateOfBirth: profile.dateOfBirth,
    taxIdLast4: profile.taxIdLast4,
    legalEntityName: profile.legalEntityName,
    entityType: profile.entityType,
    jurisdictionOfFormation: profile.jurisdictionOfFormation,
    einLast4: profile.einLast4,
    signatoryName: profile.signatoryName,
    signatoryTitle: profile.signatoryTitle,
  };
  const pdfBytes = await renderSaftPdf({
    commitmentId: commitment.id,
    profile: profileForPdf,
    allocations,
    walletAddress: body.walletAddress?.trim() || undefined,
    walletChain: body.walletChain?.trim() || null,
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
