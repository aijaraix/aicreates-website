import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";
import { getJson } from "./helpers/api";
import { INVESTOR_EMAIL } from "./helpers/users";

const SHOULD_RUN = process.env.STRIPE_E2E_DRIVE_CHECKOUT === "1";

interface Allocation {
  commitmentId: string;
  state: string;
  status: string;
}
interface AllocationsResp {
  allocations: Allocation[];
}

async function pollFunded(
  page: import("@playwright/test").Page,
  commitmentId: string,
  timeoutMs = 90_000,
): Promise<Allocation | null> {
  const deadline = Date.now() + timeoutMs;
  let last: Allocation | null = null;
  while (Date.now() < deadline) {
    const a = await getJson<AllocationsResp>(page, "/me/allocations");
    last = a.allocations.find((x) => x.commitmentId === commitmentId) ?? null;
    if (last && last.state === "funded") return last;
    await page.waitForTimeout(2_000);
  }
  return last;
}

test.describe("Stripe-hosted card checkout", () => {
  test.skip(
    !SHOULD_RUN,
    "Set STRIPE_E2E_DRIVE_CHECKOUT=1 to opt in. This test drives the live Stripe-hosted Checkout page (4242... test card) and depends on Stripe's UI staying stable. Requires the dev Stripe sandbox connector to be connected.",
  );
  test.setTimeout(180_000);

  test("4242 test card flips the commitment to funded via the Stripe webhook", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 1_000);

    await page.goto(`/portal/saft/${c.id}`);
    await completeSaft(page, {
      legalName: "Portal Investor",
      email: INVESTOR_EMAIL,
      paymentMethod: "card",
    });

    await page.goto(`/portal/checkout/${c.id}`);
    await expect(page.getByTestId("checkout-method-picker")).toBeVisible();
    await page.getByTestId("radio-method-card").click();
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

    // Redirected back to /portal/dashboard?paid=<id>
    await page.waitForURL(/\/portal\/dashboard/, { timeout: 90_000 });

    // Webhook is async; poll the allocations endpoint until funded.
    const funded = await pollFunded(page, c.id);
    expect(funded, "commitment never reached funded").not.toBeNull();
    expect(funded!.state).toBe("funded");
  });
});
