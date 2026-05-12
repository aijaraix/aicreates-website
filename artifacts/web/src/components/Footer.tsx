import { Link } from "wouter";

const COLUMNS: { heading: string; links: { name: string; href: string }[] }[] = [
  {
    heading: "Products",
    links: [
      { name: "Eve OS", href: "/eve-os" },
      { name: "NeoBank", href: "/neobank" },
      { name: "Token", href: "/token" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { name: "For Business", href: "/business" },
      { name: "For Developers", href: "/developers" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { name: "Litepaper", href: "/litepaper" },
      { name: "Roadmap", href: "/roadmap" },
      { name: "FAQ", href: "/faq" },
      { name: "Press", href: "/press" },
    ],
  },
  {
    heading: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Invest", href: "/invest" },
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] relative border-t border-white/5 pt-20 pb-10 mt-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] shadow-[0_0_10px_rgba(0,245,212,0.6)]" />
              <span className="font-sans font-semibold tracking-tight text-white text-lg leading-none">
                <span className="text-[#00F5D4]">AI</span>
                <span className="font-light">creates</span>
                <span className="text-[#00F5D4]">AI</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-6">
              Building the agentic intelligence layer for the next generation of companies, capital, and consumers.
            </p>
            <a
              href="https://x.com/theaicreatesai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AIcreatesAI on X"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#00F5D4] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.6)]" />
              @theaicreatesai
            </a>
          </div>

          {/* Link columns */}
          {COLUMNS.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-white/30 text-xs tracking-wide">
            © 2026 AIcreatesAI. All rights reserved.
          </p>
          <p className="text-white/30 text-xs tracking-wide">
            Engineered for the agentic era.
          </p>
        </div>
      </div>
    </footer>
  );
}
