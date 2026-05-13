import { useEffect, useRef, useState } from "react";

export interface HeroVideoClip {
  desktop: string;
  mobile?: string;
}

interface HeroVideoReelProps {
  clips: HeroVideoClip[];
  poster?: string;
  delayMs?: number;
  clipDurationMs?: number;
  fadeMs?: number;
  opacity?: number;
  className?: string;
}

export default function HeroVideoReel({
  clips,
  poster,
  delayMs = 300,
  clipDurationMs = 6500,
  fadeMs = 1500,
  opacity = 0.55,
  className,
}: HeroVideoReelProps) {
  const [armed, setArmed] = useState(false);
  const [active, setActive] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mqlMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqlWidth = window.matchMedia("(max-width: 640px)");
    setReduceMotion(mqlMotion.matches);
    setIsMobile(mqlWidth.matches);
    const onMotion = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    const onWidth = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mqlMotion.addEventListener("change", onMotion);
    mqlWidth.addEventListener("change", onWidth);
    return () => {
      mqlMotion.removeEventListener("change", onMotion);
      mqlWidth.removeEventListener("change", onWidth);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const t = window.setTimeout(() => setArmed(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs, reduceMotion]);

  useEffect(() => {
    if (!armed || reduceMotion || clips.length === 0) return;
    const v = videoRefs.current[active];
    if (v) {
      try {
        v.currentTime = 0;
      } catch {
        /* noop */
      }
      v.play().catch(() => {
        /* autoplay blocked */
      });
    }
    const t = window.setTimeout(() => {
      setActive((i) => (i + 1) % clips.length);
    }, clipDurationMs);
    return () => window.clearTimeout(t);
  }, [armed, active, clips.length, clipDurationMs, reduceMotion]);

  useEffect(() => {
    const timers: number[] = [];
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i !== active) {
        const id = window.setTimeout(() => {
          try {
            v.pause();
          } catch {
            /* noop */
          }
        }, fadeMs + 100);
        timers.push(id);
      }
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [active, fadeMs]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      videoRefs.current.forEach((v, i) => {
        if (!v) return;
        if (document.hidden) {
          try {
            v.pause();
          } catch {
            /* noop */
          }
        } else if (i === active && armed && !reduceMotion) {
          v.play().catch(() => {
            /* noop */
          });
        }
      });
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [active, armed, reduceMotion]);

  if (clips.length === 0) {
    return null;
  }

  if (reduceMotion) {
    return (
      <div
        aria-hidden
        className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_45%,rgba(0,245,212,0.10),transparent_70%),linear-gradient(180deg,#0A0A0A_0%,#0E1414_50%,#0A0A0A_100%)]" />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ""}`}
    >
      {clips.map((c, i) => {
        const src = isMobile && c.mobile ? c.mobile : c.desktop;
        return (
          <video
            key={src}
            ref={(el) => {
              videoRefs.current[i] = el;
            }}
            src={src}
            poster={poster}
            muted
            autoPlay
            playsInline
            // eslint-disable-next-line react/no-unknown-property
            disablePictureInPicture
            preload={i === 0 ? "auto" : armed ? "auto" : "metadata"}
            className="absolute inset-0 h-full w-full object-cover will-change-[opacity]"
            style={{
              opacity: armed && active === i ? opacity : 0,
              transition: `opacity ${fadeMs}ms ease-in-out`,
              filter: "brightness(1.2) contrast(1.03) saturate(1.05)",
            }}
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/65 via-[#0A0A0A]/35 to-[#0A0A0A]/55" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent,rgba(10,10,10,0.45))]" />
      {/* Bottom fade so the hero blends into the next section instead of cutting off */}
      <div className="absolute inset-x-0 bottom-0 h-20 sm:h-56 bg-gradient-to-b from-transparent to-[#0A0A0A]" />
    </div>
  );
}
