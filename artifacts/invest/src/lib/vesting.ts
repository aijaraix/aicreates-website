/**
 * Client-side mirror of the server's computeVestingSchedule. Used for
 * the AllocationCalculator preview on /invest/ where we have no funded
 * date yet. The dashboard always uses server-computed values.
 */
export interface VestingPoint {
  date: string;
  tokens: number;
  cumulative: number;
  label: string;
}

const DEFAULT_TGE = "2026-12-01T00:00:00Z";

function addMonths(d: Date, m: number): Date {
  const x = new Date(d.getTime());
  x.setUTCMonth(x.getUTCMonth() + m);
  return x;
}

export function computeVesting(
  totalTokens: number,
  fundedAt?: Date | null,
  opts: { tgePercent?: number; cliffMonths?: number; vestingMonths?: number } = {},
): { tgeDate: string; cliffDate: string; schedule: VestingPoint[] } {
  // Defaults match the currently-open Strategic Seed round (10% TGE,
  // 3-month cliff, 12-month linear). Callers should pass round-specific
  // vesting via opts; these defaults are only used for the static sample
  // calendar on /invest before a round is selected.
  const tgePercent = opts.tgePercent ?? 0.1;
  const cliffMonths = opts.cliffMonths ?? 3;
  const vestingMonths = opts.vestingMonths ?? 12;
  const total = Math.max(0, Math.floor(totalTokens));
  const tgeBase = fundedAt ? new Date(fundedAt.getTime()) : new Date(DEFAULT_TGE);
  const tgeTokens = Math.floor(total * tgePercent);
  const remainder = Math.max(0, total - tgeTokens);
  const monthly = vestingMonths > 0 ? Math.floor(remainder / vestingMonths) : 0;
  const last = remainder - monthly * (vestingMonths - 1);
  const schedule: VestingPoint[] = [];
  let cumulative = tgeTokens;
  schedule.push({
    date: tgeBase.toISOString(),
    tokens: tgeTokens,
    cumulative,
    label: "TGE unlock",
  });
  const cliff = addMonths(tgeBase, cliffMonths);
  for (let i = 1; i <= vestingMonths; i++) {
    const date = addMonths(cliff, i);
    const tokens = i === vestingMonths ? last : monthly;
    cumulative += tokens;
    schedule.push({
      date: date.toISOString(),
      tokens,
      cumulative,
      label: `Vesting month ${i}`,
    });
  }
  return { tgeDate: tgeBase.toISOString(), cliffDate: cliff.toISOString(), schedule };
}

/**
 * Token allocation for a USD amount at the active round price.
 * Default price is the Strategic Seed price ($0.010 per AICA = 10
 * millicents). Pass `pricePerTokenMillicents` to compute against a
 * different round.
 */
export function tokensForAmount(
  usd: number,
  pricePerTokenMillicents = 10,
): number {
  if (pricePerTokenMillicents <= 0) return 0;
  let bonus = 0;
  if (usd >= 25_000) bonus = 0.2;
  else if (usd >= 5_000) bonus = 0.1;
  // tokens = usd / pricePerTokenUsd, where price = millicents / 1000
  return Math.floor(((usd * 1000) / pricePerTokenMillicents) * (1 + bonus));
}

export function buildIcs(
  schedule: VestingPoint[],
  commitmentLabel: string,
): string {
  const fmt = (iso: string) =>
    iso.replace(/[-:]/g, "").replace(/\.\d+/, "").replace(/Z$/, "Z");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AICreatesAi//Vesting//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const p of schedule) {
    if (p.tokens <= 0) continue;
    const start = fmt(p.date);
    const endIso = new Date(
      new Date(p.date).getTime() + 60 * 60 * 1000,
    ).toISOString();
    lines.push(
      "BEGIN:VEVENT",
      `UID:${start}-${commitmentLabel}@aicreates.ai`,
      `DTSTAMP:${fmt(new Date().toISOString())}`,
      `DTSTART:${start}`,
      `DTEND:${fmt(endIso)}`,
      `SUMMARY:AICA unlock - ${p.tokens.toLocaleString()} tokens (${p.label})`,
      `DESCRIPTION:${commitmentLabel} - cumulative ${p.cumulative.toLocaleString()} AICA`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
