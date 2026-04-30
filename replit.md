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

## Contact form

The form on `/contact` is static — submission shows a success toast and does not POST anywhere. A `// TODO: connect form backend` comment in `src/pages/Contact.tsx` documents how to wire up Formspree, Tally, Supabase, or a serverless email function.

## Security

Static public website only. No API keys, secrets, customer data, or backend credentials are committed.
