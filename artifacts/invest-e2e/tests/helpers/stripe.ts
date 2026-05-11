import type { Page } from "@playwright/test";
import { getJson } from "./api";

/**
 * Heuristic for whether the api-server is likely to have working
 * Stripe credentials. The server's own `isStripeConfigured()` does
 * an actual credential fetch (live env or Replit Connector lookup);
 * we cannot replicate that from the test process without doing the
 * same network round-trip, so we use the simpler env-presence check
 * that covers both supported paths:
 *
 *   - STRIPE_SECRET_KEY: live/operator-supplied key (production deploys)
 *   - REPLIT_CONNECTORS_HOSTNAME: dev sandbox via the Replit Stripe
 *     Connector (default in the workspace dev workflows)
 *
 * Specs that drive the Stripe-hosted Checkout page should auto-skip
 * when this is false, the same way admin specs auto-skip when
 * ADMIN_EMAILS is empty.
 */
export const STRIPE_CONFIGURED = Boolean(
  process.env["STRIPE_SECRET_KEY"] || process.env["REPLIT_CONNECTORS_HOSTNAME"],
);

/**
 * One row from `GET /api/me/allocations` (see
 * `artifacts/api-server/src/routes/me.ts`). The `id` field is the
 * commitment id; there is no separate `commitmentId`. There is also
 * no `status` field on this endpoint — funded-ness is exposed as
 * `state === "funded"` and the boolean `isFunded`.
 */
interface Allocation {
  id: string;
  state: string;
  isFunded: boolean;
  fundedAt: string | null;
}
interface AllocationsResp {
  allocations: Allocation[];
}

/**
 * Poll `/api/me/allocations` until the given commitment reaches
 * state="funded", or until `timeoutMs` elapses. Returns the last
 * allocation snapshot we saw (so the caller can surface it on
 * failure). Stripe webhooks are asynchronous, so checkout success in
 * the browser does not immediately flip our local commitment row;
 * we have to wait for the webhook round-trip.
 */
export async function pollFunded(
  page: Page,
  commitmentId: string,
  timeoutMs = 120_000,
): Promise<Allocation | null> {
  const deadline = Date.now() + timeoutMs;
  let last: Allocation | null = null;
  while (Date.now() < deadline) {
    const a = await getJson<AllocationsResp>(page, "/me/allocations");
    last = a.allocations.find((x) => x.id === commitmentId) ?? null;
    if (last && last.state === "funded") return last;
    await page.waitForTimeout(2_000);
  }
  return last;
}
