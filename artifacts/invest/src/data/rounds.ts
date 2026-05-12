/**
 * Client-side mirror of the 5-round SAFT table from the whitepaper.
 * The server (artifacts/api-server/src/lib/rounds.ts) is authoritative
 * for price + capacity. This module is used for static rendering only.
 */
export interface RoundDef {
  slug: string;
  name: string;
  /** Per-token price in USD millicents (1 unit = $0.001). */
  pricePerTokenMillicents: number;
  /** Display string e.g. "$0.015 per AICA". */
  pricePerToken: string;
  /** Token allocation for the round. */
  tokens: string;
  /** Total raise. */
  totalRaise: string;
  open: boolean;
}

export const ROUNDS: RoundDef[] = [
  {
    slug: "strategic-seed",
    name: "Strategic Seed Round",
    pricePerTokenMillicents: 15,
    pricePerToken: "$0.015 per AICA",
    tokens: "200,000,000 AICA",
    totalRaise: "$3,000,000",
    open: true,
  },
  {
    slug: "private-1",
    name: "Private Sale 1",
    pricePerTokenMillicents: 25,
    pricePerToken: "$0.025 per AICA",
    tokens: "200,000,000 AICA",
    totalRaise: "$5,000,000",
    open: false,
  },
  {
    slug: "private-2",
    name: "Private Sale 2",
    pricePerTokenMillicents: 40,
    pricePerToken: "$0.040 per AICA",
    tokens: "400,000,000 AICA",
    totalRaise: "$16,000,000",
    open: false,
  },
  {
    slug: "infrastructure",
    name: "Infrastructure Round",
    pricePerTokenMillicents: 55,
    pricePerToken: "$0.055 per AICA",
    tokens: "350,000,000 AICA",
    totalRaise: "$19,250,000",
    open: false,
  },
  {
    slug: "community-launchpad",
    name: "Community + Launchpad",
    pricePerTokenMillicents: 70,
    pricePerToken: "$0.070 per AICA",
    tokens: "100,000,000 AICA",
    totalRaise: "$7,000,000",
    open: false,
  },
];

export const ROUND_BY_SLUG: Map<string, RoundDef> = new Map(
  ROUNDS.map((r) => [r.slug, r]),
);

export const ROUND_TOTALS = {
  tokens: "1,250,000,000 AICA",
  supplyPct: "12.5%",
  totalRaise: "~$50,250,000",
};

export const TIER_ROWS = [
  {
    name: "Founders",
    minimum: "$1,000",
    bonus: "Base allocation",
    tag: "Open",
  },
  {
    name: "Architect",
    minimum: "$5,000",
    bonus: "+10% allocation",
    tag: "Open",
  },
  {
    name: "Catalyst",
    minimum: "$25,000",
    bonus: "+20% allocation",
    tag: "Open",
  },
  {
    name: "Custom",
    minimum: "Above $25,000",
    bonus: "Negotiated terms",
    tag: "Contact",
  },
];

export const WIRE_INSTRUCTIONS = {
  beneficiary: "AIcreatesAI Inc.",
  beneficiaryAddress: "8310 Byron Ave, Miami Beach, Florida 33141",
  bankName: "Bank of America, N.A.",
  bankBranch: "7474 Collins Ave, Miami Beach, FL",
  accountNumber: "898167849109",
  routingNumber: "026009593",
  achRouting: "063100277",
  swift: "BOFAUS3N",
  swiftForeign: "BOFAUS6S",
  intermediaryUS: "Bank of America, N.A. - 222 Broadway, New York, NY 10038",
  intermediaryForeign: "Bank of America, N.A. - 555 California St, San Francisco, CA 94104",
  reference: "Use your Commitment ID as the wire reference",
};

/**
 * Authenticated download URLs for the wire-instructions PDF / image.
 * The api-server gates these by Clerk session + commitment ownership, so
 * the static files no longer need to live in `invest/public/`.
 */
export function wireInstructionsPdfUrl(commitId: string): string {
  return `/api/wire-instructions/${encodeURIComponent(commitId)}/pdf`;
}

export function wireInstructionsImageUrl(commitId: string): string {
  return `/api/wire-instructions/${encodeURIComponent(commitId)}/image`;
}

/** Base-path-safe URL for assets in the invest `public/` folder. */
export function publicAsset(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export const CRYPTO_INSTRUCTIONS = {
  asset: "USDC (ERC-20 / Polygon / Base)",
  network: "We will confirm the preferred network in our reply.",
  escrowAddress:
    "(Provided by the team after SAFT signing - reply to your confirmation email)",
  contact: "sholom@aicreates.ai",
  reference: "Use your Commitment ID in the memo / transaction note.",
};
