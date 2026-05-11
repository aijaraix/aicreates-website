import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";
import { completeSaft } from "./helpers/saft";
import { postJson, getJson } from "./helpers/api";
import { INVESTOR_EMAIL } from "./helpers/users";

const SHOULD_RUN = process.env.STRIPE_E2E_DRIVE_CHECKOUT === "1";

interface Allocation {
  commitmentId: string;
  state: string;
  status: string;
}
interface AllocationsResp {
  allocations: Allocation[];
}

test.describe("Stripe-hosted ACH (us_bank_account) checkout", () => {
  test.skip(
    !SHOULD_RUN,
    "Set STRIPE_E2E_DRIVE_CHECKOUT=1 to opt in. The ACH test depends on Stripe's hosted us_bank_account flow, which uses Financial Connections by default and may require the dev Stripe account to have manual entry enabled. Brittle; opt in deliberately.",
  );
  test.setTimeout(180_000);

  test("ACH checkout returns a valid Stripe Checkout url for the us_bank_account method", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 5_000);

    await page.goto(`/portal/saft/${c.id}`);
    await completeSaft(page, {
      legalName: "Portal Investor",
      email: INVESTOR_EMAIL,
      paymentMethod: "ach",
    });

    // Hit the API directly so we can assert the session shape regardless of
    // whether the hosted page UI changes. The card spec already covers the
    // full UI -> webhook -> funded round-trip.
    const checkout = await postJson<{
      url: string;
      sessionId: string;
      commitmentId: string;
    }>(page, "/checkout", { commitmentId: c.id, paymentMethod: "ach" });

    expect(checkout.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
    expect(checkout.sessionId).toMatch(/^cs_(test|live)_/);
    expect(checkout.commitmentId).toBe(c.id);

    // Sanity: load the hosted page and confirm Stripe rendered an ACH UI
    // (the page mentions "bank account" somewhere). We do not drive the
    // Financial Connections modal here; that is left to follow-up work.
    await page.goto(checkout.url);
    await expect(page.locator("body")).toContainText(/bank account/i, {
      timeout: 30_000,
    });

    // Allocations endpoint should still see the commitment as
    // pending_payment (Stripe webhook has not fired yet).
    const a = await getJson<AllocationsResp>(page, "/me/allocations");
    const mine = a.allocations.find((x) => x.commitmentId === c.id);
    expect(mine).toBeTruthy();
    expect(mine!.state).toBe("pending_payment");
  });
});
