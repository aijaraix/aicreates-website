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

    // pdf-lib writes uncompressed text streams by default, so we can do
    // a raw substring scan to prove the per-round allocation table was
    // rendered (round label, fixed table headers, vesting boilerplate).
    // This protects against silent regressions where the PDF endpoint
    // returns a valid-but-empty cover page with no allocations baked in.
    const text = body.toString("latin1");
    expect(text).toContain("Allocation");
    expect(text).toContain("Strategic Seed Round");
    expect(text).toContain("Acknowledged");
  });
});
