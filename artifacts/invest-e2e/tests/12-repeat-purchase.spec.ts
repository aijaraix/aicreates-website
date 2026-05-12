import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";
import { postJson } from "./helpers/api";
import { ADMIN_EMAIL } from "./helpers/users";

test.describe("repeat purchase", () => {
  test.skip(
    !ADMIN_EMAIL,
    "ADMIN_EMAILS env var must include at least one address",
  );

  test("a funded investor can return to /invest and create a second commitment", async ({
    page,
    browser,
  }) => {
    await signIn(page, "investor");

    // First commitment, fund it.
    const first = await createCommitment(page, 1_000);
    await page.goto(`/invest/saft/${first.id}`);
    await completeSaft(page, {
      legalName: "Portal Investor",
      paymentMethod: "wire",
    });
    await postJson(page, "/checkout", {
      commitmentId: first.id,
      paymentMethod: "wire",
    });

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await signIn(adminPage, "admin");
    await postJson(adminPage, `/admin/commitments/${first.id}/confirm-wire`, {});
    await adminCtx.close();

    // From the dashboard, the "make commitment" CTA should still route
    // to /invest with an empty cart - returning users are never blocked.
    await page.goto("/invest/dashboard");
    await expect(page.getByTestId("link-make-commitment")).toBeVisible({
      timeout: 30_000,
    });
    await page.getByTestId("link-make-commitment").click();
    await page.waitForURL(/\/invest\/invest/);
    const usd = page.getByTestId("input-usd-strategic-seed");
    await expect(usd).toBeVisible({ timeout: 30_000 });
    // Cart starts empty; total is $0.
    await expect(page.getByTestId("cart-total-usd")).toContainText("$0");

    // Second commitment via the cart UI.
    await usd.fill("1000");
    await page.getByTestId("button-cart-continue").click();
    await page.waitForURL(/\/invest\/saft\/[a-zA-Z0-9-]+/, {
      timeout: 30_000,
    });
    // The new draft should be a different commitment id from the first.
    const url = page.url();
    expect(url).not.toContain(first.id);
  });
});
