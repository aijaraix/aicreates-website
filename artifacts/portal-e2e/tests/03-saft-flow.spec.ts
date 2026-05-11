import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";
import { INVESTOR_EMAIL } from "./helpers/users";

test.describe("SAFT signing", () => {
  test("complete all 6 steps and reach the Done screen", async ({ page }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 5_000);
    await page.goto(`/portal/saft/${c.id}`);

    await completeSaft(page, {
      legalName: "Portal Investor",
      email: INVESTOR_EMAIL,
      paymentMethod: "wire",
    });

    await expect(page.getByTestId("link-go-checkout")).toBeVisible();
    await expect(page.getByTestId("link-download-saft")).toBeVisible();
  });
});
