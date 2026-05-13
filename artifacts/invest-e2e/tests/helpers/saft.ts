import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

interface SaftOptions {
  /**
   * The full legal name the typed-signature must match. Must equal the
   * "expected signer" derived from the seeded investor profile (e.g.
   * `Portal Investor` for the default seedInvestorProfile() output).
   */
  legalName: string;
  // SAFT picker was aligned with the Checkout picker in Task #72:
  // fiat (collapsed card+ACH) and wire are the only public options;
  // legacy card/ach/crypto values remain accepted for older specs but
  // tests should prefer "fiat" or "wire" going forward.
  paymentMethod: "fiat" | "card" | "ach" | "wire" | "crypto";
}

/**
 * Drive the simplified SAFT wizard end-to-end. Assumes the page is
 * already on `/invest/saft/:commitId`, the user is signed in, and the
 * investor_profiles row has been seeded (via seedInvestorProfile).
 *
 * Step layout (post Task #55 simplification):
 *   0 confirm        - read-only profile snapshot, just click Continue
 *   1 allocation     - pick payment method radio
 *   2 questionnaire  - pick first accreditation option
 *   3 risk           - tick every check-risk-* checkbox
 *   4 wallet         - skip via button-skip-wallet
 *   5 acknowledgments- tick every check-ack-* checkbox
 *   6 signature      - typed signature + intent + submit
 *   7 done           - link-go-checkout visible
 *
 * Risk and ack keys are discovered at runtime instead of hard-coded so
 * the helper doesn't break if the legal copy adds/removes a clause.
 */
export async function completeSaft(
  page: Page,
  opts: SaftOptions,
): Promise<void> {
  // Step 0 - Confirm details (read-only).
  await expect(page.getByTestId("saft-step-confirm")).toBeVisible({
    timeout: 30_000,
  });
  await page.getByTestId("button-next").click();

  // Step 1 - Allocation + payment method. Map legacy card/ach/crypto
  // inputs to the current "fiat" pill so older specs keep working
  // without rewriting every call site.
  await expect(page.getByTestId("saft-step-allocation")).toBeVisible();
  const saftMethod =
    opts.paymentMethod === "card" ||
    opts.paymentMethod === "ach" ||
    opts.paymentMethod === "crypto"
      ? "fiat"
      : opts.paymentMethod;
  await page.getByTestId(`radio-paymentmethod-${saftMethod}`).click();
  await page.getByTestId("button-next").click();

  // Step 2 - Questionnaire (accreditation).
  await expect(page.getByTestId("saft-step-questionnaire")).toBeVisible();
  await page
    .locator('[data-testid^="radio-accreditation-"]')
    .first()
    .click();
  await page.getByTestId("button-next").click();

  // Step 3 - Risk disclosures (tick all).
  await expect(page.getByTestId("saft-step-risk")).toBeVisible();
  await tickAll(page, "check-risk-");
  await page.getByTestId("button-next").click();

  // Step 4 - Wallet (skip; mapping is optional pre-TGE).
  await expect(page.getByTestId("saft-step-wallet")).toBeVisible();
  await page.getByTestId("button-skip-wallet").click();

  // Step 5 - Acknowledgments (tick all).
  await expect(page.getByTestId("saft-step-acknowledgments")).toBeVisible();
  await tickAll(page, "check-ack-");
  await page.getByTestId("button-next").click();

  // Step 6 - Signature.
  await expect(page.getByTestId("saft-step-signature")).toBeVisible();
  // Sanity-check: the expected signer must match what we'll type.
  await expect(page.getByTestId("text-expected-signer")).toHaveText(
    opts.legalName,
  );
  await page.getByTestId("input-signature-name").fill(opts.legalName);
  await page.getByTestId("check-sign-intent").click();
  await page.getByTestId("button-submit-saft").click();

  // Step 7 - Done.
  await expect(page.getByTestId("saft-step-done")).toBeVisible({
    timeout: 30_000,
  });
}

async function tickAll(page: Page, testIdPrefix: string): Promise<void> {
  const handles = await page
    .locator(`[data-testid^="${testIdPrefix}"]`)
    .all();
  for (const h of handles) {
    await h.click();
  }
}
