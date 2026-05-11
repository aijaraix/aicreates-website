import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

interface SaftOptions {
  legalName: string;
  email: string;
  paymentMethod: "card" | "ach" | "wire" | "crypto";
}

const ACK_KEYS = [
  "highRisk",
  "noOwnership",
  "consumptiveUse",
  "illiquidity",
  "vestingLockup",
  "noGeneralSolicitation",
  "confidentiality",
  "taxResponsibility",
];

/**
 * Drive the 6-step SAFT wizard end-to-end. Assumes the page is already on
 * `/portal/saft/:commitId` and the user is signed in.
 */
export async function completeSaft(
  page: Page,
  opts: SaftOptions,
): Promise<void> {
  // Step 0 - Identity
  await expect(page.getByTestId("saft-step-identity")).toBeVisible();
  await page.getByTestId("input-saft-name").fill(opts.legalName);
  await page.getByTestId("input-saft-email").fill(opts.email);
  await page
    .getByTestId("input-saft-address")
    .fill("123 Test Street, Suite 9, Wilmington, DE 19801");
  await page.getByTestId("input-saft-jurisdiction").fill("Delaware, USA");
  await page.getByTestId("input-saft-taxid").fill("123-45-6789");
  await page.getByTestId("button-saft-next").click();

  // Step 1 - Transaction (payment method preference)
  await expect(page.getByTestId("saft-step-transaction")).toBeVisible();
  await page.getByTestId(`radio-paymentmethod-${opts.paymentMethod}`).click();
  await page.getByTestId("button-saft-next").click();

  // Step 2 - Questionnaire
  await expect(page.getByTestId("saft-step-questionnaire")).toBeVisible();
  // Pick the first accreditation option that exists.
  await page
    .locator('[data-testid^="radio-accreditation-"]')
    .first()
    .click();
  await page.getByTestId("button-saft-next").click();

  // Step 3 - Acknowledgments
  await expect(page.getByTestId("saft-step-acknowledgments")).toBeVisible();
  for (const k of ACK_KEYS) {
    await page.getByTestId(`check-ack-${k}`).click();
  }
  await page.getByTestId("button-saft-next").click();

  // Step 4 - Signature (typed name must match legalName)
  await expect(page.getByTestId("saft-step-signature")).toBeVisible();
  await page.getByTestId("input-saft-signature").fill(opts.legalName);
  await page.getByTestId("check-saft-intent").click();
  await page.getByTestId("button-saft-submit").click();

  // Step 5 - Done
  await expect(page.getByTestId("saft-step-done")).toBeVisible({
    timeout: 30_000,
  });
}
