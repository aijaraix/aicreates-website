import type { Page } from "@playwright/test";
import { getJson } from "./api";

/**
 * True when the workspace has Stripe wired up in some form: either a
 * direct STRIPE_SECRET_KEY (production / live deploys) or a Replit
 * Connector hostname that the api-server can fetch sandbox creds from
 * (default in dev). Mirrors the api-server's `isStripeConfigured()`.
 *
 * Specs that drive the Stripe-hosted Checkout page should auto-skip
 * when this is false, the same way admin specs auto-skip when
 * ADMIN_EMAILS is empty.
 */
export const STRIPE_CONFIGURED = Boolean(
  process.env["STRIPE_SECRET_KEY"] || process.env["REPLIT_CONNECTORS_HOSTNAME"],
);

interface Allocation {
  commitmentId: string;
  state: string;
  status: string;
}
interface AllocationsResp {
  allocations: Allocation[];
}

/**
 * Poll `/api/me/allocations` until the given commitment reaches
 * state="funded", or until `timeoutMs` elapses. Returns the last
 * allocation snapshot we saw (so the caller can surface it on
 * failure).
 *
 * Stripe webhooks are asynchronous, so checkout success in the
 * browser does not immediately flip our local commitment row; we
 * have to wait for the webhook round-trip.
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
    last = a.allocations.find((x) => x.commitmentId === commitmentId) ?? null;
    if (last && last.state === "funded") return last;
    await page.waitForTimeout(2_000);
  }
  return last;
}
