import type { Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { createClerkClient } from "@clerk/backend";
import {
  ADMIN_EMAIL,
  INVESTOR_EMAIL,
  TEST_PASSWORD,
} from "./users";
import { seedInvestorProfile, getClerkUserId } from "./profile";

/**
 * Sign the given Page in as one of the seeded portal e2e users. We always
 * land on `/invest/sign-in` first because Clerk's testing helper requires
 * the SDK to be loaded on the page before `clerk.signIn` will work.
 *
 * After sign-in we also seed an investor_profiles row so the portal's
 * RequireProfile guard doesn't bounce subsequent navigation to /profile.
 * Pass `seedProfile: false` from specs that explicitly test the profile
 * gate itself.
 */
export async function signIn(
  page: Page,
  who: "investor" | "admin",
  opts: { seedProfile?: boolean } = {},
): Promise<string> {
  const seedProfile = opts.seedProfile !== false;
  const email = who === "admin" ? ADMIN_EMAIL : INVESTOR_EMAIL;
  if (!email) {
    throw new Error(
      "Admin sign-in requested but ADMIN_EMAILS env var is empty.",
    );
  }
  // Seed the profile BEFORE Clerk sign-in. The seed touches only
  // the DB + Clerk REST API (no page session needed), so doing it
  // first means we don't slow the post-signIn navigation window and
  // RequireProfile won't bounce us to /profile after sign-in.
  if (seedProfile) {
    await seedInvestorProfile(page, email);
  }
  await setupClerkTestingToken({ page });
  await page.goto("/invest/sign-in");
  await clerk.loaded({ page });

  // Try the @clerk/testing helper first (cookie-based).
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: email,
      password: TEST_PASSWORD,
    },
  });
  await page.goto("/invest/dashboard");
  await page.waitForURL(/\/invest\/(dashboard|profile)/, {
    timeout: 15_000,
  });

  // Verify the SPA actually sees the signed-in user. If the testing
  // helper's cookie didn't propagate (intermittent in headless dev
  // setups), fall back to a one-time sign-in ticket which navigates
  // through Clerk's hosted flow and is far more reliable.
  if (!(await isSignedIn(page))) {
    await signInViaTicket(page, email);
    await page.waitForURL(/\/invest\/(dashboard|profile)/, {
      timeout: 15_000,
    });
  }
  return email;
}

async function isSignedIn(page: Page): Promise<boolean> {
  return await page
    .evaluate(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => Boolean((window as any).Clerk?.user?.id),
    )
    .catch(() => false);
}

async function signInViaTicket(page: Page, email: string): Promise<void> {
  const secretKey = process.env["CLERK_SECRET_KEY"];
  if (!secretKey) throw new Error("CLERK_SECRET_KEY missing");
  const userId = await getClerkUserId(email);
  if (!userId) throw new Error(`No Clerk user for ${email}`);
  const backend = createClerkClient({ secretKey });
  const ticket = await backend.signInTokens.createSignInToken({
    userId,
    expiresInSeconds: 60,
  });
  // Visit Clerk's hosted ticket exchange via our portal sign-in URL.
  await page.goto(`/invest/sign-in?__clerk_ticket=${ticket.token}`);
}

export async function signOut(page: Page): Promise<void> {
  await clerk.signOut({ page });
}
