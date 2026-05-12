export interface RoundDef {
  slug: string;
  name: string;
  pricePerToken: string;
  totalRaise: string;
  cap: string;
  open: boolean;
}

export const ROUNDS: RoundDef[] = [
  {
    slug: "founders-2026",
    name: "Founders Round 2026",
    pricePerToken: "$1.00 per AICA",
    totalRaise: "$10M target",
    cap: "$15M hard cap",
    open: true,
  },
];

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
