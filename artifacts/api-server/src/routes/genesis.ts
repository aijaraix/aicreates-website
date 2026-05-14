import { Router, type IRouter, type Request } from "express";
import { z } from "zod";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import {
  db,
  appUsersTable,
  genesisReferrersTable,
  genesisLeadsTable,
  genesisLedgerTable,
  genesisRewardRulesTable,
  genesisSettingsTable,
  genesisReferralEventsTable,
} from "@workspace/db";
import { requireAuth, requireAdmin } from "../lib/auth";
import { logAdminAction } from "../lib/audit";
import { sendExport, type ExportColumn } from "../lib/exports";

const router: IRouter = Router();

/* ----------------------------- helpers --------------------------- */

const PRIVATE_MODE =
  (process.env.GENESIS_PRIVATE_MODE ?? "true").toLowerCase() !== "false";
const PUBLIC_REFERRAL_MODE =
  (process.env.PUBLIC_REFERRAL_MODE ?? "false").toLowerCase() === "true" &&
  !PRIVATE_MODE;
const TOKEN_POOL_TOTAL = Number(
  process.env.TOKEN_POOL_TOTAL ?? "250000000",
);
const POINT_TO_TOKEN_RATIO = Number(
  process.env.DEFAULT_POINT_TO_TOKEN_RATIO ?? "1",
);

const DEFAULT_RULES: Array<{
  actionKey: string;
  label: string;
  points: number;
  awardMode: "auto" | "manual_review";
}> = [
  { actionKey: "form_submit", label: "Lead form submitted", points: 100, awardMode: "auto" },
  { actionKey: "verified", label: "Lead verified", points: 250, awardMode: "manual_review" },
  { actionKey: "qualified", label: "Lead qualified", points: 500, awardMode: "manual_review" },
  { actionKey: "customer_onboarded", label: "Customer onboarded", points: 1000, awardMode: "manual_review" },
  { actionKey: "paid_customer", label: "Paid customer", points: 5000, awardMode: "manual_review" },
  { actionKey: "dev_signup", label: "Developer signup", points: 10000, awardMode: "manual_review" },
  { actionKey: "agency_signup", label: "Agency signup", points: 10000, awardMode: "manual_review" },
  { actionKey: "strategic_intro", label: "Strategic introduction", points: 15000, awardMode: "manual_review" },
  { actionKey: "investor_lead_verified", label: "Investor lead verified", points: 5000, awardMode: "manual_review" },
  { actionKey: "investor_meeting", label: "Investor meeting", points: 15000, awardMode: "manual_review" },
  { actionKey: "investor_funded", label: "Investor funded", points: 0, awardMode: "manual_review" },
];

let rulesSeeded = false;
async function seedRulesIfNeeded(): Promise<void> {
  if (rulesSeeded) return;
  for (const r of DEFAULT_RULES) {
    await db
      .insert(genesisRewardRulesTable)
      .values(r)
      .onConflictDoNothing();
  }
  rulesSeeded = true;
}

function genReferralCode(): string {
  // 8-char URL-safe code, low collision risk for invite-only program.
  return randomBytes(6).toString("base64url").slice(0, 8).toLowerCase();
}

function clientIp(req: Request): string | null {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string") return xf.split(",")[0]?.trim() || null;
  if (Array.isArray(xf)) return xf[0]?.split(",")[0]?.trim() || null;
  return req.socket.remoteAddress ?? null;
}

function isInvestorInterest(t: string): boolean {
  return t === "investor";
}

/* ----------------------------- public ---------------------------- */

/** Public flags + the resolved referrer when /r/:code is loaded. */
router.get("/genesis/public/flags", async (_req, res) => {
  res.json({
    privateMode: PRIVATE_MODE,
    publicReferralMode: PUBLIC_REFERRAL_MODE,
    tokenPoolTotal: TOKEN_POOL_TOTAL,
    pointToTokenRatio: POINT_TO_TOKEN_RATIO,
  });
});

router.get("/genesis/r/:code", async (req, res) => {
  const code = String(req.params.code ?? "").toLowerCase();
  const rows = await db
    .select({
      id: genesisReferrersTable.id,
      referralCode: genesisReferrersTable.referralCode,
      status: genesisReferrersTable.status,
      tier: genesisReferrersTable.tier,
      displayName: genesisReferrersTable.displayName,
      userFullName: appUsersTable.fullName,
    })
    .from(genesisReferrersTable)
    .leftJoin(appUsersTable, eq(genesisReferrersTable.userId, appUsersTable.id))
    .where(eq(genesisReferrersTable.referralCode, code))
    .limit(1);
  const r = rows[0];
  if (!r || r.status !== "approved") {
    res.status(404).json({ error: "Referral link not found" });
    return;
  }
  // Record click event (best-effort).
  try {
    await db.insert(genesisReferralEventsTable).values({
      referrerId: r.id,
      eventType: "click",
      ipAddress: clientIp(req),
      userAgent: req.headers["user-agent"] ?? null,
      utm: (req.query as Record<string, unknown>) ?? {},
      referer: (req.headers.referer as string) ?? null,
    });
  } catch (err) {
    req.log?.warn({ err }, "genesis click event insert failed");
  }
  res.json({
    referrer: {
      code: r.referralCode,
      tier: r.tier,
      displayName: r.displayName ?? r.userFullName ?? "An AICreatesAI partner",
    },
  });
});

