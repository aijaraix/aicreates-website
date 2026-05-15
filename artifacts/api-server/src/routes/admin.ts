import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin, adminEmails } from "../lib/auth";
import { getUncachableStripeClient } from "../lib/stripeClient";
import {
  db,
  appUsersTable,
  commitmentsTable,
  saftSubmissionsTable,
  investorProfilesTable,
} from "@workspace/db";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { logAdminAction } from "../lib/audit";
import { appendCountersignPage } from "../lib/saftPdf";

const router: IRouter = Router();

router.use("/admin", requireAuth, requireAdmin);

router.get("/admin/admins", async (_req, res) => {
  const emails = adminEmails();
  if (emails.length === 0) {
    res.json({ emails: [], users: [] });
    return;
  }
  const lower = sql`LOWER(${appUsersTable.email})`;
  const users = await db
    .select({
      id: appUsersTable.id,
      email: appUsersTable.email,
      fullName: appUsersTable.fullName,
      role: appUsersTable.role,
      lastLoginAt: appUsersTable.lastLoginAt,
      loginCount: appUsersTable.loginCount,
      createdAt: appUsersTable.createdAt,
    })
    .from(appUsersTable)
    .where(sql`${lower} = ANY(${emails})`);
  res.json({ emails, users });
});

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
      state: commitmentsTable.state,
      tierSlug: commitmentsTable.tierSlug,
      displayName: commitmentsTable.displayName,
      tokenAllocation: commitmentsTable.tokenAllocation,
      receiptUrl: commitmentsTable.receiptUrl,
      billingCountry: commitmentsTable.billingCountry,
      roundSlug: commitmentsTable.roundSlug,
      paymentMethod: commitmentsTable.paymentMethod,
      kycStatus: commitmentsTable.kycStatus,
      accreditationStatus: commitmentsTable.accreditationStatus,
      walletAddress: commitmentsTable.walletAddress,
      saftSignedAt: commitmentsTable.saftSignedAt,
      saftSignerName: saftSubmissionsTable.signatureName,
      fundedAt: commitmentsTable.fundedAt,
      createdAt: commitmentsTable.createdAt,
      completedAt: commitmentsTable.completedAt,
      refundedAt: commitmentsTable.refundedAt,
    })
    .from(commitmentsTable)
    .leftJoin(appUsersTable, eq(appUsersTable.id, commitmentsTable.userId))
    .leftJoin(
      saftSubmissionsTable,
      and(
        eq(saftSubmissionsTable.commitmentId, commitmentsTable.id),
        isNull(saftSubmissionsTable.supersededAt),
      ),
    )
    .orderBy(desc(commitmentsTable.createdAt))
    .limit(1000);

  const rows = status
    ? await baseQuery.where(eq(commitmentsTable.status, status))
    : await baseQuery;

  if ((req.query["format"] as string | undefined) === "csv") {
    const header = [
      "id",
      "created_at",
      "completed_at",
      "funded_at",
      "refunded_at",
      "email",
      "full_name",
      "tier_slug",
      "round_slug",
      "display_name",
      "amount_cents",
      "currency",
      "state",
      "status",
      "payment_method",
      "token_allocation",
      "billing_country",
      "saft_signed_at",
      "saft_signer_name",
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
        r.fundedAt,
        r.refundedAt,
        r.email,
        r.fullName,
        r.tierSlug,
        r.roundSlug,
        r.displayName,
        r.amountCents,
        r.currency,
        r.state,
        r.status,
        r.paymentMethod,
        r.tokenAllocation,
        r.billingCountry,
        r.saftSignedAt,
        r.saftSignerName,
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

router.get("/admin/commitments/:id/saft-pdf", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  // Admin can request a specific SAFT version via ?submissionId=. With
  // no submissionId we serve the latest active SAFT for the commitment;
  // when none exists (e.g. amended → pending_resign), fall back to the
  // most recent superseded one so admins can still pull historical PDFs.
  const submissionId =
    typeof req.query["submissionId"] === "string"
      ? req.query["submissionId"]
      : null;
  const whereClause = submissionId
    ? and(
        eq(saftSubmissionsTable.commitmentId, id),
        eq(saftSubmissionsTable.id, submissionId),
      )
    : eq(saftSubmissionsTable.commitmentId, id);
  const rows = await db
    .select({
      pdfBytes: saftSubmissionsTable.pdfBytes,
      countersignedPdfBytes: saftSubmissionsTable.countersignedPdfBytes,
      supersededAt: saftSubmissionsTable.supersededAt,
    })
    .from(saftSubmissionsTable)
    .where(whereClause)
    .orderBy(
      sql`(${saftSubmissionsTable.supersededAt} IS NULL) DESC`,
      desc(saftSubmissionsTable.signedAt),
    )
    .limit(1);
  const sub = rows[0];
  if (!sub || !sub.pdfBytes) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  // Admin always gets the latest binding version - prefer the
  // fully-executed (countersigned) PDF when it exists.
  const bytes = sub.countersignedPdfBytes ?? sub.pdfBytes;
  const suffix = sub.countersignedPdfBytes ? "fully-executed" : "signed";
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="aica-saft-${suffix}-${id}.pdf"`,
  );
  res.send(bytes);
});

/**
 * Apply the company countersignature to the active SAFT for a
 * commitment, producing the fully-executed instrument. Idempotent: if
 * already countersigned, returns the existing record. Body accepts an
 * optional `countersignerName` and `countersignerTitle` overriding the
 * default ("AICreatesAI Inc., Authorized Officer").
 */
router.post("/admin/commitments/:id/countersign", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const body = (req.body ?? {}) as {
    countersignerName?: string;
    countersignerTitle?: string;
  };
  const adminUser = req.appUser!;
  const countersignerName =
    (body.countersignerName?.trim() ||
      adminUser.fullName ||
      adminUser.email ||
      "AICreatesAI Inc., Authorized Officer").slice(0, 120);
  const countersignerTitle =
    body.countersignerTitle?.trim().slice(0, 120) || null;

  const rows = await db
    .select({
      submissionId: saftSubmissionsTable.id,
      pdfBytes: saftSubmissionsTable.pdfBytes,
      countersignedAt: saftSubmissionsTable.countersignedAt,
      countersignedPdfBytes: saftSubmissionsTable.countersignedPdfBytes,
      signedAt: saftSubmissionsTable.signedAt,
      signatureName: saftSubmissionsTable.signatureName,
      userId: saftSubmissionsTable.userId,
    })
    .from(saftSubmissionsTable)
    .where(
      and(
        eq(saftSubmissionsTable.commitmentId, id),
        isNull(saftSubmissionsTable.supersededAt),
      ),
    )
    .orderBy(desc(saftSubmissionsTable.signedAt))
    .limit(1);
  const sub = rows[0];
  if (!sub || !sub.pdfBytes) {
    res.status(404).json({ error: "No active signed SAFT for this commitment" });
    return;
  }
  if (sub.countersignedAt && sub.countersignedPdfBytes) {
    res.json({
      ok: true,
      alreadyCountersigned: true,
      countersignedAt: sub.countersignedAt,
    });
    return;
  }
  if (!sub.signedAt) {
    res.status(409).json({
      error: "Cannot countersign: investor signature timestamp is missing.",
    });
    return;
  }
  // Resolve investor legal name from their profile so the addendum
  // names the right party. Fall back to the typed signature name.
  const profile = (
    await db
      .select({
        kind: investorProfilesTable.kind,
        legalEntityName: investorProfilesTable.legalEntityName,
        legalFirstName: investorProfilesTable.legalFirstName,
        legalLastName: investorProfilesTable.legalLastName,
      })
      .from(investorProfilesTable)
      .where(eq(investorProfilesTable.userId, sub.userId))
      .limit(1)
  )[0];
  const investorLegalName =
    profile?.kind === "business"
      ? profile.legalEntityName ?? sub.signatureName
      : `${profile?.legalFirstName ?? ""} ${profile?.legalLastName ?? ""}`
          .trim() || sub.signatureName;

  const countersignedAt = new Date();
  const fullyExecuted = await appendCountersignPage(sub.pdfBytes, {
    countersignerName,
    countersignerTitle,
    countersignedAt: countersignedAt.toISOString(),
    commitmentId: id,
    investorLegalName,
    signedAtIso: sub.signedAt.toISOString(),
  });
  const updated = await db
    .update(saftSubmissionsTable)
    .set({
      countersignedAt,
      countersignedBy: adminUser.id,
      countersignerName,
      countersignerTitle,
      countersignedPdfBytes: fullyExecuted,
    })
    .where(
      and(
        eq(saftSubmissionsTable.id, sub.submissionId),
        isNull(saftSubmissionsTable.countersignedAt),
      ),
    )
    .returning({ id: saftSubmissionsTable.id });
  if (updated.length === 0) {
    res.json({ ok: true, alreadyCountersigned: true });
    return;
  }

  await logAdminAction({
    actorEmail: adminUser.email,
    action: "saft_countersign",
    targetType: "commitment",
    targetId: id,
    details: {
      countersignerName,
      countersignerTitle,
      submissionId: sub.submissionId,
      actorUserId: adminUser.id,
    },
  });

  res.json({ ok: true, countersignedAt: countersignedAt.toISOString() });
});

router.get("/admin/stats", async (_req, res) => {
  const result = await db.execute(sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'succeeded' OR status = 'funded') AS succeeded_count,
      COUNT(*) FILTER (WHERE status IN ('pending', 'pending_saft', 'pending_resign', 'pending_payment')) AS pending_count,
      COUNT(*) FILTER (WHERE status = 'awaiting_wire') AS awaiting_wire_count,
      COUNT(*) FILTER (WHERE status = 'awaiting_crypto') AS awaiting_crypto_count,
      COUNT(*) FILTER (WHERE status = 'refunded') AS refunded_count,
      COALESCE(SUM(amount_cents) FILTER (WHERE status IN ('succeeded', 'funded')), 0) AS total_succeeded_cents,
      COALESCE(SUM(token_allocation) FILTER (WHERE status IN ('succeeded', 'funded')), 0) AS total_tokens_allocated
    FROM commitments
  `);
  res.json({ stats: result.rows[0] ?? {} });
});

