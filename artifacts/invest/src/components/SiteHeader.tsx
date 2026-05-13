import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ChevronDown } from "lucide-react";
import { Wordmark } from "@/components/brand";

export type HeaderNavLink = {
  href: string;
  label: string;
  active?: boolean;
  external?: boolean;
  testId?: string;
  /** If set, renders as a dropdown menu instead of a direct link. */
  children?: Array<Omit<HeaderNavLink, "children">>;
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
                if (l.children && l.children.length > 0) {
                  return <NavDropdown key={l.label} link={l} />;
                }
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
                ? "inline-flex items-center justify-center rounded-full h-9 px-5 teal-btn text-sm"
                : "inline-flex items-center justify-center rounded-full h-9 px-5 glass-btn text-sm font-medium";
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

function NavDropdown({ link }: { link: HeaderNavLink }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);
  const triggerCls = `inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full transition ${
    link.active
      ? "text-white bg-white/[0.06]"
      : "text-white/65 hover:text-white hover:bg-white/[0.04]"
  }`;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={triggerCls}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid={link.testId}
      >
        {link.label}
        <ChevronDown className={`w-3.5 h-3.5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full mt-2 min-w-[180px] rounded-xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl p-1.5 shadow-2xl shadow-black/50 z-50"
        >
          {link.children!.map((c) => {
            const itemCls = `block px-3 py-2 rounded-lg text-sm transition ${
              c.active
                ? "text-white bg-white/[0.06]"
                : "text-white/75 hover:text-white hover:bg-white/[0.04]"
            }`;
            if (c.external) {
              return (
                <a
                  key={c.href + c.label}
                  href={c.href}
                  className={itemCls}
                  data-testid={c.testId}
                  onClick={() => setOpen(false)}
                >
                  {c.label}
                </a>
              );
            }
            return (
              <Link
                key={c.href + c.label}
                href={c.href}
                className={itemCls}
                data-testid={c.testId}
                onClick={() => setOpen(false)}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