const leadCaptureSchema = z.object({
  referralCode: z.string().min(2).max(40),
  name: z.string().trim().min(1).max(200),
  email: z.string().email().max(254),
  phone: z.string().trim().max(40).optional().nullable(),
  company: z.string().trim().max(200).optional().nullable(),
  country: z.string().trim().max(80).optional().nullable(),
  region: z.string().trim().max(120).optional().nullable(),
  interestType: z
    .enum([
      "customer",
      "enterprise",
      "developer",
      "agency",
      "investor",
      "partner",
      "other",
    ])
    .default("customer"),
  estimatedInvestmentRange: z.string().trim().max(80).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  consentAccepted: z.literal(true),
  utm: z.record(z.string(), z.unknown()).optional(),
  firstTouchPath: z.string().max(500).optional().nullable(),
  lastTouchPath: z.string().max(500).optional().nullable(),
});

router.post("/genesis/leads", async (req, res) => {
  const parsed = leadCaptureSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const v = parsed.data;
  const refRows = await db
    .select()
    .from(genesisReferrersTable)
    .where(eq(genesisReferrersTable.referralCode, v.referralCode.toLowerCase()))
    .limit(1);
  const referrer = refRows[0];
  if (!referrer || referrer.status !== "approved") {
    res.status(404).json({ error: "Referral link not found" });
    return;
  }

  // Basic same-email-as-referrer fraud check.
  let isFraud = false;
  try {
    const owner = await db
      .select({ email: appUsersTable.email })
      .from(appUsersTable)
      .where(eq(appUsersTable.id, referrer.userId))
      .limit(1);
    if (owner[0]?.email?.toLowerCase() === v.email.toLowerCase()) {
      isFraud = true;
    }
  } catch {
    // ignore
  }

  await seedRulesIfNeeded();

  const investor = isInvestorInterest(v.interestType);
  const inserted = await db
    .insert(genesisLeadsTable)
    .values({
      referrerId: referrer.id,
      name: v.name,
      email: v.email,
      phone: v.phone ?? null,
      company: v.company ?? null,
      country: v.country ?? null,
      region: v.region ?? null,
      interestType: v.interestType,
      estimatedInvestmentRange: v.estimatedInvestmentRange ?? null,
      notes: v.notes ?? null,
      consentAccepted: v.consentAccepted,
      submissionChannel: "public",
      ipAddress: clientIp(req),
      userAgent: req.headers["user-agent"] ?? null,
      utm: v.utm ?? {},
      firstTouchPath: v.firstTouchPath ?? null,
      lastTouchPath: v.lastTouchPath ?? null,
      status: investor ? "investor_review" : isFraud ? "compliance_hold" : "new",
    })
    .returning();
  const lead = inserted[0]!;

  await db.insert(genesisReferralEventsTable).values({
    referrerId: referrer.id,
    eventType: "form_submit",
    leadId: lead.id,
    ipAddress: clientIp(req),
    userAgent: req.headers["user-agent"] ?? null,
    utm: v.utm ?? {},
    referer: (req.headers.referer as string) ?? null,
  });

  // Auto-award form_submit points for non-investor, non-fraud leads.
  if (!investor && !isFraud) {
    const ruleRows = await db
      .select()
      .from(genesisRewardRulesTable)
      .where(eq(genesisRewardRulesTable.actionKey, "form_submit"))
      .limit(1);
    const rule = ruleRows[0];
    if (rule && rule.enabled && rule.awardMode === "auto") {
      const adjusted = Math.round(
        (rule.points * referrer.multiplierBp) / 100,
      );
      await db.insert(genesisLedgerTable).values({
        referrerId: referrer.id,
        leadId: lead.id,
        actionKey: "form_submit",
        pointsPending: adjusted,
        pointsApproved: 0,
        tokenEquivalent: 0,
        status: "pending",
      });
    }
  }

  res.status(201).json({ ok: true, leadId: lead.id });
});

const requestAccessSchema = z.object({
  email: z.string().email().max(254),
  fullName: z.string().trim().min(1).max(200),
  reason: z.string().trim().min(1).max(2000),
  source: z.string().trim().max(200).optional().nullable(),
});

