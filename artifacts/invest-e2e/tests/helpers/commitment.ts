import type { Page } from "@playwright/test";
import { postJson } from "./api";

interface Commitment {
  id: string;
  amountCents: number;
  state: string;
  status: string;
}

/**
 * Create a fresh `pending_saft` commitment for the signed-in user via the
 * same `POST /api/commitments` endpoint the UI uses. Drives the new
 * multi-round `allocations: [...]` payload so we exercise the same code
 * path as the AllocationCart UI.
 *
 * Defaults to a single allocation against `strategic-seed` (the only
 * currently open round) at $0.015/AICA.
 */
export async function createCommitment(
  page: Page,
  amountUsd = 5_000,
  roundSlug = "strategic-seed",
): Promise<Commitment> {
  const usdCents = amountUsd * 100;
  // Server: amountCents = tokens * pricePerTokenMillicents / 10
  // (strategic-seed is 15 = $0.015/token = 1.5c/token).
  // Therefore tokens = amountCents * 10 / pricePerTokenMillicents.
  // Ceil to mirror the InvestPicker UI math: a user entering exactly
  // MIN_USD must land at >= MIN_USD after token quantization, otherwise
  // the server rejects with min_usd. Server tolerates ±1c on the back-
  // computed amount.
  const pricePerTokenMillicents = 15;
  const tokens = Math.ceil((usdCents * 10) / pricePerTokenMillicents);
  const expectedCents = Math.round(
    (tokens * pricePerTokenMillicents) / 10,
  );
  const res = await postJson<{ commitment: Commitment }>(
    page,
    "/commitments",
    {
      allocations: [
        {
          roundSlug,
          tokens,
          usdCents: expectedCents,
        },
      ],
    },
  );
  return res.commitment;
}
