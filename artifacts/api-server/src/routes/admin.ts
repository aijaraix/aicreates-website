import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../lib/auth";
import { getUncachableStripeClient } from "../lib/stripeClient";
import { db, appUsersTable, commitmentsTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";

const router: IRouter = Router();

// Live allow-list (env-driven) is re-checked in requireAdmin on every request.
router.use("/admin", requireAuth, requireAdmin);

router.get("/admin/users", async (_req, res) => {
  const users = await db
    .select()
    .from(appUsersTable)
    .orderBy(desc(appUsersTable.createdAt))
    .limit(1000);
  res.json({ users });
});

router.get("/admin/commitments", async (req, res) => {
  const status = (req.query["status"] as string | undefined) ?? null;

  const baseQuery = db
    .select({
      id: commitmentsTable.id,
      userId: commitmentsTable.userId,
      email: appUsersTable.email,
      fullName: appUsersTable.fullName,
      stripeCheckoutSessionId: commitmentsTable.stripeCheckoutSessionId,
      stripePaymentIntentId: commitmentsTable.stripePaymentIntentId,
      stripeCustomerId: commitmentsTable.stripeCustomerId,
      amountCents: commitmentsTable.amountCents,
      currency: commitmentsTable.currency,
      status: commitmentsTable.status,
      tierSlug: commitmentsTable.tierSlug,
      displayName: commitmentsTable.displayName,
      tokenAllocation: commitmentsTable.tokenAllocation,
      receiptUrl: commitmentsTable.receiptUrl,
      billingCountry: commitmentsTable.billingCountry,
      createdAt: commitmentsTable.createdAt,
      completedAt: commitmentsTable.completedAt,
      refundedAt: commitmentsTable.refundedAt,
    })
    .from(commitmentsTable)
    .leftJoin(appUsersTable, eq(appUsersTable.id, commitmentsTable.userId))
    .orderBy(desc(commitmentsTable.createdAt))
    .limit(1000);

  const rows = status
    ? await baseQuery.where(eq(commitmentsTable.status, status))
    : await baseQuery;

  // CSV export.
  if ((req.query["format"] as string | undefined) === "csv") {
    const header = [
      "id",
      "created_at",
      "completed_at",
      "refunded_at",
      "email",
      "full_name",
      "tier_slug",
      "display_name",
      "amount_cents",
      "currency",
      "status",
      "token_allocation",
      "billing_country",
      "stripe_payment_intent_id",
      "stripe_customer_id",
      "stripe_checkout_session_id",
      "receipt_url",
    ].join(",");
    const escape = (v: unknown) => {
      if (v == null) return "";
      const s =
        v instanceof Date
          ? v.toISOString()
          : typeof v === "string"
            ? v
            : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = rows.map((r) =>
      [
        r.id,
        r.createdAt,
        r.completedAt,
        r.refundedAt,
        r.email,
        r.fullName,
        r.tierSlug,
        r.displayName,
        r.amountCents,
        r.currency,
        r.status,
        r.tokenAllocation,
        r.billingCountry,
        r.stripePaymentIntentId,
        r.stripeCustomerId,
        r.stripeCheckoutSessionId,
        r.receiptUrl,
      ]
        .map(escape)
        .join(","),
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="commitments-${Date.now()}.csv"`,
    );
    res.send([header, ...lines].join("\n"));
    return;
  }

  res.json({ commitments: rows });
});

router.get("/admin/stats", async (_req, res) => {
  const result = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'succeeded') AS succeeded_count,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
      COUNT(*) FILTER (WHERE status = 'refunded') AS refunded_count,
      COALESCE(SUM(amount_cents) FILTER (WHERE status = 'succeeded'), 0) AS total_succeeded_cents,
      COALESCE(SUM(token_allocation) FILTER (WHERE status = 'succeeded'), 0) AS total_tokens_allocated
    FROM commitments
  `);
  res.json({ stats: result.rows[0] ?? {} });
});

router.post("/admin/commitments/:id/refund", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const rows = await db
    .select()
    .from(commitmentsTable)
    .where(eq(commitmentsTable.id, id))
    .limit(1);
  const commitment = rows[0];
  if (!commitment) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (!commitment.stripePaymentIntentId) {
    res.status(400).json({
      error: "Commitment has no payment intent — cannot refund yet.",
    });
    return;
  }
  if (commitment.status === "refunded") {
    res.status(400).json({ error: "Already refunded" });
    return;
  }
  let stripe;
  try {
    stripe = await getUncachableStripeClient();
  } catch (err) {
    req.log?.error({ err }, "Stripe not configured");
    res.status(503).json({ error: "Stripe not configured" });
    return;
  }
  try {
    await stripe.refunds.create({
      payment_intent: commitment.stripePaymentIntentId,
      reason: "requested_by_customer",
      metadata: {
        refundedBy: req.appUser!.email,
        commitmentId: commitment.id,
      },
    });
    // Optimistic local update; the charge.refunded webhook will also fire.
    await db
      .update(commitmentsTable)
      .set({
        status: "refunded",
        refundedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(commitmentsTable.id, commitment.id));
    res.json({ ok: true });
  } catch (err) {
    req.log?.error({ err, commitmentId: id }, "Refund failed");
    res.status(500).json({ error: "Refund failed" });
  }
});

export default router;
