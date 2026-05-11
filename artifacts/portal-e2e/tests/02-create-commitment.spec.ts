import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

test.describe("create commitment", () => {
  test("custom $5,000 commitment routes the user to the SAFT wizard", async ({
    page,
  }) => {
    await signIn(page, "investor");
    await page.goto("/portal/invest");

    // Wait for tier list to render (Stripe-backed or fallback).
    await expect(page.getByTestId("card-tier-custom")).toBeVisible();
    await page.getByTestId("input-custom-amount").fill("5000");
    await page.getByTestId("button-commit-custom").click();

    await page.waitForURL(/\/portal\/saft\/[a-zA-Z0-9-]+/, { timeout: 30_000 });
    await expect(page.getByTestId("saft-step-identity")).toBeVisible();
  });
});
