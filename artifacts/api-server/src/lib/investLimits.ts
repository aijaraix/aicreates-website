import { db, commitmentsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

/**
 * Test-mode allowance: the first N funded commitments globally may
 * commit any USD amount (down to $1) so the operator can run live
 * card/wire smoke tests without committing $1,000+. Once N funded
 * commitments exist, the floor reverts to FLOOR_AFTER_TEST_CENTS.
 */
export const TEST_MODE_PURCHASE_LIMIT = 3;
export const TEST_MODE_MIN_CENTS = 100; // $1 floor while in test mode
export const FLOOR_AFTER_TEST_CENTS = 25_000; // $250 floor after test mode
export const ABSOLUTE_MAX_CENTS = 1_000_000_000; // $10M cap (unchanged)

export interface InvestLimits {
  minCents: number;
  maxCents: number;
  fundedCount: number;
  testMode: boolean;
  testPurchasesRemaining: number;
}

export async function getInvestLimits(): Promise<InvestLimits> {
  const result = await db.execute(sql`
    SELECT COUNT(*)::int AS funded_count
    FROM ${commitmentsTable}
    WHERE state = 'funded' OR status = 'succeeded'
  `);
  const row = (result.rows[0] ?? {}) as Record<string, unknown>;
  const fundedCount = Number(row["funded_count"] ?? 0);
  const testMode = fundedCount < TEST_MODE_PURCHASE_LIMIT;
  return {
    minCents: testMode ? TEST_MODE_MIN_CENTS : FLOOR_AFTER_TEST_CENTS,
    maxCents: ABSOLUTE_MAX_CENTS,
    fundedCount,
    testMode,
    testPurchasesRemaining: testMode
      ? TEST_MODE_PURCHASE_LIMIT - fundedCount
      : 0,
  };
}
