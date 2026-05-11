import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";
import { getJson } from "./helpers/api";
import { ADMIN_EMAIL, INVESTOR_EMAIL } from "./helpers/users";

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
    await page.goto(`/portal/saft/${c.id}`);
    await completeSaft(page, {
      legalName: "Portal Investor",
      email: INVESTOR_EMAIL,
      paymentMethod: "crypto",
    });

    await page.goto(`/portal/checkout/${c.id}`);
    await expect(page.getByTestId("checkout-method-picker")).toBeVisible();
    await page.getByTestId("radio-method-crypto").click();
    await expect(page.getByTestId("crypto-instructions")).toBeVisible();
    await page.getByTestId("button-checkout-pay").click();
    await expect(page.getByTestId("crypto-confirmation")).toBeVisible();

    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await signIn(adminPage, "admin");
    await adminPage.goto("/portal/admin");
    await adminPage.getByTestId("button-filter-awaiting_crypto").click();
    adminPage.once("dialog", (d) => d.accept());
    await adminPage.getByTestId(`button-confirm-crypto-${c.id}`).click();

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
