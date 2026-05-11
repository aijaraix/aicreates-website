import "dotenv/config";
import { clerkSetup } from "@clerk/testing/playwright";
import { ensureTestUsers } from "./users";

/**
 * Playwright global setup. Loads the Clerk testing token from
 * `CLERK_SECRET_KEY` and provisions the regular + admin test users used
 * by the portal e2e specs. Both users are created idempotently so the
 * suite is safe to re-run against the same dev database.
 */
export default async function globalSetup(): Promise<void> {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error(
      "CLERK_SECRET_KEY is required for portal e2e. Run the api-server " +
        "workflow at least once so the Replit Clerk integration env vars " +
        "are populated, then re-run.",
    );
  }
  if (!process.env.VITE_CLERK_PUBLISHABLE_KEY) {
    throw new Error(
      "VITE_CLERK_PUBLISHABLE_KEY is required for portal e2e.",
    );
  }
  await clerkSetup({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  });
  await ensureTestUsers();
}
