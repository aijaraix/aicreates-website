import { Link, useLocation } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { LogOut } from "lucide-react";

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
  return (
    <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-white/5 relative z-10 gap-4 flex-wrap">
      <Link
        href="/dashboard"
        className="font-semibold tracking-tight text-lg"
        style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
      >
        AI<span className="text-[#00F5D4]">creates</span>AI
        <span className="ml-2 text-xs text-white/40 uppercase tracking-[0.2em]">
          Portal
        </span>
      </Link>
      <nav className="hidden md:flex items-center gap-1 text-sm">
        {NAV_LINKS.map((l) => {
          const active =
            l.href === "/dashboard"
              ? location === "/dashboard"
              : location.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-full ${
                active
                  ? "text-[#00F5D4] bg-[#00F5D4]/10"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
              data-testid={`nav-link-${l.href.slice(1)}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center gap-3 text-sm">
        {showAdmin && (
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-full border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4]/10"
            data-testid="link-admin"
          >
            Admin
          </Link>
        )}
        <span className="text-white/60 hidden sm:block">
          {user?.primaryEmailAddress?.emailAddress}
        </span>
        <button
          onClick={() => signOut({ redirectUrl: window.location.origin })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/[0.04]"
          data-testid="button-signout"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    </header>
  );
}
