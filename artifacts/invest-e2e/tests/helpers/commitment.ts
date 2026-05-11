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
 * same `POST /api/commitments` endpoint the UI uses.
 */
export async function createCommitment(
  page: Page,
  amountUsd = 5_000,
): Promise<Commitment> {
  const res = await postJson<{ commitment: Commitment }>(
    page,
    "/commitments",
    { customAmountCents: amountUsd * 100 },
  );
  return res.commitment;
}
