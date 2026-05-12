/**
 * Field map extracted from the source SAFT PDF
 * (`AIcreatesAI_-_SAFT_Agreement.pdf`). Drives the multi-step e-sign
 * form. All copy here is presented to the investor and matches the
 * acknowledgments overlaid into the rendered SAFT PDF.
 */

export const ACCREDITATION_OPTIONS = [
  {
    value: "income",
    label:
      "Individual income > $200k (or $300k joint) for the last two years with reasonable expectation of the same.",
  },
  {
    value: "net_worth",
    label:
      "Individual net worth (or joint with spouse) > $1,000,000, excluding primary residence.",
  },
  {
    value: "professional",
    label:
      "Hold an active Series 7, 65, or 82 (or equivalent) financial certification.",
  },
  {
    value: "entity",
    label:
      "Entity with > $5M in assets, or in which all equity owners are accredited.",
  },
  {
    value: "knowledgeable",
    label:
      "Knowledgeable employee of the issuer or a related private investment fund.",
  },
] as const;

export const ACK_LIST = [
  {
    key: "highRisk",
    text: "I understand this is a high-risk early-stage investment and I may lose all funds.",
  },
  {
    key: "noOwnership",
    text: "I understand SAFT tokens do not represent equity or ownership in AICreatesAI.",
  },
  {
    key: "consumptiveUse",
    text: "I am acquiring AICA for consumptive use within the AICreatesAI ecosystem.",
  },
  {
    key: "illiquidity",
    text: "I understand AICA tokens may be illiquid and have no established secondary market.",
  },
  {
    key: "vestingLockup",
    text: "I understand and accept the vesting schedule and lockup terms.",
  },
  {
    key: "noGeneralSolicitation",
    text: "I was not solicited through general advertising or public communication.",
  },
  {
    key: "confidentiality",
    text: "I will keep all materials, terms, and code names confidential.",
  },
  {
    key: "taxResponsibility",
    text: "I am solely responsible for the tax treatment of any tokens received.",
  },
] as const;

export type AckKey = (typeof ACK_LIST)[number]["key"];

export const RISK_DISCLOSURES = [
  {
    key: "regulatoryRisk",
    title: "Regulatory risk",
    body: "AICA's classification under U.S. and foreign securities, commodity, and tax laws may change. Adverse rulings may impair, restrict, or terminate distribution.",
  },
  {
    key: "marketRisk",
    title: "Market and liquidity risk",
    body: "There is no established secondary market for AICA. Even after TGE, the token may be illiquid, volatile, or untradable in your jurisdiction.",
  },
  {
    key: "technologyRisk",
    title: "Technology risk",
    body: "Smart contracts, custody systems, and the underlying chain may suffer bugs, exploits, or outages that result in partial or total loss of tokens.",
  },
  {
    key: "executionRisk",
    title: "Execution risk",
    body: "AICreatesAI may fail to deliver Eve OS, the hybrid compute fabric, or any other planned product. The roadmap may slip materially or be abandoned.",
  },
  {
    key: "concentrationRisk",
    title: "Concentration and conflicts",
    body: "Founders, team, and early backers hold a disproportionate token allocation and may have interests that diverge from later holders.",
  },
  {
    key: "noRecoveryRisk",
    title: "No recovery",
    body: "AICreatesAI cannot recover tokens sent to incorrect addresses, lost keys, or compromised wallets. You are solely responsible for custody.",
  },
  {
    key: "noGuaranteedReturns",
    title: "No guaranteed returns",
    body: "There is no guarantee of profit, yield, or any positive return on this commitment. You may lose the entire amount committed. No projection, model, or forward-looking statement is a promise of performance.",
  },
  {
    key: "noListingPromise",
    title: "No listing promise",
    body: "AICreatesAI makes no representation that AICA will be listed on any centralized or decentralized exchange, market maker, or liquidity venue. Listing decisions are at the sole discretion of third parties and are not committed by the company.",
  },
  {
    key: "jurisdictionRestrictions",
    title: "Jurisdiction restrictions",
    body: "I confirm I am not a resident of, or located in, a U.S. OFAC-sanctioned jurisdiction or other restricted territory, and that participation does not violate the laws of my home jurisdiction. Eligibility may further be limited to accredited investors under Reg D / Reg S exemptions.",
  },
] as const;

export type RiskKey = (typeof RISK_DISCLOSURES)[number]["key"];

export const WALLET_CHAINS = [
  { value: "ethereum", label: "Ethereum", hint: "0x..." },
  { value: "base", label: "Base", hint: "0x..." },
  { value: "solana", label: "Solana", hint: "Base58" },
  { value: "other", label: "Other", hint: "Specify in note" },
] as const;

export const PAYMENT_METHODS = [
  {
    value: "card",
    label: "Card",
    blurb: "Fastest. Recommended under $5,000.",
  },
  {
    value: "ach",
    label: "ACH bank transfer",
    blurb: "Recommended for $5,000+. Settles in 3-5 business days.",
  },
  {
    value: "wire",
    label: "Wire transfer",
    blurb: "Recommended for $25,000+. Bank instructions on confirmation.",
  },
  {
    value: "crypto",
    label: "Crypto (USDC)",
    blurb: "Manually escrowed. Address provided by email after signing.",
  },
] as const;
