import { test, expect, type FrameLocator } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";
import { INVESTOR_EMAIL } from "./helpers/users";
import { STRIPE_CONFIGURED, pollFunded } from "./helpers/stripe";

/**
 * Drive Stripe's Financial Connections sandbox to "Test Institution",
 * which is the canonical way to complete a us_bank_account payment in
 * test mode without real Plaid credentials. The FC widget renders
 * inside a Stripe-served iframe; we accept either matcher.
 */
async function pickFcTestInstitution(
  fc: FrameLocator,
): Promise<void> {
  // Stripe shows "Test Institution" as a featured option in test mode.
  // Several layouts exist (button, list item, role=option); try them in
  // turn so the test survives small UI revisions.
  const candidates = [
    fc.getByRole("button", { name: /test institution/i }),
    fc.getByText(/^test institution$/i).first(),
    fc.locator('[data-test="institution-row"]', {
      hasText: /test institution/i,
    }),
  ];
  for (const c of candidates) {
    if (await c.isVisible().catch(() => false)) {
      await c.click();
      return;
    }
  }
  throw new Error(
    'Could not find "Test Institution" in the Financial Connections modal.',
  );
}

async function clickAny(
  fc: FrameLocator,
  patterns: RegExp[],
  timeoutMs = 10_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    for (const p of patterns) {
      const btn = fc.getByRole("button", { name: p }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        return;
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `Could not find a button matching any of: ${patterns.map(String).join(", ")}`,
  );
}

test.describe("Stripe-hosted ACH (us_bank_account) checkout", () => {
  test.skip(
    !STRIPE_CONFIGURED,
    "Stripe is not configured (no STRIPE_SECRET_KEY and no REPLIT_CONNECTORS_HOSTNAME).",
  );
  test.setTimeout(240_000);

  test("ACH via Financial Connections Test Institution flips the commitment to funded", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 5_000);

    await page.goto(`/invest/saft/${c.id}`);
    await completeSaft(page, {
      legalName: "Portal Investor",
      email: INVESTOR_EMAIL,
      paymentMethod: "ach",
    });

    await page.goto(`/invest/checkout/${c.id}`);
    await expect(page.getByTestId("checkout-method-picker")).toBeVisible();
    await page.getByTestId("radio-method-ach").click();
    await page.getByTestId("button-checkout-pay").click();

    // Stripe-hosted Checkout page (us_bank_account only).
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60_000 });

    const emailField = page.locator('input[name="email"]');
    if (await emailField.isVisible().catch(() => false)) {
      await emailField.fill(INVESTOR_EMAIL);
    }
    const billingName = page.locator('input[name="billingName"]');
    if (await billingName.isVisible().catch(() => false)) {
      await billingName.fill("Portal Investor");
    }

    // Trigger the Financial Connections modal.
    await page.locator('button[type="submit"]').first().click();

    // The Financial Connections widget renders in a Stripe iframe.
    const fc = page.frameLocator('iframe[src*="stripe.com"]').first();

    await pickFcTestInstitution(fc);
    // FC sandbox typically asks for an Agree -> Connect/Authorize sequence.
    await clickAny(fc, [/agree|continue/i], 15_000);
    await clickAny(fc, [/connect|authori[sz]e|allow|done/i], 15_000);

    // Back on the Stripe Checkout page; complete payment.
    const finalPay = page.locator('button[type="submit"]').first();
    if (await finalPay.isEnabled().catch(() => false)) {
      await finalPay.click();
    }

    // Redirect back to the portal dashboard.
    await page.waitForURL(/\/invest\/dashboard/, { timeout: 120_000 });

    // Webhook is async; poll allocations until funded.
    const funded = await pollFunded(page, c.id, 180_000);
    expect(
      funded,
      "commitment never reached funded after ACH payment",
    ).not.toBeNull();
    expect(funded!.state).toBe("funded");
    expect(funded!.isFunded).toBe(true);
    expect(funded!.fundedAt).not.toBeNull();
  });
});
