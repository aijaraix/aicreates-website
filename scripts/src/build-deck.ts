/**
 * Build the AICA visual whitepaper deck for the marketing site.
 *
 * Reads a source PDF (default: the attached visual whitepaper), renders each
 * page to a high-resolution master JPEG, then emits a responsive set of WebP
 * variants (640w / 1024w / 1467w) plus a manifest.json describing the deck.
 * The final files live under artifacts/web/public/deck/.
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run build-deck                # uses default attached PDF
 *   pnpm --filter @workspace/scripts run build-deck path/to/src.pdf
 *
 * Requires `pdftoppm` (poppler-utils) and `magick` (ImageMagick) on PATH,
 * both provided by the Replit Nix environment.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");
const DEFAULT_SRC = resolve(
  REPO_ROOT,
  "attached_assets/AICA_v8_visual_whitepaper_1778530504544.pdf",
);
const OUT_DIR = resolve(REPO_ROOT, "artifacts/web/public/deck");

function main() {
  const src = resolve(process.argv[2] ?? DEFAULT_SRC);
  if (!existsSync(src)) {
    console.error(`Source PDF not found: ${src}`);
    console.error("Pass a path as the first argument or place the file at ./aica-deck.pdf");
    process.exit(1);
  }

  /** Responsive widths to emit per slide (in CSS pixels). */
  const RESPONSIVE_WIDTHS = [640, 1024, 1467];
  /** Width chosen as the `<img>` fallback `src`. */
  const DEFAULT_WIDTH = 1024;
  /** WebP encoder quality (1-100). */
  const WEBP_QUALITY = 80;
  /** Width used for the single JPEG fallback served via the `<img>` element
   *  inside `<picture>`. Picked from RESPONSIVE_WIDTHS. */
  const FALLBACK_WIDTH = 1024;
  /** JPEG encoder quality (1-100) for the `<picture>` fallback. */
  const FALLBACK_JPEG_QUALITY = 82;

  if (existsSync(OUT_DIR)) {
    for (const f of readdirSync(OUT_DIR)) {
      if (
        /^slide-\d+(-\d+)?\.(jpg|webp)$/.test(f) ||
        f === "manifest.json" ||
        f.startsWith("_master-")
      ) {
        rmSync(resolve(OUT_DIR, f));
      }
    }
  } else {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log(`Rendering ${src} -> ${OUT_DIR}`);
  // Determine page count to pick a zero-pad width that prevents lexicographic mis-ordering.
  const pageCountRaw = execFileSync("pdfinfo", [src], { encoding: "utf8" });
  const pageMatch = /^Pages:\s+(\d+)/m.exec(pageCountRaw);
  const totalPages = pageMatch ? Number(pageMatch[1]) : 0;
  const padWidth = Math.max(2, String(totalPages || 99).length);

  // Render high-resolution master JPEGs; we'll downscale these into WebPs.
  execFileSync(
    "pdftoppm",
    [
      "-jpeg",
      "-jpegopt",
      "quality=92",
      "-r",
      "150",
      "-digits",
      String(padWidth),
      src,
      resolve(OUT_DIR, "_master"),
    ],
    { stdio: "inherit" },
  );

  // Natural-numeric sort so master-2 < master-10 even if any pad slips through.
  const masters = readdirSync(OUT_DIR)
    .filter((f) => /^_master-\d+\.jpg$/.test(f))
    .sort((a, b) => {
      const na = Number(/\d+/.exec(a)![0]);
      const nb = Number(/\d+/.exec(b)![0]);
      return na - nb;
    });

  if (masters.length === 0) {
    console.error("pdftoppm produced no slides.");
    process.exit(1);
  }

  // Capture native dimensions from the first master so the carousel can reserve space.
  const dimsRaw = execFileSync(
    "magick",
    ["identify", "-format", "%w %h", resolve(OUT_DIR, masters[0])],
    { encoding: "utf8" },
  );
  const [mw, mh] = dimsRaw.trim().split(/\s+/).map(Number);

  // Emit WebP variants per slide, then drop the master.
  const slideStems: string[] = [];
  for (const m of masters) {
    const num = /\d+/.exec(m)![0];
    const stem = `slide-${num}`;
    slideStems.push(stem);
    for (const w of RESPONSIVE_WIDTHS) {
      execFileSync(
        "magick",
        [
          resolve(OUT_DIR, m),
          "-resize",
          `${w}x`,
          "-quality",
          String(WEBP_QUALITY),
          "-define",
          "webp:method=6",
          resolve(OUT_DIR, `${stem}-${w}.webp`),
        ],
        { stdio: "inherit" },
      );
    }
    // Single JPEG fallback for the `<picture>` element's `<img>` tag, used
    // only by browsers that don't support WebP.
    execFileSync(
      "magick",
      [
        resolve(OUT_DIR, m),
        "-resize",
        `${FALLBACK_WIDTH}x`,
        "-quality",
        String(FALLBACK_JPEG_QUALITY),
        resolve(OUT_DIR, `${stem}-${FALLBACK_WIDTH}.jpg`),
      ],
      { stdio: "inherit" },
    );
    rmSync(resolve(OUT_DIR, m));
  }

  const manifest = {
    slides: slideStems,
    count: slideStems.length,
    widths: RESPONSIVE_WIDTHS,
    defaultWidth: DEFAULT_WIDTH,
    format: "webp" as const,
    fallbackFormat: "jpg" as const,
    fallbackWidth: FALLBACK_WIDTH,
    width: mw || null,
    height: mh || null,
    aspectRatio: mw && mh ? mw / mh : null,
    source: "AICA Visual Whitepaper",
    sourceFile: src,
    generatedAt: new Date().toISOString(),
  };
  writeFileSync(resolve(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(
    `Wrote ${slideStems.length} slides x ${RESPONSIVE_WIDTHS.length} widths (webp) + manifest.json`,
  );
}

main();
