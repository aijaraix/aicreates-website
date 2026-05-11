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
