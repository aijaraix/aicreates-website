import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  bigint,
  jsonb,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { appUsersTable } from "./app_users";

/**
 * Genesis Referral System (Phase 1 MVP).
 *
 * One `genesis_referrers` row per approved (or pending) referrer.
 * Tied 1:1 to `app_users` via userId. Holds tier, status, multiplier,
 * compensation preference, and the unique referral_code.
 */
export const genesisReferrersTable = pgTable(
  "genesis_referrers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsersTable.id, { onDelete: "cascade" }),
    referralCode: text("referral_code").notNull(),
    /** family_friends | trusted_introducer | genesis_partner | strategic | creator | developer | agency | investor_introduction */
    tier: text("tier").notNull().default("family_friends"),
    /** pending | approved | rejected | disabled */
    status: text("status").notNull().default("pending"),
    /** Point multiplier (1.0 default, e.g. 1.5 = 150%). Stored x100 as integer. */
    multiplierBp: integer("multiplier_bp").notNull().default(100),
    /** token | credit | cash | hybrid */
    compensationType: text("compensation_type").notNull().default("token"),
    /** For hybrid: { token: 50, credit: 25, cash: 25 } summing to 100. */
    compensationSplit: jsonb("compensation_split").notNull().default({}),
    /** Public display name for the referrer (defaults to user.fullName). */
    displayName: text("display_name"),
    /** Internal admin notes about this referrer. */
    adminNotes: text("admin_notes"),
    /** Where they were sourced from (referral, direct, invitation). */
    source: text("source"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: text("approved_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: uniqueIndex("genesis_referrers_user_idx").on(t.userId),
    codeIdx: uniqueIndex("genesis_referrers_code_idx").on(t.referralCode),
    statusIdx: index("genesis_referrers_status_idx").on(t.status),
  }),
);

/** Visit + form-submit events for /r/:code links. */
export const genesisReferralEventsTable = pgTable(
  "genesis_referral_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => genesisReferrersTable.id, { onDelete: "cascade" }),
    /** click | form_submit | manual_intro */
    eventType: text("event_type").notNull(),
    leadId: uuid("lead_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    utm: jsonb("utm").notNull().default({}),
    referer: text("referer"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    referrerIdx: index("genesis_referral_events_referrer_idx").on(t.referrerId),
    typeIdx: index("genesis_referral_events_type_idx").on(t.eventType),
  }),
);

/** A captured lead (introduction). Either via /r/:code public form or
 * manually submitted by the referrer from their dashboard. */
export const genesisLeadsTable = pgTable(
  "genesis_leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => genesisReferrersTable.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    company: text("company"),
    country: text("country"),
    region: text("region"),
    /** customer | enterprise | developer | agency | investor | partner | other */
    interestType: text("interest_type").notNull().default("customer"),
    estimatedInvestmentRange: text("estimated_investment_range"),
    notes: text("notes"),
    /** Referrer's own notes if submitted via manual intro. */
    referrerNotes: text("referrer_notes"),
    consentAccepted: boolean("consent_accepted").notNull().default(false),
    /**
     * Standard status set:
     *   new | under_review | contacted | verified | qualified |
     *   converted | not_qualified | rejected | duplicate | compliance_hold
     * Investor leads use the investor compliance set:
     *   investor_review | investor_kyc | investor_meeting | investor_funded |
     *   investor_rejected | compliance_hold
     */
    status: text("status").notNull().default("new"),
    /** "manual" if submitted by the referrer; "public" if via /r/:code. */
    submissionChannel: text("submission_channel").notNull().default("public"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    utm: jsonb("utm").notNull().default({}),
    /** First touch + last touch path for attribution. */
    firstTouchPath: text("first_touch_path"),
    lastTouchPath: text("last_touch_path"),
    /** Set when admin transitions to converted -> ties back to a real app_user. */
    convertedUserId: text("converted_user_id"),
    /** Set when admin transitions to converted -> ties back to a commitment. */
    convertedCommitmentId: text("converted_commitment_id"),
    /** Internal admin notes. */
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    referrerIdx: index("genesis_leads_referrer_idx").on(t.referrerId),
    statusIdx: index("genesis_leads_status_idx").on(t.status),
    interestIdx: index("genesis_leads_interest_idx").on(t.interestType),
    emailIdx: index("genesis_leads_email_idx").on(t.email),
  }),
);

/** Configurable point values per action. Seeded with the defaults from
 * the spec on first boot. Admin can edit values via /admin > Genesis. */
