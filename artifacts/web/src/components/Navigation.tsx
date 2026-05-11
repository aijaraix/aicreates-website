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

const PRODUCT_LINKS = [
  { name: "Eve OS", path: "/eve-os", desc: "The Agentic Business Operating System" },
  { name: "NeoBank", path: "/neobank", desc: "Capital that thinks" },
];

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Litepaper", path: "/litepaper" },
  { name: "Invest", path: "/invest" },
  { name: "Contact", path: "/contact" },
];

function Wordmark({ size = "md" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "text-base" : "text-lg";
  return (
    <span className={`font-sans font-semibold tracking-tight text-white ${cls} leading-none`}>
      <span className="text-[hsl(168_100%_48%)]">AI</span>
      <span className="font-light">creates</span>
      <span className="text-[hsl(168_100%_48%)]">AI</span>
    </span>
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

  const productsActive = PRODUCT_LINKS.some((l) => l.path === location);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-2.5 h-2.5 rounded-full bg-[#00F5D4] shadow-[0_0_12px_rgba(0,245,212,0.7)]" />
          <Wordmark />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/">
            <span
              className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                location === "/"
                  ? "text-white bg-white/[0.06]"
                  : "text-white/60 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              Home
            </span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`relative inline-flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors rounded-full focus:outline-none ${
                  productsActive
                    ? "text-white bg-white/[0.06]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                }`}
                data-testid="nav-products"
              >
                Products
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={10}
              className="w-72 bg-[#0E0E0E]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            >
              {PRODUCT_LINKS.map((p) => (
                <DropdownMenuItem
                  key={p.path}
                  className="rounded-xl focus:bg-white/[0.06] focus:text-white p-0"
                >
                  <Link
                    href={p.path}
                    className="flex flex-col gap-0.5 px-4 py-3 cursor-pointer w-full"
                  >
                    <span className="text-sm font-semibold text-white">{p.name}</span>
                    <span className="text-xs text-white/50">{p.desc}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {NAV_LINKS.filter((l) => l.path !== "/").map((link) => {
            const active = location === link.path;
            return (
              <Link key={link.path} href={link.path}>
                <span
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                    active
                      ? "text-white bg-white/[0.06]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/contact" className="hidden md:block">
            <Button
              size="sm"
              className="rounded-full h-9 px-5 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium"
            >
              Engage
            </Button>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0A0A0A] border-l border-white/5 w-[300px] p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2.5 mb-12">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00F5D4]" />
                  <Wordmark />
                </div>

                <nav className="flex flex-col gap-1">
                  <Link href="/" onClick={() => setOpen(false)}>
                    <span
                      className={`block px-3 py-3 rounded-lg text-base font-medium ${
                        location === "/" ? "text-white bg-white/[0.06]" : "text-white/70"
                      }`}
                    >
                      Home
                    </span>
                  </Link>

                  <div className="px-3 pt-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    Products
                  </div>
                  {PRODUCT_LINKS.map((p) => (
                    <Link key={p.path} href={p.path} onClick={() => setOpen(false)}>
                      <span
                        className={`block px-3 py-3 rounded-lg text-base font-medium ${
                          location === p.path ? "text-white bg-white/[0.06]" : "text-white/70"
                        }`}
                      >
                        {p.name}
                      </span>
                    </Link>
                  ))}

                  <div className="h-2" />

                  {NAV_LINKS.filter((l) => l.path !== "/").map((link) => {
                    const active = location === link.path;
                    return (
                      <Link key={link.path} href={link.path} onClick={() => setOpen(false)}>
                        <span
                          className={`block px-3 py-3 rounded-lg text-base font-medium ${
                            active ? "text-white bg-white/[0.06]" : "text-white/70"
                          }`}
                        >
                          {link.name}
                        </span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto pt-10">
                  <Link href="/contact" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-full bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90">
                      Engage
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
