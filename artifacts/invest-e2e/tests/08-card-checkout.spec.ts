import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";
import { INVESTOR_EMAIL } from "./helpers/users";
import { STRIPE_CONFIGURED, pollFunded } from "./helpers/stripe";

test.describe("Stripe-hosted card checkout", () => {
  test.skip(
    !STRIPE_CONFIGURED,
    "Stripe is not configured (no STRIPE_SECRET_KEY and no REPLIT_CONNECTORS_HOSTNAME).",
  );
  // Skipped by default: this drives Stripe's hosted Checkout UI (a vendor
  // surface outside our control). Stripe ships UI changes that break our
  // input selectors with no notice. Set RUN_STRIPE_UI=1 to opt-in locally
  // when validating the live integration end-to-end.
  test.skip(
    !process.env["RUN_STRIPE_UI"],
    "Stripe-hosted Checkout UI tests are opt-in (set RUN_STRIPE_UI=1).",
  );
  test.setTimeout(240_000);

  test("4242 test card flips the commitment to funded via the Stripe webhook", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 1_000);

    await page.goto(`/invest/saft/${c.id}`);
    await completeSaft(page, {
      legalName: "Portal Investor",
      paymentMethod: "card",
    });

    await page.goto(`/invest/checkout/${c.id}`);
    await expect(page.getByTestId("checkout-method-picker")).toBeVisible();
    // Card + ACH are collapsed under a single "Fiat" picker pill; Stripe
    // Checkout itself lets the customer pick the rail on the hosted page.
    await page.getByTestId("radio-method-fiat").click();
    await page.getByTestId("button-checkout-pay").click();

    // Stripe-hosted Checkout page.
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });

    const emailField = page.locator('input[name="email"]');
    if (await emailField.isVisible().catch(() => false)) {
      await emailField.fill(INVESTOR_EMAIL);
    }
    await page.locator('input[name="cardNumber"]').fill("4242424242424242");
    await page.locator('input[name="cardExpiry"]').fill("12 / 34");
    await page.locator('input[name="cardCvc"]').fill("123");
    await page.locator('input[name="billingName"]').fill("Portal Investor");
    const postal = page.locator('input[name="billingPostalCode"]');
    if (await postal.isVisible().catch(() => false)) {
      await postal.fill("94105");
    }

    await page.locator('button[type="submit"]').first().click();

    // Redirected back to /invest/dashboard?paid=<id>
    await page.waitForURL(/\/invest\/dashboard/, { timeout: 120_000 });

    const funded = await pollFunded(page, c.id);
    expect(
      funded,
      "commitment never reached funded after card payment",
    ).not.toBeNull();
    expect(funded!.state).toBe("funded");
    expect(funded!.isFunded).toBe(true);
    expect(funded!.fundedAt).not.toBeNull();
  });
});
