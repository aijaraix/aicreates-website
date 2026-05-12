# AIcreatesAI Website

## Overview

Premium static React website for **AIcreatesAI** — a technology company building the agentic intelligence layer that companies, capital, and consumers will run on.

The site is developed in Replit and deployed to **GitHub Pages** at the custom domain **https://www.aicreates.ai**. Replit is the dev environment; GitHub is the permanent code repository; GitHub Pages is the production host.

## Brand & Visual Identity

Dark futuristic, NVIDIA / AMD-inspired aesthetic.

- Background: `#0A0A0A` / `#121212`
- Text: `#F5F5F5` (primary) / `#A1A1AA` (muted)
- Accent: `#00F5D4` electric teal (single accent across the entire site)
- Display type: Space Grotesk
- Body: Inter
- Mono: JetBrains Mono

Copy convention: hyphens only. No em dashes, no en dashes.

Premium agentic-AI vocabulary: Agentic Intelligence Layer, Hybrid Compute Fabric, Closed-Loop Quality Engine, Self-Healing Workflows. No technical reveal of the underlying stack.

## Stack

- React 18 + Vite + TypeScript
- TailwindCSS v4, shadcn/ui (new-york), framer-motion
- Routing: wouter (client-side)
- Hosting: GitHub Pages with custom domain (CNAME) and HTTPS
- CI: GitHub Actions workflow at `.github/workflows/deploy.yml`

## Pages

Page structure:

- `/` — Home (positions the agentic intelligence layer; flagship + secondary spotlights; three-audience entry: consumer / business / investor)
- `/eve-os` — Flagship product: Eve OS, the Agentic Business Operating System
- `/neobank` — Secondary product line: consumer + business neobank built on the layer
- `/litepaper` — Long-form positioning + architecture
- `/invest` — Investor page (opportunity, $50M raise + $3.5M GPU cluster, deck/litepaper materials, why-invest pillars). Pitch deck buttons are visibly disabled "Coming soon" until the PDF lands. CTAs link to `/contact?interest=Investor`.
- `/contact` — Inquiry form with interest selector (Eve OS, NeoBank, Investor, Press, Other). Reads `?interest=` (or `#`) on mount and preselects the matching pill.
- `/privacy` and `/terms` — Legal pages (linked from footer)

Sticky glass navigation: Home, Products (dropdown: Eve OS, NeoBank), Litepaper, Invest, Contact, plus Engage CTA. Mobile drawer mirrors the desktop nav with a "Products" section header. X-only social (`@theaicreatesai`).

## Key Files

- `artifacts/web/index.html` — SEO meta, Open Graph, Twitter cards, theme color `#0A0A0A`
- `artifacts/web/src/index.css` — design tokens, grid + glass + accent utilities
- `artifacts/web/public/CNAME` — `www.aicreates.ai`
- `artifacts/web/public/sitemap.xml` — 5-route sitemap
- `artifacts/web/src/components/Navigation.tsx`, `Footer.tsx`, `Brand.tsx`
- `artifacts/web/src/pages/{Home,EveOS,NeoBank,Litepaper,Contact,Privacy,Terms,not-found}.tsx`
- `artifacts/web/src/App.tsx` — wouter route table
- `artifacts/web/src/components/EveWidget.tsx` — kept in the codebase but **not mounted**
- `.github/workflows/deploy.yml` — GitHub Pages deploy workflow
- `README.md` — Replit → GitHub → GitHub Pages → custom domain (GoDaddy DNS) instructions

## Development

```bash
pnpm install
pnpm --filter @workspace/web run dev          # local dev (BASE_PATH "/" by default)
pnpm --filter @workspace/web run build         # production build → artifacts/web/dist/public
pnpm --filter @workspace/web run typecheck     # TypeScript check
```

In Replit, the `artifacts/web: web` workflow runs the dev server automatically.

## Deployment

Two production surfaces, two deploy paths:

| Surface | URL | Host | Trigger |
| --- | --- | --- | --- |
| Marketing site | https://www.aicreates.ai | GitHub Pages | `git push github main` (Actions workflow runs `.github/workflows/deploy.yml`) |
| Investor portal | https://invest.aicreates.ai | Replit Deployments (autoscale) | Click **Publish** in the Replit Publishing tab |

The GitHub Actions workflow installs pnpm, builds the marketing site with `BASE_PATH=/`, and deploys `artifacts/web/dist/public` to Pages. `public/CNAME` provides the custom domain.

The Replit deployment publishes the api-server (process) and the invest static SPA from the same autoscale instance. The `web` artifact is intentionally excluded from Replit publishing — see "Investor portal → Production deploy" below for why.

See `README.md` for the full step-by-step setup.

## Contact form

