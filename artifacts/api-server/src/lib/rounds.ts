/**
 * Authoritative server-side round catalog. Mirrors the SAFT round table
 * in the AIcreatesAI whitepaper. Mirrored client-side in
 * artifacts/invest/src/data/rounds.ts but the server is the source of
 * truth for token math, raise totals, and capacity gating.
 *
 * Aggregate: 2,250,000,000 AICA across 5 rounds = 22.50% of the
 * 10,000,000,000 fixed supply, raising $50,000,000 (~$230M FDV at
 * blended round pricing).
 */
export interface RoundDef {
  slug: string;
  label: string;
  /** Per-token price in USD millicents (1 unit = $0.001). */
  pricePerTokenMillicents: number;
  /** Hard cap of tokens available for sale in this round. */
  tokensForSale: number;
  /** Soft target raise in USD cents. */
  targetRaiseCents: number;
  /** Hard cap raise in USD cents. */
  hardCapCents: number;
  /** ISO date string the round closes. */
  deadline: string;
  open: boolean;
  /**
   * Per-round vesting parameters. Earlier rounds carry longer lockups;
   * later rounds vest faster. Mirrors the client-side definitions in
   * `artifacts/invest/src/data/rounds.ts`.
   */
  vesting: {
    tgePercent: number;
    cliffMonths: number;
    vestingMonths: number;
  };
}

export const ROUNDS: readonly RoundDef[] = [
  {
    slug: "strategic-seed",
    label: "Strategic Seed",
    pricePerTokenMillicents: 10, // $0.010 per AICA
    tokensForSale: 500_000_000,
    targetRaiseCents: 500_000_000, // $5M
    hardCapCents: 500_000_000,
    deadline: "2026-12-31T23:59:59Z",
    open: true,
    vesting: { tgePercent: 0.1, cliffMonths: 3, vestingMonths: 12 },
  },
  {
    slug: "private-1",
    label: "Private Round 1",
    pricePerTokenMillicents: 15, // $0.015 per AICA
    tokensForSale: 800_000_000,
    targetRaiseCents: 1_200_000_000, // $12M
    hardCapCents: 1_200_000_000,
    deadline: "2027-03-31T23:59:59Z",
    open: false,
    vesting: { tgePercent: 0.15, cliffMonths: 2, vestingMonths: 10 },
  },
  {
    slug: "private-2",
    label: "Private Round 2",
    pricePerTokenMillicents: 20, // $0.020 per AICA
    tokensForSale: 650_000_000,
    targetRaiseCents: 1_800_000_000, // $18M
    hardCapCents: 1_800_000_000,
    deadline: "2027-06-30T23:59:59Z",
    open: false,
    vesting: { tgePercent: 0.2, cliffMonths: 2, vestingMonths: 7 },
  },
  {
    slug: "infrastructure",
    label: "Infrastructure / Strategic",
    pricePerTokenMillicents: 26, // $0.026 per AICA
    tokensForSale: 230_769_231,
    targetRaiseCents: 1_000_000_000, // $10M
    hardCapCents: 1_000_000_000,
    deadline: "2027-09-30T23:59:59Z",
    open: false,
    vesting: { tgePercent: 0.25, cliffMonths: 1, vestingMonths: 5 },
  },
  {
    slug: "community-launchpad",
    label: "Community / Launchpad",
    pricePerTokenMillicents: 34, // $0.034 per AICA
    tokensForSale: 69_230_769,
    targetRaiseCents: 500_000_000, // $5M
    hardCapCents: 500_000_000,
    deadline: "2027-12-31T23:59:59Z",
    open: false,
    vesting: { tgePercent: 0.3, cliffMonths: 0, vestingMonths: 3 },
  },
] as const;

export const ROUND_BY_SLUG: Map<string, RoundDef> = new Map(
  ROUNDS.map((r) => [r.slug, r]),
);

export function getActiveRound(): RoundDef {
  return ROUNDS.find((r) => r.open) ?? ROUNDS[0]!;
}

/** Resolve a round slug to its display label, with a sensible fallback. */
export function getRoundLabel(slug: string | null | undefined): string {
  if (!slug) return getActiveRound().label;
  return ROUND_BY_SLUG.get(slug)?.label ?? slug;
}

/**
 * Compute token allocation for a USD amount (in cents) at the active or
 * specified round price, applying tier bonuses (+10% at $5k, +20% at $25k).
 */
export function tokensForAmountCents(
  amountCents: number,
  pricePerTokenMillicents?: number,
): number {
  const price =
    pricePerTokenMillicents ?? getActiveRound().pricePerTokenMillicents;
  if (price <= 0) return 0;
  const usd = amountCents / 100;
  let bonus = 0;
  if (usd >= 25_000) bonus = 0.2;
  else if (usd >= 5_000) bonus = 0.1;
  // tokens = amountCents * 10 / millicents (since 1 millicent = 0.1 cents)
  return Math.floor(((amountCents * 10) / price) * (1 + bonus));
}