router.post("/genesis/request-access", async (req, res) => {
  const parsed = requestAccessSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const v = parsed.data;
  const email = v.email.toLowerCase();

  // Resolve to an existing app_user (matched by email) when one exists -
  // e.g. an investor signing up for the referral program from the same email.
  // Otherwise stub a pending:genesis:{email} row that the auth middleware
  // migrates to the real Clerk userId on first sign-in.
  const existingUser = await db
    .select()
    .from(appUsersTable)
    .where(eq(appUsersTable.email, email))
    .limit(1);
  const pendingUserId = existingUser[0]?.id ?? `pending:genesis:${email}`;
  if (!existingUser[0]) {
    await db
      .insert(appUsersTable)
      .values({
        id: pendingUserId,
        email,
        fullName: v.fullName,
        role: "pending",
      })
      .onConflictDoNothing();
  }

  const existing = await db
    .select()
    .from(genesisReferrersTable)
    .where(eq(genesisReferrersTable.userId, pendingUserId))
    .limit(1);

  const intakeNote = `Request reason: ${v.reason}${v.source ? `\nSource: ${v.source}` : ""}\nIP: ${clientIp(req) ?? "n/a"}`;

  if (existing[0]) {
    // Public endpoint: never mutate an existing referrer record from anonymous
    // input (would let anyone overwrite a real referrer's displayName/notes by
    // submitting their email). Silently 409 - admins can see prior intake in
    // the audit trail and approved referrers don't need re-intake.
    res.status(409).json({
      ok: false,
      error: "A request for this email already exists.",
    });
    return;
  } else {
    await db
      .insert(genesisReferrersTable)
      .values({
        userId: pendingUserId,
        referralCode: genReferralCode(),
        tier: "family_friends",
        status: "pending",
        displayName: v.fullName,
        source: v.source ?? "request_access",
        adminNotes: intakeNote,
      });
  }

  res.status(201).json({ ok: true });
});

/* ----------------------- referrer self ---------------------------- */

router.get("/genesis/me", requireAuth, async (req, res) => {
  await seedRulesIfNeeded();
  const userId = req.appUser!.id;
  const role = req.appUser!.role;
  const rows = await db
    .select()
    .from(genesisReferrersTable)
    .where(eq(genesisReferrersTable.userId, userId))
    .limit(1);
  const referrer = rows[0] ?? null;
  // Gate self endpoints by role=referrer (or admin) AND approved status.
  // Non-referrers get a non-error response so the UI can show
  // "request access" without a 403 noise.
  const hasAccess =
    (role === "referrer" || role === "admin") &&
    (referrer?.status === "approved" || role === "admin");
  if (!hasAccess) {
    res.json({
      privateMode: PRIVATE_MODE,
      publicReferralMode: PUBLIC_REFERRAL_MODE,
      tokenPoolTotal: TOKEN_POOL_TOTAL,
      pointToTokenRatio: POINT_TO_TOKEN_RATIO,
      referrer,
      stats: {
        totalLeads: 0,
        verifiedLeads: 0,
        pendingPoints: 0,
        approvedPoints: 0,
        tokenEquivalent: 0,
      },
      leads: [],
      ledger: [],
    });
    return;
  }

  let stats = {
    totalLeads: 0,
    verifiedLeads: 0,
    pendingPoints: 0,
    approvedPoints: 0,
    tokenEquivalent: 0,
  };
  let leads: Array<Record<string, unknown>> = [];
  let ledger: Array<Record<string, unknown>> = [];

  if (referrer) {
    const leadRows = await db
      .select()
      .from(genesisLeadsTable)
      .where(eq(genesisLeadsTable.referrerId, referrer.id))
      .orderBy(desc(genesisLeadsTable.createdAt))
      .limit(500);
    leads = leadRows;
    const ledgerRows = await db
      .select()
      .from(genesisLedgerTable)
      .where(eq(genesisLedgerTable.referrerId, referrer.id))
      .orderBy(desc(genesisLedgerTable.createdAt))
      .limit(500);
    ledger = ledgerRows;

    stats.totalLeads = leadRows.length;
    stats.verifiedLeads = leadRows.filter((l) =>
      ["verified", "qualified", "converted", "investor_meeting", "investor_funded"].includes(l.status),
    ).length;
    for (const e of ledgerRows) {
      stats.pendingPoints += e.pointsPending;
      stats.approvedPoints += e.pointsApproved;
      stats.tokenEquivalent += Number(e.tokenEquivalent);
    }
  }

  res.json({
    privateMode: PRIVATE_MODE,
    publicReferralMode: PUBLIC_REFERRAL_MODE,
    tokenPoolTotal: TOKEN_POOL_TOTAL,
    pointToTokenRatio: POINT_TO_TOKEN_RATIO,
    referrer,
    stats,
    leads,
    ledger,
  });
});

