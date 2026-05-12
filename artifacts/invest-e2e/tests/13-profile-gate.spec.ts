import { test, expect, type Page } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { INVESTOR_EMAIL } from "./helpers/users";
import { resetInvestorProfile } from "./helpers/dbReset";

test.describe("profile gate", () => {
  test("RequireProfile redirects to /profile, and saving the form unlocks /invest", async ({
    page,
  }) => {
    // Deterministic precondition: wipe any leftover profile from prior
    // runs so the gate fires every time.
    await resetInvestorProfile(INVESTOR_EMAIL);

    await signIn(page, "investor", { seedProfile: false });

    // Navigating to /invest with no profile must redirect to /profile.
    await page.goto("/invest/invest");
    await page.waitForURL(/\/invest\/profile(\?|$)/, { timeout: 15_000 });
    await expect(
      page.getByTestId("button-profile-kind-individual"),
    ).toBeVisible();

    // Fill required fields by stable test-id (Profile.tsx renders the
    // <label> text and the <input> as siblings without htmlFor/id, so
    // getByLabel is unreliable here).
    await page.getByTestId("button-profile-kind-individual").click();
    await fill(page, "input-profile-email", INVESTOR_EMAIL);
    await fill(page, "input-profile-address1", "123 Test Street");
    await fill(page, "input-profile-city", "Wilmington");
    await fill(page, "input-profile-region", "DE");
    await fill(page, "input-profile-postal", "19801");
    await fill(page, "input-profile-country", "US");
    await fill(page, "input-profile-firstname", "Portal");
    await fill(page, "input-profile-lastname", "Investor");
    await fill(page, "input-profile-dob", "1990-01-01");

    await page.getByTestId("button-profile-save").click();

    // After save the form's onSuccess primes the ["me","profile"] cache
    // with the freshly-saved profile and only then navigates, so
    // RequireProfile must NOT bounce us back to /profile.
    await page.waitForURL(/\/invest\/invest/, { timeout: 15_000 });
    await expect(page.getByTestId("input-usd-strategic-seed")).toBeVisible({
      timeout: 30_000,
    });
  });
});

async function fill(page: Page, testId: string, value: string): Promise<void> {
  // Fail-fast: if the test-id moves the spec must surface that, not
  // silently skip.
  await page.getByTestId(testId).fill(value);
}
