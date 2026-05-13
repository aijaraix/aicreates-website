import {
  db,
  commitmentsTable,
  commitmentAllocationsTable,
  saftSubmissionsTable,
  type Commitment,
} from "@workspace/db";
import { and, eq, isNull } from "drizzle-orm";
import { ROUND_BY_SLUG, tokensForAmountCents } from "./rounds";
import {
  lockRoundsForUpdate,
  validateCapacity,
  RESERVING_STATES,
} from "./availability";
import { getRoundStatusesTx } from "./roundStatus";
import { logAdminAction } from "./audit";

export const MIN_AMEND_CENTS = 100_000; // $1,000
export const MAX_AMEND_CENTS = 1_000_000_000; // $10,000,000

/**
 * States from which an investor or admin may amend a commitment's
 * amount/round. A funded or refunded commitment is locked in.
 */
export const AMENDABLE_STATES = [
  "pending_saft",
  "pending_resign",
  "pending_payment",
  "awaiting_wire",
  "failed",
  // legacy
  "pending",
];

export interface AmendInput {
  commitmentId: string;
  newAmountCents: number;
  newRoundSlug: string;
  reason: string | null;
  actorEmail: string;
  actorKind: "investor" | "admin";
}

export type AmendResult =
  | { ok: true; commitment: Commitment }
  | {
      ok: false;
      status: number;
      code: string;
      error: string;
      details?: unknown;
    };

/**
 * Amend a commitment's amount and/or round. The previous SAFT (if any)
 * is marked superseded, the commitment transitions to `pending_resign`
 * so the investor must re-sign before checkout, and per-round
 * allocations are replaced atomically. Capacity is validated against
 * the new round under per-round advisory locks so concurrent amends
 * cannot overflow a round.
 */