export const genesisRewardRulesTable = pgTable("genesis_reward_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** form_submit | verified | qualified | customer_onboarded |
   * paid_customer | dev_signup | agency_signup | strategic_intro |
   * investor_lead_verified | investor_meeting | investor_funded */
  actionKey: text("action_key").notNull().unique(),
  label: text("label").notNull(),
  points: integer("points").notNull(),
  /** auto | manual_review */
  awardMode: text("award_mode").notNull().default("auto"),
  enabled: boolean("enabled").notNull().default(true),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** The append-only points ledger. Each row = one award (or rejection). */
export const genesisLedgerTable = pgTable(
  "genesis_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => genesisReferrersTable.id, { onDelete: "cascade" }),
    leadId: uuid("lead_id"),
    /** Action key from reward_rules, or "manual_adjust", "named_bonus". */
    actionKey: text("action_key").notNull(),
    /** Optional human-readable bonus name for named bonuses. */
    bonusLabel: text("bonus_label"),
    pointsPending: integer("points_pending").notNull().default(0),
    pointsApproved: integer("points_approved").notNull().default(0),
    /** Estimated $AICA token-equivalent at the current 1:1 ratio.
     * Mirrors pointsApproved for now. Stored as bigint for headroom. */
    tokenEquivalent: bigint("token_equivalent", { mode: "number" })
      .notNull()
      .default(0),
    /** pending | approved | rejected | compliance_hold | vesting | vested | claimable_later */
    status: text("status").notNull().default("pending"),
    approverEmail: text("approver_email"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedReason: text("rejected_reason"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    referrerIdx: index("genesis_ledger_referrer_idx").on(t.referrerId),
    leadIdx: index("genesis_ledger_lead_idx").on(t.leadId),
    statusIdx: index("genesis_ledger_status_idx").on(t.status),
  }),
);

/** Per-ledger vesting plan stub. MVP stores fields, does not compute monthly unlocks. */
export const genesisVestingSchedulesTable = pgTable(
  "genesis_vesting_schedules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ledgerId: uuid("ledger_id")
      .notNull()
      .references(() => genesisLedgerTable.id, { onDelete: "cascade" }),
    cliffMonths: integer("cliff_months").notNull().default(6),
    vestingMonths: integer("vesting_months").notNull().default(24),
    tgePct: integer("tge_pct").notNull().default(0),
    startDate: timestamp("start_date", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    ledgerIdx: index("genesis_vesting_schedules_ledger_idx").on(t.ledgerId),
  }),
);

/** Future payout requests (Phase 3). Schema only for forward-compat. */
export const genesisPayoutRequestsTable = pgTable(
  "genesis_payout_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => genesisReferrersTable.id, { onDelete: "cascade" }),
    requestedPoints: integer("requested_points").notNull(),
    /** token | credit | cash */
    payoutType: text("payout_type").notNull(),
    /** pending | approved | paid | rejected */
    status: text("status").notNull().default("pending"),
    walletAddress: text("wallet_address"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    referrerIdx: index("genesis_payout_requests_referrer_idx").on(t.referrerId),
  }),
);

/** Fraud flags raised against a referrer or lead. MVP stub. */
export const genesisFraudFlagsTable = pgTable(
  "genesis_fraud_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** referrer | lead */
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    /** duplicate_email | duplicate_ip | duplicate_phone | velocity | restricted_jurisdiction | other */
    flagType: text("flag_type").notNull(),
    severity: text("severity").notNull().default("low"),
    details: jsonb("details").notNull().default({}),
    /** open | dismissed | confirmed */
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    targetIdx: index("genesis_fraud_flags_target_idx").on(
      t.targetType,
      t.targetId,
    ),
  }),
);

/**
 * Singleton settings row for the Genesis program. Holds admin-editable
 * caps and the public referral mode toggle. The private mode flag is
 * env-locked (GENESIS_PRIVATE_MODE) and is NOT stored here.
 */
export const genesisSettingsTable = pgTable("genesis_settings", {
  id: text("id").primaryKey().default("singleton"),
  /** Public referral mode (admin can flip when private mode is off). */
  publicReferralMode: boolean("public_referral_mode").notNull().default(false),
  /** Maximum approved points per single referrer. 0 = no cap. */
  perReferrerPointCap: bigint("per_referrer_point_cap", { mode: "number" })
    .notNull()
    .default(0),
  /** Maximum approved points per campaign tag. 0 = no cap. */
  perCampaignPointCap: bigint("per_campaign_point_cap", { mode: "number" })
    .notNull()
    .default(0),
  /** Total $AICA tokens reserved for the Genesis cohort. */
  tokenPoolTotal: bigint("token_pool_total", { mode: "number" })
    .notNull()
    .default(250_000_000),
  /** point → $AICA conversion ratio (integer for MVP). */
  pointToTokenRatio: integer("point_to_token_ratio").notNull().default(1),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: text("updated_by"),
});

export type GenesisReferrer = typeof genesisReferrersTable.$inferSelect;
export type InsertGenesisReferrer = typeof genesisReferrersTable.$inferInsert;
export type GenesisLead = typeof genesisLeadsTable.$inferSelect;
export type InsertGenesisLead = typeof genesisLeadsTable.$inferInsert;
export type GenesisRewardRule = typeof genesisRewardRulesTable.$inferSelect;
export type GenesisLedgerEntry = typeof genesisLedgerTable.$inferSelect;
export type GenesisReferralEvent =
  typeof genesisReferralEventsTable.$inferSelect;
