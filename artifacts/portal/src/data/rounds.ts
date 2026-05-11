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
  beneficiary: "AICreatesAI Inc.",
  bankName: "(Provided after SAFT signing)",
  accountNumber: "(Provided after SAFT signing)",
  routingNumber: "(Provided after SAFT signing)",
  swift: "(Provided after SAFT signing)",
  reference: "Use your Commitment ID as the wire reference",
};

export const CRYPTO_INSTRUCTIONS = {
  asset: "USDC (ERC-20 / Polygon / Base)",
  network: "We will confirm the preferred network in our reply.",
  escrowAddress:
    "(Provided by the team after SAFT signing - reply to your confirmation email)",
  contact: "sholom@aicreates.ai",
  reference: "Use your Commitment ID in the memo / transaction note.",
};
