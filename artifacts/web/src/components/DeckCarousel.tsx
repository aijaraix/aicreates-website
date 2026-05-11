import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";

type Manifest = {
  /** Per-slide stem (e.g. `slide-01`); the carousel composes file URLs from this + width + format. */
  slides: string[];
  count: number;
  /** Available widths in pixels for the responsive `srcset` (e.g. [640, 1024, 1467]). */
  widths?: number[];
  /** Width chosen for the `<img>` fallback `src`. */
  defaultWidth?: number;
  /** Primary asset format served via the `<source>` element. */
  format?: "webp" | "jpeg";
  /** Optional fallback format served via the `<img>` element for browsers
   *  that don't support `format` (e.g. very old browsers without WebP). */
  fallbackFormat?: "jpg" | "jpeg" | "png";
  /** Width used for the `<img>` fallback file. Defaults to `defaultWidth`. */
  fallbackWidth?: number;
  /** Native rendered dimensions of the source slides (for aspect-ratio reservation). */
  width?: number;
  height?: number;
  aspectRatio?: number;
  source?: string;
};

interface DeckCarouselProps {
  basePath?: string;
  manifestUrl?: string;
  title?: string;
  subline?: string;
  testIdPrefix?: string;
}

export default function DeckCarousel({
  basePath = "/deck",
  manifestUrl = "/deck/manifest.json",
  title = "Visual Whitepaper",
  subline = "Swipe through the deck or open it fullscreen.",
  testIdPrefix = "deck",
}: DeckCarouselProps) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(manifestUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`Manifest fetch failed (${r.status})`);
        return r.json() as Promise<Manifest>;
      })
      .then((m) => {
        if (!cancelled) setManifest(m);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [manifestUrl]);

  const slides = manifest?.slides ?? [];
  const count = slides.length;
  const widths = manifest?.widths;
  // Pick a fallback width that actually exists in `widths`; if the manifest
  // declares a `defaultWidth` not in the set, snap to the nearest one so the
  // `<img>` `src` always points at a real generated file.
  const defaultWidth = (() => {
    if (!widths || widths.length === 0) return undefined;
    const declared = manifest?.defaultWidth;
    if (declared && widths.includes(declared)) return declared;
    if (declared) {
      return widths.reduce((best, w) =>
        Math.abs(w - declared) < Math.abs(best - declared) ? w : best,
      );
    }
    return widths[Math.floor((widths.length - 1) / 2)];
  })();
  const format: "webp" | "jpeg" = manifest?.format ?? "webp";
  const fallbackFormat = manifest?.fallbackFormat ?? "jpg";
  const fallbackWidth = manifest?.fallbackWidth ?? defaultWidth;
  const nativeWidth = manifest?.width ?? null;
  const nativeHeight = manifest?.height ?? null;

  const go = useCallback(
    (delta: number) => {
      setActive((i) => {
        if (count === 0) return 0;
        const n = (i + delta + count) % count;
        return n;
      });
    },
    [count],
  );

  const goTo = useCallback(
    (i: number) => {
      if (count === 0) return;
      setActive(((i % count) + count) % count);
    },
    [count],
  );

  // Keyboard navigation when focused / fullscreen
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!containerRef.current) return;
      const isFs =
        document.fullscreenElement === containerRef.current || isFullscreen;
      const isFocused = containerRef.current.contains(document.activeElement);
      if (!isFs && !isFocused) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(count - 1);
      } else if (e.key === "Escape" && isFullscreen) {
        if (document.fullscreenElement === containerRef.current) {
          document.exitFullscreen?.();
        }
        setIsFullscreen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [go, goTo, count, isFullscreen]);

  // Track native fullscreen state
  useEffect(() => {
    function onFs() {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    }
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // Exit if currently in real fullscreen on this element OR in emulated fullscreen.
    if (document.fullscreenElement === el) {
      document.exitFullscreen?.();
      return;
    }
    if (isFullscreen && !document.fullscreenElement) {
      // Emulated fullscreen: just clear the flag.
      setIsFullscreen(false);
      return;
    }
    const req = el.requestFullscreen?.();
    if (req && typeof req.catch === "function") {
      req.catch(() => {
        // Fallback: emulate fullscreen via layout flag.
        setIsFullscreen(true);
      });
    } else {
      setIsFullscreen(true);
    }
  }, [isFullscreen]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const dx = end - start;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  // Lazy-load: render the previous, current, and next slides
  const renderable = useMemo(() => {
    if (count === 0) return new Set<number>();
    return new Set([
      (active - 1 + count) % count,
      active,
      (active + 1) % count,
    ]);
  }, [active, count]);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      data-testid={`${testIdPrefix}-carousel`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className={`group relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] overflow-hidden focus:outline-none focus:ring-1 focus:ring-[#00F5D4]/30 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-0" : ""
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.08),transparent_60%)] pointer-events-none" />

      {/* Header */}
      {!isFullscreen && (
        <div className="relative px-5 sm:px-7 pt-5 pb-3 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
                {title}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/55">{subline}</p>
          </div>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full border border-white/10 bg-black/30 text-xs text-white/70 hover:text-white hover:bg-white/[0.06]"
            aria-label="Open deck fullscreen"
            data-testid={`${testIdPrefix}-fullscreen-toggle`}
          >
            <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
          </button>
        </div>
      )}

      {/* Slide stage */}
      <div
        className={`relative w-full ${
          isFullscreen ? "h-[100dvh]" : "aspect-[4/3] sm:aspect-[16/10]"
        } bg-black flex items-center justify-center select-none`}
      >
        {error && (
          <div className="text-white/50 text-sm px-6 text-center">
            Could not load deck: {error}
          </div>
        )}
        {!error && count === 0 && (
          <div className="text-white/40 text-sm">Loading deck…</div>
        )}
        {slides.map((stem, i) => {
          if (!renderable.has(i)) return null;
          const isActive = i === active;
          // Backwards-compat: if the manifest still ships full filenames (e.g.
          // `slide-01.jpg`), strip the extension so the srcset composer works.
          const base = stem.replace(/\.(webp|jpe?g|png)$/i, "");
          // Legacy single-format manifest (no `widths`): fall back to the
          // original `<img>` rendering.
          if (!widths || widths.length === 0) {
            return (
              <img
                key={stem}
                src={`${basePath}/${stem}`}
                alt={`Slide ${i + 1} of ${count}`}
                loading={isActive ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                data-testid={isActive ? `${testIdPrefix}-slide-active` : undefined}
                width={nativeWidth ?? undefined}
                height={nativeHeight ?? undefined}
                className={`absolute inset-0 m-auto max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />
            );
          }
          const sourceExt = format === "jpeg" ? "jpg" : "webp";
          const sourceMime = format === "jpeg" ? "image/jpeg" : "image/webp";
          const sourceSrcSet = widths
            .map((w) => `${basePath}/${base}-${w}.${sourceExt} ${w}w`)
            .join(", ");
          const sizes = "(min-width: 1280px) 1280px, (min-width: 640px) 100vw, 100vw";
          // The fallback `<img>` is what older browsers (e.g. browsers
          // without WebP support) actually render; we ship a single JPEG
          // size at `fallbackWidth` so we don't bloat the deploy.
          const fallbackSrc = `${basePath}/${base}-${fallbackWidth}.${fallbackFormat}`;
          return (
            <picture
              key={stem}
              className={`absolute inset-0 m-auto flex items-center justify-center transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <source type={sourceMime} srcSet={sourceSrcSet} sizes={sizes} />
              <img
                src={fallbackSrc}
                alt={`Slide ${i + 1} of ${count}`}
                loading={isActive ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                width={nativeWidth ?? undefined}
                height={nativeHeight ?? undefined}
                data-testid={isActive ? `${testIdPrefix}-slide-active` : undefined}
                className="max-w-full max-h-full object-contain"
              />
            </picture>
          );
        })}

        {/* Arrows */}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous slide"
              data-testid={`${testIdPrefix}-prev`}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/15 bg-black/50 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next slide"
              data-testid={`${testIdPrefix}-next`}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/15 bg-black/50 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Fullscreen close (when fullscreen) */}
        {isFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Exit fullscreen"
            data-testid={`${testIdPrefix}-fullscreen-exit`}
            className="absolute top-3 right-3 w-10 h-10 rounded-full border border-white/15 bg-black/60 text-white/80 hover:text-white hover:bg-black/80 backdrop-blur flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Slide counter */}
        {count > 0 && (
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10 text-[11px] font-mono text-white/70">
            {String(active + 1).padStart(2, "0")}{" "}
            <span className="text-white/30">/</span>{" "}
            {String(count).padStart(2, "0")}
          </div>
        )}

        {/* Fullscreen toggle in fullscreen-emulated mode */}
        {!isFullscreen && (
          <div className="absolute bottom-3 right-3 hidden sm:block">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              className="w-9 h-9 rounded-full border border-white/15 bg-black/50 text-white/70 hover:text-white hover:bg-black/70 backdrop-blur flex items-center justify-center"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Dots */}
      {count > 1 && !isFullscreen && (
        <div className="relative px-5 sm:px-7 py-4 flex items-center justify-center gap-1.5 overflow-x-auto">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={active === i}
              data-testid={`${testIdPrefix}-dot-${i}`}
              className={`shrink-0 h-1.5 rounded-full transition-all ${
                active === i
                  ? "w-6 bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.6)]"
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
