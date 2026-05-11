# AIcreatesAI

Premium static React website for **AIcreatesAI** — an agentic AI technology company building intelligent business infrastructure and next-generation digital products.

The site is built with React + Vite + TailwindCSS and is designed to be hosted on **GitHub Pages** at the custom domain **https://www.aicreates.ai**. Replit is used only as the development environment.

---

## Local Development (Replit)

The project runs as a workflow inside Replit. Simply open the project — the `web` workflow serves the site at the preview path `/`.

To run locally outside Replit:

```bash
pnpm install
pnpm --filter @workspace/web run dev
```

The dev server reads `PORT` (defaults to `5173`) and `BASE_PATH` (defaults to `/`).

To build a production bundle locally:

```bash
pnpm --filter @workspace/web run build
```

The output is written to `artifacts/web/dist/public` — that folder is what gets deployed to GitHub Pages.

---

## Deploying to GitHub Pages

The site is deployed automatically by a GitHub Actions workflow that builds the Vite project and publishes it to GitHub Pages on every push to `main`.

Follow the steps below once to wire everything up.

### 1. Add the deploy workflow (one-time, manual)

For security reasons, automated agents cannot write files under `.github/workflows/`. You need to add the workflow file once via the GitHub web UI:

1. On GitHub, open this repository.
2. Click the **Actions** tab → **New workflow** → **set up a workflow yourself**.
3. Set the file name to `deploy.yml` (the path becomes `.github/workflows/deploy.yml`).
4. Open `MANUAL-WORKFLOW-SETUP.md` in this repo, copy the YAML inside the code block, and paste it as the file contents.
5. Click **Commit changes…** → commit directly to `main`.

That single commit will trigger the first build immediately. From then on, every push to `main` re-deploys the site.

### 2. Enable GitHub Pages

1. On GitHub, open your repository → **Settings → Pages**.
2. Under **Build and deployment → Source**, select **GitHub Actions**.
3. Push to `main` (or open the **Actions** tab and run the **Deploy AIcreatesAI to GitHub Pages** workflow manually). The workflow installs dependencies, builds the site, and publishes the contents of `artifacts/web/dist/public` to GitHub Pages.

### 3. Set the custom domain

The repository already includes `artifacts/web/public/CNAME` containing `www.aicreates.ai`. The build copies this file into the deploy artifact, so GitHub Pages will pick it up automatically.

To verify on GitHub:

1. Open **Settings → Pages**.
2. Under **Custom domain**, confirm it shows `www.aicreates.ai`. If not, type it in and click **Save**.
3. Wait for the DNS check to pass (this can take a few minutes after DNS is configured — see step 5).

### 4. Enforce HTTPS

1. Still in **Settings → Pages**, scroll to **Enforce HTTPS** and tick the checkbox.
2. If the option is greyed out, GitHub is still provisioning the TLS certificate for your domain. Come back in 10–60 minutes once DNS propagates.

### 5. Configure DNS in GoDaddy

Open GoDaddy → **My Products → Domains → aicreates.ai → DNS** and create the records below. Delete any conflicting `A`, `AAAA`, or `CNAME` records on the same names first.

#### Apex domain (`aicreates.ai`) — four A records pointing to GitHub Pages

| Type | Name | Value           | TTL     |
| ---- | ---- | --------------- | ------- |
| A    | @    | 185.199.108.153 | 600     |
| A    | @    | 185.199.109.153 | 600     |
| A    | @    | 185.199.110.153 | 600     |
| A    | @    | 185.199.111.153 | 600     |

(Optionally also add the AAAA equivalents: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`.)

#### `www` subdomain — CNAME to your GitHub Pages domain

| Type  | Name | Value                          | TTL |
| ----- | ---- | ------------------------------ | --- |
| CNAME | www  | `<your-username>.github.io`    | 600 |

> Replace `<your-username>` with your actual GitHub username (or organization name). For example: `aicreatesai.github.io`. Do **not** include the repository name and do **not** add `https://` — just the bare host.

GitHub will serve `aicreates.ai` and automatically redirect it to the canonical `www.aicreates.ai` once both records resolve and HTTPS is enforced.

### 6. Verify the live site

Once DNS has propagated:

- https://www.aicreates.ai — primary site
- https://aicreates.ai — redirects to `www`
- Browser tab title reads **AIcreatesAI | Agentic AI Business Systems**
- Sharing the URL on Twitter/X, LinkedIn, Slack, iMessage, etc. shows the social preview image at `public/social-preview.png`

---

## Project Structure

```
artifacts/web/
├── public/                  # Static files copied verbatim into the build
│   ├── CNAME                # Custom domain for GitHub Pages
│   ├── favicon.ico          # Browser tab favicon
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── apple-touch-icon.png
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── site.webmanifest     # PWA manifest
│   ├── robots.txt
│   ├── sitemap.xml
│   └── social-preview.png   # Used for Open Graph and Twitter cards
├── src/
│   ├── assets/              # Brand imagery used throughout the site
│   ├── pages/               # Home, About, Technology, Products, Fin, Services, Contact
│   ├── components/          # Navigation, footer, UI primitives, etc.
│   ├── App.tsx              # React Router setup
│   └── main.tsx
├── index.html               # SEO meta tags, Open Graph, Twitter cards, favicon links
└── vite.config.ts
```

## Connecting the contact form to a backend

The contact form on the `Contact` page is a static layout. Wiring it to a real backend takes one of these drop-in services:

- **Formspree** — replace the `<form>` element's `action` with your `https://formspree.io/f/<form-id>` endpoint.
- **Tally** — embed a Tally form, or POST to a Tally endpoint.
- **Supabase** — create a `contacts` table and POST submissions to its REST API or Edge Function.
- **Email service** — send to a serverless function (Vercel, Netlify, Cloudflare Workers) that forwards via Resend, Postmark, or SendGrid.

Look for the `// TODO: connect form backend` comment in `src/pages/Contact.tsx`.

## Security

This is a static public website. Do **not** add API keys, secrets, customer data, or backend credentials to the repository — anything committed here ends up publicly served by GitHub Pages.

## Investor portal (separate deployment)

In addition to this static site, the repo contains an authenticated investor portal at `artifacts/portal/` that deploys to **https://portal.aicreates.ai** via Replit Deployments. Highlights:

- Auth: Clerk (white-labeled).
- Payments: Stripe one-time Checkout for "Founders Commitment" tiers.
- Stripe data is mirrored to Postgres via `stripe-replit-sync`.
- Pages: `/sign-in`, `/sign-up`, `/dashboard`, `/invest`, `/admin`.

One-time setup (in Replit):

1. Connect Stripe via the Integrations tab.
2. Set `ADMIN_EMAILS=you@example.com` on the api-server env.
3. `pnpm --filter @workspace/db run push` to sync the `app_users` schema.
4. `pnpm --filter @workspace/scripts run seed-tiers` to create Founders / Architect / Catalyst products and prices.

See `replit.md` → "Investor portal" for full details. The marketing site's `/invest` page links to `https://portal.aicreates.ai/` from the hero "Reserve Your Allocation" button.
