import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";
import { postJson } from "./helpers/api";
import { ADMIN_EMAIL, INVESTOR_EMAIL } from "./helpers/users";

test.describe("dashboard funded state", () => {
  test.skip(
    !ADMIN_EMAIL,
    "ADMIN_EMAILS env var must include at least one address",
  );

  test("a funded wire commitment surfaces in the dashboard with a vesting schedule", async ({
    page,
    browser,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 5_000);
    await page.goto(`/portal/saft/${c.id}`);
    await completeSaft(page, {
      legalName: "Portal Investor",
      email: INVESTOR_EMAIL,
      paymentMethod: "wire",
    });

    // Move to awaiting_wire via the checkout endpoint.
    await postJson(page, "/checkout", {
      commitmentId: c.id,
      paymentMethod: "wire",
    });

    // Admin confirms the wire to flip the commitment to funded.
    const adminCtx = await browser.newContext();
    const adminPage = await adminCtx.newPage();
    await signIn(adminPage, "admin");
    await postJson(adminPage, `/admin/commitments/${c.id}/confirm-wire`, {});
    await adminCtx.close();

    // Investor reloads the dashboard and sees the funded commitment.
    await page.goto("/portal/dashboard");
    await expect(page.getByTestId(`row-commitment-${c.id}`)).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page
        .getByTestId(`row-commitment-${c.id}`)
        .locator('[data-testid="badge-state-funded"]'),
    ).toBeVisible();

    // The .ics export button only renders for funded commitments with a
    // vesting schedule, so its presence implies the schedule was computed.
    await expect(page.getByTestId(`button-ics-${c.id}`)).toBeVisible();
  });
});
