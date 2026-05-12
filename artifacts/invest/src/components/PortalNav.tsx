import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { LogOut, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invest", label: "Invest" },
  { href: "/documents", label: "Documents" },
  { href: "/faq", label: "FAQ" },
];

export default function PortalNav({
  showAdmin,
}: {
  showAdmin?: boolean;
}) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? location === "/dashboard"
      : location.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? "bg-[#0A0A0A]/75 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 h-16 flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          data-testid="link-portal-home"
        >
          <span className="relative flex h-7 w-7 items-center justify-center rounded-md border border-[#00F5D4]/40 bg-[#00F5D4]/10">
            <span className="absolute inset-0 rounded-md bg-[#00F5D4]/20 blur-md opacity-50 group-hover:opacity-80 transition" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_10px_rgba(0,245,212,0.9)]" />
          </span>
          <span className="font-display font-semibold tracking-tight text-base sm:text-lg">
            AI<span className="text-[#00F5D4]">creates</span>AI
          </span>
          <span className="hidden sm:inline-flex ml-2 px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">
            Portal
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3.5 py-1.5 rounded-full transition ${
                isActive(l.href)
                  ? "text-[#00F5D4] bg-[#00F5D4]/10 ring-1 ring-inset ring-[#00F5D4]/20"
                  : "text-white/65 hover:text-white hover:bg-white/[0.04]"
              }`}
              data-testid={`nav-link-${l.href.slice(1)}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-sm">
          {showAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex px-3 py-1.5 rounded-full border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4]/10 transition"
              data-testid="link-admin"
            >
              Admin
            </Link>
          )}
          <span className="hidden lg:block text-white/55 text-xs font-mono truncate max-w-[180px]">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
          <button
            onClick={() => signOut({ redirectUrl: window.location.origin })}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/[0.04] transition"
            data-testid="button-signout"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/10 hover:bg-white/[0.04]"
            aria-label="Open menu"
            data-testid="button-mobile-menu"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl">
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2.5 rounded-xl text-sm transition ${
                  isActive(l.href)
                    ? "text-[#00F5D4] bg-[#00F5D4]/10"
                    : "text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {showAdmin && (
              <Link
                href="/admin"
                className="px-3 py-2.5 rounded-xl text-sm text-[#00F5D4] hover:bg-[#00F5D4]/10"
              >
                Admin
              </Link>
            )}
            <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/50 font-mono truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
              <button
                onClick={() => signOut({ redirectUrl: window.location.origin })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/[0.04] text-xs"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
