import { Router, type IRouter } from "express";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  db,
  appUsersTable,
  commitmentsTable,
  saftSubmissionsTable,
  adminAuditLogTable,
  adminNotesTable,
  investorProfilesTable,
  allocationApplicationsTable,
} from "@workspace/db";
import { and, desc, eq, gte, ilike, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { logAdminAction } from "../lib/audit";
import { getUncachableStripeClient } from "../lib/stripeClient";
import { ROUNDS, ROUND_BY_SLUG, tokensForAmountCents } from "../lib/rounds";
import { sendExport, type ExportColumn } from "../lib/exports";

const router: IRouter = Router();

router.use("/admin", requireAuth, requireAdmin);

/* ---------------------------------------------------------------- *
 * 1. Overview
 * ---------------------------------------------------------------- */

router.get("/admin/overview", async (_req, res) => {
  const [stats] = (
    await db.execute(sql`
      SELECT
        COUNT(*) AS total_count,
        COUNT(*) FILTER (WHERE state = 'funded' OR status = 'succeeded') AS funded_count,
        COUNT(*) FILTER (WHERE state = 'awaiting_wire') AS awaiting_wire_count,
        COUNT(*) FILTER (WHERE state = 'awaiting_crypto') AS awaiting_crypto_count,
        COUNT(*) FILTER (WHERE state IN ('pending_saft','pending_resign','pending_payment')) AS pending_count,
        COUNT(*) FILTER (WHERE state = 'refunded' OR status = 'refunded') AS refunded_count,
        COUNT(DISTINCT user_id) FILTER (WHERE state = 'funded' OR status = 'succeeded') AS funded_investors,
        COALESCE(SUM(amount_cents) FILTER (WHERE state = 'funded' OR status = 'succeeded'), 0) AS funded_cents,
        COALESCE(SUM(amount_cents) FILTER (WHERE state IN ('awaiting_wire','awaiting_crypto','pending_payment')), 0) AS in_flight_cents,
        COALESCE(SUM(token_allocation) FILTER (WHERE state = 'funded' OR status = 'succeeded'), 0) AS allocated_tokens
      FROM commitments
    `)
  ).rows as Array<Record<string, unknown>>;

  const byRound = (
    await db.execute(sql`
      SELECT
        round_slug,
        COUNT(*) AS commitment_count,
        COALESCE(SUM(amount_cents) FILTER (WHERE state = 'funded' OR status = 'succeeded'), 0) AS funded_cents,
        COALESCE(SUM(token_allocation) FILTER (WHERE state = 'funded' OR status = 'succeeded'), 0) AS allocated_tokens,
        COUNT(*) FILTER (WHERE state = 'funded' OR status = 'succeeded') AS funded_count
      FROM commitments
      GROUP BY round_slug
      ORDER BY round_slug
    `)
  ).rows as Array<Record<string, unknown>>;

  const recentActivity = await db
    .select()
    .from(adminAuditLogTable)
    .orderBy(desc(adminAuditLogTable.createdAt))
    .limit(10);

  const userCount = (
    await db.execute(sql`SELECT COUNT(*) AS c FROM app_users`)
  ).rows[0] as Record<string, unknown> | undefined;
  const applicationCount = (
    await db.execute(sql`SELECT COUNT(*) AS c FROM allocation_applications`)
  ).rows[0] as Record<string, unknown> | undefined;

  res.json({
    stats: stats ?? {},
    byRound: byRound.map((r) => ({
      roundSlug: String(r["round_slug"] ?? ""),
      label:
        ROUND_BY_SLUG.get(String(r["round_slug"] ?? ""))?.label ??
        String(r["round_slug"] ?? ""),
      commitmentCount: Number(r["commitment_count"] ?? 0),
      fundedCount: Number(r["funded_count"] ?? 0),
      fundedCents: Number(r["funded_cents"] ?? 0),
      allocatedTokens: Number(r["allocated_tokens"] ?? 0),
    })),
    rounds: ROUNDS,
    recentActivity,
    totals: {
      users: Number(userCount?.["c"] ?? 0),
      applications: Number(applicationCount?.["c"] ?? 0),
    },
  });
});

/* ---------------------------------------------------------------- *
 * 2. Investors list (with search, role filter) + 3. exports
 * ---------------------------------------------------------------- */

interface InvestorRow {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  loginCount: number;
  stripeCustomerId: string | null;
  commitmentCount: number;
  fundedCount: number;
  fundedCents: number;
  pendingCents: number;
  totalTokens: number;
  hasProfile: boolean;
  country: string | null;
}

async function listInvestors(opts: {
  q?: string | null;
  role?: string | null;
  hasCommitments?: boolean | null;
  limit?: number;
}): Promise<InvestorRow[]> {
  const filters: ReturnType<typeof eq>[] = [];
  if (opts.q) {
    const like = `%${opts.q.toLowerCase()}%`;
    filters.push(
      or(
        ilike(appUsersTable.email, like),
        ilike(appUsersTable.fullName, like),
      )!,
    );
  }
  if (opts.role) {
    filters.push(eq(appUsersTable.role, opts.role));
  }

  const rows = await db
    .select({
      id: appUsersTable.id,
      email: appUsersTable.email,
      fullName: appUsersTable.fullName,
      role: appUsersTable.role,
      createdAt: appUsersTable.createdAt,
      lastLoginAt: appUsersTable.lastLoginAt,
      loginCount: appUsersTable.loginCount,
      stripeCustomerId: appUsersTable.stripeCustomerId,
      commitmentCount: sql<number>`COUNT(${commitmentsTable.id})::int`,
      fundedCount: sql<number>`COUNT(${commitmentsTable.id}) FILTER (WHERE ${commitmentsTable.state} = 'funded' OR ${commitmentsTable.status} = 'succeeded')::int`,
      fundedCents: sql<number>`COALESCE(SUM(${commitmentsTable.amountCents}) FILTER (WHERE ${commitmentsTable.state} = 'funded' OR ${commitmentsTable.status} = 'succeeded'), 0)::int`,
      pendingCents: sql<number>`COALESCE(SUM(${commitmentsTable.amountCents}) FILTER (WHERE ${commitmentsTable.state} IN ('awaiting_wire','awaiting_crypto','pending_payment')), 0)::int`,
      totalTokens: sql<number>`COALESCE(SUM(${commitmentsTable.tokenAllocation}) FILTER (WHERE ${commitmentsTable.state} = 'funded' OR ${commitmentsTable.status} = 'succeeded'), 0)::int`,
      hasProfile: sql<boolean>`(${investorProfilesTable.userId} IS NOT NULL)`,
      country: investorProfilesTable.country,
    })
    .from(appUsersTable)
    .leftJoin(commitmentsTable, eq(commitmentsTable.userId, appUsersTable.id))
    .leftJoin(
      investorProfilesTable,
      eq(investorProfilesTable.userId, appUsersTable.id),
    )
    .where(filters.length ? and(...filters) : undefined)
    .groupBy(appUsersTable.id, investorProfilesTable.userId)
    .orderBy(desc(appUsersTable.createdAt))
    .limit(opts.limit ?? 1000);

  if (opts.hasCommitments === true) {
    return rows.filter((r) => r.commitmentCount > 0);
  }
  if (opts.hasCommitments === false) {
    return rows.filter((r) => r.commitmentCount === 0);
  }
  return rows as InvestorRow[];
}

router.get("/admin/investors", async (req, res) => {
  const q = (req.query["q"] as string | undefined) || null;
  const role = (req.query["role"] as string | undefined) || null;
  const hasCommitmentsParam = req.query["hasCommitments"] as string | undefined;
  const hasCommitments =
    hasCommitmentsParam === "true"
      ? true
      : hasCommitmentsParam === "false"
        ? false
        : null;
  const format = req.query["format"] as string | undefined;

  const investors = await listInvestors({ q, role, hasCommitments });

  const cols: ExportColumn<InvestorRow>[] = [
    { key: "id", header: "id", get: (r) => r.id },
    { key: "email", header: "email", get: (r) => r.email },
    { key: "full_name", header: "full_name", get: (r) => r.fullName },
    { key: "role", header: "role", get: (r) => r.role },
    { key: "country", header: "country", get: (r) => r.country },
    { key: "created_at", header: "created_at", get: (r) => r.createdAt },
    { key: "last_login_at", header: "last_login_at", get: (r) => r.lastLoginAt },
    { key: "login_count", header: "login_count", get: (r) => r.loginCount },
    {
      key: "commitment_count",
      header: "commitment_count",
      get: (r) => r.commitmentCount,
    },
    { key: "funded_count", header: "funded_count", get: (r) => r.fundedCount },
    {
      key: "funded_cents",
      header: "funded_cents",
      get: (r) => r.fundedCents,
    },
    {
      key: "pending_cents",
      header: "pending_cents",
      get: (r) => r.pendingCents,
    },
    { key: "total_tokens", header: "total_tokens", get: (r) => r.totalTokens },
    {
      key: "stripe_customer_id",
      header: "stripe_customer_id",
      get: (r) => r.stripeCustomerId,
    },
  ];
  if (sendExport(res, format, investors, cols, "investors")) return;
  res.json({ investors });
});

/* ---------------------------------------------------------------- *
 * 4. Investor detail
 * ---------------------------------------------------------------- */

router.get("/admin/investors/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const userRows = await db
    .select()
    .from(appUsersTable)
    .where(eq(appUsersTable.id, id))
    .limit(1);
  const user = userRows[0];
  if (!user) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const profileRows = await db
    .select()
    .from(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, id))
    .limit(1);
  const commitments = await db
    .select()
    .from(commitmentsTable)
    .where(eq(commitmentsTable.userId, id))
    .orderBy(desc(commitmentsTable.createdAt));
  const notes = await db
    .select()
    .from(adminNotesTable)
    .where(eq(adminNotesTable.targetUserId, id))
    .orderBy(desc(adminNotesTable.createdAt));
  const audit = await db
    .select()
    .from(adminAuditLogTable)
    .where(eq(adminAuditLogTable.targetId, id))
    .orderBy(desc(adminAuditLogTable.createdAt))
    .limit(100);
  const apps = await db
    .select()
    .from(allocationApplicationsTable)
    .where(eq(allocationApplicationsTable.userId, id))
    .orderBy(desc(allocationApplicationsTable.createdAt));

  const commitmentIds = commitments.map((c) => c.id);
  const saftRows = commitmentIds.length
    ? await db
        .select({
          id: saftSubmissionsTable.id,
          commitmentId: saftSubmissionsTable.commitmentId,
          status: saftSubmissionsTable.status,
          payload: saftSubmissionsTable.payload,
          signatureName: saftSubmissionsTable.signatureName,
          signedAt: saftSubmissionsTable.signedAt,
          signerIp: saftSubmissionsTable.signerIp,
          signerUserAgent: saftSubmissionsTable.signerUserAgent,
          version: saftSubmissionsTable.version,
        })
        .from(saftSubmissionsTable)
        // Admin drawer shows full SAFT history per commitment (active +
        // superseded). The UI labels each row by `status` and offers a
        // per-version PDF link via `?submissionId=<id>`.
        .where(inArray(saftSubmissionsTable.commitmentId, commitmentIds))
        .orderBy(desc(saftSubmissionsTable.signedAt))
    : [];

  res.json({
    user,
    profile: profileRows[0] ?? null,
    commitments,
    saftSubmissions: saftRows,
    notes,
    audit,
    applications: apps,
    stripeMode: detectStripeMode(),
  });
});

