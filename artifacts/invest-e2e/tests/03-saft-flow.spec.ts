import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";

test.describe("SAFT signing", () => {
  test("complete the simplified SAFT wizard end-to-end", async ({ page }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 5_000);
    await page.goto(`/invest/saft/${c.id}`);

    await completeSaft(page, {
      legalName: "Portal Investor",
      paymentMethod: "wire",
    });

    await expect(page.getByTestId("link-go-checkout")).toBeVisible();
  });
});
