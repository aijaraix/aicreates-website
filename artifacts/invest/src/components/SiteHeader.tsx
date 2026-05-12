import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Wordmark } from "@/components/brand";

export type HeaderNavLink = {
  href: string;
  label: string;
  active?: boolean;
  external?: boolean;
  testId?: string;
};

export type HeaderCta = {
  href: string;
  label: string;
  variant: "primary" | "outline";
  testId?: string;
  external?: boolean;
};

export default function SiteHeader({
  homeHref = "/",
  homeExternal = false,
  homeTestId,
  navLinks = [],
  ctas = [],
  rightSlot,
  sticky = false,
}: {
  homeHref?: string;
  homeExternal?: boolean;
  homeTestId?: string;
  navLinks?: HeaderNavLink[];
  ctas?: HeaderCta[];
  rightSlot?: React.ReactNode;
  sticky?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sticky]);

  const wrapperCls = sticky
    ? `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 py-3"
          : "bg-transparent py-5 border-b border-transparent"
      }`
    : "py-5 border-b border-white/5 relative z-20";

  const homeInner = <Wordmark />;

  return (
    <header className={wrapperCls}>
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 lg:gap-6">
          {homeExternal ? (
            <a
              href={homeHref}
              className="inline-flex items-center"
              data-testid={homeTestId}
            >
              {homeInner}
            </a>
          ) : (
            <Link
              href={homeHref}
              className="inline-flex items-center"
              data-testid={homeTestId}
            >
              {homeInner}
            </Link>
          )}

          {navLinks.length > 0 && (
            <nav className="hidden md:flex items-center gap-1 text-sm">
              {navLinks.map((l) => {
                const cls = `px-3.5 py-1.5 rounded-full transition ${
                  l.active
                    ? "text-white bg-white/[0.06]"
                    : "text-white/65 hover:text-white hover:bg-white/[0.04]"
                }`;
                if (l.external) {
                  return (
                    <a
                      key={l.href + l.label}
                      href={l.href}
                      className={cls}
                      data-testid={l.testId}
                    >
                      {l.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={l.href + l.label}
                    href={l.href}
                    className={cls}
                    data-testid={l.testId}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          {ctas.map((c) => {
            const cls =
              c.variant === "primary"
                ? "inline-flex items-center justify-center rounded-full h-9 px-5 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 text-sm font-medium transition"
                : "inline-flex items-center justify-center rounded-full h-9 px-5 border border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] text-sm font-medium transition";
            if (c.external) {
              return (
                <a
                  key={c.href + c.label}
                  href={c.href}
                  className={cls}
                  data-testid={c.testId}
                >
                  {c.label}
                </a>
              );
            }
            return (
              <Link
                key={c.href + c.label}
                href={c.href}
                className={cls}
                data-testid={c.testId}
              >
                {c.label}
              </Link>
            );
          })}
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
