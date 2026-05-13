import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { getUncachableStripeClient } from "../lib/stripeClient";
import { TIER_BY_SLUG, getAllowedBillingCountries } from "../lib/tiers";
import { notifyTeam } from "../lib/notify";
import { emailWireInstructions } from "../lib/email";
import { WIRE_INSTRUCTIONS } from "../lib/wireInstructions";
import {
  ROUND_BY_SLUG,
  getActiveRound,
  tokensForAmountCents,
} from "../lib/rounds";
import { lockRoundsForUpdate, validateCapacity } from "../lib/availability";
import {
  db,
  appUsersTable,
  commitmentsTable,
  commitmentAllocationsTable,
  investorProfilesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

const MIN_CUSTOM = 100_000; // $1,000
const MAX_CUSTOM = 1_000_000_000; // $10,000,000

interface AllocationLine {
  roundSlug?: string;
  tokens?: number;
  usdCents?: number;
}

interface CommitBody {
  // multi-round cart (new)
  allocations?: AllocationLine[];
  // legacy single-round path
  tierSlug?: string;
  customAmountCents?: number;
  roundSlug?: string;
}

function tokensForAmount(amountCents: number, roundSlug?: string): number {
  const round = roundSlug ? ROUND_BY_SLUG.get(roundSlug) : undefined;
  return tokensForAmountCents(amountCents, round?.pricePerTokenMillicents);
}

/**
 * Create a `pending_saft` commitment row. Two paths:
 *
 *  - Multi-round cart: `allocations: [{ roundSlug, tokens, usdCents }]`
 *    (preferred). Inserts one parent row plus one commitment_allocations
 *    row per line, validating per-round capacity inside a transaction.
 *
 *  - Legacy single-round: `tierSlug` or `customAmountCents` (+ optional
 *    `roundSlug`). Kept for back-compat with old clients/tests.
 */
router.post("/commitments", requireAuth, async (req, res) => {
  const body = (req.body ?? {}) as CommitBody;
  const userId = req.appUser!.id;

  // Profile gate: every commitment requires a completed investor profile.
  const profileRows = await db
    .select({ userId: investorProfilesTable.userId, kind: investorProfilesTable.kind })
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, userId))
    .limit(1);
  if (!profileRows[0]) {
    res.status(403).json({
      error: "Investor profile required before committing.",
      code: "profile_required",
    });
    return;
  }

  // ---- Multi-round path ----
  if (Array.isArray(body.allocations) && body.allocations.length > 0) {
    const lines: Array<{
      roundSlug: string;
      tokens: number;
      usdCents: number;
      pricePerTokenMillicents: number;
    }> = [];

    for (const a of body.allocations) {
      const slug = String(a.roundSlug ?? "");
      const round = ROUND_BY_SLUG.get(slug);
      if (!round) {
        res.status(400).json({ error: `Unknown round: ${slug}` });
        return;
      }
      const tokens = Math.floor(Number(a.tokens) || 0);
      const usdCents = Math.floor(Number(a.usdCents) || 0);
      if (tokens <= 0 || usdCents <= 0) continue;
      // Server is the source of truth: recompute USD from tokens at the
      // round price. Reject if client value diverges by > 1 cent of rounding.
      const expectedCents = Math.round((tokens * round.pricePerTokenMillicents) / 10);
      if (Math.abs(expectedCents - usdCents) > 1) {
        res.status(400).json({
          error: `Allocation math mismatch for ${slug}: ${tokens} tokens at ${round.pricePerTokenMillicents}/1000 USD = ${expectedCents}c, got ${usdCents}c`,
        });
        return;
      }
      lines.push({
        roundSlug: slug,
        tokens,
        usdCents: expectedCents,
        pricePerTokenMillicents: round.pricePerTokenMillicents,
      });
    }

    if (lines.length === 0) {
      res.status(400).json({ error: "At least one allocation required" });
      return;
    }

    const totalCents = lines.reduce((s, l) => s + l.usdCents, 0);
    const totalTokens = lines.reduce((s, l) => s + l.tokens, 0);
    if (totalCents < MIN_CUSTOM) {
      res.status(400).json({
        error: `Total must be at least $${(MIN_CUSTOM / 100).toLocaleString()}.`,
      });
      return;
    }
    if (totalCents > MAX_CUSTOM) {
      res.status(400).json({
        error: `Total exceeds $${(MAX_CUSTOM / 100).toLocaleString()} cap.`,
      });
      return;
    }

    const violations = await validateCapacity(
      lines.map((l) => ({ roundSlug: l.roundSlug, tokens: l.tokens })),
    );
    if (violations.length > 0) {
      res.status(409).json({
        error: "Round capacity exceeded",
        code: "capacity_exceeded",
        violations,
      });
      return;
    }

    const isMulti = new Set(lines.map((l) => l.roundSlug)).size > 1;
    const primarySlug = lines[0]!.roundSlug;
    const tierSlug = isMulti ? "multi-round" : primarySlug;
    const displayName = isMulti
      ? `Multi-round commitment (${lines.length} rounds)`
      : `${ROUND_BY_SLUG.get(primarySlug)!.label}`;

    const result = await db.transaction(async (tx) => {
      // Per-round advisory locks serialize concurrent commits against
      // the same rounds; re-check capacity using the tx snapshot.
      await lockRoundsForUpdate(
        tx,
        lines.map((l) => l.roundSlug),
      );
      const v2 = await validateCapacity(
        lines.map((l) => ({ roundSlug: l.roundSlug, tokens: l.tokens })),
        tx,
      );
      if (v2.length > 0) {
        return { ok: false as const, violations: v2 };
      }
      const inserted = await tx
        .insert(commitmentsTable)
        .values({
          userId,
          amountCents: totalCents,
          currency: "usd",
          status: "pending_saft",
          state: "pending_saft",
          tierSlug,
          displayName,
          tokenAllocation: totalTokens,
          customAmountCents: totalCents,
          roundSlug: primarySlug,
        })
        .returning();
      const c = inserted[0]!;
      await tx.insert(commitmentAllocationsTable).values(
        lines.map((l) => ({
          commitmentId: c.id,
          roundSlug: l.roundSlug,
          tokens: l.tokens,
          usdCents: l.usdCents,
          pricePerTokenMillicents: l.pricePerTokenMillicents,
        })),
      );
      return { ok: true as const, commitment: c };
    });

    if (!result.ok) {
      res.status(409).json({
        error: "Round capacity exceeded",
        code: "capacity_exceeded",
        violations: result.violations,
      });
      return;
    }
    res.status(201).json({
      commitment: result.commitment,
      allocations: lines,
    });
    return;
  }

  // ---- Legacy single-round path ----
  const round = body.roundSlug ?? getActiveRound().slug;
  if (!ROUND_BY_SLUG.has(round)) {
    res.status(400).json({ error: "Unknown round" });
    return;
  }

  let amountCents: number;
  let displayName: string;
  let resolvedTierSlug: string;
  let tokenAllocation: number;
  let custom: number | null = null;

  if (body.tierSlug) {
    const tier = TIER_BY_SLUG.get(body.tierSlug);
    if (!tier) {
      res.status(400).json({ error: "Unknown tier" });
      return;
    }
    amountCents = tier.amountCents;
    displayName = tier.displayName;
    resolvedTierSlug = tier.slug;
    tokenAllocation = tier.tokenAllocation;
  } else if (typeof body.customAmountCents === "number") {
    if (
      !Number.isFinite(body.customAmountCents) ||
      body.customAmountCents < MIN_CUSTOM ||
      body.customAmountCents > MAX_CUSTOM
    ) {
      res.status(400).json({
        error: `customAmountCents must be between ${MIN_CUSTOM} and ${MAX_CUSTOM}`,
      });
      return;
    }
    amountCents = Math.floor(body.customAmountCents);
    custom = amountCents;
    resolvedTierSlug = "custom";
    displayName = "Custom commitment";
    tokenAllocation = tokensForAmount(amountCents, round);
  } else {
    res.status(400).json({ error: "tierSlug, customAmountCents, or allocations required" });
    return;
  }

  const violations = await validateCapacity([
    { roundSlug: round, tokens: tokenAllocation },
  ]);
  if (violations.length > 0) {
    res.status(409).json({
      error: "Round capacity exceeded",
      code: "capacity_exceeded",
      violations,
    });
    return;
  }

  const result = await db.transaction(async (tx) => {
    await lockRoundsForUpdate(tx, [round]);
    const v2 = await validateCapacity(
      [{ roundSlug: round, tokens: tokenAllocation }],
      tx,
    );
    if (v2.length > 0) return { ok: false as const, violations: v2 };
    const inserted = await tx
      .insert(commitmentsTable)
      .values({
        userId,
        amountCents,
        currency: "usd",
        status: "pending_saft",
        state: "pending_saft",
        tierSlug: resolvedTierSlug,
        displayName,
        tokenAllocation,
        customAmountCents: custom,
        roundSlug: round,
      })
      .returning();
    const c = inserted[0]!;
    await tx.insert(commitmentAllocationsTable).values({
      commitmentId: c.id,
      roundSlug: round,
      tokens: tokenAllocation,
      usdCents: amountCents,
      pricePerTokenMillicents:
        ROUND_BY_SLUG.get(round)?.pricePerTokenMillicents ?? 0,
    });
    return { ok: true as const, commitment: c };
  });

  if (!result.ok) {
    res.status(409).json({
      error: "Round capacity exceeded",
      code: "capacity_exceeded",
      violations: result.violations,
    });
    return;
  }
  res.status(201).json({ commitment: result.commitment });
});

