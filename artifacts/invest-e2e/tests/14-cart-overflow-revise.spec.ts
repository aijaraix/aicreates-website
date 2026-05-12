import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

test.describe("AllocationCart capacity overflow", () => {
  test("over-committing in the cart shows the overflow banner and disables Continue", async ({
    page,
  }) => {
    await signIn(page, "investor");
    await page.goto("/invest/invest");

    const usd = page.getByTestId("input-usd-strategic-seed");
    await expect(usd).toBeVisible({ timeout: 30_000 });

    // strategic-seed has 200M tokens for sale. Asking for $9M (= 600M
    // tokens at $0.015) clearly exceeds it, so the cart's client-side
    // capacity check should flag it BEFORE we ever hit the server.
    await usd.fill("9000000");

    // The per-row + summary overflow banner appears, and Continue is
    // disabled, preventing the user from posting a known-bad request.
    // (This is the deterministic UX. The server-side 409 auto-revise
    // path only runs when two investors race for the same capacity -
    // it's exercised via the race-condition follow-up task, not here.)
    await expect(page.getByTestId("cart-overflow-banner")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("button-cart-continue")).toBeDisabled();

    // Reducing the request below available re-enables Continue.
    await usd.fill("1500");
    await expect(page.getByTestId("cart-overflow-banner")).toHaveCount(0);
    await expect(page.getByTestId("button-cart-continue")).toBeEnabled();
  });
});
