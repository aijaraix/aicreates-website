# AIcreatesAI

This monorepo holds **everything that powers the AIcreatesAI brand** — the public marketing site, the investor portal, the shared API server, the design system, and the database schema.

It is developed inside Replit, version-controlled on GitHub, and serves two production surfaces:

| Surface | URL | Hosted on | What it is |
| --- | --- | --- | --- |
| Marketing site | https://www.aicreates.ai | **GitHub Pages** | Static React site for the brand, products, litepaper, tokenomics, contact form |
| Investor portal | https://invest.aicreates.ai | **Replit Deployments (Autoscale)** | Investor sign-up, SAFT signing, Stripe checkout, vesting dashboard, admin tools |

> **Heads-up:** The legacy `https://portal.aicreates.ai` subdomain is permanently retired. The api-server includes a host-based 301 redirect that sends any request whose `Host` is `portal.aicreates.ai` to `https://invest.aicreates.ai`. Keep the `portal` subdomain linked to the same Replit deployment (via the A + TXT records described in the [DNS at GoDaddy](#deployment-2-investor-portal--replit-deployments) section below) so the redirect runs.

---

## Repository layout

```
artifacts/
  web/         → marketing site (React + Vite, static)        → GitHub Pages
  invest/      → investor portal frontend (React + Vite)      → Replit Deployments (static, served at /invest)
  api-server/  → Express API + Clerk + Stripe                 → Replit Deployments (autoscale process)
lib/           → shared libs (db schema, vesting, api-spec, …)
scripts/       → one-off scripts (seed-tiers, post-merge, …)
.github/workflows/deploy.yml → GitHub Pages CI
.replit-artifact/artifact.toml in each artifact → per-artifact production config
```

The pnpm workspace is the source of truth. In multi-artifact pnpm projects, the root `.replit`'s `[deployment]` block only declares the deployment target (`autoscale`) and router mode (`application`); the actual `build`/`run`/`serve` for each service comes from that artifact's own `.replit-artifact/artifact.toml`. Edit `.replit` only via Replit's tools (it is sandbox-protected); always edit `artifact.toml` files via the `artifact.edit.toml` flow so they stay in sync with the workspace.

---

## Local development (Replit)

Three dev servers run in parallel in Replit:

| Workflow | Command | Port |
| --- | --- | --- |
| `artifacts/web: web` | `pnpm --filter @workspace/web run dev` | 22333 (proxied at `/`) |
| `artifacts/invest: web` | `PORT=25265 BASE_PATH=/invest/ pnpm --filter @workspace/invest run dev` | 25265 (proxied at `/invest/`) |
| `artifacts/api-server: API Server` | `pnpm --filter @workspace/api-server run dev` | 8080 (proxied at `/api`) |

The `Project` run button starts the two `web` workflows; the `artifacts/api-server: API Server` workflow is fully managed by its `.replit-artifact/artifact.toml` and is auto-started by the artifact system, so it does not appear in the `Project` parallel task list. Do not add a separate manually-defined `api-server` workflow in `.replit` — it will collide with the artifact-managed one on port 8080.

Use `localhost:80/<path>` (not the raw service ports) so you go through the same path-based proxy your browser does.

To run individual checks from the shell:

```bash
pnpm install
pnpm --filter @workspace/web run typecheck
pnpm --filter @workspace/invest run typecheck
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/web run build      # static bundle for GitHub Pages
```

Do **not** run `pnpm dev` at the workspace root — Replit workflows wire up `PORT` and `BASE_PATH` per artifact.

---

## Deployment 1: marketing site → GitHub Pages

`https://www.aicreates.ai` is fully owned by the GitHub repo `aijaraix/aicreates-website`.

**How it deploys:**

1. You (or the agent) push to `main`.
2. `.github/workflows/deploy.yml` runs on every push to `main`. It installs deps, runs `pnpm --filter @workspace/web run build` with `BASE_PATH=/`, and uploads `artifacts/web/dist/public` as a GitHub Pages artifact.
3. The `deploy` job publishes that artifact to GitHub Pages.
4. `artifacts/web/public/CNAME` (which contains `www.aicreates.ai`) is copied into the build output, so GitHub Pages serves it on the custom domain over HTTPS.

**One-time GitHub setup (already done):**

- Repository → **Settings → Pages → Build and deployment → Source = GitHub Actions**.
- DNS at GoDaddy: `www.aicreates.ai` → `CNAME` → `aijaraix.github.io.`
- Apex `aicreates.ai`: 4 `A` records pointing to GitHub Pages IPs (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).

**To publish a new version of the marketing site:**

```bash
git push github main
```

(Where `github` is the remote pointing at `https://github.com/aijaraix/aicreates-website.git`.) Watch the `Deploy AIcreatesAI to GitHub Pages` workflow under **Actions**; once it goes green, the new content is live.

---

## Deployment 2: investor portal → Replit Deployments

`https://invest.aicreates.ai` is served by a single Replit Autoscale deployment that publishes both:

- `api-server` (Node/Express process at the root) — handles `/api/*`, the Clerk proxy at `/api/__clerk`, the Stripe webhook, the legacy `portal.aicreates.ai` 301 redirect, etc.
- `invest` (static SPA) — served at `/invest/*` with SPA rewrites to `index.html`.

The `web` artifact is also published to this same Replit deployment as a static SPA at `/*` (a fallback). The canonical marketing site is GitHub Pages at https://www.aicreates.ai and DNS only points there — the `*.replit.app/` copy is unreachable via any custom domain. The fallback exists because every artifact must have a `[services.production]` block in its `.replit-artifact/artifact.toml` for Replit Publishing to accept the deployment. Removing the block from `web` produces *"Could not find run command"* in the Publish dialog and blocks publish entirely. See the inline comment in `artifacts/web/.replit-artifact/artifact.toml`.

**One-time Replit setup:**

1. **Connect the Stripe integration** via the Replit Integrations tab. The api-server skips Stripe init gracefully if it's not connected, so the rest of the app keeps working — but checkout will be unavailable.
2. **Connect the GitHub integration** if you haven't already. The agent uses it to push to `aijaraix/aicreates-website`.
3. **Set the production environment variables** in Replit Deployments → Secrets:

   | Variable | Value | Notes |
   | --- | --- | --- |
   | `ADMIN_EMAILS` | `sholom@aicreates.ai,chris@aicreates.ai` | Comma-separated. **Every** email in this list is granted the `admin` role on next request (checked per-request, so removing an email from the list demotes that user immediately). Already set in `[userenv.shared]`. |
   | `VITE_CLERK_PROXY_URL` | `/api/__clerk` | **Production only.** Already set in `[userenv.production]`. Setting it in dev blanks the portal because the dev Clerk proxy is a no-op. |
   | `DATABASE_URL` | (Replit-managed Postgres) | Auto-provisioned when "Create production database" is checked. |
   | Stripe vars | (managed by integration) | Don't set by hand. |

   `SESSION_SECRET` is also present as a Replit secret but is **not currently consumed by application code** (Clerk owns auth state); leave it alone unless you add session middleware later.
4. **DNS at GoDaddy** — Replit's "Connect your own domain" flow uses A + TXT verification, not CNAME. For each of `invest.aicreates.ai` and `portal.aicreates.ai`:

   1. In Replit Publishing → Domains → **Connect your own domain**, enter the subdomain. The dialog reveals two records:
      - `A` `<subdomain>` → `34.111.179.208`
      - `TXT` `<subdomain>` → `replit-verify=<unique-token>` (different token per subdomain)
   2. Add both rows in GoDaddy DNS, save, then click **Link** in the Replit dialog. Verification typically completes within 5-30 minutes.
   3. After it shows green, click **Manage** on the subdomain in Replit. The "Authentication DNS setup required" panel exposes three more CNAMEs that Clerk needs for branded auth-email delivery from the custom domain. Add all three to GoDaddy:
      - `CNAME` `clkmail.<subdomain>` → `mail.<clerk-tenant>.clerk.services`
      - `CNAME` `clk._domainkey.<subdomain>` → `dkim1.<clerk-tenant>.clerk.services`
      - `CNAME` `clk2._domainkey.<subdomain>` → `dkim2.<clerk-tenant>.clerk.services`

   When GoDaddy pops up "Let's double check…" because the Name field has the full FQDN, always pick the **first option** (without the doubled domain). End state: each subdomain has 1 A row, 1 TXT row, and 3 CNAME rows in GoDaddy — six new rows per subdomain, twelve total for invest + portal.

5. **Switch Stripe to live mode (operator-only verification).** The api-server's `stripeClient.ts` prefers operator-supplied `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` env secrets in production and falls back to the dev Stripe connector otherwise.

   1. In Stripe Dashboard, generate a live secret key. Add it as `STRIPE_SECRET_KEY` in Replit Deployments → Secrets.
   2. Register the production webhook at `https://invest.aicreates.ai/api/stripe/webhook` for `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `charge.dispute.created`. Add the webhook signing secret as `STRIPE_WEBHOOK_SECRET`.
   3. In Stripe Dashboard → Settings → Payment methods, enable ACH Direct Debit, Apple Pay, and Google Pay. Wallet buttons appear automatically because the portal uses Stripe Checkout (hosted page).
   4. **End-to-end live verification (cannot be automated from inside the app).** The api-server's `/api/me` and `/api/admin/investors/:id` now return `stripeMode: "live" | "test" | "unknown"` derived from the `sk_live_` / `sk_test_` prefix, and the admin investor drawer displays it next to "Stripe ___" in the Commitments header. With that visible:
      - Run a real $1 commitment from a personal account. Confirm the payment shows under **live** in Stripe Dashboard, the webhook hits `https://invest.aicreates.ai/api/stripe/webhook` with a 200, the commitment advances to `funded`, and `/dashboard` renders the "Funded — waiting for TGE" countdown banner.
      - Trigger a deliberate decline (real card with insufficient funds, or any Stripe error path live cards expose). Confirm `/checkout/:commitId?failed=1` shows the customer-readable decline reason and the same reason renders on the next-action card on `/dashboard`. The decline reason is persisted to `commitments.last_failure_reason` from `payment_intent.payment_failed.last_payment_error`.
      - In the admin drawer, click each Stripe deep-link beside `cus` / `pi` / `cs` and confirm it opens `dashboard.stripe.com/{customers,payments,checkout/sessions}/...` (no `test/` prefix in live mode) on the right record.

6. **Clerk allowed origins** — managed automatically. Replit-managed Clerk picks up each verified custom domain from the Publishing → Domains list and registers it as an allowed origin without a separate step. If sign-in still fails on a custom domain after verification, open the workspace **Auth pane** and look for warning icons next to your SSO providers — those flag OAuth provider redirect URIs (e.g. Google, X) that need to be added in the provider's own developer console.

**To publish a new version of the portal:**

1. Open the Publishing tab in Replit.
2. Pick the deployment domain (or your custom `*.replit.app`).
3. Set access to **Public**.
4. Tick **Create production database** + **Set up production database with current development data** (only on the very first publish, or when you intentionally want to refresh prod data from dev).
5. Click **Publish**. Replit will:
   - Run `pnpm install --frozen-lockfile`.
   - Run each artifact's production `build`.
   - Start the api-server process (`node --enable-source-maps artifacts/api-server/dist/index.mjs`).
   - Health-check `/api/healthz` (liveness — always 200 if the process is up).
   - Route `/invest/*` to the static SPA bundle.

### Post-deploy smoke test

After publish, verify the deep readiness preflight before sending traffic:

```bash
curl -s https://invest.aicreates.ai/api/healthz/ready | jq
```

Expected: `{"status":"ok", checks: { database, clerk, stripe, email, ... }}` with HTTP 200. The route returns 503 if either critical check (`database`, `clerk`) fails. `stripe` and `email` are reported but non-critical — wire-only checkout still works without them.

If publish ever fails with *"Could not find run command"*, the most common cause is that someone removed the `[services.production]` block from one of the artifacts (most often `artifacts/web/.replit-artifact/artifact.toml`). Restore it — see the inline comment in that file.

---

## Production database

Replit Deployments creates and manages a separate production Postgres for you. The dev database (visible in the Database tab in the workspace) is **not** the production database. To copy schema/data from dev → prod, tick the "Set up your production database with current development data" box in the Publishing dialog before clicking Publish, or run:

```bash
pnpm --filter @workspace/db run push   # pushes Drizzle schema (idempotent)
```

---

## Where to find more detail

- `replit.md` — high-level project overview, brand tokens, page list, portal flow, Eve widget toggle, e2e tests.
- `artifacts/invest-e2e/README.md` — Playwright suite that drives the portal.
- `lib/api-spec/openapi.yaml` — single source of truth for API contracts.
- `.local/tasks/*.md` — historical project task plans.
