import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { motion } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Technology", path: "/technology" },
  ];
  
  const rightLinks = [
    { name: "Services", path: "/services" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(110,86,207,0.5)]">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          </div>
          <span className="font-sans font-extrabold text-xl tracking-tight text-white group-hover:text-white/90 transition-colors leading-none">
            <span className="bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">AI</span>
            <span className="font-medium">creates</span>
            <span className="bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.path}>
              <span
                className={`text-sm font-medium transition-colors hover:text-white relative py-1 ${
                  location === link.path ? "text-white" : "text-white/60"
                }`}
              >
                {link.name}
                {location === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </span>
            </Link>
          ))}

          {/* Products Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white transition-colors outline-none py-1">
              Products <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card border-white/10 bg-background/80 w-48 p-2 mt-2">
              <Link href="/products">
                <DropdownMenuItem className="cursor-pointer focus:bg-white/10 rounded-md p-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">Overview</span>
                    <span className="text-xs text-white/50">All products</span>
                  </div>
                </DropdownMenuItem>
              </Link>
              <div className="h-px bg-white/10 my-1 mx-2" />
              <Link href="/products/fin">
                <DropdownMenuItem className="cursor-pointer focus:bg-white/10 rounded-md p-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-white">Fin</span>
                    <span className="text-xs text-primary">Tokenized Neobank</span>
                  </div>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          {rightLinks.map((link) => (
            <Link key={link.name} href={link.path}>
              <span
                className={`text-sm font-medium transition-colors hover:text-white relative py-1 ${
                  location === link.path ? "text-white" : "text-white/60"
                }`}
              >
                {link.name}
                {location === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
              </span>
            </Link>
          ))}
        </nav>

        {/* CTA & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Link href="/contact" className="hidden md:block">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 transition-transform hover:scale-105">
              Contact Us
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass bg-background/95 border-white/10 w-[300px] p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-12">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-blue-600" />
                  <span className="font-sans font-extrabold text-lg text-white tracking-tight"><span className="bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">AI</span><span className="font-medium">creates</span><span className="bg-gradient-to-br from-violet-400 to-blue-400 bg-clip-text text-transparent">AI</span></span>
                </div>
                
                <nav className="flex flex-col gap-6">
                  {[...navLinks, { name: "Products Overview", path: "/products" }, { name: "Fin", path: "/products/fin" }, ...rightLinks].map((link) => (
                    <Link key={link.name} href={link.path}>
                      <span className={`text-lg font-medium ${location === link.path ? "text-white" : "text-white/60"}`}>
                        {link.name}
                      </span>
                    </Link>
                  ))}
                </nav>
                
                <div className="mt-auto pt-10">
                  <Link href="/contact">
                    <Button className="w-full bg-white text-black hover:bg-white/90 rounded-full">
                      Contact Us
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
