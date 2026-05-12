import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  back?: { href: string; label?: string };
  actions?: ReactNode;
  align?: "left" | "center";
  size?: "default" | "compact";
}

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  back,
  actions,
  align = "left",
  size = "default",
}: PageHeaderProps) {
  const isCenter = align === "center";
  const isCompact = size === "compact";
  return (
    <div className="relative isolate">
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 h-[260px] glow-radial-teal -z-10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 -top-20 h-[320px] bg-grid-fade -z-10"
        aria-hidden
      />
      <div
        className={`mx-auto max-w-6xl px-6 md:px-10 ${
          isCompact ? "pt-8 md:pt-10 pb-6" : "pt-12 md:pt-16 pb-8 md:pb-10"
        }`}
      >
        {back && (
          <Link
            href={back.href}
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-6 transition"
            data-testid="link-page-back"
          >
            <ArrowLeft className="w-4 h-4" />
            {back.label ?? "Back"}
          </Link>
        )}
        <div
          className={`flex flex-wrap items-end justify-between gap-6 ${
            isCenter ? "flex-col items-center text-center" : ""
          }`}
        >
          <div className={isCenter ? "max-w-2xl" : "max-w-3xl"}>
            {eyebrow && (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00F5D4]/30 bg-[#00F5D4]/5 mb-5 ${
                  isCenter ? "" : ""
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#00F5D4]">
                  {eyebrow}
                </span>
              </div>
            )}
            <h1
              className={`font-display font-semibold tracking-tight ${
                isCompact
                  ? "text-3xl sm:text-4xl"
                  : "text-4xl sm:text-5xl md:text-[3.5rem] leading-[1.05]"
              } text-gradient-teal`}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className={`mt-4 text-white/60 ${
                  isCompact ? "text-base" : "text-base md:text-lg"
                } max-w-2xl ${isCenter ? "mx-auto" : ""}`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
      </div>
      <div className="border-b border-white/5" />
    </div>
  );
}