function detectStripeMode(): "test" | "live" | "unknown" {
  const k =
    process.env["STRIPE_SECRET_KEY"] ??
    process.env["STRIPE_API_KEY"] ??
    "";
  if (k.startsWith("sk_live_")) return "live";
  if (k.startsWith("sk_test_")) return "test";
  return "unknown";
}

/* ---------------------------------------------------------------- *
 * 5. Update investor (role)
 * ---------------------------------------------------------------- */

router.patch("/admin/investors/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const { role, fullName } = (req.body ?? {}) as {
    role?: string;
    fullName?: string;
  };
  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (role !== undefined) {
    if (!["investor", "admin"].includes(role)) {
      res.status(400).json({ error: "invalid role" });
      return;
    }
    set["role"] = role;
  }
  if (fullName !== undefined) {
    set["fullName"] = fullName.trim().slice(0, 200) || null;
  }
  if (Object.keys(set).length === 1) {
    res.status(400).json({ error: "no fields to update" });
    return;
  }
  const updated = await db
    .update(appUsersTable)
    .set(set)
    .where(eq(appUsersTable.id, id))
    .returning();
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "update_investor",
    targetType: "app_user",
    targetId: id,
    details: { role, fullName },
  });
  res.json({ user: updated[0] });
});

/* ---------------------------------------------------------------- *
 * 6. Edit allocation (commitment)
 * ---------------------------------------------------------------- */

