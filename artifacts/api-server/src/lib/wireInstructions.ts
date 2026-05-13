/**
 * Server-side mirror of `artifacts/invest/src/data/rounds.ts → WIRE_INSTRUCTIONS`.
 * Hardcoded Bank of America values - no env vars, no placeholders. Kept in
 * sync with the client copy by hand (single source of truth lives in the
 * portal, this is the small server projection of the same fields used by the
 * wire-instructions email template).
 */
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
  intermediaryForeign:
    "Bank of America, N.A. - 555 California St, San Francisco, CA 94104",
  memo: "Commitment ID + investor name",
} as const;
