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

See `README.md` for the full GitHub Pages + GoDaddy DNS setup. The GitHub Actions workflow installs pnpm, builds the site with `BASE_PATH=/`, and deploys `artifacts/web/dist/public` to Pages. The `public/CNAME` file provides the custom domain.

## Contact form

`/contact` posts via AJAX to `https://formsubmit.co/ajax/sholom@aicreates.ai` with fields: name, email, company, role, message, plus an interest selector (`Eve OS`, `NeoBank`, `Investor`, `Press`, `Other`).

`formsubmit.co` requires a one-time activation by clicking the verification email it sends to `sholom@aicreates.ai` on the very first submission.

## Investor portal (`artifacts/portal`)

A separate authenticated investor portal lives at `artifacts/portal` and is intended to deploy to **https://portal.aicreates.ai** (Replit Deployments, autoscale). It is not part of the GitHub Pages marketing build.

- Auth: Clerk (white-labeled via the api-server's Clerk proxy at `/api/__clerk`; set `VITE_CLERK_PROXY_URL=/api/__clerk` in the portal env).
- Payments: Stripe one-time Checkout for "Founders Commitment" tiers.
- Stripe data is mirrored locally via `stripe-replit-sync` (schema `stripe.*` in Postgres).
- App-side users are stored in `app_users` (`lib/db/src/schema/app_users.ts`).
- Portal pages: `/` (landing), `/sign-in`, `/sign-up`, `/dashboard` (per-user commitments), `/invest` (tier picker + Checkout), `/admin` (admin-only overview).

### One-time setup

1. **Connect Stripe** via the Replit Integrations tab (no API keys to copy by hand).
2. **Set admin emails:** add `ADMIN_EMAILS=you@example.com,other@example.com` (comma-separated) to the api-server env. Matching users are auto-promoted to `admin` on next request.
3. **Seed tiers:** `pnpm --filter @workspace/scripts run seed-tiers` — idempotent; creates Founders ($1k), Architect ($5k), Catalyst ($25k) products + USD one-time prices in Stripe.
4. **Push DB schema:** `pnpm --filter @workspace/db run push` (already includes `app_users`).

The api-server gracefully skips Stripe init if the integration is not connected, so the rest of the app keeps working.

### Production deploy

Use Replit Deployments (autoscale) for `portal.aicreates.ai`. The api-server serves both `/api/*` and `/portal/*` (static). Point a `CNAME` for `portal.aicreates.ai` at the Replit deployment and add the domain in Clerk's allowed origins.

## Eve chat widget (hidden)

The Eve widget (`artifacts/web/src/components/EveWidget.tsx`) and its backend route (`artifacts/api-server/src/routes/eve.ts`) remain in the codebase but the widget is not mounted in `App.tsx`. To re-enable: uncomment the import and the `<EveWidget />` mount in `App.tsx`.

## Security

Static public website. The api-server has CORS allow-lists and never exposes any third-party API keys to the client.
