import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Company in a Box", path: "/company-in-a-box" },
  { name: "NeoBank", path: "/neobank" },
  { name: "Litepaper", path: "/litepaper" },
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
          {NAV_LINKS.map((link) => {
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
                  {NAV_LINKS.map((link) => {
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
