# AIcreatesAI Website

## Overview

Premium static React website for **AIcreatesAI** — a technology company building agentic AI systems, intelligent business infrastructure, and next-generation digital products (Adam, Eve, Fin).

The site is developed in Replit and deployed to **GitHub Pages** at the custom domain **https://www.aicreates.ai**. Replit is the dev environment; GitHub is the permanent code repository; GitHub Pages is the production host.

## Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS v4, shadcn/ui (new-york), framer-motion for animation
- **Routing**: wouter (client-side)
- **Fonts**: Inter (body) and Space Grotesk (display) from Google Fonts
- **Hosting**: GitHub Pages with custom domain (CNAME) and HTTPS
- **CI**: GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys on push to `main`

## Pages

`/`, `/about`, `/technology`, `/products`, `/products/fin`, `/services`, `/contact`

Sticky glass-morphism navigation with a Products dropdown (containing Fin) and a mobile drawer. Consistent footer.

## Key Files

- `artifacts/web/index.html` — full SEO meta, Open Graph, Twitter cards, favicon, manifest
- `artifacts/web/public/CNAME` — `www.aicreates.ai`
- `artifacts/web/public/social-preview.png` — Open Graph / Twitter card image
- `artifacts/web/public/favicon.ico` and the `favicon-*.png`, `apple-touch-icon.png`, `android-chrome-*.png`, `site.webmanifest`, `robots.txt`, `sitemap.xml`
- `artifacts/web/src/components/Brand.tsx` — branded `<Brand />` component used in body copy so `AIcreatesAI` always reads unambiguously
- `artifacts/web/src/components/Navigation.tsx`, `Footer.tsx`
- `artifacts/web/src/pages/*.tsx` — Home, About, Technology, Products, Fin, Services, Contact, NotFound
- `artifacts/web/src/assets/*.png` — AI-generated brand imagery (no stock photos)
- `.github/workflows/deploy.yml` — GitHub Pages deploy workflow
- `README.md` — step-by-step instructions for connecting Replit → GitHub → GitHub Pages → custom domain (GoDaddy DNS)

## Development

```bash
pnpm install
pnpm --filter @workspace/web run dev          # local dev (defaults to BASE_PATH "/" and PORT 5173 if not set)
pnpm --filter @workspace/web run build         # production build → artifacts/web/dist/public
```

In Replit, the `artifacts/web: web` workflow runs the dev server automatically.

## Deployment

See `README.md` for the full GitHub Pages + GoDaddy DNS setup. The GitHub Actions workflow installs pnpm, builds the site with `BASE_PATH=/`, and deploys `artifacts/web/dist/public` to Pages. The `public/CNAME` file provides the custom domain.

## Contact & waitlist forms

Both forms POST via AJAX to `https://formsubmit.co/ajax/sholom@aicreates.ai`:

- `/contact` — full inquiry form (name, email, company, role, interest, message) with loading / success / error states.
- `/products/fin` — inline waitlist form with Personal / Business / Enterprise tier selector.

`formsubmit.co` requires a one-time activation by clicking the verification email it sends to `sholom@aicreates.ai` on the very first submission.

## Eve chat widget (NEW)

A floating "Chat with Eve" widget in the bottom-right corner of every page. It's a lead-gen / brand-ambassador chatbot that drives visitors toward the Fin waitlist, the contact form, or sharing their email.

**Architecture (split between two hosts):**

- **Frontend** — `artifacts/web/src/components/EveWidget.tsx` mounted in `App.tsx`. Lives on GitHub Pages (`www.aicreates.ai`). Calls the backend at `EVE_API_BASE`.
- **Backend** — `artifacts/api-server/src/routes/eve.ts` with one route: `POST /api/eve/chat`. Uses Anthropic's `claude-haiku-4-5` via Replit AI Integrations (env vars `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` and `AI_INTEGRATIONS_ANTHROPIC_API_KEY` are auto-provisioned by Replit). The system prompt locks Eve to AIcreatesAI topics, refuses tech-stack/pricing/team details, and pushes conversion at every turn.
- **Lead capture** — when a visitor's message contains an email, the backend fires-and-forgets a POST to `formsubmit.co/ajax/sholom@aicreates.ai` with the full conversation transcript.
- **Hosting model** — frontend on GitHub Pages (free, static), backend on a Replit Deployment (the user clicks "Publish" once on Replit; the deployed URL is wired into `EVE_API_BASE` in `EveWidget.tsx`).
- **CORS** — `artifacts/api-server/src/app.ts` allow-lists `aicreates.ai`, `www.aicreates.ai`, `aijaraix.github.io`, localhost, and `*.replit.{dev,app}` / `*.repl.co`.

To run locally:

```bash
# Terminal 1 — backend on :8080
pnpm --filter @workspace/api-server run dev
# Terminal 2 — frontend on :22333 (or whatever PORT)
pnpm --filter @workspace/web run dev
```

In Replit both run as workflows automatically.

## Security

Static public website. The api-server has CORS allow-lists, sanitizes Eve's message history (max 20 turns, 4000 chars each), caps payload at 256kb, and never exposes the Anthropic API key to the client.