export async function amendCommitment(input: AmendInput): Promise<AmendResult> {
  const round = ROUND_BY_SLUG.get(input.newRoundSlug);
  if (!round) {
    return {
      ok: false,
      status: 400,
      code: "unknown_round",
      error: `Unknown round: ${input.newRoundSlug}`,
    };
  }
  if (
    !Number.isFinite(input.newAmountCents) ||
    input.newAmountCents < MIN_AMEND_CENTS ||
    input.newAmountCents > MAX_AMEND_CENTS
  ) {
    return {
      ok: false,
      status: 400,
      code: "amount_out_of_range",
      error: `Amount must be between $${(
        MIN_AMEND_CENTS / 100
      ).toLocaleString()} and $${(MAX_AMEND_CENTS / 100).toLocaleString()}.`,
    };
  }
  const newAmountCents = Math.floor(input.newAmountCents);
  const newTokens = tokensForAmountCents(
    newAmountCents,
    round.pricePerTokenMillicents,
  );
  if (newTokens <= 0) {
    return {
      ok: false,
      status: 400,
      code: "zero_tokens",
      error: "Computed token allocation is zero",
    };
  }

  const result = await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(commitmentsTable)
      .where(eq(commitmentsTable.id, input.commitmentId))
      .limit(1);
    const c = rows[0];
    if (!c) return { ok: false as const, status: 404, code: "not_found", error: "Commitment not found" };
    if (!AMENDABLE_STATES.includes(c.state)) {
      return {
        ok: false as const,
        status: 409,
        code: "not_amendable",
        error: `Commitment in state ${c.state} cannot be amended`,
      };
    }

    // Lock both old and new round so concurrent amends serialize.
    await lockRoundsForUpdate(tx, [c.roundSlug, input.newRoundSlug]);

    // Verify the new round is still open. We do not require the old
    // round to be open — closing a round must not strand investors who
    // need to amend down or move into an open round.
    const txStatuses = await getRoundStatusesTx(tx);
    if (txStatuses.get(input.newRoundSlug)?.status !== "open") {
      return {
        ok: false as const,
        status: 409,
        code: "round_not_open",
        error: `Round not open: ${input.newRoundSlug}`,
      };
    }
    const def = ROUND_BY_SLUG.get(input.newRoundSlug);
    if (def?.deadline && Date.parse(def.deadline) <= Date.now()) {
      return {
        ok: false as const,
        status: 409,
        code: "round_not_open",
        error: `Round not open: ${input.newRoundSlug}`,
      };
    }

    // Free this commitment's existing allocations from the capacity
    // calculation by dropping them up front; validateCapacity will then
    // see only the OTHER reservations and the requested new tokens.
    await tx
      .delete(commitmentAllocationsTable)
      .where(eq(commitmentAllocationsTable.commitmentId, c.id));
    // Temporarily park the commitment in a non-reserving state so the
    // legacy fallback in reservedByRound (commitments without
    // allocation rows) doesn't double-count this row's old amount.
    if (RESERVING_STATES.includes(c.state)) {
      await tx
        .update(commitmentsTable)
        .set({ state: "amend_in_progress", status: "amend_in_progress" })
        .where(eq(commitmentsTable.id, c.id));
    }

    const violations = await validateCapacity(
      [{ roundSlug: input.newRoundSlug, tokens: newTokens }],
      tx,
    );
    if (violations.length > 0) {
      return {
        ok: false as const,
        status: 409,
        code: "capacity_exceeded",
        error: "Round capacity exceeded",
        details: { violations },
      };
    }

    // Mark every prior SAFT submission for this commitment as
    // superseded — investor must re-sign with the new terms.
    const now = new Date();
    await tx
      .update(saftSubmissionsTable)
      .set({ status: "superseded", supersededAt: now })
      .where(
        and(
          eq(saftSubmissionsTable.commitmentId, c.id),
          isNull(saftSubmissionsTable.supersededAt),
        ),
      );

    const updated = await tx
      .update(commitmentsTable)
      .set({
        state: "pending_resign",
        status: "pending_resign",
        amountCents: newAmountCents,
        customAmountCents: newAmountCents,
        roundSlug: input.newRoundSlug,
        tokenAllocation: newTokens,
        tierSlug: input.newRoundSlug,
        displayName: round.label,
        // Force the investor through the SAFT + checkout again.
        saftSignedAt: null,
        saftPdfKey: null,
        paymentMethod: null,
        // Detach any prior Stripe session/PI so a stale webhook event
        // can no longer mutate this commitment's state. The webhook
        // handler also explicitly ignores stale events for
        // `pending_resign`, but clearing the linkage is belt-and-braces.
        stripeCheckoutSessionId: null,
        stripePaymentIntentId: null,
        completedAt: null,
        refundedAt: null,
        receiptUrl: null,
        // Clear stale failure context so the dashboard banner doesn't
        // misrepresent the new attempt.
        lastFailureReason: null,
        lastFailureCode: null,
        lastFailureDeclineCode: null,
        lastFailureAt: null,
        updatedAt: now,
      })
      .where(eq(commitmentsTable.id, c.id))
      .returning();

    await tx.insert(commitmentAllocationsTable).values({
      commitmentId: c.id,
      roundSlug: input.newRoundSlug,
      tokens: newTokens,
      usdCents: newAmountCents,
      pricePerTokenMillicents: round.pricePerTokenMillicents,
    });

    return {
      ok: true as const,
      commitment: updated[0]!,
      previous: {
        amountCents: c.amountCents,
        roundSlug: c.roundSlug,
        tokenAllocation: c.tokenAllocation,
        state: c.state,
      },
    };
  });

  if (!result.ok) return result;

  // Audit log outside the tx — failures must never block the amend.
  await logAdminAction({
    actorEmail: input.actorEmail,
    action: "amend_commitment",
    targetType: "commitment",
    targetId: input.commitmentId,
    details: {
      actorKind: input.actorKind,
      reason: input.reason,
      previous: result.previous,
      next: {
        amountCents: result.commitment.amountCents,
        roundSlug: result.commitment.roundSlug,
        tokenAllocation: result.commitment.tokenAllocation,
        state: result.commitment.state,
      },
    },
  });

  return { ok: true, commitment: result.commitment };
}
