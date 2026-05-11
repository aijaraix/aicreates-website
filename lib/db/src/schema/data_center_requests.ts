import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * "Request Data Center Access" form submissions from /invest/.
 */
export const dataCenterRequestsTable = pgTable("data_center_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  useCase: text("use_case").notNull(),
  capacity: text("capacity"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type DataCenterRequest = typeof dataCenterRequestsTable.$inferSelect;
export type InsertDataCenterRequest =
  typeof dataCenterRequestsTable.$inferInsert;
