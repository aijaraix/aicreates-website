import type { Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import {
  ADMIN_EMAIL,
  INVESTOR_EMAIL,
  TEST_PASSWORD,
} from "./users";
import { seedInvestorProfile } from "./profile";

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
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: email,
      password: TEST_PASSWORD,
    },
  });
  await page.goto("/invest/dashboard");
  await page.waitForURL(/\/invest\/(dashboard|profile)/);
  return email;
}

export async function signOut(page: Page): Promise<void> {
  await clerk.signOut({ page });
}
