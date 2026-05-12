# AIcreatesAI

This monorepo holds **everything that powers the AIcreatesAI brand** — the public marketing site, the investor portal, the shared API server, the design system, and the database schema.

It is developed inside Replit, version-controlled on GitHub, and serves two production surfaces:

| Surface | URL | Hosted on | What it is |
| --- | --- | --- | --- |
| Marketing site | https://www.aicreates.ai | **GitHub Pages** | Static React site for the brand, products, litepaper, tokenomics, contact form |
| Investor portal | https://invest.aicreates.ai | **Replit Deployments (Autoscale)** | Investor sign-up, SAFT signing, Stripe checkout, vesting dashboard, admin tools |

> **Heads-up:** The legacy `https://portal.aicreates.ai` subdomain is permanently retired. The api-server includes a host-based 301 redirect that sends any request whose `Host` is `portal.aicreates.ai` to `https://invest.aicreates.ai`. Leave the `portal` `CNAME` pointed at the same Replit deployment so the redirect runs.

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

The Replit `Project` workflow starts three dev servers in parallel:

| Workflow | Command | Port |
| --- | --- | --- |
| `artifacts/web: web` | `pnpm --filter @workspace/web run dev` | 22333 (proxied at `/`) |
| `api-server` | `pnpm --filter @workspace/api-server run dev` | 8080 (proxied at `/api`) |
| `artifacts/invest: web` | `PORT=25265 BASE_PATH=/invest/ pnpm --filter @workspace/invest run dev` | 25265 (proxied at `/invest/`) |

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

The `web` artifact is **deliberately excluded** from Replit Deployments (no `[services.production]` block in its `artifact.toml`) because the marketing site lives on GitHub Pages. Trying to publish all three artifacts to one autoscale deployment is what produces the *"Could not find run command"* warning in the Publish dialog — keeping web out of the production set keeps that warning gone.

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
4. **DNS at GoDaddy:**
   - `invest.aicreates.ai` → `CNAME` → your `*.replit.app` deployment hostname (visible in the Publishing dialog).
   - `portal.aicreates.ai` → `CNAME` → same `*.replit.app` (so the host-based 301 redirect runs).
5. **Add both custom domains** in Clerk's allowed origins (otherwise sign-in breaks on the live domain).

**To publish a new version of the portal:**

1. Open the Publishing tab in Replit.
2. Pick the deployment domain (or your custom `*.replit.app`).
3. Set access to **Public**.
4. Tick **Create production database** + **Set up production database with current development data** (only on the very first publish, or when you intentionally want to refresh prod data from dev).
5. Click **Publish**. Replit will:
   - Run `pnpm install --frozen-lockfile`.
   - Run each artifact's production `build`.
   - Start the api-server process (`node --enable-source-maps artifacts/api-server/dist/index.mjs`).
   - Health-check `/api/healthz`.
   - Route `/invest/*` to the static SPA bundle.

If publish ever fails with *"Could not find run command"*, the most common cause is that someone re-added a `[services.production]` block to `artifacts/web/.replit-artifact/artifact.toml`. Remove that block — see the inline comment in that file.

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
