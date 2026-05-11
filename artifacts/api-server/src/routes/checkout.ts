import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { getUncachableStripeClient } from "../lib/stripeClient";
import { TIER_BY_SLUG, getAllowedBillingCountries } from "../lib/tiers";
import { db, appUsersTable, commitmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

interface CheckoutBody {
  tierSlug?: string;
}

router.post("/checkout", requireAuth, async (req, res) => {
  const { tierSlug } = req.body as CheckoutBody;
  if (!tierSlug || typeof tierSlug !== "string") {
    res.status(400).json({ error: "tierSlug is required" });
    return;
  }
  // Server-authoritative tier lookup. Client can never inject arbitrary
  // Stripe priceIds — they pick by slug and we resolve to the seeded price.
  const tier = TIER_BY_SLUG.get(tierSlug);
  if (!tier) {
    res.status(400).json({ error: "Unknown tier" });
    return;
  }

  const user = req.appUser!;
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

  // Resolve the active Stripe price for this tier by metadata.tier_slug.
  const products = await stripe.products.search({
    query: `active:'true' AND metadata['tier_slug']:'${tier.slug}'`,
  });
  const product = products.data[0];
  if (!product) {
    res.status(503).json({
      error:
        "This tier has not been seeded into Stripe yet. Run `pnpm --filter @workspace/scripts run seed-tiers`.",
    });
    return;
  }
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });
  const price = prices.data.find(
    (p) =>
      p.unit_amount === tier.amountCents &&
      p.currency === "usd" &&
      !p.recurring,
  );
  if (!price) {
    res.status(503).json({ error: "Tier price missing in Stripe." });
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

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${origin}/portal/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/portal/invest?canceled=1`,
    billing_address_collection: "required",
    customer_update: { address: "auto", name: "auto" },
    metadata: {
      user_id: user.id,
      tier_slug: tier.slug,
      display_name: tier.displayName,
      token_allocation: String(tier.tokenAllocation),
    },
    payment_intent_data: {
      metadata: {
        user_id: user.id,
        tier_slug: tier.slug,
        display_name: tier.displayName,
        token_allocation: String(tier.tokenAllocation),
      },
    },
  };

  // Geo allow-list — restrict to approved jurisdictions at the Stripe
  // Checkout layer (rather than after-the-fact via Radar). The list is
  // applied to shipping_address_collection so Stripe refuses billing
  // addresses outside the allow-list during checkout.
  const allowedCountries = getAllowedBillingCountries();
  if (allowedCountries && allowedCountries.length > 0) {
    sessionParams.shipping_address_collection = {
      allowed_countries:
        allowedCountries as unknown as Array<"US" | "CA" | "GB" | "AU">,
    };
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  // Create the first-party commitment row immediately, BEFORE the user is
  // redirected to Stripe. Webhook updates will move it to succeeded /
  // failed / refunded. This guarantees we never lose a commitment record
  // even if the webhook is delayed.
  await db
    .insert(commitmentsTable)
    .values({
      userId: user.id,
      stripeCheckoutSessionId: session.id,
      stripeCustomerId: customerId,
      amountCents: tier.amountCents,
      currency: "usd",
      status: "pending",
      tierSlug: tier.slug,
      displayName: tier.displayName,
      tokenAllocation: tier.tokenAllocation,
    })
    .onConflictDoNothing();

  res.json({ url: session.url, sessionId: session.id });
});

export default router;
