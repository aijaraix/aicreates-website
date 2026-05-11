/**
 * Build the AICA visual whitepaper deck for the marketing site.
 *
 * Reads a source PDF (default: ./aica-deck.pdf at the repo root) and writes
 * one JPEG per page to artifacts/web/public/deck/slide-NN.jpg, plus a
 * manifest.json describing the slide order.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run build-deck                # uses ./aica-deck.pdf
 *   pnpm --filter @workspace/scripts run build-deck path/to/src.pdf
 *
 * Requires `pdftoppm` (poppler-utils) on PATH, which is provided by the
 * Replit Nix environment.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");
const DEFAULT_SRC = resolve(REPO_ROOT, "aica-deck.pdf");
const OUT_DIR = resolve(REPO_ROOT, "artifacts/web/public/deck");

function main() {
  const src = resolve(process.argv[2] ?? DEFAULT_SRC);
  if (!existsSync(src)) {
    console.error(`Source PDF not found: ${src}`);
    console.error("Pass a path as the first argument or place the file at ./aica-deck.pdf");
    process.exit(1);
  }

  if (existsSync(OUT_DIR)) {
    for (const f of readdirSync(OUT_DIR)) {
      if (/^slide-\d+\.jpg$/.test(f) || f === "manifest.json") {
        rmSync(resolve(OUT_DIR, f));
      }
    }
  } else {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`Rendering ${src} -> ${OUT_DIR}`);
  execFileSync(
    "pdftoppm",
    ["-jpeg", "-jpegopt", "quality=82", "-r", "110", src, resolve(OUT_DIR, "slide")],
    { stdio: "inherit" },
  );

  const slides = readdirSync(OUT_DIR)
    .filter((f) => /^slide-\d+\.jpg$/.test(f))
    .sort();

  if (slides.length === 0) {
    console.error("pdftoppm produced no slides.");
    process.exit(1);
  }

  const manifest = {
    slides,
    count: slides.length,
    source: "AICA Visual Whitepaper",
    generatedAt: new Date().toISOString(),
  };
  writeFileSync(resolve(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${slides.length} slides + manifest.json`);
}

main();
