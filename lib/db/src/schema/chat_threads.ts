import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { appUsersTable } from "./app_users";

/**
 * One chat thread per investor. Shared across all admins so any admin
 * can pick up a conversation. `lastMessageAt` is denormalized for cheap
 * recency sorting in the admin inbox.
 */
export const chatThreadsTable = pgTable(
  "chat_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    investorUserId: text("investor_user_id")
      .notNull()
      .unique()
      .references(() => appUsersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
  },
  (t) => ({
    lastMessageIdx: index("chat_threads_last_message_idx").on(t.lastMessageAt),
  }),
);

export type ChatThread = typeof chatThreadsTable.$inferSelect;
export type InsertChatThread = typeof chatThreadsTable.$inferInsert;
