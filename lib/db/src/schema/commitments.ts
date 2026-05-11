import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { appUsersTable } from "./app_users";

/**
 * First-party Founders Commitment record. Created when a user picks a
 * tier or custom amount on the /invest page in the invest artifact. Lifecycle:
 *   pending_saft -> pending_payment -> awaiting_wire | funded | failed
 *                                                    |        |
 *                                                    +-> refunded
 *
 * Legacy values "pending" / "succeeded" remain accepted for back-compat.
 */
export const commitmentsTable = pgTable(
  "commitments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsersTable.id),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    stripeCustomerId: text("stripe_customer_id"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    /** pending_saft | pending_payment | awaiting_wire | funded | failed | refunded (legacy: pending | succeeded) */
    status: text("status").notNull().default("pending_saft"),
    /** Same value as status, mirrored to a clearer column name for queries. */
    state: text("state").notNull().default("pending_saft"),
    tierSlug: text("tier_slug").notNull(),
    displayName: text("display_name").notNull(),
    tokenAllocation: integer("token_allocation").notNull().default(0),
    customAmountCents: integer("custom_amount_cents"),
    roundSlug: text("round_slug").notNull().default("founders-2026"),
    paymentMethod: text("payment_method"),
    receiptUrl: text("receipt_url"),
    billingCountry: text("billing_country"),
    saftSignedAt: timestamp("saft_signed_at", { withTimezone: true }),
    saftPdfKey: text("saft_pdf_key"),
    fundedAt: timestamp("funded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
  },
  (t) => ({
    userIdx: index("commitments_user_idx").on(t.userId),
    statusIdx: index("commitments_status_idx").on(t.status),
    stateIdx: index("commitments_state_idx").on(t.state),
    paymentIntentIdx: index("commitments_payment_intent_idx").on(
      t.stripePaymentIntentId,
    ),
  }),
);

export type Commitment = typeof commitmentsTable.$inferSelect;
export type InsertCommitment = typeof commitmentsTable.$inferInsert;
