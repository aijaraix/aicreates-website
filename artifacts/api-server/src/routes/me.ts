import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import {
  db,
  appUsersTable,
  commitmentsTable,
  saftSubmissionsTable,
  commitmentAllocationsTable,
} from "@workspace/db";
import { eq, desc, inArray, asc } from "drizzle-orm";
import { computeVestingSchedule } from "../lib/vesting";
import { getRoundLabel, ROUND_BY_SLUG } from "../lib/rounds";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = req.appUser!;
  const commitments = await db
    .select()
    .from(commitmentsTable)
    .where(eq(commitmentsTable.userId, user.id))
    .orderBy(desc(commitmentsTable.createdAt))
    .limit(100);
  res.json({ user, commitments });
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
    })
    .from(saftSubmissionsTable)
    .where(eq(saftSubmissionsTable.userId, user.id));
  const saftByCommitment = new Map(
    saftRows.map((s) => [s.commitmentId, s] as const),
  );

  const ids = commitments.map((c) => c.id);
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
    const vesting = computeVestingSchedule({
      totalTokens: c.tokenAllocation,
      fundedAt: c.fundedAt ?? c.completedAt,
    });
    const saft = saftByCommitment.get(c.id);
    const payload = (saft?.payload ?? {}) as Record<string, unknown>;
    const lines = linesByCommitment.get(c.id) ?? [];
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
