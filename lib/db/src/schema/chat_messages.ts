import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { chatThreadsTable } from "./chat_threads";
import { appUsersTable } from "./app_users";

/**
 * Individual chat message. `senderRole` is denormalized off the sender
 * at write time so historical messages don't shift role if a user is
 * later removed from / added to ADMIN_EMAILS.
 *
 * `readByInvestorAt` / `readByAdminAt` track unread status from the
 * counterparty's point of view (e.g. an investor message is "read by
 * admin" once any admin opens the thread).
 */
export const chatMessagesTable = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => chatThreadsTable.id, { onDelete: "cascade" }),
    senderUserId: text("sender_user_id")
      .notNull()
      .references(() => appUsersTable.id, { onDelete: "cascade" }),
    senderRole: text("sender_role").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    readByInvestorAt: timestamp("read_by_investor_at", { withTimezone: true }),
    readByAdminAt: timestamp("read_by_admin_at", { withTimezone: true }),
  },
  (t) => ({
    threadCreatedIdx: index("chat_messages_thread_created_idx").on(
      t.threadId,
      t.createdAt,
    ),
    unreadByInvestorIdx: index("chat_messages_unread_by_investor_idx").on(
      t.threadId,
      t.readByInvestorAt,
    ),
    unreadByAdminIdx: index("chat_messages_unread_by_admin_idx").on(
      t.threadId,
      t.readByAdminAt,
    ),
  }),
);

export type ChatMessage = typeof chatMessagesTable.$inferSelect;
export type InsertChatMessage = typeof chatMessagesTable.$inferInsert;
