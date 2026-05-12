/**
 * Authoritative server-side round catalog. Mirrors the SAFT round table
 * in the AIcreatesAI whitepaper. Mirrored client-side in
 * artifacts/invest/src/data/rounds.ts but the server is the source of
 * truth for token math, raise totals, and capacity gating.
 *
 * Aggregate: 1,250,000,000 AICA across 5 rounds = 12.5% of the
 * 10,000,000,000 fixed supply, raising approximately $50,250,000
 * (headline rounded to "$50M" in marketing copy).
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
}

export const ROUNDS: readonly RoundDef[] = [
  {
    slug: "strategic-seed",
    label: "Strategic Seed Round",
    pricePerTokenMillicents: 15, // $0.015 per AICA
    tokensForSale: 200_000_000,
    targetRaiseCents: 300_000_000, // $3M
    hardCapCents: 300_000_000, // $3M
    deadline: "2026-12-31T23:59:59Z",
    open: true,
  },
  {
    slug: "private-1",
    label: "Private Sale 1",
    pricePerTokenMillicents: 25, // $0.025 per AICA
    tokensForSale: 200_000_000,
    targetRaiseCents: 500_000_000, // $5M
    hardCapCents: 500_000_000,
    deadline: "2027-03-31T23:59:59Z",
    open: false,
  },
  {
    slug: "private-2",
    label: "Private Sale 2",
    pricePerTokenMillicents: 40, // $0.040 per AICA
    tokensForSale: 400_000_000,
    targetRaiseCents: 1_600_000_000, // $16M
    hardCapCents: 1_600_000_000,
    deadline: "2027-06-30T23:59:59Z",
    open: false,
  },
  {
    slug: "infrastructure",
    label: "Infrastructure Round",
    pricePerTokenMillicents: 55, // $0.055 per AICA
    tokensForSale: 350_000_000,
    targetRaiseCents: 1_925_000_000, // $19.25M
    hardCapCents: 1_925_000_000,
    deadline: "2027-09-30T23:59:59Z",
    open: false,
  },
  {
    slug: "community-launchpad",
    label: "Community + Launchpad",
    pricePerTokenMillicents: 70, // $0.070 per AICA
    tokensForSale: 100_000_000,
    targetRaiseCents: 700_000_000, // $7M
    hardCapCents: 700_000_000,
    deadline: "2027-12-31T23:59:59Z",
    open: false,
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
