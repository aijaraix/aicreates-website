import { test, expect } from "@playwright/test";
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

    // Fill the minimum required fields. Labels copied verbatim from
    // Profile.tsx so the assertions don't drift if the copy changes.
    await page.getByTestId("button-profile-kind-individual").click();
    await fillByLabel(page, "Email", INVESTOR_EMAIL);
    await fillByLabel(page, "Address line 1", "123 Test Street");
    await fillByLabel(page, "City", "Wilmington");
    await fillByLabel(page, "State / Region", "DE");
    await fillByLabel(page, "Postal code", "19801");
    await fillByLabel(page, "Country (ISO 2-letter)", "US");
    await fillByLabel(page, "Legal first name", "Portal");
    await fillByLabel(page, "Legal last name", "Investor");
    await fillByLabel(page, "Date of birth", "1990-01-01");

    await page.getByTestId("button-profile-save").click();

    // After save the form's onSuccess routes to ?next= (which defaults
    // to /invest). Verify RequireProfile no longer bounces us.
    await page.waitForURL(/\/invest\/invest/, { timeout: 15_000 });
    await expect(page.getByTestId("input-usd-strategic-seed")).toBeVisible({
      timeout: 30_000,
    });
  });
});

async function fillByLabel(
  page: import("@playwright/test").Page,
  label: string,
  value: string,
): Promise<void> {
  // Labels in Profile.tsx render as <label>{label}</label><input>.
  // Use exact match to avoid e.g. "Date of birth" matching "Date of formation".
  const input = page
    .getByLabel(label, { exact: true })
    .first();
  await input.waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
  if (await input.isVisible().catch(() => false)) {
    await input.fill(value);
  }
}