const compensationSchema = z.object({
  compensationType: z.enum(["token", "credit", "cash", "hybrid"]),
  compensationSplit: z
    .object({
      token: z.number().min(0).max(100).optional(),
      credit: z.number().min(0).max(100).optional(),
      cash: z.number().min(0).max(100).optional(),
    })
    .optional(),
  displayName: z.string().trim().max(200).optional().nullable(),
});

router.put("/genesis/me", requireAuth, async (req, res) => {
  const parsed = compensationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const role = req.appUser!.role;
  if (role !== "referrer" && role !== "admin") {
    res.status(403).json({ error: "Referrer role required" });
    return;
  }
  const userId = req.appUser!.id;
  const updated = await db
    .update(genesisReferrersTable)
    .set({
      compensationType: parsed.data.compensationType,
      compensationSplit: parsed.data.compensationSplit ?? {},
      displayName: parsed.data.displayName ?? null,
      updatedAt: new Date(),
    })
    .where(eq(genesisReferrersTable.userId, userId))
    .returning();
  if (!updated[0]) {
    res.status(404).json({ error: "Referrer not found" });
    return;
  }
  res.json({ referrer: updated[0] });
});

const manualLeadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().email().max(254),
  phone: z.string().trim().max(40).optional().nullable(),
  company: z.string().trim().max(200).optional().nullable(),
  country: z.string().trim().max(80).optional().nullable(),
  interestType: z
    .enum([
      "customer",
      "enterprise",
      "developer",
      "agency",
      "investor",
      "partner",
      "other",
    ])
    .default("customer"),
  estimatedInvestmentRange: z.string().trim().max(80).optional().nullable(),
  referrerNotes: z.string().trim().max(2000).optional().nullable(),
});

router.post("/genesis/leads/manual", requireAuth, async (req, res) => {
  const parsed = manualLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const role = req.appUser!.role;
  if (role !== "referrer" && role !== "admin") {
    res.status(403).json({ error: "Referrer role required" });
    return;
  }
  const v = parsed.data;
  const userId = req.appUser!.id;
  const refRows = await db
    .select()
    .from(genesisReferrersTable)
    .where(eq(genesisReferrersTable.userId, userId))
    .limit(1);
  const referrer = refRows[0];
  if (!referrer || referrer.status !== "approved") {
    res.status(403).json({ error: "Referrer not approved" });
    return;
  }
  const investor = isInvestorInterest(v.interestType);
  const inserted = await db
    .insert(genesisLeadsTable)
    .values({
      referrerId: referrer.id,
      name: v.name,
      email: v.email,
      phone: v.phone ?? null,
      company: v.company ?? null,
      country: v.country ?? null,
      interestType: v.interestType,
      estimatedInvestmentRange: v.estimatedInvestmentRange ?? null,
      referrerNotes: v.referrerNotes ?? null,
      consentAccepted: true,
      submissionChannel: "manual",
      status: investor ? "investor_review" : "new",
    })
    .returning();
  res.status(201).json({ ok: true, lead: inserted[0] });
});

/* ------------------------------ admin --------------------------------- */

router.use("/admin/genesis", requireAuth, requireAdmin);

router.get("/admin/genesis/overview", async (_req, res) => {
  await seedRulesIfNeeded();
  const [refStats] = (
    await db.execute(sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status='approved') AS approved,
        COUNT(*) FILTER (WHERE status='pending') AS pending
      FROM genesis_referrers
      WHERE referral_code != '_intake'
    `)
  ).rows as Array<Record<string, unknown>>;
  const [leadStats] = (
    await db.execute(sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE interest_type='investor') AS investor_leads,
        COUNT(*) FILTER (WHERE interest_type IN ('customer','enterprise')) AS customer_leads,
        COUNT(*) FILTER (WHERE status IN ('verified','qualified','converted')) AS qualified_count
      FROM genesis_leads
    `)
  ).rows as Array<Record<string, unknown>>;
  const [pointStats] = (
    await db.execute(sql`
      SELECT
        COALESCE(SUM(points_pending),0) AS pending_points,
        COALESCE(SUM(points_approved),0) AS approved_points,
        COALESCE(SUM(token_equivalent),0) AS token_reserved
      FROM genesis_ledger
    `)
  ).rows as Array<Record<string, unknown>>;
  const [fraudStats] = (
    await db.execute(sql`
      SELECT COUNT(*) AS open_flags
      FROM genesis_fraud_flags
      WHERE status='open'
    `)
  ).rows as Array<Record<string, unknown>>;

  const reserved = Number(pointStats?.["token_reserved"] ?? 0);
  res.json({
    referrers: refStats ?? {},
    leads: leadStats ?? {},
    points: pointStats ?? {},
    fraud: fraudStats ?? {},
    pool: {
      total: TOKEN_POOL_TOTAL,
      reserved,
      remaining: Math.max(0, TOKEN_POOL_TOTAL - reserved),
    },
    flags: { privateMode: PRIVATE_MODE, publicReferralMode: PUBLIC_REFERRAL_MODE },
  });
});

