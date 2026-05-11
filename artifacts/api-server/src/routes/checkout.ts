import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { getUncachableStripeClient } from "../lib/stripeClient";
import { TIER_BY_SLUG, getAllowedBillingCountries } from "../lib/tiers";
import { notifyTeam } from "../lib/notify";
import { db, appUsersTable, commitmentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

const ROUND_LABEL: Record<string, string> = {
  "founders-2026": "AICA Founders Round 2026",
};

const MIN_CUSTOM = 100_000; // $1,000
const MAX_CUSTOM = 1_000_000_000; // $10,000,000

function tokensForAmount(amountCents: number): number {
  // Base ratio: 1 token per $1 (Founders tier). Larger amounts get a
  // graduated bonus to mirror the seeded tiers (10% / 20%).
  const usd = amountCents / 100;
  let bonus = 0;
  if (usd >= 25_000) bonus = 0.2;
  else if (usd >= 5_000) bonus = 0.1;
  return Math.round(usd * (1 + bonus));
}

interface CommitBody {
  tierSlug?: string;
  customAmountCents?: number;
  roundSlug?: string;
}

/**
 * Create a `pending_saft` commitment row from a tier or custom amount.
 * The user is then routed to /invest/saft/:id in the client.
 */
router.post("/commitments", requireAuth, async (req, res) => {
  const { tierSlug, customAmountCents, roundSlug } = (req.body ?? {}) as CommitBody;
  const round = roundSlug ?? "founders-2026";
  if (!ROUND_LABEL[round]) {
    res.status(400).json({ error: "Unknown round" });
    return;
  }
  let amountCents: number;
  let displayName: string;
  let resolvedTierSlug: string;
  let tokenAllocation: number;
  let custom: number | null = null;

  if (tierSlug) {
    const tier = TIER_BY_SLUG.get(tierSlug);
    if (!tier) {
      res.status(400).json({ error: "Unknown tier" });
      return;
    }
    amountCents = tier.amountCents;
    displayName = tier.displayName;
    resolvedTierSlug = tier.slug;
    tokenAllocation = tier.tokenAllocation;
  } else if (typeof customAmountCents === "number") {
    if (
      !Number.isFinite(customAmountCents) ||
      customAmountCents < MIN_CUSTOM ||
      customAmountCents > MAX_CUSTOM
    ) {
      res.status(400).json({
        error: `customAmountCents must be between ${MIN_CUSTOM} and ${MAX_CUSTOM}`,
      });
      return;
    }
    amountCents = Math.floor(customAmountCents);
    custom = amountCents;
    resolvedTierSlug = "custom";
    displayName = "Custom commitment";
    tokenAllocation = tokensForAmount(amountCents);
  } else {
    res.status(400).json({ error: "tierSlug or customAmountCents required" });
    return;
  }

  const inserted = await db
    .insert(commitmentsTable)
    .values({
      userId: req.appUser!.id,
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
  res.status(201).json({ commitment: inserted[0] });
});

interface CheckoutBody {
  commitmentId?: string;
  paymentMethod?: "card" | "ach" | "crypto" | "wire";
  /** Legacy: pre-Phase-C single-shot tier picker. */
  tierSlug?: string;
}

router.post("/checkout", requireAuth, async (req, res) => {
  const body = (req.body ?? {}) as CheckoutBody;
  const user = req.appUser!;

  // Resolve commitment.
  let commitmentId = body.commitmentId;
  let amountCents: number;
  let displayName: string;
  let tierSlug: string;
  let tokenAllocation: number;
  let roundSlug: string;
  let paymentMethod: "card" | "ach" | "crypto" | "wire" =
    body.paymentMethod ?? "card";

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
    const tier = TIER_BY_SLUG.get(body.tierSlug);
    if (!tier) {
      res.status(400).json({ error: "Unknown tier" });
      return;
    }
    // Legacy path: create + checkout in a single shot.
    const inserted = await db
      .insert(commitmentsTable)
      .values({
        userId: user.id,
        amountCents: tier.amountCents,
        currency: "usd",
        status: "pending_payment",
        state: "pending_payment",
        tierSlug: tier.slug,
        displayName: tier.displayName,
        tokenAllocation: tier.tokenAllocation,
        roundSlug: "founders-2026",
        paymentMethod,
      })
      .returning();
    commitmentId = inserted[0]!.id;
    amountCents = tier.amountCents;
    displayName = tier.displayName;
    tierSlug = tier.slug;
    tokenAllocation = tier.tokenAllocation;
    roundSlug = "founders-2026";
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
    res.json({ wire: true, commitmentId });
    return;
  }

  // Crypto path: handled out-of-band (Stripe Pay-with-Crypto is region-gated
  // and not universally available). We move the commitment to
  // `awaiting_crypto`, surface escrow instructions in the UI, and notify
  // the team to coordinate the on-chain confirmation manually.
  if (paymentMethod === "crypto") {
    await db
      .update(commitmentsTable)
      .set({
        state: "awaiting_crypto",
        status: "awaiting_crypto",
        paymentMethod,
        updatedAt: new Date(),
      })
      .where(eq(commitmentsTable.id, commitmentId!));
    await notifyTeam({
      subject: `[AICA] Crypto commitment awaiting funds: $${(amountCents / 100).toLocaleString()} from ${user.email}`,
      message: `${user.fullName ?? user.email} committed via crypto.\n\nCommitment: ${commitmentId}\nAmount: $${(amountCents / 100).toLocaleString()}\nDisplay: ${displayName}\nRound: ${roundSlug}\nTokens: ${tokenAllocation.toLocaleString()} AICA\n\nReply with the escrow address. Mark received in /invest/admin once on-chain confirmations are finalized.`,
      payload: {
        kind: "crypto",
        commitmentId,
        userId: user.id,
        email: user.email,
        amountCents,
      },
    });
    res.json({ crypto: true, commitmentId });
    return;
  }

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

  // Ensure the user has a Stripe customer.
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

  const methodTypes: Array<"card" | "us_bank_account"> =
    paymentMethod === "ach" ? ["us_bank_account"] : ["card"];

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
            name: `${ROUND_LABEL[roundSlug] ?? roundSlug} - ${displayName}`,
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
