import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";

test.describe("SAFT PDF preview", () => {
  test("the live PDF preview iframe renders on the signature step", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 2_500);
    await page.goto(`/portal/saft/${c.id}`);

    // Fill the minimum required fields to advance to step 4.
    await page.getByTestId("input-saft-name").fill("Portal Investor");
    await page
      .getByTestId("input-saft-email")
      .fill("portal-e2e-investor@example.com");
    await page
      .getByTestId("input-saft-address")
      .fill("123 Test Street, Wilmington, DE 19801");
    await page.getByTestId("input-saft-jurisdiction").fill("Delaware, USA");
    await page.getByTestId("input-saft-taxid").fill("123-45-6789");
    await page.getByTestId("button-saft-next").click();

    await page.getByTestId("radio-paymentmethod-wire").click();
    await page.getByTestId("button-saft-next").click();

    await page
      .locator('[data-testid^="radio-accreditation-"]')
      .first()
      .click();
    await page.getByTestId("button-saft-next").click();

    // Skip ack toggling — we just need to land on the signature step.
    for (const k of [
      "highRisk",
      "noOwnership",
      "consumptiveUse",
      "illiquidity",
      "vestingLockup",
      "noGeneralSolicitation",
      "confidentiality",
      "taxResponsibility",
    ]) {
      await page.getByTestId(`check-ack-${k}`).click();
    }
    await page.getByTestId("button-saft-next").click();

    // Signature step renders the preview iframe.
    await expect(page.getByTestId("saft-step-signature")).toBeVisible();
    await expect(page.getByTestId("saft-pdf-preview")).toBeVisible({
      timeout: 30_000,
    });

    // Independently verify the preview endpoint serves a real PDF.
    const res = await page.request.post(`/api/saft/${c.id}/preview`, {
      data: {
        legalName: "Portal Investor",
        email: "portal-e2e-investor@example.com",
        address: "123 Test Street",
        jurisdiction: "Delaware, USA",
        taxId: "123-45-6789",
        paymentMethod: "wire",
        accreditationCategory: "Net worth >$1M",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.ok()).toBeTruthy();
    expect(res.headers()["content-type"]).toContain("application/pdf");
    const body = await res.body();
    expect(body.length).toBeGreaterThan(500);
    expect(body.slice(0, 4).toString("latin1")).toBe("%PDF");
  });
});
