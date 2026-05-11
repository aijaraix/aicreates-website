import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { getUncachableStripeClient } from "../lib/stripeClient";
import { db, appUsersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

// Server-side allow-list of approved Founders Commitment tier identifiers.
// A price is allowed if its product has metadata.tier in this set.
const ALLOWED_TIER_KEYS = new Set(["founders", "architect", "catalyst"]);

router.post("/checkout", requireAuth, async (req, res) => {
  const { priceId } = req.body as { priceId?: string };
  if (!priceId || typeof priceId !== "string" || !priceId.startsWith("price_")) {
    res.status(400).json({ error: "priceId is required" });
    return;
  }

  // Verify the price belongs to one of our approved commitment tiers.
  // Uses the local stripe.* mirror so this is a fast DB lookup, not a Stripe round-trip.
  let allowed = false;
  try {
    const result = await db.execute(sql`
      SELECT p.metadata->>'tier' AS tier
      FROM stripe.prices pr
      JOIN stripe.products p ON p.id = pr.product
      WHERE pr.id = ${priceId}
        AND pr.active = true
        AND p.active = true
      LIMIT 1
    `);
    const row = result.rows[0] as { tier?: string } | undefined;
    if (row && row.tier && ALLOWED_TIER_KEYS.has(row.tier)) {
      allowed = true;
    }
  } catch (err) {
    req.log?.error({ err }, "Failed to validate priceId against stripe mirror");
  }
  if (!allowed) {
    res.status(403).json({
      error:
        "This price is not an approved Founders Commitment tier. Please pick a tier from the portal.",
    });
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

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/portal/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/portal/invest?canceled=1`,
    metadata: {
      userId: user.id,
      priceId,
    },
    payment_intent_data: {
      metadata: {
        userId: user.id,
        priceId,
      },
    },
  });

  res.json({ url: session.url, sessionId: session.id });
});

export default router;
