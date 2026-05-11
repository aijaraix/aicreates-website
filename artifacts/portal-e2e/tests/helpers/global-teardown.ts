import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import {
  appUsersTable,
  commitmentsTable,
  saftSubmissionsTable,
} from "@workspace/db/schema";
import { INVESTOR_EMAIL } from "./users";

/**
 * Playwright global teardown. Removes commitments + SAFT submissions that
 * the e2e suite created under the seeded investor identity so the dev
 * database stays tidy between runs. Real (non-test) commitments are never
 * touched because we scope the delete to the fixed test investor email.
 *
 * The teardown is best-effort: missing DATABASE_URL or already-empty rows
 * are not errors, and any failure is logged but never fails the run.
 */
export default async function globalTeardown(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn(
      "[portal-e2e teardown] DATABASE_URL not set; skipping cleanup.",
    );
    return;
  }

  const { db, pool } = await import("@workspace/db");
  try {
    const users = await db
      .select({ id: appUsersTable.id })
      .from(appUsersTable)
      .where(eq(appUsersTable.email, INVESTOR_EMAIL));

    if (users.length === 0) {
      return;
    }
    const userIds = users.map((u) => u.id);

    const commitments = await db
      .select({ id: commitmentsTable.id })
      .from(commitmentsTable)
      .where(inArray(commitmentsTable.userId, userIds));

    if (commitments.length === 0) {
      return;
    }
    const commitmentIds = commitments.map((c) => c.id);

    // Explicitly delete saft_submissions first for clarity; the FK has
    // ON DELETE CASCADE so this is belt-and-suspenders but keeps the
    // teardown obvious if the schema ever changes.
    await db
      .delete(saftSubmissionsTable)
      .where(inArray(saftSubmissionsTable.commitmentId, commitmentIds));

    const deleted = await db
      .delete(commitmentsTable)
      .where(inArray(commitmentsTable.id, commitmentIds))
      .returning({ id: commitmentsTable.id });

    console.log(
      `[portal-e2e teardown] Removed ${deleted.length} test commitment(s) for ${INVESTOR_EMAIL}.`,
    );
  } catch (err) {
    console.warn("[portal-e2e teardown] Cleanup failed:", err);
  } finally {
    await pool.end().catch(() => {});
  }
}
