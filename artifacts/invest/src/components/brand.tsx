import * as React from "react";

type Div = React.HTMLAttributes<HTMLDivElement>;

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

/* ---------------- BrandCard ---------------- */
export function BrandCard({
  className,
  hairline = false,
  glow = false,
  ...rest
}: Div & { hairline?: boolean; glow?: boolean }) {
  return (
    <div
      {...rest}
      className={cx(
        glow ? "brand-card-teal" : "brand-card",
        hairline && "brand-hairline-teal",
        className,
      )}
    />
  );
}

/* ---------------- StatTile ---------------- */
export function StatTile({
  label,
  value,
  hint,
  accent = false,
  className,
  testId,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  hint?: React.ReactNode;
  accent?: boolean;
  className?: string;
  testId?: string;
}) {
  return (
    <BrandCard
      hairline
      className={cx("p-5 md:p-6", className)}
      data-testid={testId}
    >
      <div className="text-[11px] uppercase tracking-[0.16em] text-white/50 font-medium">
        {label}
      </div>
      <div
        className={cx(
          "mt-2 font-display text-2xl md:text-3xl tracking-tight font-semibold",
          accent ? "text-gradient-teal" : "text-white",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1.5 text-xs text-white/45">{hint}</div>
      ) : null}
    </BrandCard>
  );
}

/* ---------------- BrandButton ---------------- */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
};
export function BrandButton({
  variant = "primary",
  className,
  ...rest
}: ButtonProps) {
  const base =
    variant === "primary"
      ? "brand-cta"
      : variant === "outline"
        ? "brand-cta-outline"
        : "inline-flex items-center justify-center h-11 px-5 rounded-full text-white/70 hover:text-white transition-colors";
  return <button {...rest} className={cx(base, className)} />;
}

/* ---------------- BrandInput ---------------- */
export const BrandInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function BrandInput({ className, ...rest }, ref) {
  return <input ref={ref} {...rest} className={cx("brand-input", className)} />;
});

/* ---------------- BrandBadge ---------------- */
export function BrandBadge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: "neutral" | "teal" | "amber" | "rose" | "emerald";
  className?: string;
  children: React.ReactNode;
}) {
  const palette: Record<string, string> = {
    neutral: "border-white/15 bg-white/[0.04] text-white/75",
    teal: "border-[#00F5D4]/40 bg-[#00F5D4]/10 text-[#00F5D4]",
    amber: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    rose: "border-rose-400/40 bg-rose-400/10 text-rose-300",
    emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium uppercase tracking-[0.12em]",
        palette[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Wordmark (matches main site exactly) ----------------
   Main site Navigation.tsx renders:
     small teal dot + "AI"(teal) + "creates"(light) + "AI"(teal),
     font-sans (Inter) font-semibold tracking-tight text-white text-lg.
   Use this everywhere in the portal (PortalNav, AuthShell, Home header)
   so the wordmark is byte-identical to the marketing site. */
export function Wordmark({
  size = "md",
  withDot = true,
}: {
  size?: "sm" | "md";
  withDot?: boolean;
}) {
  const cls = size === "sm" ? "text-base" : "text-lg";
  return (
    <span className="inline-flex items-center gap-2.5">
      {withDot && (
        <span className="relative w-2.5 h-2.5 rounded-full bg-[#00F5D4] shadow-[0_0_12px_rgba(0,245,212,0.7)]" />
      )}
      <span
        className={cx(
          "font-sans font-semibold tracking-tight text-white leading-none",
          cls,
        )}
      >
        <span className="text-[#00F5D4]">AI</span>
        <span className="font-light">creates</span>
        <span className="text-[#00F5D4]">AI</span>
      </span>
    </span>
  );
}

/* ---------------- SectionLabel (matches main site SectionLabel) ----------------
   Neutral pill with a tiny teal dot - white/10 border, white/[0.02] bg,
   uppercase white/70 text. Use it for hero eyebrows on every portal page. */
export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]",
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
        {children}
      </span>
    </div>
  );
}

/* ---------------- BrandTable ---------------- */
export function BrandTable({
  className,
  ...rest
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="brand-card overflow-hidden">
      <table
        {...rest}
        className={cx("w-full text-sm text-left", className)}
      />
    </div>
  );
}
export function BrandTHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="text-[11px] uppercase tracking-[0.14em] text-white/45 bg-white/[0.02] border-b border-white/5">
      {children}
    </thead>
  );
}
export function BrandTRow({
  className,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...rest} className={cx("brand-table-row", className)} />;
}
