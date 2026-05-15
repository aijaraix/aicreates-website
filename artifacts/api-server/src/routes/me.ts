import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import {
  db,
  appUsersTable,
  commitmentsTable,
  saftSubmissionsTable,
  commitmentAllocationsTable,
  adminAuditLogTable,
} from "@workspace/db";
import { eq, desc, inArray, asc, and, isNull } from "drizzle-orm";
import { computeVestingSchedule } from "../lib/vesting";
import { getRoundLabel, ROUND_BY_SLUG } from "../lib/rounds";

const router: IRouter = Router();

function detectStripeMode(): "test" | "live" | "unknown" {
  const k =
    process.env["STRIPE_SECRET_KEY"] ??
    process.env["STRIPE_API_KEY"] ??
    "";
  if (k.startsWith("sk_live_")) return "live";
  if (k.startsWith("sk_test_")) return "test";
  return "unknown";
}

router.get("/me", requireAuth, async (req, res) => {
  const user = req.appUser!;
  const commitments = await db
    .select()
    .from(commitmentsTable)
    .where(eq(commitmentsTable.userId, user.id))
    .orderBy(desc(commitmentsTable.createdAt))
    .limit(100);
  res.json({ user, commitments, stripeMode: detectStripeMode() });
});

router.get("/me/allocations", requireAuth, async (req, res) => {
  const user = req.appUser!;
  const commitments = await db
    .select()
    .from(commitmentsTable)
    .where(eq(commitmentsTable.userId, user.id))
    .orderBy(desc(commitmentsTable.createdAt))
    .limit(100);
  const saftRows = await db
    .select({
      commitmentId: saftSubmissionsTable.commitmentId,
      status: saftSubmissionsTable.status,
      signedAt: saftSubmissionsTable.signedAt,
      signatureName: saftSubmissionsTable.signatureName,
      payload: saftSubmissionsTable.payload,
      countersignedAt: saftSubmissionsTable.countersignedAt,
      countersignerName: saftSubmissionsTable.countersignerName,
    })
    .from(saftSubmissionsTable)
    .where(
      and(
        eq(saftSubmissionsTable.userId, user.id),
        isNull(saftSubmissionsTable.supersededAt),
      ),
    )
    .orderBy(desc(saftSubmissionsTable.signedAt));
  // saftRows is newest-first; first occurrence per commitment wins.
  const saftByCommitment = new Map<string, (typeof saftRows)[number]>();
  for (const s of saftRows) {
    if (!saftByCommitment.has(s.commitmentId)) {
      saftByCommitment.set(s.commitmentId, s);
    }
  }

  const ids = commitments.map((c) => c.id);
  // Most recent amend audit per commitment so the dashboard can render
  // an "action required" transparency card for pending_resign rows.
  const amendRows = ids.length
    ? await db
        .select({
          targetId: adminAuditLogTable.targetId,
          actorEmail: adminAuditLogTable.actorEmail,
          details: adminAuditLogTable.details,
          createdAt: adminAuditLogTable.createdAt,
        })
        .from(adminAuditLogTable)
        .where(
          and(
            eq(adminAuditLogTable.action, "amend_commitment"),
            inArray(adminAuditLogTable.targetId, ids),
          ),
        )
        .orderBy(desc(adminAuditLogTable.createdAt))
    : [];
  const lastAmendByCommitment = new Map<
    string,
    (typeof amendRows)[number]
  >();
  for (const a of amendRows) {
    if (a.targetId && !lastAmendByCommitment.has(a.targetId)) {
      lastAmendByCommitment.set(a.targetId, a);
    }
  }

  const lineRows = ids.length
    ? await db
        .select()
        .from(commitmentAllocationsTable)
        .where(inArray(commitmentAllocationsTable.commitmentId, ids))
        .orderBy(asc(commitmentAllocationsTable.createdAt))
    : [];
  const linesByCommitment = new Map<string, typeof lineRows>();
  for (const l of lineRows) {
    const arr = linesByCommitment.get(l.commitmentId) ?? [];
    arr.push(l);
    linesByCommitment.set(l.commitmentId, arr);
  }

  const allocations = commitments.map((c) => {
    const isFunded = c.state === "funded" || c.status === "succeeded";
    const saft = saftByCommitment.get(c.id);
    const payload = (saft?.payload ?? {}) as Record<string, unknown>;
    const lines = linesByCommitment.get(c.id) ?? [];
    // Per-round vesting params drive the per-commitment schedule. For
    // multi-round commitments use the round whose tokens are largest
    // (typically the entry round) so the bar reflects the dominant
    // lockup; this also matches single-round semantics when there's only
    // one line.
    const vestingRoundSlug =
      lines.length > 1
        ? [...lines].sort((a, b) => b.tokens - a.tokens)[0]!.roundSlug
        : c.roundSlug;
    const roundVesting = ROUND_BY_SLUG.get(vestingRoundSlug)?.vesting;
    const vesting = computeVestingSchedule({
      totalTokens: c.tokenAllocation,
      fundedAt: c.fundedAt ?? c.completedAt,
      tgePercent: roundVesting?.tgePercent,
      cliffMonths: roundVesting?.cliffMonths,
      vestingMonths: roundVesting?.vestingMonths,
    });
    // Derive a top-level price-per-token for the commitment. For multi-round
    // commitments fall back to a tokens-weighted average across the per-round
    // lines so the displayed "price paid" is a true blended price.
    const roundPrice =
      ROUND_BY_SLUG.get(c.roundSlug)?.pricePerTokenMillicents ?? null;
    let pricePerTokenMillicents: number | null = roundPrice;
    if (lines.length > 1) {
      const totalTok = lines.reduce((s, l) => s + l.tokens, 0);
      const totalUsd = lines.reduce((s, l) => s + l.usdCents, 0);
      // millicents-per-token = (usdCents * 10) / tokens
      if (totalTok > 0) {
        pricePerTokenMillicents = Math.round((totalUsd * 10) / totalTok);
      }
    }
    const lastAmend = lastAmendByCommitment.get(c.id);
    const lastAmendDetails = (lastAmend?.details ?? null) as {
      actorKind?: "investor" | "admin";
      reason?: string | null;
      previous?: {
        amountCents?: number;
        roundSlug?: string;
        tokenAllocation?: number;
      };
      next?: {
        amountCents?: number;
        roundSlug?: string;
        tokenAllocation?: number;
      };
    } | null;
    return {
      id: c.id,
      roundSlug: c.roundSlug,
      tierSlug: c.tierSlug,
      displayName: c.displayName,
      amountCents: c.amountCents,
      currency: c.currency,
      tokenAllocation: c.tokenAllocation,
      pricePerTokenMillicents,
      state: c.state ?? c.status,
      paymentMethod: c.paymentMethod,
      saftSignedAt: c.saftSignedAt ?? saft?.signedAt ?? null,
      saftStatus: saft?.status ?? null,
      saftSignerName: saft?.signatureName ?? null,
      saftCountersignedAt: saft?.countersignedAt ?? null,
      saftCountersignerName: saft?.countersignerName ?? null,
      lastFailureReason: c.lastFailureReason ?? null,
      lastFailureCode: c.lastFailureCode ?? null,
      lastFailureDeclineCode: c.lastFailureDeclineCode ?? null,
      lastFailureAt: c.lastFailureAt ?? null,
      kycStatus: c.kycStatus,
      accreditationStatus: c.accreditationStatus,
      walletAddress: c.walletAddress,
      walletChain:
        typeof payload["walletChain"] === "string"
          ? (payload["walletChain"] as string)
          : null,
      fundedAt: c.fundedAt ?? c.completedAt,
      createdAt: c.createdAt,
      isFunded,
      lastAmend: lastAmend && lastAmendDetails
        ? {
            actorKind: lastAmendDetails.actorKind ?? "admin",
            actorEmail: lastAmend.actorEmail,
            reason: lastAmendDetails.reason ?? null,
            createdAt: lastAmend.createdAt,
            previousAmountCents:
              lastAmendDetails.previous?.amountCents ?? null,
            previousRoundSlug:
              lastAmendDetails.previous?.roundSlug ?? null,
            previousRoundLabel: lastAmendDetails.previous?.roundSlug
              ? getRoundLabel(lastAmendDetails.previous.roundSlug)
              : null,
            newAmountCents: lastAmendDetails.next?.amountCents ?? null,
            newRoundSlug: lastAmendDetails.next?.roundSlug ?? null,
            newRoundLabel: lastAmendDetails.next?.roundSlug
              ? getRoundLabel(lastAmendDetails.next.roundSlug)
              : null,
          }
        : null,
      vesting: isFunded ? vesting : null,
      lines: lines.map((l) => ({
        roundSlug: l.roundSlug,
        roundLabel: getRoundLabel(l.roundSlug),
        tokens: l.tokens,
        usdCents: l.usdCents,
        pricePerTokenMillicents: l.pricePerTokenMillicents,
      })),
    };
  });

  res.json({ user, allocations });
});

