import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../lib/auth";
import { db, appUsersTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router: IRouter = Router();

router.use("/admin", requireAuth, requireAdmin);

router.get("/admin/users", async (_req, res) => {
  const users = await db
    .select()
    .from(appUsersTable)
    .orderBy(desc(appUsersTable.createdAt))
    .limit(500);
  res.json({ users });
});

router.get("/admin/commitments", async (req, res) => {
  try {
    const result = await db.execute(sql`
      SELECT
        s.id as session_id,
        s.customer as stripe_customer_id,
        s.amount_total,
        s.currency,
        s.payment_status,
        s.status,
        s.created,
        s.metadata,
        u.id as user_id,
        u.email,
        u.full_name,
        u.role
      FROM stripe.checkout_sessions s
      LEFT JOIN app_users u ON u.stripe_customer_id = s.customer
      WHERE s.payment_status IS NOT NULL
      ORDER BY s.created DESC
      LIMIT 500
    `);
    res.json({ commitments: result.rows });
  } catch (err) {
    req.log?.warn({ err }, "admin/commitments query failed");
    res.json({ commitments: [] });
  }
});

export default router;
