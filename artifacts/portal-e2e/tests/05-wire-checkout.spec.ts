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

test.describe("wire checkout + admin confirm", () => {
  test.skip(
    !ADMIN_EMAIL,
    "ADMIN_EMAILS env var must include at least one address",
  );

  test("wire commitment moves to awaiting_wire and admin can mark it funded", async ({
    page,
    browser,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 25_000);
    await page.goto(`/portal/saft/${c.id}`);
    await completeSaft(page, {
      legalName: "Portal Investor",
      email: INVESTOR_EMAIL,
      paymentMethod: "wire",
    });

    // Move to checkout, pick wire, confirm.
    await page.goto(`/portal/checkout/${c.id}`);
    await expect(page.getByTestId("checkout-method-picker")).toBeVisible();
    await page.getByTestId("radio-method-wire").click();
    await expect(page.getByTestId("wire-instructions")).toBeVisible();
    await page.getByTestId("button-checkout-pay").click();
    await expect(page.getByTestId("wire-confirmation")).toBeVisible();

    // Admin signs in (separate browser context) and confirms the wire.
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await signIn(adminPage, "admin");
    await adminPage.goto("/portal/admin");
    await adminPage.getByTestId("button-filter-awaiting_wire").click();
    adminPage.once("dialog", (d) => d.accept());
    await adminPage.getByTestId(`button-confirm-wire-${c.id}`).click();

    // Verify commitment is now funded via the admin API.
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

  test("wire commitment cannot be created without a signed SAFT", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 10_000);
    // No SAFT signed yet -> /checkout endpoint must reject.
    const res = await page.request.post("/api/checkout", {
      data: { commitmentId: c.id, paymentMethod: "wire" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body.error).toMatch(/SAFT not signed/i);
  });
});
