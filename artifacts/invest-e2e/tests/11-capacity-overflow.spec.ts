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
    // strategic-seed has 500,000,000 AICA capacity at $0.010/token.
    // Pick a token count that:
    //   - clearly exceeds the 500M capacity (force a 409), and
    //   - keeps the resulting USD total inside [MIN_CUSTOM=$1k,
    //     MAX_CUSTOM=$10M] so the server cannot short-circuit on the
    //     amount validators that run BEFORE validateCapacity.
    // 900M tokens => 900M * 10 / 10 = 900,000,000c = $9M.
    const tokens = 900_000_000;
    const usdCents = Math.round((tokens * 10) / 10); // $9,000,000.00
    const res = await page.request.post("/api/commitments", {
      data: {
        allocations: [{ roundSlug: "strategic-seed", tokens, usdCents }],
      },
      headers: { "Content-Type": "application/json" },
    });
    // Deterministic: must be exactly 409 with capacity_exceeded.
    expect(res.status()).toBe(409);
    const body = (await res.json()) as OverflowBody;
    expect(body.code).toBe("capacity_exceeded");
    expect(body.violations.length).toBeGreaterThan(0);
    const v = body.violations[0]!;
    expect(v.roundSlug).toBe("strategic-seed");
    expect(v.requested).toBe(tokens);
    expect(v.available).toBeLessThan(tokens);
  });

  test("a feasible allocation against the same round still succeeds", async ({
    page,
  }) => {
    await signIn(page, "investor");
    const tokens = Math.floor((1_000 * 100 * 1000) / 10);
    const usdCents = Math.round((tokens * 10) / 10);
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
