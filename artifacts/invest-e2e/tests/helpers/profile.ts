import type { Page } from "@playwright/test";
import { createClerkClient, type ClerkClient } from "@clerk/backend";

let _clerk: ClerkClient | null = null;
function clerk(): ClerkClient {
  if (_clerk) return _clerk;
  const secretKey = process.env["CLERK_SECRET_KEY"];
  if (!secretKey) throw new Error("CLERK_SECRET_KEY missing");
  _clerk = createClerkClient({ secretKey });
  return _clerk;
}

/**
 * Seed the signed-in user's investor profile directly in Postgres.
 *
 * The portal's RequireProfile guard blocks /invest, /saft/:id, and
 * /checkout/:id behind a completed profile. Every spec that drives the
 * UI for those routes must call this after signIn() so it doesn't get
 * redirected to /profile.
 *
 * We hit the DB rather than `PUT /api/me/profile` because Clerk's
 * testing token doesn't always survive the round-trip from
 * `page.request` to the api-server's clerkMiddleware in headless mode,
 * which would surface as a flaky 401. The DB write is idempotent via
 * the userId primary key, so repeated calls per run are safe.
 *
 * Best-effort: missing DATABASE_URL is a no-op (the suite is then
 * presumed to be running against a remote that owns its own state).
 */
export async function seedInvestorProfile(
  page: Page,
  email: string,
): Promise<void> {
  void page;
  if (!process.env["DATABASE_URL"]) return;
  const userId = await getClerkUserId(email);
  if (!userId) {
    throw new Error(
      `seedInvestorProfile: no Clerk user for ${email}; global-setup didn't provision`,
    );
  }
  const { db, appUsersTable, investorProfilesTable } = await import(
    "@workspace/db"
  );
  // Mirror the api-server requireAuth bootstrap: insert app_users with
  // the Clerk userId as PK if it isn't there yet.
  await db
    .insert(appUsersTable)
    .values({ id: userId, email, fullName: "Portal Investor", role: "investor" })
    .onConflictDoNothing();
  await db
    .insert(investorProfilesTable)
    .values(profileRow(userId, email))
    .onConflictDoUpdate({
      target: investorProfilesTable.userId,
      set: { ...profileRow(userId, email), updatedAt: new Date() },
    });
}

function profileRow(userId: string, email: string) {
  return {
    userId,
    kind: "individual",
    email,
    addressLine1: "123 Test Street",
    city: "Wilmington",
    region: "DE",
    postalCode: "19801",
    country: "US",
    legalFirstName: "Portal",
    legalLastName: "Investor",
    dateOfBirth: "1990-01-01",
    taxIdLast4: "6789",
  };
}

export async function getClerkUserId(email: string): Promise<string | null> {
  const list = await clerk().users.getUserList({
    emailAddress: [email],
    limit: 1,
  });
  return list.data[0]?.id ?? null;
}
