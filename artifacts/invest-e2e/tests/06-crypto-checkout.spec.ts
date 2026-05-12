import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";
import { getJson } from "./helpers/api";
import { ADMIN_EMAIL } from "./helpers/users";

interface AdminCommitmentsResponse {
  commitments: Array<{
    id: string;
    state: string;
    status: string;
    paymentMethod: string | null;
  }>;
}

test.describe("crypto checkout + admin confirm", () => {
  test.skip(
    !ADMIN_EMAIL,
    "ADMIN_EMAILS env var must include at least one address",
  );

  test("crypto commitment moves to awaiting_crypto and admin can mark it funded", async ({
    page,
    browser,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 5_000);
    await page.goto(`/invest/saft/${c.id}`);
    await completeSaft(page, {
      legalName: "Portal Investor",
      paymentMethod: "crypto",
    });

    await page.goto(`/invest/checkout/${c.id}`);
    await expect(page.getByTestId("checkout-method-picker")).toBeVisible();
    await page.getByTestId("radio-method-crypto").click();
    await expect(page.getByTestId("crypto-instructions")).toBeVisible();
    await page.getByTestId("button-checkout-pay").click();
    await expect(page.getByTestId("crypto-confirmation")).toBeVisible();

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await signIn(adminPage, "admin");
    await adminPage.goto("/invest/admin");
    await adminPage.getByTestId("tab-commitments").click();
    await adminPage
      .getByTestId("select-status-filter")
      .selectOption("awaiting_crypto");
    adminPage.once("dialog", (d) => d.accept());
    await Promise.all([
      adminPage.waitForResponse(
        (r) =>
          r.url().includes(`/api/admin/commitments/${c.id}/confirm-crypto`) &&
          r.request().method() === "POST",
      ),
      adminPage.getByTestId(`button-confirm-crypto-${c.id}`).click(),
    ]);

    const after = await getJson<AdminCommitmentsResponse>(
      adminPage,
      "/admin/commitments",
    );
    const updated = after.commitments.find((x) => x.id === c.id);
    expect(updated).toBeTruthy();
    expect(updated!.state).toBe("funded");
    expect(updated!.status).toBe("succeeded");

    await adminCtx.close();
  });
});
