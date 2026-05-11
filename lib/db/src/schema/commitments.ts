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
 * First-party Founders Commitment record. Created when a user starts a
 * Stripe Checkout session and updated by webhook events
 * (payment_intent.succeeded / payment_intent.payment_failed /
 * charge.refunded). We keep tier name + token allocation as a snapshot so
 * historical commitments survive any future Stripe metadata drift.
 */
export const commitmentsTable = pgTable(
  "commitments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsersTable.id),
    stripeCheckoutSessionId: text("stripe_checkout_session_id")
      .notNull()
      .unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    stripeCustomerId: text("stripe_customer_id"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("usd"),
    /** pending | succeeded | failed | refunded */
    status: text("status").notNull().default("pending"),
    tierSlug: text("tier_slug").notNull(),
    displayName: text("display_name").notNull(),
    tokenAllocation: integer("token_allocation").notNull().default(0),
    receiptUrl: text("receipt_url"),
    billingCountry: text("billing_country"),
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
    paymentIntentIdx: index("commitments_payment_intent_idx").on(
      t.stripePaymentIntentId,
    ),
  }),
);

export type Commitment = typeof commitmentsTable.$inferSelect;
export type InsertCommitment = typeof commitmentsTable.$inferInsert;
