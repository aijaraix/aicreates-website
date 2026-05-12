import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { LogOut, Menu, X } from "lucide-react";
import SiteHeader, { type HeaderNavLink } from "@/components/SiteHeader";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invest", label: "Invest" },
  { href: "/documents", label: "Documents" },
  { href: "/faq", label: "FAQ" },
];

export default function PortalNav({ showAdmin }: { showAdmin?: boolean }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? location === "/dashboard"
      : location.startsWith(href);

  const navLinks: HeaderNavLink[] = NAV_LINKS.map((l) => ({
    href: l.href,
    label: l.label,
    active: isActive(l.href),
    testId: `nav-link-${l.href.slice(1)}`,
  }));

  return (
    <>
      <SiteHeader
        homeHref="/dashboard"
        homeTestId="link-portal-home"
        sticky
        navLinks={navLinks}
        rightSlot={
          <>
            <a
              href="https://www.aicreates.ai/litepaper"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center justify-center rounded-full h-9 px-5 border border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] text-sm font-medium transition"
              data-testid="link-portal-litepaper"
            >
              Litepaper
            </a>
            {showAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center justify-center rounded-full h-9 px-5 border border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] text-sm font-medium transition"
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
              className="hidden md:inline-flex items-center justify-center gap-1.5 rounded-full h-9 px-5 border border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] text-sm font-medium transition"
              data-testid="button-signout"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/15 bg-white/[0.02] hover:bg-white/[0.06]"
              aria-label="Open menu"
              data-testid="button-mobile-menu"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </>
        }
      />

      {open && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl sticky top-[64px] z-30">
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2.5 rounded-xl text-sm transition ${
                  isActive(l.href)
                    ? "text-white bg-white/[0.06]"
                    : "text-white/70 hover:bg-white/[0.04]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {showAdmin && (
              <Link
                href="/admin"
                className="px-3 py-2.5 rounded-xl text-sm text-white hover:bg-white/[0.04]"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.02] hover:bg-white/[0.06] text-xs"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
