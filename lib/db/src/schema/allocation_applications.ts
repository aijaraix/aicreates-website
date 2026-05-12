import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { appUsersTable } from "./app_users";

/**
 * AI Allocation Gateway intake. Created when an investor completes the
 * gateway interview before they can reserve a tier on /invest. The
 * gateway captures applicant context (geo, accreditation, intended size,
 * thesis fit) so the team can prioritize allocations and surface flags
 * to admins. The structured payload is jsonb so we can iterate on the
 * intake schema without schema migrations.
 */
export const allocationApplicationsTable = pgTable(
  "allocation_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsersTable.id, { onDelete: "cascade" }),
    /** submitted | approved | needs_review | rejected */
    status: text("status").notNull().default("submitted"),
    /** Self-declared accreditation (income | net_worth | professional | entity | knowledgeable | none). */
    accreditation: text("accreditation"),
    /** ISO country code (e.g. US). */
    country: text("country"),
    /** Intended commitment in USD cents. */
    intendedAmountCents: integer("intended_amount_cents"),
    /** "consumer" | "business" | "investor" persona. */
    persona: text("persona"),
    /** Free-text "why this round" thesis fit answer. */
    thesisFit: text("thesis_fit"),
    /** Source of intro (e.g. referral, founder, conference). */
    referralSource: text("referral_source"),
    /** Full structured payload for any future intake fields. */
    payload: jsonb("payload").notNull().default({}),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: text("reviewed_by"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("allocation_applications_user_idx").on(t.userId),
    statusIdx: index("allocation_applications_status_idx").on(t.status),
  }),
);

export type AllocationApplication =
  typeof allocationApplicationsTable.$inferSelect;
export type InsertAllocationApplication =
  typeof allocationApplicationsTable.$inferInsert;
