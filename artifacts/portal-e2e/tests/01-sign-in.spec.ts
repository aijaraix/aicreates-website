import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

test.describe("sign-in", () => {
  test("investor signs in and lands on the dashboard", async ({ page }) => {
    await signIn(page, "investor");
    await expect(page).toHaveURL(/\/portal\/dashboard/);
    await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
    await expect(page.getByTestId("link-make-commitment")).toBeVisible();
  });
});
