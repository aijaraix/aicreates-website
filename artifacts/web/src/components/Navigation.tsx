import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogoMark } from "./LogoMark";

const PRODUCT_LINKS = [
  { name: "Eve OS", path: "/eve-os", desc: "The Agentic Business Operating System" },
  { name: "NeoBank", path: "/neobank", desc: "Capital that thinks" },
];

const SOLUTION_LINKS = [
  { name: "For Business", path: "/business", desc: "Operate like a much larger company" },
  { name: "For Developers", path: "/developers", desc: "Build on the agentic primitives" },
];

const RESOURCE_LINKS = [
  { name: "Litepaper", path: "/litepaper", desc: "Positioning, architecture, and tokenomics" },
  { name: "Roadmap", path: "/roadmap", desc: "Phased path from product-market fit to scale" },
  { name: "FAQ", path: "/faq", desc: "Common questions, answered" },
  { name: "Press", path: "/press", desc: "Coverage, mentions, and brand assets" },
];

const COMPANY_LINKS = [
  { name: "About", path: "/about", desc: "Platform, agents, and Company in a Box" },
  { name: "Contact", path: "/contact", desc: "Get in touch with the team" },
  { name: "Token", path: "/token", desc: "$AICA - the native asset of the layer" },
  { name: "Opportunity", path: "/invest", desc: "Investor opportunity and materials" },
];

function Wordmark({ size = "md" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "text-base" : "text-lg";
  const iconCls = size === "sm" ? "h-5 w-auto shrink-0" : "h-6 w-auto shrink-0";
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={iconCls} title="AIcreatesAI" />
      <span className={`font-sans font-semibold tracking-tight text-white ${cls} leading-none`}>
        <span className="text-[hsl(168_100%_48%)]">AI</span>
        <span className="font-light">creates</span>
        <span className="text-[hsl(168_100%_48%)]">AI</span>
      </span>
    </span>
  );
}

type LinkItem = { name: string; path: string; desc: string };

function NavDropdown({
  label,
  items,
  testId,
  location,
}: {
  label: string;
  items: LinkItem[];
  testId: string;
  location: string;
}) {
  const active = items.some((l) => l.path === location);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`relative inline-flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-full focus:outline-none ${
            active
              ? "text-white bg-white/[0.06]"
              : "text-white/60 hover:text-white hover:bg-white/[0.03]"
          }`}
          data-testid={testId}
        >
          {label}
          <ChevronDown className="w-3.5 h-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={10}
        className="w-72 bg-[#0E0E0E]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
      >
        {items.map((p) => (
          <DropdownMenuItem
            key={p.path}
            className="rounded-xl focus:bg-white/[0.06] focus:text-white p-0"
          >
            <Link href={p.path} className="flex flex-col gap-0.5 px-4 py-3 cursor-pointer w-full">
              <span className="text-sm font-semibold text-white">{p.name}</span>
              <span className="text-xs text-white/50">{p.desc}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navigation() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group" data-testid="link-home-logo">
            <Wordmark />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavDropdown label="Products" items={PRODUCT_LINKS} testId="nav-products" location={location} />
            <NavDropdown label="Solutions" items={SOLUTION_LINKS} testId="nav-solutions" location={location} />
            <NavDropdown label="Resources" items={RESOURCE_LINKS} testId="nav-resources" location={location} />
            <NavDropdown label="Company" items={COMPANY_LINKS} testId="nav-company" location={location} />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <Link href="/litepaper">
              <Button
                variant="outline"
                className="rounded-full h-9 px-5 glass-btn text-sm font-medium"
                data-testid="button-nav-litepaper"
              >
                Litepaper
              </Button>
            </Link>
            <a
              href={import.meta.env.PROD ? "https://invest.aicreates.ai/" : "/invest/"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="rounded-full h-9 px-5 teal-btn text-sm"
                data-testid="button-nav-portal"
              >
                Portal
              </Button>
            </a>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0A0A0A] border-l border-white/5 w-screen max-w-none sm:max-w-none p-6 overflow-y-auto">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2.5 mb-10">
                  <Wordmark />
                </div>

                <nav className="flex flex-col gap-1">
                  {[
                    { header: "Products", items: PRODUCT_LINKS },
                    { header: "Solutions", items: SOLUTION_LINKS },
                    { header: "Resources", items: RESOURCE_LINKS },
                    { header: "Company", items: COMPANY_LINKS },
                  ].map((group) => (
                    <div key={group.header}>
                      <div className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                        {group.header}
                      </div>
                      {group.items.map((p) => (
                        <Link key={p.path} href={p.path} onClick={() => setOpen(false)}>
                          <span
                            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                              location === p.path ? "text-white bg-white/[0.06]" : "text-white/70"
                            }`}
                          >
                            {p.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-2">
                  <Link href="/litepaper" onClick={() => setOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-11 glass-btn"
                      data-testid="button-mobile-nav-litepaper"
                    >
                      Litepaper
                    </Button>
                  </Link>
                  <a
                    href={import.meta.env.PROD ? "https://invest.aicreates.ai/" : "/invest/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      className="w-full rounded-full h-11 teal-btn"
                      data-testid="button-mobile-nav-portal"
                    >
                      Portal
                    </Button>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
