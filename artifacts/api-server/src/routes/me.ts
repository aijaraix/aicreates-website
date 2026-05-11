import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { db, appUsersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = req.appUser!;

  let commitments: unknown[] = [];
  try {
    if (user.stripeCustomerId) {
      const result = await db.execute(sql`
        SELECT
          id,
          amount_total,
          currency,
          payment_status,
          status,
          created,
          metadata
        FROM stripe.checkout_sessions
        WHERE customer = ${user.stripeCustomerId}
        ORDER BY created DESC
        LIMIT 50
      `);
      commitments = result.rows;
    }
  } catch (err) {
    req.log?.warn({ err }, "Could not fetch commitments (stripe schema may not be ready)");
  }

  res.json({ user, commitments });
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

export default router;
