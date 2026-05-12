import {
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { appUsersTable } from "./app_users";

/**
 * Free-form admin-only notes attached to an investor (app_user). Used to
 * track follow-ups, KYC context, or wire-confirmation reminders. Surfaced
 * inline in /invest/admin.
 */
export const adminNotesTable = pgTable(
  "admin_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => appUsersTable.id, { onDelete: "cascade" }),
    authorEmail: text("author_email").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    targetIdx: index("admin_notes_target_idx").on(t.targetUserId),
  }),
);

export type AdminNote = typeof adminNotesTable.$inferSelect;
export type InsertAdminNote = typeof adminNotesTable.$inferInsert;