router.patch("/admin/commitments/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const body = (req.body ?? {}) as {
    amountCents?: number;
    tokenAllocation?: number;
    roundSlug?: string;
    tierSlug?: string;
    displayName?: string;
    walletAddress?: string;
    accreditationStatus?: string;
    recomputeTokens?: boolean;
  };
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
  const set: Record<string, unknown> = { updatedAt: new Date() };
  let nextRoundSlug = c.roundSlug;
  let nextAmountCents = c.amountCents;
  if (body.roundSlug !== undefined) {
    if (!ROUND_BY_SLUG.has(body.roundSlug)) {
      res.status(400).json({ error: "invalid roundSlug" });
      return;
    }
    set["roundSlug"] = body.roundSlug;
    nextRoundSlug = body.roundSlug;
  }
  if (body.amountCents !== undefined) {
    if (
      !Number.isFinite(body.amountCents) ||
      body.amountCents < 0 ||
      body.amountCents > 1_000_000_00 * 100
    ) {
      res.status(400).json({ error: "invalid amountCents" });
      return;
    }
    set["amountCents"] = Math.round(body.amountCents);
    nextAmountCents = Math.round(body.amountCents);
  }
  if (body.tierSlug !== undefined) set["tierSlug"] = body.tierSlug.slice(0, 80);
  if (body.displayName !== undefined)
    set["displayName"] = body.displayName.slice(0, 200);
  if (body.walletAddress !== undefined)
    set["walletAddress"] = body.walletAddress.trim().slice(0, 200) || null;
  if (body.accreditationStatus !== undefined)
    set["accreditationStatus"] =
      body.accreditationStatus.trim().slice(0, 120) || null;
  if (body.tokenAllocation !== undefined) {
    if (!Number.isFinite(body.tokenAllocation) || body.tokenAllocation < 0) {
      res.status(400).json({ error: "invalid tokenAllocation" });
      return;
    }
    set["tokenAllocation"] = Math.round(body.tokenAllocation);
  } else if (body.recomputeTokens) {
    const round = ROUND_BY_SLUG.get(nextRoundSlug);
    if (round) {
      set["tokenAllocation"] = tokensForAmountCents(
        nextAmountCents,
        round.pricePerTokenMillicents,
      );
    }
  }
  if (Object.keys(set).length === 1) {
    res.status(400).json({ error: "no fields to update" });
    return;
  }
  const updated = await db
    .update(commitmentsTable)
    .set(set)
    .where(eq(commitmentsTable.id, id))
    .returning();
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "edit_allocation",
    targetType: "commitment",
    targetId: id,
    details: {
      previous: {
        amountCents: c.amountCents,
        tokenAllocation: c.tokenAllocation,
        roundSlug: c.roundSlug,
        tierSlug: c.tierSlug,
      },
      next: set,
    },
  });
  res.json({ commitment: updated[0] });
});