router.get("/admin/genesis/referrers", async (req, res) => {
  const referrers = await db
    .select({
      id: genesisReferrersTable.id,
      userId: genesisReferrersTable.userId,
      referralCode: genesisReferrersTable.referralCode,
      tier: genesisReferrersTable.tier,
      status: genesisReferrersTable.status,
      multiplierBp: genesisReferrersTable.multiplierBp,
      compensationType: genesisReferrersTable.compensationType,
      displayName: genesisReferrersTable.displayName,
      adminNotes: genesisReferrersTable.adminNotes,
      createdAt: genesisReferrersTable.createdAt,
      email: appUsersTable.email,
      fullName: appUsersTable.fullName,
    })
    .from(genesisReferrersTable)
    .leftJoin(appUsersTable, eq(genesisReferrersTable.userId, appUsersTable.id))
    .orderBy(desc(genesisReferrersTable.createdAt))
    .limit(500);

  const filtered = referrers.filter((r) => r.referralCode !== "_intake");

  if (req.query.format) {
    const cols: ExportColumn<(typeof filtered)[number]>[] = [
      { key: "code", header: "Referral Code", get: (r) => r.referralCode },
      { key: "email", header: "Email", get: (r) => r.email ?? "" },
      { key: "name", header: "Name", get: (r) => r.fullName ?? r.displayName ?? "" },
      { key: "tier", header: "Tier", get: (r) => r.tier },
      { key: "status", header: "Status", get: (r) => r.status },
      { key: "multiplier", header: "Multiplier %", get: (r) => r.multiplierBp },
      { key: "comp", header: "Compensation", get: (r) => r.compensationType },
      { key: "createdAt", header: "Created", get: (r) => r.createdAt as unknown as Date },
    ];
    const sent = sendExport(res, String(req.query.format), filtered, cols, "genesis-referrers");
    if (sent) return;
  }

  res.json({ referrers: filtered });
});

const updateReferrerSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "disabled"]).optional(),
  tier: z
    .enum([
      "family_friends",
      "trusted_introducer",
      "genesis_partner",
      "strategic",
      "creator",
      "developer",
      "agency",
      "investor_introduction",
    ])
    .optional(),
  multiplierBp: z.number().int().min(0).max(1000).optional(),
  adminNotes: z.string().max(2000).optional().nullable(),
  displayName: z.string().max(200).optional().nullable(),
});

router.patch("/admin/genesis/referrers/:id", async (req, res) => {
  const parsed = updateReferrerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const id = String(req.params.id);
  const update: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: new Date(),
  };
  if (parsed.data.status === "approved") {
    update.approvedAt = new Date();
    update.approvedBy = req.appUser!.email;
    // Promote underlying app_user role to referrer (don't downgrade admins).
    const ref = await db
      .select()
      .from(genesisReferrersTable)
      .where(eq(genesisReferrersTable.id, id))
      .limit(1);
    if (ref[0]) {
      await db
        .update(appUsersTable)
        .set({ role: "referrer", updatedAt: new Date() })
        .where(
          and(
            eq(appUsersTable.id, ref[0].userId),
            sql`role NOT IN ('admin','system')`,
          ),
        );
    }
  }
  const updated = await db
    .update(genesisReferrersTable)
    .set(update)
    .where(eq(genesisReferrersTable.id, id))
    .returning();
  if (!updated[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "genesis.referrer.update",
    targetType: "genesis_referrer",
    targetId: id,
    details: parsed.data as Record<string, unknown>,
  });
  res.json({ referrer: updated[0] });
});

const promoteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().trim().max(200).optional().nullable(),
  tier: z
    .enum([
      "family_friends",
      "trusted_introducer",
      "genesis_partner",
      "strategic",
      "creator",
      "developer",
      "agency",
      "investor_introduction",
    ])
    .default("family_friends"),
  status: z
    .enum(["pending", "approved"])
    .default("approved"),
});

