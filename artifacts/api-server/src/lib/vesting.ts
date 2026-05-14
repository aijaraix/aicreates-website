/**
 * Server-authoritative vesting schedule. Single source of truth used by
 * both the dashboard ("/api/me/allocations") and the .ics export.
 *
 * Default schedule (matches the currently-open Strategic Seed round):
 *   - 10% unlocked at TGE
 *   - 3-month cliff (no further unlocks)
 *   - Remaining 90% linear over 12 monthly tranches after the cliff
 *
 * Callers should pass round-specific vesting via args.tgePercent /
 * cliffMonths / vestingMonths; the defaults exist only for safety when
 * a commitment has no associated round vesting metadata.
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
  const tgePercent = args.tgePercent ?? 0.1;
  const cliffMonths = args.cliffMonths ?? 3;
  const vestingMonths = args.vestingMonths ?? 12;

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
