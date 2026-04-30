# Manual Workflow Setup (one-time)

The site is deployed via GitHub Actions, but the workflow file (`.github/workflows/deploy.yml`) must be added manually because GitHub blocks automated tooling from writing into `.github/workflows/` without the special `workflow` OAuth scope.

This is a 30-second, one-time step.

## Steps

1. On GitHub, open this repository (`aicreates-website`).
2. Click the **Actions** tab.
3. Click **New workflow**, then click the small link **set up a workflow yourself**.
4. Change the suggested filename in the top bar to exactly: `deploy.yml`
   - The full path shown should read: `.github/workflows/deploy.yml`
5. Delete the placeholder content in the editor.
6. Copy the YAML below and paste it in.
7. Click **Commit changes…** and commit directly to the `main` branch.

The push will immediately trigger the first deployment. After it finishes, the site will be live at the GitHub Pages URL (and at `https://www.aicreates.ai` once DNS is configured — see `README.md`).

## Workflow YAML — copy everything between the `---` markers

---
```yaml
name: Deploy AIcreatesAI to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build website
        run: pnpm --filter @workspace/web run build
        env:
          BASE_PATH: "/"
          NODE_ENV: "production"

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: artifacts/web/dist/public

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
---

## After committing

1. Open **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Verify the **Custom domain** field shows `www.aicreates.ai` (it should auto-detect from the `CNAME` file in `artifacts/web/public/`). If empty, type it in and save.
3. Configure DNS in GoDaddy as described in the **DNS** section of `README.md`.
4. After DNS propagates, return to **Settings → Pages** and tick **Enforce HTTPS**.

That's it — the site is now fully on auto-pilot. Any future push to `main` will rebuild and redeploy the site automatically.
