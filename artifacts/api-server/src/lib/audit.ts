import { db, adminAuditLogTable } from "@workspace/db";

export async function logAdminAction(opts: {
  actorEmail: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.insert(adminAuditLogTable).values({
      actorEmail: opts.actorEmail,
      action: opts.action,
      targetType: opts.targetType ?? null,
      targetId: opts.targetId ?? null,
      details: opts.details ?? {},
    });
  } catch {
    // Audit log failures must never block the underlying admin action.
  }
}
