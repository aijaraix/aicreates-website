import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

test.describe("create commitment via AllocationCart", () => {
  test("filling a strategic-seed allocation routes the user to the SAFT wizard", async ({
    page,
  }) => {
    await signIn(page, "investor");
    await page.goto("/invest/invest");

    // Wait for the multi-round cart to render.
    const usdInput = page.getByTestId("input-usd-strategic-seed");
    await expect(usdInput).toBeVisible({ timeout: 30_000 });

    // Type a $5,000 allocation. Tokens auto-derive from price.
    await usdInput.fill("5000");
    await expect(page.getByTestId("cart-total-usd")).toContainText("$5,000");

    await page.getByTestId("button-cart-continue").click();

    await page.waitForURL(/\/invest\/saft\/[a-zA-Z0-9-]+/, {
      timeout: 30_000,
    });
    await expect(page.getByTestId("saft-step-confirm")).toBeVisible();
  });
});
