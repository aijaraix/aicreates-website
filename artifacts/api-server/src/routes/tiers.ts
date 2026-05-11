import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/tiers", async (_req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.metadata as product_metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.metadata as price_metadata
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY pr.unit_amount ASC NULLS LAST
    `);
    const tiers = result.rows.map((row) => ({
      productId: row["product_id"],
      name: row["product_name"],
      description: row["product_description"],
      metadata: row["product_metadata"],
      priceId: row["price_id"],
      amountCents: row["unit_amount"],
      currency: row["currency"],
    }));
    res.json({ tiers });
  } catch (err) {
    // stripe schema may not exist yet (Stripe not connected). Return empty list.
    (req => req)(_req).log?.warn?.(
      { err },
      "tiers query failed (stripe schema may not be ready)",
    );
    res.json({ tiers: [] });
  }
});

export default router;
