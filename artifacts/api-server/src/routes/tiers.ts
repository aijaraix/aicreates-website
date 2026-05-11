import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { TIERS } from "../lib/tiers";

const router: IRouter = Router();

interface StripeTierRow {
  product_id: string;
  tier_slug: string;
  display_name: string;
  description: string | null;
  token_allocation: string | null;
  order: string | null;
  unit_amount: string | null;
  currency: string | null;
}

/**
 * Live tiers come from the mirrored Stripe products + prices (schema
 * `stripe.*`). Falls back to the server-authoritative TIERS list when the
 * Stripe mirror is empty (e.g. before the seed-tiers script has run, or
 * when the integration is not connected).
 */
router.get("/tiers", async (_req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        p.id AS product_id,
        p.metadata->>'tier_slug' AS tier_slug,
        COALESCE(p.metadata->>'display_name', p.name) AS display_name,
        p.description AS description,
        p.metadata->>'token_allocation' AS token_allocation,
        p.metadata->>'order' AS "order",
        pr.unit_amount::text AS unit_amount,
        pr.currency AS currency
      FROM stripe.products p
      LEFT JOIN LATERAL (
        SELECT unit_amount, currency
        FROM stripe.prices
        WHERE product = p.id AND active = true AND recurring IS NULL
        ORDER BY created DESC
        LIMIT 1
      ) pr ON true
      WHERE p.active = true
        AND p.metadata ? 'tier_slug'
      ORDER BY (p.metadata->>'order')::int NULLS LAST, p.created
    `);
    const rows = result.rows as unknown as StripeTierRow[];
    if (rows.length > 0) {
      res.json({
        tiers: rows.map((r) => ({
          slug: r.tier_slug,
          displayName: r.display_name,
          description: r.description ?? "",
          amountCents: r.unit_amount ? parseInt(r.unit_amount, 10) : 0,
          currency: r.currency ?? "usd",
          tokenAllocation: r.token_allocation
            ? parseInt(r.token_allocation, 10)
            : 0,
        })),
        source: "stripe",
      });
      return;
    }
  } catch (err) {
    // stripe.* schema may not exist yet — fall through to defaults.
    void err;
  }
  res.json({
    tiers: TIERS.map((t) => ({
      slug: t.slug,
      displayName: t.displayName,
      description: t.description,
      amountCents: t.amountCents,
      currency: "usd",
      tokenAllocation: t.tokenAllocation,
    })),
    source: "fallback",
  });
});

export default router;