`/contact` posts via AJAX to `https://formsubmit.co/ajax/sholom@aicreates.ai` with fields: name, email, company, role, message, plus an interest selector (`Eve OS`, `NeoBank`, `Investor`, `Press`, `Other`).

`formsubmit.co` requires a one-time activation by clicking the verification email it sends to `sholom@aicreates.ai` on the very first submission.

## Investor portal (`artifacts/invest`)

A full investor experience at `artifacts/invest`, intended to deploy to **https://invest.aicreates.ai** (Replit Deployments, autoscale). It is not part of the GitHub Pages marketing build.

- Auth: Clerk (white-labeled via the api-server's Clerk proxy at `/api/__clerk`). Set `VITE_CLERK_PROXY_URL=/api/__clerk` in the **production** environment only — the api-server's `clerkProxyMiddleware` is a no-op in dev, so passing `proxyUrl` to `ClerkProvider` in dev will blank the portal. The portal client also gates this with `import.meta.env.PROD`.
- Payments: Stripe Checkout (card / ACH / crypto) plus a wire-transfer flow that skips Stripe and is manually confirmed by an admin.
- Stripe data is mirrored locally via `stripe-replit-sync` (schema `stripe.*` in Postgres).
- App-side users are stored in `app_users` (`lib/db/src/schema/app_users.ts`).
- Portal pages: `/` (long-scroll deck + thesis), `/sign-in`, `/sign-up`, `/invest` (tier picker + custom amount $1k–$10M with bonus token tiers at $5k/$25k), `/saft/:commitId` (6-step SAFT e-sign flow that renders + persists a PDF), `/checkout/:commitId` (4 payment methods including wire instructions), `/dashboard` (vesting calendar with .ics export), `/admin` (commitments table with state filter, mark-wire-received, refund, CSV export).

### Investor flow

1. `/invest` → POST `/api/commitments` creates a commitment in `pending_saft`.
2. `/saft/:commitId` → 6 steps (identity, address, KYC/wallet, payment method, accreditation, sign). On submit, server renders a PDF via `pdf-lib` (cover sheet + acknowledgments overlaid on `assets/saft-template.pdf`), persists it to `saft_submissions.pdfBytes` (bytea), and advances state to `pending_payment`.
3. `/checkout/:commitId` → POST `/api/checkout` with chosen method. Card/ACH/crypto return a Stripe Checkout URL; wire returns a state transition to `awaiting_wire` plus on-screen bank instructions (placeholders in `data/rounds.ts WIRE_INSTRUCTIONS`).
4. Stripe webhook → state `funded`, sets `fundedAt`. Admin manually confirms wire via `/admin` → `POST /api/admin/commitments/:id/confirm-wire`.
5. `/dashboard` → reads `/api/me/allocations` which joins commitments + saft_submissions and computes a 24-month linear vesting schedule (6-month cliff) via `lib/vesting.ts`.

### Schema additions

- `commitments` extended: `state`, `roundSlug`, `customAmountCents`, `paymentMethod`, `saftSignedAt`, `saftPdfKey`, `fundedAt`. `stripeCheckoutSessionId` is now nullable (wire flow has no session).
- `saft_submissions` (new): captured payload, signature metadata, IP/UA, and the rendered PDF bytes. PDF is intentionally stored in the DB as `bytea` (single source of truth, simple backups). Migrate to object storage if SAFTs grow large.
- `data_center_requests` (new): captures inquiries from the data-center request form on the long-scroll home page.

### One-time setup

1. **Connect Stripe** via the Replit Integrations tab (no API keys to copy by hand).
2. **Connect Resend** via the Replit Integrations tab for transactional emails (SAFT signed, payment received, wire instructions, refund, dispute alert). The portal gracefully no-ops on every send when Resend is not connected, so this is non-blocking but emails won't actually deliver until it is.
3. **Set admin emails:** add `ADMIN_EMAILS=you@example.com,other@example.com` (comma-separated) to the api-server env. Matching users are auto-promoted to `admin` on next request. Dispute alert emails are sent to every admin in this list.
4. **Seed tiers:** `pnpm --filter @workspace/scripts run seed-tiers` — idempotent; creates Founders ($1k), Architect ($5k), Catalyst ($25k) products + USD one-time prices in Stripe.
5. **Push DB schema:** `pnpm --filter @workspace/db run push` (already includes `app_users`).

The api-server gracefully skips Stripe init if the integration is not connected, so the rest of the app keeps working.

### Transactional email (Resend)

`artifacts/api-server/src/lib/email.ts` is the single integration point. It resolves a Resend API key from two sources, in order:

1. `RESEND_API_KEY` env secret — operator-supplied, used for production deploys where the connector isn't bound.
2. The Replit **Resend connector** — read live from `connectors.replit.com` using the same `X-Replit-Token` pattern as the Stripe connector.

If neither resolves, every send is logged and skipped — no errors propagate to API responses.

Templates and where they fire:
- `emailSaftSigned` → `POST /api/saft/:commitId` after the SAFT row is committed.
- `emailWireInstructions` → `POST /api/checkout` wire branch. Bank fields default to placeholders; supply the live values via env: `WIRE_BANK_NAME`, `WIRE_ACCOUNT_NAME`, `WIRE_ACCOUNT_NUMBER`, `WIRE_ROUTING_NUMBER`, `WIRE_SWIFT` (optional).
- `emailPaymentReceived` → `payment_intent.succeeded` webhook handler.
- `emailRefundIssued` → `charge.refunded` webhook handler.
- `emailDisputeAdmin` → `charge.dispute.created` webhook handler. Sent to every address in `ADMIN_EMAILS`.

Set `PUBLIC_PORTAL_ORIGIN` (e.g. `https://invest.aicreates.ai`) so dashboard links in webhook-fired emails point at the live host instead of the dev preview origin.

### Going live with Stripe

`artifacts/api-server/src/lib/stripeClient.ts` already supports two key sources: it prefers operator-supplied `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` env secrets when running in a Replit deployment, and otherwise falls back to the dev Stripe connector. To switch to live mode in production:

1. In Stripe Dashboard, generate a live secret key. Add it as `STRIPE_SECRET_KEY` in Replit Deployments → Secrets.
2. Register the production webhook endpoint at `https://invest.aicreates.ai/api/stripe/webhook` for events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`. Add the webhook signing secret as `STRIPE_WEBHOOK_SECRET`.
3. In Stripe Dashboard → Settings → Payment methods, enable ACH Direct Debit, Apple Pay, and Google Pay. Apple Pay / Google Pay require no extra integration work because the portal uses Stripe Checkout (hosted page), not Stripe Elements — wallet buttons appear automatically when "card" is enabled and the customer's device supports them. ACH is selected explicitly via `paymentMethod: "ach"` in `POST /api/checkout`.

### Production deploy

Use Replit Deployments (autoscale) for `invest.aicreates.ai`. A single autoscale deployment publishes:

- `api-server` (Node/Express process) — serves `/api/*`, Clerk proxy at `/api/__clerk`, Stripe webhook, legacy `portal.aicreates.ai` 301 redirect.
- `invest` (static SPA) — served at `/invest/*` with SPA rewrites to `index.html`.

The `web` artifact is **deliberately excluded** from Replit Deployments (no `[services.production]` block in `artifacts/web/.replit-artifact/artifact.toml`) because the marketing site lives on GitHub Pages. If publish ever fails with *"Could not find run command"*, the most common cause is that someone re-added a production block to the `web` artifact toml — remove it. See the inline comment in that file.

DNS at GoDaddy:
- `invest.aicreates.ai` `CNAME` → the deployment's `*.replit.app` hostname (visible in the Publishing dialog).
- `portal.aicreates.ai` `CNAME` → same `*.replit.app` so the host-based 301 redirect runs before Clerk and CORS.
- Add both custom domains in Clerk's allowed origins.

Production env vars (set in Replit Deployments → Secrets):
- `ADMIN_EMAILS` — comma-separated; every listed email is granted the `admin` role per-request (already in `[userenv.shared]`)
- `VITE_CLERK_PROXY_URL=/api/__clerk` — production only (already in `[userenv.production]`)
- `DATABASE_URL` — auto-provisioned when "Create production database" is checked at publish time
- Stripe — managed by the Replit Stripe integration, don't set by hand
- `SESSION_SECRET` is present as a Replit secret but not currently consumed by application code (Clerk owns auth state). Leave it unless you add session middleware later.

See `README.md` for the full setup walkthrough.

## Eve chat widget (hidden)

The Eve widget (`artifacts/web/src/components/EveWidget.tsx`) and its backend route (`artifacts/api-server/src/routes/eve.ts`) remain in the codebase but the widget is not mounted in `App.tsx`. To re-enable: uncomment the import and the `<EveWidget />` mount in `App.tsx`.

## Security

Static public website. The api-server has CORS allow-lists and never exposes any third-party API keys to the client.

## Investor portal e2e tests (`artifacts/invest-e2e`)

A Playwright suite that drives the portal through the dev workflows on `http://localhost:80`. Sign-in is fully programmatic via `@clerk/testing/playwright`; two test users are provisioned idempotently on every run (a regular investor and the first email in `ADMIN_EMAILS`).

Specs cover: sign-in, create commitment, complete the 6-step SAFT, SAFT PDF preview, wire checkout + admin confirm, crypto checkout + admin confirm, and the funded-state dashboard with vesting.

```bash
pnpm install
pnpm --filter @workspace/invest-e2e exec playwright install chromium
pnpm --filter @workspace/invest-e2e run test
```

See `artifacts/invest-e2e/README.md` for full details.
