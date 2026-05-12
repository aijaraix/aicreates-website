import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

test.describe("dashboard ?paid=1 toast", () => {
  test("returning from a successful Stripe Checkout shows the success toast", async ({
    page,
  }) => {
    await signIn(page, "investor");
    // Stripe Checkout success_url redirects here. The toast should
    // render once and self-dismiss; we just need it visible at least
    // briefly to confirm the wiring.
    await page.goto("/invest/dashboard?paid=1");
    await expect(page.getByTestId("toast-paid")).toBeVisible({
      timeout: 10_000,
    });
  });
});
