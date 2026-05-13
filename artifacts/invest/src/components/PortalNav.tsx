import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { ChevronDown, FileText, LogOut, Menu, User as UserIcon, X } from "lucide-react";
import SiteHeader, { type HeaderNavLink } from "@/components/SiteHeader";

const PRIMARY_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
];

const INFO_LINKS = [
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

  const infoActive = INFO_LINKS.some((l) => isActive(l.href));

  const navLinks: HeaderNavLink[] = [
    ...PRIMARY_LINKS.map((l) => ({
      href: l.href,
      label: l.label,
      active: isActive(l.href),
      testId: `nav-link-${l.href.slice(1)}`,
    })),
    {
      href: "#info",
      label: "Info",
      active: infoActive,
      testId: "nav-link-info",
      children: INFO_LINKS.map((l) => ({
        href: l.href,
        label: l.label,
        active: isActive(l.href),
        testId: `nav-link-${l.href.slice(1)}`,
      })),
    },
  ];

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const displayName =
    user?.firstName ||
    user?.username ||
    (email ? email.split("@")[0] : "Account");

  return (
    <>
      <SiteHeader
        homeHref="https://www.aicreates.ai"
        homeExternal
        homeTestId="link-portal-home"
        sticky
        navLinks={navLinks}
        rightSlot={
          <>
            {showAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center justify-center rounded-full h-9 px-5 glass-btn text-sm font-medium"
                data-testid="link-admin"
              >
                Admin
              </Link>
            )}
            <UserMenu
              name={displayName}
              email={email}
              onSignOut={() => signOut({ redirectUrl: window.location.origin })}
            />
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full glass-btn"
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
            {[...PRIMARY_LINKS, ...INFO_LINKS].map((l) => (
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
                {email}
              </span>
              <button
                onClick={() => signOut({ redirectUrl: window.location.origin })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-btn text-xs"
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

function UserMenu({
  name,
  email,
  onSignOut,
}: {
  name: string;
  email: string;
  onSignOut: () => void;
}) {
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
  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 h-9 px-4 rounded-full glass-btn text-sm font-medium max-w-[220px]"
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid="button-user-menu"
      >
        <UserIcon className="w-3.5 h-3.5 text-[#00F5D4] shrink-0" />
        <span className="truncate">{name}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[240px] rounded-xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl p-1.5 shadow-2xl shadow-black/50 z-50"
        >
          <div className="px-3 py-2.5 border-b border-white/5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
              Signed in as
            </div>
            <div className="mt-0.5 text-xs font-mono text-white/85 truncate">
              {email || "—"}
            </div>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/[0.04]"
            onClick={() => setOpen(false)}
            data-testid="user-menu-profile"
          >
            <UserIcon className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <Link
            href="/documents"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/[0.04]"
            onClick={() => setOpen(false)}
            data-testid="user-menu-documents"
          >
            <FileText className="w-3.5 h-3.5" /> My Documents
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/[0.04]"
            data-testid="button-signout"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