router.post("/admin/commitments/:id/confirm-wire", async (req, res) => {
  await confirmManual(req, res, "wire");
});

router.post("/admin/commitments/:id/confirm-crypto", async (req, res) => {
  await confirmManual(req, res, "crypto");
});

async function confirmManual(
  req: import("express").Request,
  res: import("express").Response,
  expectedMethod: "wire" | "crypto",
): Promise<void> {
  const id = req.params["id"] as string | undefined;
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const rows = await db
    .select()
    .from(commitmentsTable)
    .where(eq(commitmentsTable.id, id))
    .limit(1);
  const c = rows[0];
  if (!c) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (c.paymentMethod !== expectedMethod) {
    res
      .status(400)
      .json({ error: `Commitment is not a ${expectedMethod} payment` });
    return;
  }
  await db
    .update(commitmentsTable)
    .set({
      state: "funded",
      status: "succeeded",
      fundedAt: new Date(),
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(commitmentsTable.id, c.id));
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: `confirm_${expectedMethod}`,
    targetType: "commitment",
    targetId: c.id,
    details: { amountCents: c.amountCents, email: c.userId },
  });
  res.json({ ok: true });
}

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
    await db
      .update(commitmentsTable)
      .set({
        status: "refunded",
        state: "refunded",
        refundedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(commitmentsTable.id, commitment.id));
    await logAdminAction({
      actorEmail: req.appUser!.email,
      action: "refund",
      targetType: "commitment",
      targetId: commitment.id,
      details: {
        amountCents: commitment.amountCents,
        paymentIntentId: commitment.stripePaymentIntentId,
      },
    });
    res.json({ ok: true });
  } catch (err) {
    req.log?.error({ err, commitmentId: id }, "Refund failed");
    res.status(500).json({ error: "Refund failed" });
  }
});

export default router;
