# @workspace/portal-e2e

Playwright end-to-end suite for the investor portal (`artifacts/portal` +
`artifacts/api-server`). Drives real browsers against the dev workflows on
`http://localhost:80`.

## Prerequisites

1. The following workflows must be running:
   - `api-server`
   - `artifacts/portal: web`
2. Required env vars (already populated by the Replit Clerk integration in
   the workspace; the suite reads them via `dotenv`):
   - `CLERK_SECRET_KEY`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `ADMIN_EMAILS` — admin/dashboard tests are auto-skipped if empty.
3. Install deps and the Playwright browser binary:

   ```bash
   pnpm install
   pnpm --filter @workspace/portal-e2e exec playwright install chromium
   ```

## Run

```bash
# Headless run, full suite
pnpm --filter @workspace/portal-e2e run test

# Watch a single spec
pnpm --filter @workspace/portal-e2e run test -- tests/03-saft-flow.spec.ts

# Headed, interactive UI mode
pnpm --filter @workspace/portal-e2e run test:ui

# Open the last HTML report
pnpm --filter @workspace/portal-e2e run report
```

Override the base URL with `PORTAL_E2E_BASE_URL` (defaults to
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
| `08-card-checkout` | (opt-in) Drives Stripe-hosted Checkout with test card 4242, asserts webhook flips commitment to `funded`. |
| `09-ach-checkout` | (opt-in) ACH (us_bank_account) checkout returns a valid Stripe session URL and the page renders the bank-account UI. |

## Stripe-hosted Checkout specs (opt-in)

The card and ACH specs (`08-*`, `09-*`) drive the Stripe-hosted Checkout
page, which is Stripe's UI and can change without notice. They are
**skipped by default** to keep the suite stable. To run them:

```bash
STRIPE_E2E_DRIVE_CHECKOUT=1 pnpm --filter @workspace/portal-e2e run test
```

Prerequisites:

- The api-server's dev Stripe sandbox connector must be connected (the
  workspace already does this via the Replit Stripe integration).
- The card spec uses test card `4242 4242 4242 4242`, exp `12/34`, CVC
  `123`. It waits for the asynchronous Stripe webhook to flip the
  commitment to `funded` (poll up to 90s).
- The ACH spec only verifies the Checkout session is created with the
  correct shape and the hosted page renders the bank-account UI; it
  does not drive the Financial Connections modal end-to-end.

## Test users

`tests/helpers/users.ts` provisions two users idempotently in the Clerk
dev tenant on every run, both with the password `PortalE2E!Pass1234`:

- `portal-e2e-investor@example.com` — regular investor
- The first email in `ADMIN_EMAILS` — admin

Sign-in is fully programmatic via `@clerk/testing/playwright` — the suite
never interacts with Clerk's sign-in UI.

## Notes

- Tests share the dev database. Each run creates new commitment rows; old
  rows are not cleaned up, mirroring the rest of the workspace's testing
  posture.
- The default suite does not exercise Stripe. The wire and crypto
  paths cover the full state machine without leaving our own surface.
  The opt-in card/ACH specs (above) drive the Stripe-hosted page when
  `STRIPE_E2E_DRIVE_CHECKOUT=1` is set.