router.post("/admin/genesis/referrers", async (req, res) => {
  const parsed = promoteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const v = parsed.data;
  // Find or create the underlying app_user.
  const existing = await db
    .select()
    .from(appUsersTable)
    .where(eq(appUsersTable.email, v.email))
    .limit(1);
  let user = existing[0];
  if (!user) {
    const newId = `pending:${randomBytes(8).toString("hex")}`;
    const inserted = await db
      .insert(appUsersTable)
      .values({
        id: newId,
        email: v.email,
        fullName: v.fullName ?? null,
        role: "referrer",
      })
      .returning();
    user = inserted[0]!;
  } else if (v.status === "approved" && user.role !== "admin") {
    await db
      .update(appUsersTable)
      .set({ role: "referrer", fullName: v.fullName ?? user.fullName })
      .where(eq(appUsersTable.id, user.id));
  }
  // Generate unique referral code (retry on collision).
  let code = "";
  for (let i = 0; i < 5; i++) {
    code = genReferralCode();
    const collision = await db
      .select({ id: genesisReferrersTable.id })
      .from(genesisReferrersTable)
      .where(eq(genesisReferrersTable.referralCode, code))
      .limit(1);
    if (!collision[0]) break;
  }
  const inserted = await db
    .insert(genesisReferrersTable)
    .values({
      userId: user.id,
      referralCode: code,
      tier: v.tier,
      status: v.status,
      approvedAt: v.status === "approved" ? new Date() : null,
      approvedBy: v.status === "approved" ? req.appUser!.email : null,
      displayName: v.fullName ?? null,
    })
    .onConflictDoNothing()
    .returning();
  if (!inserted[0]) {
    res.status(409).json({ error: "Referrer already exists for this user" });
    return;
  }
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "genesis.referrer.create",
    targetType: "genesis_referrer",
    targetId: inserted[0].id,
    details: { email: v.email, tier: v.tier, status: v.status },
  });
  res.status(201).json({ referrer: inserted[0] });
});

router.get("/admin/genesis/leads", async (req, res) => {
  const status = req.query.status ? String(req.query.status) : null;
  const interest = req.query.interest ? String(req.query.interest) : null;
  const conds = [] as unknown[];
  if (status) conds.push(eq(genesisLeadsTable.status, status));
  if (interest) conds.push(eq(genesisLeadsTable.interestType, interest));
  const where = conds.length
    ? and(...(conds as Parameters<typeof and>))
    : undefined;
  const rows = await db
    .select({
      id: genesisLeadsTable.id,
      referrerId: genesisLeadsTable.referrerId,
      name: genesisLeadsTable.name,
      email: genesisLeadsTable.email,
      phone: genesisLeadsTable.phone,
      company: genesisLeadsTable.company,
      country: genesisLeadsTable.country,
      interestType: genesisLeadsTable.interestType,
      estimatedInvestmentRange: genesisLeadsTable.estimatedInvestmentRange,
      status: genesisLeadsTable.status,
      submissionChannel: genesisLeadsTable.submissionChannel,
      notes: genesisLeadsTable.notes,
      adminNotes: genesisLeadsTable.adminNotes,
      createdAt: genesisLeadsTable.createdAt,
      referralCode: genesisReferrersTable.referralCode,
      referrerEmail: appUsersTable.email,
    })
    .from(genesisLeadsTable)
    .leftJoin(
      genesisReferrersTable,
      eq(genesisLeadsTable.referrerId, genesisReferrersTable.id),
    )
    .leftJoin(appUsersTable, eq(genesisReferrersTable.userId, appUsersTable.id))
    .where(where as never)
    .orderBy(desc(genesisLeadsTable.createdAt))
    .limit(1000);

  if (req.query.format) {
    const cols: ExportColumn<(typeof rows)[number]>[] = [
      { key: "id", header: "Lead ID", get: (l) => l.id },
      { key: "code", header: "Referrer Code", get: (l) => l.referralCode ?? "" },
      { key: "ref_email", header: "Referrer Email", get: (l) => l.referrerEmail ?? "" },
      { key: "name", header: "Name", get: (l) => l.name },
      { key: "email", header: "Email", get: (l) => l.email },
      { key: "phone", header: "Phone", get: (l) => l.phone ?? "" },
      { key: "company", header: "Company", get: (l) => l.company ?? "" },
      { key: "country", header: "Country", get: (l) => l.country ?? "" },
      { key: "interest", header: "Interest", get: (l) => l.interestType },
      { key: "range", header: "Range", get: (l) => l.estimatedInvestmentRange ?? "" },
      { key: "status", header: "Status", get: (l) => l.status },
      { key: "channel", header: "Channel", get: (l) => l.submissionChannel },
      { key: "createdAt", header: "Created", get: (l) => l.createdAt as unknown as Date },
    ];
    const sent = sendExport(res, String(req.query.format), rows, cols, "genesis-leads");
    if (sent) return;
  }
  res.json({ leads: rows });
});

const updateLeadSchema = z.object({
  status: z.string().min(1).max(40).optional(),
  adminNotes: z.string().max(4000).optional().nullable(),
});

router.patch("/admin/genesis/leads/:id", async (req, res) => {
  const parsed = updateLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const id = String(req.params.id);
  const updated = await db
    .update(genesisLeadsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(genesisLeadsTable.id, id))
    .returning();
  if (!updated[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "genesis.lead.update",
    targetType: "genesis_lead",
    targetId: id,
    details: parsed.data as Record<string, unknown>,
  });
  res.json({ lead: updated[0] });
});

