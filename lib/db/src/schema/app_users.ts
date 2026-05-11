import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const appUsersTable = pgTable("app_users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  role: text("role").notNull().default("investor"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type AppUser = typeof appUsersTable.$inferSelect;
export type InsertAppUser = typeof appUsersTable.$inferInsert;
