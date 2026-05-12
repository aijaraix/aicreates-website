import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";
import { createCommitment } from "./helpers/commitment";

test.describe("SAFT PDF preview", () => {
  test("the live preview endpoint renders a real PDF auto-filled from the profile", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const c = await createCommitment(page, 2_500);

    // The simplified preview endpoint pulls investor + allocation data
    // from the DB (profile + commitment_allocations); the request body
    // only carries the in-progress wizard fields. With a fresh draft we
    // can pass an empty body and still get a valid PDF back.
    const res = await page.request.post(`/api/saft/${c.id}/preview`, {
      data: {
        paymentMethod: "wire",
        accreditationCategory: "net-worth",
        signatureName: "Portal Investor",
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