router.get("/admin/genesis/ledger", async (req, res) => {
  const status = req.query.status ? String(req.query.status) : null;
  const where = status ? eq(genesisLedgerTable.status, status) : undefined;
  const rows = await db
    .select({
      id: genesisLedgerTable.id,
      referrerId: genesisLedgerTable.referrerId,
      leadId: genesisLedgerTable.leadId,
      actionKey: genesisLedgerTable.actionKey,
      bonusLabel: genesisLedgerTable.bonusLabel,
      pointsPending: genesisLedgerTable.pointsPending,
      pointsApproved: genesisLedgerTable.pointsApproved,
      tokenEquivalent: genesisLedgerTable.tokenEquivalent,
      status: genesisLedgerTable.status,
      approverEmail: genesisLedgerTable.approverEmail,
      approvedAt: genesisLedgerTable.approvedAt,
      rejectedReason: genesisLedgerTable.rejectedReason,
      notes: genesisLedgerTable.notes,
      createdAt: genesisLedgerTable.createdAt,
      referralCode: genesisReferrersTable.referralCode,
      referrerEmail: appUsersTable.email,
    })
    .from(genesisLedgerTable)
    .leftJoin(
      genesisReferrersTable,
      eq(genesisLedgerTable.referrerId, genesisReferrersTable.id),
    )
    .leftJoin(appUsersTable, eq(genesisReferrersTable.userId, appUsersTable.id))
    .where(where as never)
    .orderBy(desc(genesisLedgerTable.createdAt))
    .limit(1000);

  if (req.query.format) {
    const cols: ExportColumn<(typeof rows)[number]>[] = [
      { key: "id", header: "Ledger ID", get: (l) => l.id },
      { key: "code", header: "Referrer", get: (l) => l.referralCode ?? "" },
      { key: "ref_email", header: "Referrer Email", get: (l) => l.referrerEmail ?? "" },
      { key: "action", header: "Action", get: (l) => l.actionKey },
      { key: "bonus", header: "Bonus", get: (l) => l.bonusLabel ?? "" },
      { key: "pending", header: "Pending", get: (l) => l.pointsPending },
      { key: "approved", header: "Approved", get: (l) => l.pointsApproved },
      { key: "tokens", header: "Tokens", get: (l) => Number(l.tokenEquivalent) },
      { key: "status", header: "Status", get: (l) => l.status },
      { key: "approver", header: "Approver", get: (l) => l.approverEmail ?? "" },
      { key: "createdAt", header: "Created", get: (l) => l.createdAt as unknown as Date },
    ];
    const sent = sendExport(res, String(req.query.format), rows, cols, "genesis-ledger");
    if (sent) return;
  }
  res.json({ ledger: rows });
});

const ledgerActionSchema = z.object({
  action: z.enum(["approve", "reject", "compliance_hold", "manual_adjust", "named_bonus"]),
  pointsApproved: z.number().int().min(0).optional(),
  pointsPending: z.number().int().min(0).optional(),
  rejectedReason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

router.patch("/admin/genesis/ledger/:id", async (req, res) => {
  const parsed = ledgerActionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const id = String(req.params.id);
  const v = parsed.data;
  const update: Record<string, unknown> = {
    updatedAt: new Date(),
    notes: v.notes ?? null,
  };
  if (v.action === "approve") {
    update.status = "approved";
    update.approverEmail = req.appUser!.email;
    update.approvedAt = new Date();
    if (typeof v.pointsApproved === "number") {
      update.pointsApproved = v.pointsApproved;
      update.pointsPending = 0;
      update.tokenEquivalent = Math.round(v.pointsApproved * POINT_TO_TOKEN_RATIO);
    }
  } else if (v.action === "reject") {
    update.status = "rejected";
    update.approverEmail = req.appUser!.email;
    update.rejectedReason = v.rejectedReason ?? null;
    update.pointsApproved = 0;
    update.pointsPending = 0;
    update.tokenEquivalent = 0;
  } else if (v.action === "compliance_hold") {
    update.status = "compliance_hold";
  } else if (v.action === "manual_adjust") {
    if (typeof v.pointsApproved === "number") {
      update.pointsApproved = v.pointsApproved;
      update.tokenEquivalent = Math.round(v.pointsApproved * POINT_TO_TOKEN_RATIO);
    }
    if (typeof v.pointsPending === "number") {
      update.pointsPending = v.pointsPending;
    }
  }
  const updated = await db
    .update(genesisLedgerTable)
    .set(update)
    .where(eq(genesisLedgerTable.id, id))
    .returning();
  if (!updated[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: `genesis.ledger.${v.action}`,
    targetType: "genesis_ledger",
    targetId: id,
    details: v as Record<string, unknown>,
  });
  res.json({ entry: updated[0] });
});

const namedBonusSchema = z.object({
  referrerId: z.string().uuid(),
  bonusLabel: z.enum([
    "Strategic Introduction Bonus",
    "Investor Introduction Bonus",
    "Enterprise Customer Bonus",
    "Advisor/Partner Bonus",
    "Special Founder Approved Bonus",
  ]),
  pointsApproved: z.number().int().min(0),
  notes: z.string().max(2000).optional(),
});

router.post("/admin/genesis/ledger/bonus", async (req, res) => {
  const parsed = namedBonusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const v = parsed.data;
  const inserted = await db
    .insert(genesisLedgerTable)
    .values({
      referrerId: v.referrerId,
      actionKey: "named_bonus",
      bonusLabel: v.bonusLabel,
      pointsPending: 0,
      pointsApproved: v.pointsApproved,
      tokenEquivalent: Math.round(v.pointsApproved * POINT_TO_TOKEN_RATIO),
      status: "approved",
      approverEmail: req.appUser!.email,
      approvedAt: new Date(),
      notes: v.notes ?? null,
    })
    .returning();
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "genesis.ledger.named_bonus",
    targetType: "genesis_ledger",
    targetId: inserted[0]!.id,
    details: v as Record<string, unknown>,
  });
  res.status(201).json({ entry: inserted[0] });
});

