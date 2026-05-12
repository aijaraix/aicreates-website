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
  // Server is the source of truth for price; strategic-seed is 15 millicents
  // per token (= $0.015). Tokens = usdCents * 1000 / pricePerTokenMillicents.
  // Floor to avoid math-mismatch rounding rejections (server tolerates ±1c).
  const pricePerTokenMillicents = 15;
  const tokens = Math.floor((usdCents * 1000) / pricePerTokenMillicents);
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