interface CheckoutBody {
  commitmentId?: string;
  /**
   * "fiat" is the new collapsed picker option that lets Stripe Checkout offer
   * card + ACH on the same hosted page. "card" / "ach" are kept for backward
   * compat. "crypto" is no longer in the public picker but the server branch
   * stays for legacy admin confirm-crypto rows.
   */
  paymentMethod?: "fiat" | "card" | "ach" | "crypto" | "wire";
  /** Legacy: pre-Phase-C single-shot tier picker. */
  tierSlug?: string;
}

router.post("/checkout", requireAuth, async (req, res) => {
  const body = (req.body ?? {}) as CheckoutBody;
  const user = req.appUser!;

  // Profile gate: backend mirror of the UI RequireProfile guard so the
  // check cannot be bypassed by hitting the API directly.
  const profileRows = await db
    .select({ userId: investorProfilesTable.userId })
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, user.id))
    .limit(1);
  if (!profileRows[0]) {
    res.status(403).json({
      error: "Investor profile required before checkout.",
      code: "profile_required",
    });
    return;
  }

  // Resolve commitment.
  let commitmentId = body.commitmentId;
  let amountCents: number;
  let displayName: string;
  let tierSlug: string;
  let tokenAllocation: number;
  let roundSlug: string;
  let paymentMethod: "fiat" | "card" | "ach" | "crypto" | "wire" =
    body.paymentMethod ?? "fiat";

  // Crypto was removed from the public picker in Task #72 (Stripe Crypto
  // pending). The legacy `awaiting_crypto` admin-confirm path remains for
  // pre-existing rows, but new commitments cannot be created via crypto.
  if (paymentMethod === "crypto") {
    res.status(400).json({
      error: "Crypto checkout is temporarily unavailable. Please choose Fiat (card or ACH) or Bank Transfer.",
    });
    return;
  }

  if (commitmentId) {
    const rows = await db
      .select()
      .from(commitmentsTable)
      .where(
        and(
          eq(commitmentsTable.id, commitmentId),
          eq(commitmentsTable.userId, user.id),
        ),
      )
      .limit(1);
    const c = rows[0];
    if (!c) {
      res.status(404).json({ error: "Commitment not found" });
      return;
    }
    if (c.state === "funded" || c.status === "succeeded") {
      res.status(400).json({ error: "Commitment is already funded" });
      return;
    }
    if (c.state === "pending_saft" && !c.saftSignedAt) {
      res.status(400).json({ error: "SAFT not signed" });
      return;
    }
    amountCents = c.amountCents;
    displayName = c.displayName;
    tierSlug = c.tierSlug;
    tokenAllocation = c.tokenAllocation;
    roundSlug = c.roundSlug;
  } else if (body.tierSlug) {
    res.status(410).json({
      error: "Legacy checkout path removed. Use POST /commitments then /checkout with commitmentId.",
      code: "legacy_checkout_removed",
    });
    return;
  } else {
    res.status(400).json({ error: "commitmentId or tierSlug required" });
    return;
  }

  // Wire path: no Stripe.
  if (paymentMethod === "wire") {
    await db
      .update(commitmentsTable)
      .set({
        state: "awaiting_wire",
        status: "awaiting_wire",
        paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(commitmentsTable.id, commitmentId!));
    await notifyTeam({
      subject: `[AICA] Wire commitment awaiting funds: $${(amountCents / 100).toLocaleString()} from ${user.email}`,
      message: `${user.fullName ?? user.email} committed via wire.\n\nCommitment: ${commitmentId}\nAmount: $${(amountCents / 100).toLocaleString()}\nDisplay: ${displayName}\nRound: ${roundSlug}\nTokens: ${tokenAllocation.toLocaleString()} AICA\n\nMark wire received in /invest/admin once funds arrive.`,
      payload: {
        kind: "wire",
        commitmentId,
        userId: user.id,
        email: user.email,
        amountCents,
      },
    });
    // Investor-facing wire instructions email. Bank details are the real
    // Bank of America values, hardcoded in WIRE_INSTRUCTIONS - no env vars,
    // no placeholders.
    void emailWireInstructions({
      to: user.email,
      investorName: user.fullName ?? user.email,
      commitmentId: commitmentId!,
      amountCents,
      tokens: tokenAllocation,
      bank: {
        ...WIRE_INSTRUCTIONS,
        reference: commitmentId!,
      },
    });
    res.json({ wire: true, commitmentId });
    return;
  }

  // Crypto path was removed in Task #72: new commitments cannot select
  // crypto (rejected with 400 above). The legacy `awaiting_crypto` state +
  // admin confirm-crypto endpoint remain for any pre-existing rows.

  let stripe;
  try {
    stripe = await getUncachableStripeClient();
  } catch (err) {
    req.log?.error({ err }, "Stripe not configured");
    res.status(503).json({
      error:
        "Payments are not yet configured. Please connect Stripe via the Replit Integrations tab.",
    });
    return;
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.fullName ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db
      .update(appUsersTable)
      .set({ stripeCustomerId: customerId, updatedAt: new Date() })
      .where(eq(appUsersTable.id, user.id));
  }

  const origin =
    (req.headers["origin"] as string | undefined) ??
    `${req.protocol}://${req.get("host")}`;

  // "fiat" collapses card + ACH onto Stripe Checkout's hosted page so the
  // customer picks the rail there. "card" / "ach" remain explicit for any
  // older client that still posts them.
  const methodTypes: Array<"card" | "us_bank_account"> =
    paymentMethod === "ach"
      ? ["us_bank_account"]
      : paymentMethod === "fiat"
        ? ["card", "us_bank_account"]
        : ["card"];

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    customer: customerId,
    mode: "payment",
    payment_method_types: methodTypes,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `${ROUND_BY_SLUG.get(roundSlug)?.label ?? roundSlug} - ${displayName}`,
            description: `Commitment ${commitmentId} (${tokenAllocation.toLocaleString()} AICA)`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/invest/dashboard?paid=${commitmentId}`,
    cancel_url: `${origin}/invest/checkout/${commitmentId}?canceled=1`,
    billing_address_collection: "required",
    customer_update: { address: "auto", name: "auto" },
    metadata: {
      commitment_id: commitmentId!,
      user_id: user.id,
      tier_slug: tierSlug,
      display_name: displayName,
      token_allocation: String(tokenAllocation),
      round_slug: roundSlug,
      payment_method_pref: paymentMethod,
    },
    payment_intent_data: {
      metadata: {
        commitment_id: commitmentId!,
        user_id: user.id,
        tier_slug: tierSlug,
        display_name: displayName,
        token_allocation: String(tokenAllocation),
        round_slug: roundSlug,
        payment_method_pref: paymentMethod,
      },
    },
  };

  const allowedCountries = getAllowedBillingCountries();
  if (allowedCountries && allowedCountries.length > 0) {
    sessionParams.shipping_address_collection = {
      allowed_countries:
        allowedCountries as unknown as Array<"US" | "CA" | "GB" | "AU">,
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  await db
    .update(commitmentsTable)
    .set({
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: customerId,
      state: "pending_payment",
      status: "pending_payment",
      paymentMethod,
      updatedAt: new Date(),
    })
    .where(eq(commitmentsTable.id, commitmentId!));

  res.json({ url: session.url, sessionId: session.id, commitmentId });
});

export default router;
