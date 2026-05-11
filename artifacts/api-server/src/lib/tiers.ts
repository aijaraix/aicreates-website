/**
 * Authoritative server-side definition of the Founders Commitment tiers.
 * Mirrored to Stripe by `pnpm --filter @workspace/scripts run seed-tiers`.
 *
 * Token allocation values are deliberately encoded server-side so they
 * cannot be tampered with by Stripe metadata changes.
 */
export interface TierDefinition {
  slug: "founders" | "architect" | "catalyst";
  displayName: string;
  amountCents: number;
  tokenAllocation: number;
  description: string;
}

export const TIERS: readonly TierDefinition[] = [
  {
    slug: "founders",
    displayName: "Founders Circle",
    amountCents: 100_000,
    tokenAllocation: 1_000,
    description:
      "Earliest backers of the Agentic Intelligence Layer. Founders Commitment - not a security; refundable until terms are finalized.",
  },
  {
    slug: "architect",
    displayName: "Architect Circle",
    amountCents: 500_000,
    tokenAllocation: 5_500,
    description:
      "Backers shaping Eve OS and the Hybrid Compute Fabric. 10% allocation bonus. Founders Commitment - not a security; refundable until terms are finalized.",
  },
  {
    slug: "catalyst",
    displayName: "Catalyst Circle",
    amountCents: 2_500_000,
    tokenAllocation: 30_000,
    description:
      "Strategic backers of the GPU cluster + flagship rollout. 20% allocation bonus. Founders Commitment - not a security; refundable until terms are finalized.",
  },
] as const;

export const TIER_BY_SLUG: Map<string, TierDefinition> = new Map(
  TIERS.map((t) => [t.slug, t]),
);

/**
 * Countries the Founders Commitment is open to. Comma-separated env var
 * `ALLOWED_BILLING_COUNTRIES` overrides this default. Set to "*" to disable.
 * Stripe Checkout enforces this at the address-collection step.
 */
const DEFAULT_ALLOWED_COUNTRIES = [
  "US",
  "CA",
  "GB",
  "AU",
  "NZ",
  "IE",
  "SG",
  "AE",
  "CH",
  "DE",
  "FR",
  "NL",
  "SE",
  "NO",
  "DK",
  "FI",
  "IL",
  "JP",
  "HK",
];

export function getAllowedBillingCountries(): readonly string[] | null {
  const raw = process.env.ALLOWED_BILLING_COUNTRIES;
  if (!raw) return DEFAULT_ALLOWED_COUNTRIES;
  if (raw.trim() === "*") return null;
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}
