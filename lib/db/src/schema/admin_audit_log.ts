import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";

/**
 * Append-only log of admin write actions (refunds, manual confirms,
 * KYC updates, note creation). Surfaced in /invest/admin.
 */
export const adminAuditLogTable = pgTable(
  "admin_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type"),
    targetId: text("target_id"),
    details: jsonb("details").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    actorIdx: index("admin_audit_log_actor_idx").on(t.actorEmail),
    actionIdx: index("admin_audit_log_action_idx").on(t.action),
    createdIdx: index("admin_audit_log_created_idx").on(t.createdAt),
  }),
);

export type AdminAuditLog = typeof adminAuditLogTable.$inferSelect;
export type InsertAdminAuditLog = typeof adminAuditLogTable.$inferInsert;
