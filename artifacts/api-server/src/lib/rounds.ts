/**
 * Authoritative server-side round catalog. Mirrored client-side in
 * artifacts/invest/src/data/rounds.ts but the server is the source of
 * truth for token math, raise totals, and capacity gating.
 */
export interface RoundDef {
  slug: string;
  label: string;
  /** Per-token price in USD cents. */
  pricePerTokenCents: number;
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
    slug: "founders-2026",
    label: "AICA Founders Round 2026",
    pricePerTokenCents: 100, // $1.00 per AICA
    tokensForSale: 50_000_000,
    targetRaiseCents: 1_000_000_000, // $10M
    hardCapCents: 1_500_000_000, // $15M
    deadline: "2026-12-31T23:59:59Z",
    open: true,
  },
] as const;

export const ROUND_BY_SLUG: Map<string, RoundDef> = new Map(
  ROUNDS.map((r) => [r.slug, r]),
);

export function getActiveRound(): RoundDef {
  return ROUNDS.find((r) => r.open) ?? ROUNDS[0]!;
}
