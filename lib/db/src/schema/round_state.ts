import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

/**
 * DB-driven round lifecycle. The catalog of rounds (price, caps,
 * vesting) lives in `artifacts/api-server/src/lib/rounds.ts`. This
 * table holds the mutable status (`upcoming` | `open` | `closed`) and
 * the operator-tunable soft-close percentage so a round can be
 * auto-advanced without a redeploy.
 */
export const roundStateTable = pgTable("round_state", {
  slug: text("slug").primaryKey(),
  status: text("status").notNull().default("upcoming"),
  /** Auto-close threshold. Round closes when sold% >= softClosePct. */
  softClosePct: integer("soft_close_pct").notNull().default(100),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type RoundState = typeof roundStateTable.$inferSelect;
export type InsertRoundState = typeof roundStateTable.$inferInsert;