/* ---------------------------------------------------------------- *
 * 7. Bulk commitment actions
 * ---------------------------------------------------------------- */

interface BulkResult {
  id: string;
  ok: boolean;
  error?: string;
}

router.post("/admin/commitments/bulk", async (req, res) => {
  const body = (req.body ?? {}) as { ids?: string[]; action?: string };
  const action = body.action;
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((s): s is string => typeof s === "string")
    : [];
  if (!ids.length) {
    res.status(400).json({ error: "ids required" });
    return;
  }
  if (ids.length > 200) {
    res.status(400).json({ error: "too many ids (max 200)" });
    return;
  }
  if (!action || !["confirm-wire", "confirm-crypto", "refund"].includes(action)) {
    res.status(400).json({ error: "invalid action" });
    return;
  }

  const rows = await db
    .select()
    .from(commitmentsTable)
    .where(inArray(commitmentsTable.id, ids));
  const byId = new Map(rows.map((r) => [r.id, r] as const));
  const results: BulkResult[] = [];

  let stripe: Awaited<ReturnType<typeof getUncachableStripeClient>> | null =
    null;
  if (action === "refund") {
    try {
      stripe = await getUncachableStripeClient();
    } catch {
      res.status(503).json({ error: "Stripe not configured" });
      return;
    }
  }

  for (const id of ids) {
    const c = byId.get(id);
    if (!c) {
      results.push({ id, ok: false, error: "not_found" });
      continue;
    }
    try {
      if (action === "confirm-wire" || action === "confirm-crypto") {
        const expected = action === "confirm-wire" ? "wire" : "crypto";
        if (c.paymentMethod !== expected) {
          results.push({ id, ok: false, error: `not_${expected}` });
          continue;
        }
        if (c.state === "funded" || c.status === "succeeded") {
          results.push({ id, ok: false, error: "already_funded" });
          continue;
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
          .where(eq(commitmentsTable.id, id));
        await logAdminAction({
          actorEmail: req.appUser!.email,
          action: `bulk_confirm_${expected}`,
          targetType: "commitment",
          targetId: id,
          details: { amountCents: c.amountCents },
        });
        results.push({ id, ok: true });
      } else if (action === "refund") {
        if (!c.stripePaymentIntentId) {
          results.push({ id, ok: false, error: "no_payment_intent" });
          continue;
        }
        if (c.status === "refunded") {
          results.push({ id, ok: false, error: "already_refunded" });
          continue;
        }
        await stripe!.refunds.create({
          payment_intent: c.stripePaymentIntentId,
          reason: "requested_by_customer",
          metadata: {
            refundedBy: req.appUser!.email,
            commitmentId: c.id,
            bulk: "true",
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
          .where(eq(commitmentsTable.id, id));
        await logAdminAction({
          actorEmail: req.appUser!.email,
          action: "bulk_refund",
          targetType: "commitment",
          targetId: id,
          details: {
            amountCents: c.amountCents,
            paymentIntentId: c.stripePaymentIntentId,
          },
        });
        results.push({ id, ok: true });
      }
    } catch (err) {
      req.log?.error({ err, id, action }, "Bulk action failed");
      results.push({
        id,
        ok: false,
        error: (err as Error).message ?? "error",
      });
    }
  }
  res.json({
    results,
    summary: {
      total: results.length,
      ok: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
    },
  });
});

/* ---------------------------------------------------------------- *
 * 8. Commitments list with global search + xlsx/csv export
 * ---------------------------------------------------------------- */

interface CommitmentRow {
  id: string;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  amountCents: number;
  currency: string;
  status: string;
  state: string;
  tierSlug: string;
  roundSlug: string;
  displayName: string;
  tokenAllocation: number;
  paymentMethod: string | null;
  saftSignedAt: Date | null;
  saftSignerName: string | null;
  fundedAt: Date | null;
  receiptUrl: string | null;
  billingCountry: string | null;
  createdAt: Date;
  completedAt: Date | null;
  refundedAt: Date | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string | null;
  kycStatus: string | null;
  accreditationStatus: string | null;
  walletAddress: string | null;
}

router.get("/admin/commitments-search", async (req, res) => {
  const q = (req.query["q"] as string | undefined) || null;
  const status = (req.query["status"] as string | undefined) || null;
  const round = (req.query["round"] as string | undefined) || null;
  const paymentMethod =
    (req.query["paymentMethod"] as string | undefined) || null;
  const since = parseDate(req.query["since"]);
  const until = parseDate(req.query["until"]);
  const format = req.query["format"] as string | undefined;

  const filters = [];
  if (status) {
    // Match either status or state column so legacy rows with diverging
    // values stay visible to the operator.
    filters.push(
      or(
        eq(commitmentsTable.status, status),
        eq(commitmentsTable.state, status),
      )!,
    );
  }
  if (round) filters.push(eq(commitmentsTable.roundSlug, round));
  if (paymentMethod) filters.push(eq(commitmentsTable.paymentMethod, paymentMethod));
  if (since) filters.push(gte(commitmentsTable.createdAt, since));
  if (until) filters.push(lte(commitmentsTable.createdAt, until));
  if (q) {
    const like = `%${q.toLowerCase()}%`;
    filters.push(
      or(
        ilike(appUsersTable.email, like),
        ilike(appUsersTable.fullName, like),
        ilike(commitmentsTable.displayName, like),
        sql`CAST(${commitmentsTable.id} AS TEXT) ILIKE ${like}`,
      )!,
    );
  }

  const rows = (await db
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
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(commitmentsTable.createdAt))
    .limit(2000)) as CommitmentRow[];

  const cols: ExportColumn<CommitmentRow>[] = [
    { key: "id", header: "id", get: (r) => r.id },
    { key: "created_at", header: "created_at", get: (r) => r.createdAt },
    { key: "funded_at", header: "funded_at", get: (r) => r.fundedAt },
    { key: "refunded_at", header: "refunded_at", get: (r) => r.refundedAt },
    { key: "email", header: "email", get: (r) => r.email },
    { key: "full_name", header: "full_name", get: (r) => r.fullName },
    { key: "round_slug", header: "round_slug", get: (r) => r.roundSlug },
    { key: "tier_slug", header: "tier_slug", get: (r) => r.tierSlug },
    { key: "display_name", header: "display_name", get: (r) => r.displayName },
    { key: "amount_cents", header: "amount_cents", get: (r) => r.amountCents },
    { key: "currency", header: "currency", get: (r) => r.currency },
    { key: "state", header: "state", get: (r) => r.state },
    { key: "status", header: "status", get: (r) => r.status },
    {
      key: "payment_method",
      header: "payment_method",
      get: (r) => r.paymentMethod,
    },
    {
      key: "token_allocation",
      header: "token_allocation",
      get: (r) => r.tokenAllocation,
    },
    {
      key: "billing_country",
      header: "billing_country",
      get: (r) => r.billingCountry,
    },
    {
      key: "saft_signed_at",
      header: "saft_signed_at",
      get: (r) => r.saftSignedAt,
    },
    {
      key: "saft_signer_name",
      header: "saft_signer_name",
      get: (r) => r.saftSignerName,
    },
    {
      key: "stripe_payment_intent_id",
      header: "stripe_payment_intent_id",
      get: (r) => r.stripePaymentIntentId,
    },
    {
      key: "stripe_customer_id",
      header: "stripe_customer_id",
      get: (r) => r.stripeCustomerId,
    },
    {
      key: "stripe_checkout_session_id",
      header: "stripe_checkout_session_id",
      get: (r) => r.stripeCheckoutSessionId,
    },
    { key: "receipt_url", header: "receipt_url", get: (r) => r.receiptUrl },
  ];
  if (sendExport(res, format, rows, cols, "commitments")) return;
  res.json({ commitments: rows });
});

/* ---------------------------------------------------------------- *
 * 9. Audit log filters + 10. exports
 * ---------------------------------------------------------------- */

router.get("/admin/audit-log/search", async (req, res) => {
  const actor = (req.query["actor"] as string | undefined) || null;
  const action = (req.query["action"] as string | undefined) || null;
  const targetId = (req.query["targetId"] as string | undefined) || null;
  const since = parseDate(req.query["since"]);
  const until = parseDate(req.query["until"]);
  const format = req.query["format"] as string | undefined;

  const filters = [];
  if (actor) filters.push(ilike(adminAuditLogTable.actorEmail, `%${actor}%`));
  if (action) filters.push(ilike(adminAuditLogTable.action, `%${action}%`));
  if (targetId) filters.push(eq(adminAuditLogTable.targetId, targetId));
  if (since) filters.push(gte(adminAuditLogTable.createdAt, since));
  if (until) filters.push(lte(adminAuditLogTable.createdAt, until));

  const rows = await db
    .select()
    .from(adminAuditLogTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(adminAuditLogTable.createdAt))
    .limit(2000);

  type Row = (typeof rows)[number];
  const cols: ExportColumn<Row>[] = [
    { key: "created_at", header: "created_at", get: (r) => r.createdAt },
    { key: "actor_email", header: "actor_email", get: (r) => r.actorEmail },
    { key: "action", header: "action", get: (r) => r.action },
    { key: "target_type", header: "target_type", get: (r) => r.targetType },
    { key: "target_id", header: "target_id", get: (r) => r.targetId },
    {
      key: "details",
      header: "details",
      get: (r) => JSON.stringify(r.details ?? {}),
    },
  ];
  if (sendExport(res, format, rows, cols, "audit-log")) return;
  res.json({ entries: rows });
});

/* ---------------------------------------------------------------- *
 * 11. Delete admin note
 * ---------------------------------------------------------------- */

router.delete("/admin/notes/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const deleted = await db
    .delete(adminNotesTable)
    .where(eq(adminNotesTable.id, id))
    .returning();
  if (!deleted[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "delete_note",
    targetType: "admin_note",
    targetId: id,
    details: { targetUserId: deleted[0].targetUserId },
  });
  res.json({ ok: true });
});

/* ---------------------------------------------------------------- *
 * 12. Edit admin note
 * ---------------------------------------------------------------- */

router.patch("/admin/notes/:id", async (req, res) => {
  const id = req.params["id"];
  if (!id) {
    res.status(400).json({ error: "id required" });
    return;
  }
  const body = (req.body ?? {}) as { body?: unknown };
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) {
    res.status(400).json({ error: "body required" });
    return;
  }
  const updated = await db
    .update(adminNotesTable)
    .set({ body: text })
    .where(eq(adminNotesTable.id, id))
    .returning();
  if (!updated[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "edit_note",
    targetType: "admin_note",
    targetId: id,
    details: { targetUserId: updated[0].targetUserId },
  });
  res.json({ note: updated[0] });
});

/* ---------------------------------------------------------------- *
 * helpers
 * ---------------------------------------------------------------- */

function parseDate(v: unknown): Date | null {
  if (typeof v !== "string" || !v) return null;
  const ms = Date.parse(v);
  if (Number.isNaN(ms)) return null;
  return new Date(ms);
}

export default router;
