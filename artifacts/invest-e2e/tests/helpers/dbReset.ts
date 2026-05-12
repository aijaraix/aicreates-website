import { eq } from "drizzle-orm";
import { getClerkUserId } from "./profile";

/**
 * Wipe the investor_profiles row for the given email. Used by specs
 * that explicitly test the RequireProfile gate so they don't depend on
 * leftover state from prior runs in the shared dev DB.
 *
 * Best-effort: missing DATABASE_URL is a no-op rather than a failure,
 * so the suite can still run in environments where Drizzle isn't wired.
 */
export async function resetInvestorProfile(email: string): Promise<void> {
  if (!process.env["DATABASE_URL"]) return;
  const { db, investorProfilesTable } = await import("@workspace/db");
  const userId = await getClerkUserId(email);
  if (!userId) return;
  await db
    .delete(investorProfilesTable)
    .where(eq(investorProfilesTable.userId, userId));
}