router.get("/admin/genesis/rules", async (_req, res) => {
  await seedRulesIfNeeded();
  const rules = await db
    .select()
    .from(genesisRewardRulesTable)
    .orderBy(genesisRewardRulesTable.actionKey);
  res.json({ rules });
});

const updateRuleSchema = z.object({
  points: z.number().int().min(0).max(1000000).optional(),
  awardMode: z.enum(["auto", "manual_review"]).optional(),
  enabled: z.boolean().optional(),
  notes: z.string().max(2000).optional().nullable(),
});

router.patch("/admin/genesis/rules/:id", async (req, res) => {
  const parsed = updateRuleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  const id = String(req.params.id);
  const updated = await db
    .update(genesisRewardRulesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(genesisRewardRulesTable.id, id))
    .returning();
  if (!updated[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "genesis.rule.update",
    targetType: "genesis_rule",
    targetId: id,
    details: parsed.data as Record<string, unknown>,
  });
  res.json({ rule: updated[0] });
});

async function loadSettings() {
  const rows = await db
    .select()
    .from(genesisSettingsTable)
    .where(eq(genesisSettingsTable.id, "singleton"))
    .limit(1);
  if (rows[0]) return rows[0];
  const inserted = await db
    .insert(genesisSettingsTable)
    .values({
      id: "singleton",
      publicReferralMode: PUBLIC_REFERRAL_MODE,
      tokenPoolTotal: TOKEN_POOL_TOTAL,
      pointToTokenRatio: POINT_TO_TOKEN_RATIO,
    })
    .onConflictDoNothing()
    .returning();
  if (inserted[0]) return inserted[0];
  return (
    await db
      .select()
      .from(genesisSettingsTable)
      .where(eq(genesisSettingsTable.id, "singleton"))
      .limit(1)
  )[0]!;
}

router.get("/admin/genesis/settings", async (_req, res) => {
  const s = await loadSettings();
  res.json({
    privateMode: PRIVATE_MODE,
    privateModeLocked: true,
    publicReferralMode: s.publicReferralMode,
    perReferrerPointCap: s.perReferrerPointCap,
    perCampaignPointCap: s.perCampaignPointCap,
    tokenPoolTotal: s.tokenPoolTotal,
    pointToTokenRatio: s.pointToTokenRatio,
    note:
      "Private mode is env-locked (GENESIS_PRIVATE_MODE) and cannot be toggled here. While private mode is on, public referral mode is forced off regardless of the value below.",
  });
});

const updateSettingsSchema = z.object({
  publicReferralMode: z.boolean().optional(),
  perReferrerPointCap: z.number().int().min(0).max(10_000_000_000).optional(),
  perCampaignPointCap: z.number().int().min(0).max(10_000_000_000).optional(),
  tokenPoolTotal: z.number().int().min(0).max(10_000_000_000_000).optional(),
  pointToTokenRatio: z.number().int().min(1).max(1_000_000).optional(),
});

router.put("/admin/genesis/settings", async (req, res) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    return;
  }
  await loadSettings();
  const update: Record<string, unknown> = {
    ...parsed.data,
    updatedAt: new Date(),
    updatedBy: req.appUser!.email,
  };
  // Hard-lock: while env says private mode, never persist publicReferralMode=true.
  if (PRIVATE_MODE) update.publicReferralMode = false;
  const updated = await db
    .update(genesisSettingsTable)
    .set(update)
    .where(eq(genesisSettingsTable.id, "singleton"))
    .returning();
  await logAdminAction({
    actorEmail: req.appUser!.email,
    action: "genesis.settings.update",
    targetType: "genesis_settings",
    targetId: "singleton",
    details: parsed.data as Record<string, unknown>,
  });
  res.json({ settings: updated[0] });
});

export default router;
