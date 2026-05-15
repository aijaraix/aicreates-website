import { Router, type IRouter } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requireAuth } from "../lib/auth";
import {
  db,
  commitmentsTable,
  saftSubmissionsTable,
  commitmentAllocationsTable,
  investorProfilesTable,
} from "@workspace/db";
import { eq, and, asc, desc, isNull } from "drizzle-orm";
import { renderSaftPdf, type SaftAllocationLine, type SaftProfileForPdf } from "../lib/saftPdf";
import { ROUND_BY_SLUG, getRoundLabel } from "../lib/rounds";
import { emailSaftSigned } from "../lib/email";

const router: IRouter = Router();

interface SaftBody {
  walletAddress?: string;
  walletChain?: string;
  paymentMethod?: "fiat" | "card" | "ach" | "wire" | "crypto";
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

// Public route: serve the unsigned SAFT template so prospective investors
// can review/download the document before signing. No auth required.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let cachedTemplate: Buffer | null = null;
async function loadTemplate(): Promise<Buffer> {
  if (cachedTemplate) return cachedTemplate;
  const candidates = [
    path.resolve(__dirname, "../../assets/saft-template.pdf"),
    path.resolve(__dirname, "../assets/saft-template.pdf"),
    path.resolve(process.cwd(), "artifacts/api-server/assets/saft-template.pdf"),
  ];
  for (const p of candidates) {
    try {
      cachedTemplate = await readFile(p);
      return cachedTemplate;
    } catch {
      /* keep searching */
    }
  }
  throw new Error("SAFT template not found");
}
router.get("/saft/template.pdf", async (_req, res) => {
  try {
    const buf = await loadTemplate();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="AIcreatesAI-SAFT-template.pdf"',
    );
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: "template unavailable" });
  }
});

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
    .where(
      and(
        eq(saftSubmissionsTable.commitmentId, commitment.id),
        isNull(saftSubmissionsTable.supersededAt),
      ),
    )
    .orderBy(desc(saftSubmissionsTable.signedAt))
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
  // Accreditation category is now optional - investors can decline to state.
  const accreditationCategory =
    typeof body.accreditationCategory === "string" &&
    body.accreditationCategory.trim()
      ? body.accreditationCategory.trim().slice(0, 120)
      : "decline_to_state";
  const signatureName =
    typeof body.signatureName === "string" ? body.signatureName.trim() : "";
  if (!signatureName) errors.push("signatureName required");
  const paymentMethod =
    body.paymentMethod === "fiat" ||
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
  // Defensive: any prior un-superseded SAFT for this commitment is
  // marked superseded before we insert the new one. Normally amend
  // already does this, but a stale row from before the amend feature
  // existed would otherwise live alongside the new submission.

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
      .update(saftSubmissionsTable)
      .set({ status: "superseded", supersededAt: signedAt })
      .where(
        and(
          eq(saftSubmissionsTable.commitmentId, commitment.id),
          isNull(saftSubmissionsTable.supersededAt),
        ),
      );
    await tx.insert(saftSubmissionsTable).values({
      commitmentId: commitment.id,
      userId: req.appUser!.id,
      status: "draft",
      payload: safePayload,
      signatureName,
      signedAt,
      signerIp,
      signerUserAgent: ua,
      pdfBytes,
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

  // Investor-facing confirmation email. Fire-and-forget; never blocks
  // the response. The email lib silently no-ops if Resend is not wired.
  const totalTokens = allocations.reduce((s, a) => s + a.tokens, 0);
  const totalCents = allocations.reduce((s, a) => s + a.usdCents, 0);
  // Prefer the configured canonical portal origin for transactional email
  // links so investor receipts always point at the live host even when the
  // request originated from a preview or non-canonical origin. Falls back
  // to the request origin in dev where PUBLIC_PORTAL_ORIGIN isn't set.
  const origin =
    process.env["PUBLIC_PORTAL_ORIGIN"] ??
    (req.headers["origin"] as string | undefined) ??
    `${req.protocol}://${req.get("host")}`;
  void emailSaftSigned({
    to: profile.email,
    investorName:
      profile.kind === "business"
        ? profile.legalEntityName ?? profile.signatoryName ?? profile.email
        : `${profile.legalFirstName ?? ""} ${profile.legalLastName ?? ""}`.trim() ||
          profile.email,
    commitmentId: commitment.id,
    totalCents,
    totalTokens,
    paymentMethod,
    portalUrl: `${origin}/invest/checkout/${commitment.id}`,
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
      countersignedPdfBytes: saftSubmissionsTable.countersignedPdfBytes,
      countersignedAt: saftSubmissionsTable.countersignedAt,
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
        isNull(saftSubmissionsTable.supersededAt),
      ),
    )
    .orderBy(desc(saftSubmissionsTable.signedAt))
    .limit(1);
  const sub = rows[0];
  if (!sub || !sub.pdfBytes) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  // Prefer the fully-executed (countersigned) PDF when available so the
  // dashboard "SAFT PDF" link always serves the latest, most-binding
  // version of the document.
  const bytes = sub.countersignedPdfBytes ?? sub.pdfBytes;
  const suffix = sub.countersignedPdfBytes ? "fully-executed" : "signed";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="aica-saft-${suffix}-${id}.pdf"`,
  );
  res.send(bytes);
});

/**
 * Pre-populated draft download. Renders a SAFT for the requesting
 * investor using their current profile + commitment + allocation data,
 * before they have completed the on-screen sign flow. Useful for
 * sharing with counsel or saving a record of what the document will
 * look like once signed. Does NOT persist anything.
 */
router.get("/saft/:commitId/draft.pdf", requireAuth, async (req, res) => {
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
  const expectedName = expectedSignerName(profile) || "(unsigned draft)";
  const pdfBytes = await renderSaftPdf({
    commitmentId: commitment.id,
    profile: profileForPdf,
    allocations,
    walletAddress: commitment.walletAddress ?? undefined,
    walletChain: null,
    paymentMethod: commitment.paymentMethod ?? "(to be selected)",
    accreditationCategory: commitment.accreditationStatus ?? "(to be selected)",
    acknowledgments: REQUIRED_ACK_KEYS.map((k) => ACK_TEXT[k] ?? k),
    signatureName: `${expectedName} (DRAFT - UNSIGNED)`,
    signedAt: new Date().toISOString(),
    signerIp: null,
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="aica-saft-draft-${commitment.id}.pdf"`,
  );
  res.send(Buffer.from(pdfBytes));
});

export default router;
