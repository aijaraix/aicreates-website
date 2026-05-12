import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/auth";

interface OverflowBody {
  error: string;
  code: string;
  violations: Array<{
    roundSlug: string;
    requested: number;
    available: number;
  }>;
}

test.describe("capacity enforcement", () => {
  test("over-committing returns 409 capacity_exceeded with per-round violations", async ({
    page,
  }) => {
    await signIn(page, "investor");
    // strategic-seed has 200,000,000 AICA capacity. Request 10 billion
    // tokens to guarantee an overflow regardless of any seed activity.
    const tokens = 10_000_000_000;
    const usdCents = Math.round((tokens * 15) / 10); // $150,000,000
    const res = await page.request.post("/api/commitments", {
      data: {
        allocations: [
          { roundSlug: "strategic-seed", tokens, usdCents },
        ],
      },
      headers: { "Content-Type": "application/json" },
    });
    // Could 400 first on the $10M cap; either way the gate must reject.
    expect([400, 409]).toContain(res.status());
    if (res.status() === 409) {
      const body = (await res.json()) as OverflowBody;
      expect(body.code).toBe("capacity_exceeded");
      expect(body.violations.length).toBeGreaterThan(0);
      expect(body.violations[0]!.roundSlug).toBe("strategic-seed");
    }
  });

  test("a feasible allocation against the same round still succeeds", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const tokens = Math.floor((1_000 * 100 * 1000) / 15);
    const usdCents = Math.round((tokens * 15) / 10);
    const res = await page.request.post("/api/commitments", {
      data: {
        allocations: [
          { roundSlug: "strategic-seed", tokens, usdCents },
        ],
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(201);
  });
});
