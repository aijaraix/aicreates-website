# @workspace/invest-e2e

Playwright end-to-end suite for the investor portal (`artifacts/invest` +
`artifacts/api-server`). Drives real browsers against the dev workflows on
`http://localhost:80`.

## Prerequisites

1. The following workflows must be running:
   - `api-server`
   - `artifacts/invest: web`
2. Required env vars (already populated by the Replit Clerk integration in
   the workspace; the suite reads them via `dotenv`):
   - `CLERK_SECRET_KEY`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `ADMIN_EMAILS` — admin/dashboard tests are auto-skipped if empty.
3. Install deps and the Playwright browser binary:

   ```bash
   pnpm install
   pnpm --filter @workspace/invest-e2e exec playwright install chromium
   ```

## Run

```bash
# Headless run, full suite
pnpm --filter @workspace/invest-e2e run test

# Watch a single spec
pnpm --filter @workspace/invest-e2e run test -- tests/03-saft-flow.spec.ts

# Headed, interactive UI mode
pnpm --filter @workspace/invest-e2e run test:ui

# Open the last HTML report
pnpm --filter @workspace/invest-e2e run report
```

Override the base URL with `INVEST_E2E_BASE_URL` (defaults to
`http://localhost:80`).

## What is covered

| Spec | Scenario |
| ---- | -------- |
| `01-sign-in` | Clerk programmatic sign-in lands on the dashboard. |
| `02-create-commitment` | Custom $5k commit routes to the SAFT wizard. |
| `03-saft-flow` | All 6 SAFT wizard steps complete. |
| `04-saft-pdf-preview` | Signature step renders the live PDF iframe. |
| `05-wire-checkout` | Wire flow → `awaiting_wire` → admin confirm → `funded`. |
| `06-crypto-checkout` | Crypto flow → `awaiting_crypto` → admin confirm → `funded`. |
| `07-dashboard-funded` | Funded commitment + vesting schedule on the dashboard. |
| `08-card-checkout` | Drives Stripe-hosted Checkout with test card 4242 and asserts the webhook flips the commitment to `funded`. Auto-skipped when Stripe is not configured. |
| `09-ach-checkout` | Drives Stripe Financial Connections "Test Institution" sandbox and asserts the webhook flips the commitment to `funded`. Auto-skipped when Stripe is not configured. |

## Stripe-hosted Checkout specs (auto-detected)

The card and ACH specs (`08-*`, `09-*`) drive the Stripe-hosted
Checkout page. They run automatically when Stripe is configured
(`STRIPE_SECRET_KEY` is set OR `REPLIT_CONNECTORS_HOSTNAME` is set so
the api-server can fetch sandbox credentials from the Replit Stripe
integration). They auto-skip otherwise, the same way admin specs
skip when `ADMIN_EMAILS` is empty.

Notes:

- The card spec uses test card `4242 4242 4242 4242`, exp `12/34`,
  CVC `123`, then polls `/api/me/allocations` for up to 2 min for the
  Stripe webhook to flip the commitment to `funded`.
- The ACH spec drives Stripe's Financial Connections sandbox by
  picking the "Test Institution", agreeing to terms, and completing
  the connection. Selectors are intentionally tolerant of small UI
  revisions (we try several role/text matchers).
- These specs DO drive Stripe's hosted UI, so they can break when
  Stripe ships UI changes. If a spec breaks, update the matchers in
  `tests/08-card-checkout.spec.ts` / `tests/09-ach-checkout.spec.ts`.

## Test users

`tests/helpers/users.ts` provisions two users idempotently in the Clerk
dev tenant on every run, both with the password `PortalE2E!Pass1234`:

- `invest-e2e-investor@example.com` — regular investor
- The first email in `ADMIN_EMAILS` — admin

Sign-in is fully programmatic via `@clerk/testing/playwright` — the suite
never interacts with Clerk's sign-in UI.

## Notes

- Tests share the dev database. Each run creates new commitment rows; old
  rows are not cleaned up, mirroring the rest of the workspace's testing
  posture.
- The wire and crypto paths cover the full state machine without
  leaving our own surface. The card/ACH specs (above) auto-run when
  Stripe is configured and drive the Stripe-hosted page end-to-end.
