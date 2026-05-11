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
- Stripe is not exercised. Card/ACH paths are not covered here because
  they redirect to Stripe Checkout, which we do not want to drive
  programmatically. The wire and crypto paths cover the full state
  machine without leaving our own surface.
