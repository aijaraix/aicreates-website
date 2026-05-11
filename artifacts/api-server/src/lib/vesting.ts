/**
 * Server-authoritative vesting schedule. Single source of truth used by
 * both the dashboard ("/api/me/allocations") and the .ics export.
 *
 * Default schedule (matches the SAFT visual whitepaper):
 *   - 25% unlocked at TGE
 *   - 6-month cliff (no further unlocks)
 *   - Remaining 75% linear over 24 monthly tranches after the cliff
 */
export interface VestingPoint {
  date: string;
  tokens: number;
  cumulative: number;
  label: string;
}

export interface VestingScheduleArgs {
  totalTokens: number;
  fundedAt: Date | null;
  tgePercent?: number;
  cliffMonths?: number;
  vestingMonths?: number;
}

const DEFAULT_TGE = "2026-12-01T00:00:00Z";

export function computeVestingSchedule(args: VestingScheduleArgs): {
  tgeDate: string;
  cliffDate: string;
  schedule: VestingPoint[];
} {
  const totalTokens = Math.max(0, Math.floor(args.totalTokens));
  const tgePercent = args.tgePercent ?? 0.25;
  const cliffMonths = args.cliffMonths ?? 6;
  const vestingMonths = args.vestingMonths ?? 24;

  // TGE anchor: real funding date if available, else the published TGE.
  const tgeBase = args.fundedAt
    ? new Date(args.fundedAt.getTime())
    : new Date(DEFAULT_TGE);

  const tgeTokens = Math.floor(totalTokens * tgePercent);
  const remainder = Math.max(0, totalTokens - tgeTokens);
  const monthly = vestingMonths > 0 ? Math.floor(remainder / vestingMonths) : 0;
  // Last tranche absorbs the rounding remainder so cumulative === totalTokens.
  const lastTranche = remainder - monthly * (vestingMonths - 1);

  const schedule: VestingPoint[] = [];
  let cumulative = 0;
  cumulative += tgeTokens;
  schedule.push({
    date: tgeBase.toISOString(),
    tokens: tgeTokens,
    cumulative,
    label: "TGE unlock",
  });
  const cliffDate = addMonths(tgeBase, cliffMonths);
  for (let i = 1; i <= vestingMonths; i++) {
    const date = addMonths(cliffDate, i);
    const tokens = i === vestingMonths ? lastTranche : monthly;
    cumulative += tokens;
    schedule.push({
      date: date.toISOString(),
      tokens,
      cumulative,
      label: `Vesting month ${i}`,
    });
  }

  return {
    tgeDate: tgeBase.toISOString(),
    cliffDate: cliffDate.toISOString(),
    schedule,
  };
}

function addMonths(d: Date, m: number): Date {
  const x = new Date(d.getTime());
  x.setUTCMonth(x.getUTCMonth() + m);
  return x;
}
