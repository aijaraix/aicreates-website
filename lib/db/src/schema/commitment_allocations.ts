import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { commitmentsTable } from "./commitments";

/**
 * Per-round line items inside a single commitment. A commitment may
 * span multiple rounds (multi-round cart). The parent `commitments`
 * row aggregates totals (amount_cents, token_allocation) for backwards
 * compatibility with the legacy single-round path.
 */
export const commitmentAllocationsTable = pgTable(
  "commitment_allocations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    commitmentId: uuid("commitment_id")
      .notNull()
      .references(() => commitmentsTable.id, { onDelete: "cascade" }),
    roundSlug: text("round_slug").notNull(),
    tokens: integer("tokens").notNull(),
    usdCents: integer("usd_cents").notNull(),
    pricePerTokenMillicents: integer("price_per_token_millicents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    commitmentIdx: index("commitment_allocations_commitment_idx").on(
      t.commitmentId,
    ),
    roundIdx: index("commitment_allocations_round_idx").on(t.roundSlug),
  }),
);

export type CommitmentAllocation =
  typeof commitmentAllocationsTable.$inferSelect;
export type InsertCommitmentAllocation =
  typeof commitmentAllocationsTable.$inferInsert;