router.patch("/me", requireAuth, async (req, res) => {
  const { fullName } = req.body as { fullName?: string };
  if (typeof fullName !== "string" || fullName.length > 200) {
    res.status(400).json({ error: "Invalid fullName" });
    return;
  }
  const updated = await db
    .update(appUsersTable)
    .set({ fullName: fullName.trim() || null, updatedAt: new Date() })
    .where(eq(appUsersTable.id, req.appUser!.id))
    .returning();
  res.json({ user: updated[0] });
});

// Loose Solana base58 address validation: 32-44 chars, no 0/O/I/l.
const SOLANA_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

router.put("/me/wallet", requireAuth, async (req, res) => {
  const { solanaWalletAddress } = (req.body ?? {}) as {
    solanaWalletAddress?: string | null;
  };
  let value: string | null = null;
  if (typeof solanaWalletAddress === "string") {
    const trimmed = solanaWalletAddress.trim();
    if (trimmed.length > 0) {
      if (!SOLANA_RE.test(trimmed)) {
        res.status(400).json({
          error:
            "Invalid Solana address. Expected a base58 string of 32-44 characters.",
        });
        return;
      }
      value = trimmed;
    }
  } else if (solanaWalletAddress !== null && solanaWalletAddress !== undefined) {
    res.status(400).json({ error: "solanaWalletAddress must be a string" });
    return;
  }
  const updated = await db
    .update(appUsersTable)
    .set({ solanaWalletAddress: value, updatedAt: new Date() })
    .where(eq(appUsersTable.id, req.appUser!.id))
    .returning();
  res.json({ user: updated[0] });
});

export default router;
