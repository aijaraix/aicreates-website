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
import wordmark from "@/assets/aica-wordmark.png";

type LinkItem = { name: string; path: string; desc: string; external?: boolean };

const PRODUCT_LINKS: LinkItem[] = [
  { name: "Eve OS", path: "/eve-os", desc: "The Agentic Business Operating System" },
  { name: "NeoBank", path: "/neobank", desc: "Capital that thinks" },
];

const SOLUTION_LINKS: LinkItem[] = [
  { name: "For Business", path: "/business", desc: "Operate like a much larger company" },
  { name: "For Developers", path: "/developers", desc: "Build on the agentic primitives" },
];

const RESOURCE_LINKS: LinkItem[] = [
  { name: "Litepaper", path: "/litepaper", desc: "Positioning, architecture, and tokenomics" },
  { name: "Roadmap", path: "/roadmap", desc: "Phased path from product-market fit to scale" },
  { name: "FAQ", path: "/faq", desc: "Common questions, answered" },
  { name: "Press", path: "/press", desc: "Coverage, mentions, and brand assets" },
];

const COMPANY_LINKS: LinkItem[] = [
  { name: "About", path: "/about", desc: "Platform, agents, and Company in a Box" },
  { name: "Contact", path: "/contact", desc: "Get in touch with the team" },
  { name: "Token", path: "/token", desc: "$AICA - the native asset of the layer" },
  { name: "Opportunity", path: "/opportunity", desc: "Investor opportunity and materials" },
  {
    name: "Ambassadors",
    path: "https://invest.aicreates.ai/genesis",
    desc: "Genesis referral program - earn $AICA for warm intros",
    external: true,
  },
];

function Wordmark({ size = "md" }: { size?: "sm" | "md" }) {
  const iconCls = size === "sm" ? "h-4 w-auto shrink-0" : "h-[19px] w-auto shrink-0";
  const textCls = size === "sm" ? "h-[10px] w-auto" : "h-[13px] w-auto";
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark className={iconCls} />
      <img
        src={wordmark}
        alt="AIcreatesAI"
        draggable={false}
        decoding="async"
        loading="eager"
        className={textCls}
      />
    </span>
  );
}

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
            {p.external ? (
              <a
                href={p.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-0.5 px-4 py-3 cursor-pointer w-full"
                data-testid={`link-nav-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span className="text-sm font-semibold text-white">{p.name}</span>
                <span className="text-xs text-white/50">{p.desc}</span>
              </a>
            ) : (
              <Link href={p.path} className="flex flex-col gap-0.5 px-4 py-3 cursor-pointer w-full">
                <span className="text-sm font-semibold text-white">{p.name}</span>
                <span className="text-xs text-white/50">{p.desc}</span>
              </Link>
            )}
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
  const [openGroup, setOpenGroup] = useState<string | null>(null);

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
              href={import.meta.env.PROD ? "https://invest.aicreates.ai/invest/" : "/invest/"}
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
            <SheetContent side="right" className="bg-[#0A0A0A] border-l border-white/5 w-screen max-w-none sm:max-w-none p-5 h-[100dvh] overflow-hidden">
              <div className="flex flex-col h-full min-h-0">
                <div className="flex items-center gap-2.5 mb-5 shrink-0">
                  <Wordmark />
                </div>

                <nav className="flex-1 min-h-0 flex flex-col gap-1 overflow-y-auto">
                  {[
                    { header: "Products", items: PRODUCT_LINKS },
                    { header: "Solutions", items: SOLUTION_LINKS },
                    { header: "Resources", items: RESOURCE_LINKS },
                    { header: "Company", items: COMPANY_LINKS },
                  ].map((group) => {
                    const isOpen = openGroup === group.header;
                    const hasActive = group.items.some((p) => !p.external && p.path === location);
                    return (
                      <div
                        key={group.header}
                        className="rounded-xl overflow-hidden flex flex-col shrink-0"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenGroup(isOpen ? null : group.header)
                          }
                          className={`shrink-0 w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-colors ${
                            isOpen || hasActive
                              ? "bg-white/[0.06] text-white"
                              : "text-white/80 hover:bg-white/[0.03]"
                          }`}
                          aria-expanded={isOpen}
                          data-testid={`button-mobile-group-${group.header.toLowerCase()}`}
                        >
                          <span className="text-base font-semibold tracking-tight">
                            {group.header}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 opacity-70 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="pl-3 pr-1 py-1 flex flex-col">
                            {group.items.map((p) =>
                              p.external ? (
                                <a
                                  key={p.path}
                                  href={p.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setOpen(false)}
                                  data-testid={`link-mobile-nav-${p.name.toLowerCase().replace(/\s+/g, "-")}`}
                                  className="flex items-center px-4 py-2 rounded-lg text-base text-white/75 hover:text-white hover:bg-white/[0.04]"
                                >
                                  {p.name}
                                </a>
                              ) : (
                                <Link
                                  key={p.path}
                                  href={p.path}
                                  onClick={() => setOpen(false)}
                                >
                                  <span
                                    className={`flex items-center px-4 py-2 rounded-lg text-base cursor-pointer ${
                                      location === p.path
                                        ? "text-white bg-white/[0.06]"
                                        : "text-white/75 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                                  >
                                    {p.name}
                                  </span>
                                </Link>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>

                <div className="shrink-0 mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                  <Link href="/litepaper" onClick={() => setOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-10 glass-btn text-sm"
                      data-testid="button-mobile-nav-litepaper"
                    >
                      Litepaper
                    </Button>
                  </Link>
                  <a
                    href={import.meta.env.PROD ? "https://invest.aicreates.ai/invest/" : "/invest/"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      className="w-full rounded-full h-10 teal-btn text-sm"
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
