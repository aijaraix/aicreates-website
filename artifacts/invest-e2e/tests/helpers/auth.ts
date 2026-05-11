import type { Page } from "@playwright/test";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import {
  ADMIN_EMAIL,
  INVESTOR_EMAIL,
  TEST_PASSWORD,
} from "./users";

/**
 * Sign the given Page in as one of the seeded portal e2e users. We always
 * land on `/invest/sign-in` first because Clerk's testing helper requires
 * the SDK to be loaded on the page before `clerk.signIn` will work.
 */
export async function signIn(
  page: Page,
  who: "investor" | "admin",
): Promise<string> {
  const email = who === "admin" ? ADMIN_EMAIL : INVESTOR_EMAIL;
  if (!email) {
    throw new Error(
      "Admin sign-in requested but ADMIN_EMAILS env var is empty.",
    );
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
  await page.waitForURL(/\/invest\/dashboard/);
  return email;
}

export async function signOut(page: Page): Promise<void> {
  await clerk.signOut({ page });
}
