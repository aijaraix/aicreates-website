import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { appUsersTable } from "./app_users";

// Separate from token/SAFT commitments. No conversion of legacy obligations.
export const seriesSeedCasesTable = pgTable(
  "series_seed_cases",
  {
    id: uuid("id").primaryKey(),
    prospectName: text("prospect_name").notNull(),
    investorUserId: text("investor_user_id").references(
      () => appUsersTable.id,
      { onDelete: "restrict" },
    ),
    stage: text("stage").notNull().default("discovery"),
    revision: integer("revision").notNull().default(0),
    createdBy: text("created_by")
      .notNull()
      .references(() => appUsersTable.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("series_seed_cases_investor_idx").on(t.investorUserId),
    check("series_seed_cases_revision_check", sql`${t.revision} >= 0`),
    check(
      "series_seed_cases_stage_check",
      sql`${t.stage} IN ('discovery','research','qualification','outreach','meeting','diligence','term_sheet','negotiation','commitment','documentation','closing','ongoing_ir')`,
    ),
  ],
);
export const seriesSeedEventsTable = pgTable(
  "series_seed_events",
  {
    id: uuid("id").primaryKey(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => seriesSeedCasesTable.id, { onDelete: "restrict" }),
    actorUserId: text("actor_user_id")
      .notNull()
      .references(() => appUsersTable.id, { onDelete: "restrict" }),
    fromStage: text("from_stage"),
    toStage: text("to_stage").notNull(),
    revision: integer("revision").notNull(),
    reason: text("reason").notNull(),
    evidenceReference: text("evidence_reference"),
    idempotencyKey: uuid("idempotency_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("series_seed_events_case_id_revision_key").on(
      t.caseId,
      t.revision,
    ),
    uniqueIndex("series_seed_events_case_id_idempotency_key_key").on(
      t.caseId,
      t.idempotencyKey,
    ),
    index("series_seed_events_case_idx").on(t.caseId, t.createdAt),
  ],
);
