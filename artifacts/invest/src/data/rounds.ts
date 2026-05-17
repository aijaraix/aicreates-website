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
  /** Display string e.g. "$0.010 per AICA". */
  pricePerToken: string;
  /** Token allocation for the round. */
  tokens: string;
  /** Total raise. */
  totalRaise: string;
  /** Percent of total fixed supply. */
  supplyPct: string;
  /** Fully diluted valuation at this round's price. */
  fdv: string;
  open: boolean;
  /**
   * Per-round vesting parameters. Earlier rounds carry longer lockups;
   * later rounds vest faster. Final terms are subject to counsel review.
   */
  vesting: {
    tgePercent: number;
    cliffMonths: number;
    vestingMonths: number;
  };
}

export const ROUNDS: RoundDef[] = [
  {
    slug: "strategic-seed",
    name: "Strategic Seed",
    pricePerTokenMillicents: 10,
    pricePerToken: "$0.010 per AICA",
    tokens: "500,000,000 AICA",
    totalRaise: "$5,000,000",
    supplyPct: "5.00%",
    fdv: "$100M",
    open: true,
    vesting: { tgePercent: 0.1, cliffMonths: 3, vestingMonths: 12 },
  },
  {
    slug: "private-1",
    name: "Private Round 1",
    pricePerTokenMillicents: 15,
    pricePerToken: "$0.015 per AICA",
    tokens: "800,000,000 AICA",
    totalRaise: "$12,000,000",
    supplyPct: "8.00%",
    fdv: "$150M",
    open: false,
    vesting: { tgePercent: 0.15, cliffMonths: 2, vestingMonths: 10 },
  },
  {
    slug: "private-2",
    name: "Private Round 2",
    pricePerTokenMillicents: 20,
    pricePerToken: "$0.020 per AICA",
    tokens: "650,000,000 AICA",
    totalRaise: "$18,000,000",
    supplyPct: "6.50%",
    fdv: "$200M",
    open: false,
    vesting: { tgePercent: 0.2, cliffMonths: 2, vestingMonths: 7 },
  },
  {
    slug: "infrastructure",
    name: "Infrastructure / Strategic",
    pricePerTokenMillicents: 26,
    pricePerToken: "$0.026 per AICA",
    tokens: "230,769,231 AICA",
    totalRaise: "$10,000,000",
    supplyPct: "2.31%",
    fdv: "$260M",
    open: false,
    vesting: { tgePercent: 0.25, cliffMonths: 1, vestingMonths: 5 },
  },
  {
    slug: "community-launchpad",
    name: "Community / Launchpad",
    pricePerTokenMillicents: 34,
    pricePerToken: "$0.034 per AICA",
    tokens: "69,230,769 AICA",
    totalRaise: "$5,000,000",
    supplyPct: "0.69%",
    fdv: "$340M",
    open: false,
    vesting: { tgePercent: 0.3, cliffMonths: 0, vestingMonths: 3 },
  },
];

/** Display helper - "10% / 12mo / 24mo". */
export function formatVesting(v: RoundDef["vesting"]): {
  tge: string;
  cliff: string;
  linear: string;
  summary: string;
} {
  const tge = `${Math.round(v.tgePercent * 100)}% at TGE`;
  const cliff = `${v.cliffMonths}-month cliff`;
  const linear = `${v.vestingMonths}-month linear`;
  return { tge, cliff, linear, summary: `${tge} · ${cliff} · ${linear}` };
}

export const ROUND_BY_SLUG: Map<string, RoundDef> = new Map(
  ROUNDS.map((r) => [r.slug, r]),
);

export const ROUND_TOTALS = {
  tokens: "2,250,000,000 AICA",
  supplyPct: "22.50%",
  totalRaise: "$50,000,000",
  fdv: "~$230M",
};

export const TIER_ROWS = [
  {
    name: "Founders",
    minimum: "$250",
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
  memo: "Commitment ID + investor name",
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

/**
 * Real on-chain escrow addresses (Coinbase-hosted). Each entry is a
 * single-asset / single-network destination. Sending the wrong asset
 * or to the wrong network will result in lost funds, which is why
 * each address is paired with one and only one (asset, network) pair
 * in the UI.
 */
export interface CryptoEscrow {
  asset: "BTC" | "ETH" | "SOL" | "USDC" | "USDT";
  network: string;
  address: string;
  warning: string;
}

export const CRYPTO_ESCROWS: CryptoEscrow[] = [
  {
    asset: "USDC",
    network: "Base",
    address: "0x16c3C8457054C79b23894a6B0E6a42819b9dDeDC",
    warning:
      "Only send USDC on the Base network. Sending USDC on any other chain or sending non-USDC tokens will be lost.",
  },
  {
    asset: "USDC",
    network: "Ethereum",
    address: "0x16c3C8457054C79b23894a6B0E6a42819b9dDeDC",
    warning:
      "Only send USDC on the Ethereum network. Do not send USDC on any other network.",
  },
  {
    asset: "USDT",
    network: "Ethereum",
    address: "0x02650Ea5C2262b3bcFAA408De91705Dc0F448bc2",
    warning:
      "Only send USDT (Tether ERC-20) on the Ethereum network. Do not send USDT on Tron or any other chain.",
  },
  {
    asset: "ETH",
    network: "Ethereum",
    address: "0xE16838A8317576cf4596c2C8B58169685F7E4508",
    warning:
      "Only send native ETH on the Ethereum network. Do not send ERC-20s, NFTs, or WETH to this address.",
  },
  {
    asset: "BTC",
    network: "Bitcoin",
    address: "3PJPDBB5jUWGxeE6cDWWTzdEYv97ngEj97",
    warning:
      "Only send BTC on the Bitcoin network. Do not send Bitcoin Cash (BCH) or BTC on any other network. Allow ~30 min for processing.",
  },
  {
    asset: "SOL",
    network: "Solana",
    address: "HBLgyfbpVV5emfwBG9og2p2eL7VYruUzEYNbXBwQz3JR",
    warning:
      "Only send native SOL on the Solana network. Minimum 0.001 SOL. Do not send SPL tokens or NFTs to this address.",
  },
];

export const CRYPTO_INSTRUCTIONS = {
  contact: "sholom@aicreates.ai",
  reference: "Use your Commitment ID in the memo / transaction note.",
  escrows: CRYPTO_ESCROWS,
};
