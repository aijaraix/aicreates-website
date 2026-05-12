import { Link } from "wouter";
import { Wordmark } from "@/components/brand";

const COLUMNS: {
  heading: string;
  links: { name: string; href: string; external?: boolean }[];
}[] = [
  {
    heading: "Portal",
    links: [
      { name: "Sign in", href: "/sign-in" },
      { name: "Reserve allocation", href: "/sign-up" },
      { name: "Documents", href: "/documents" },
      { name: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "Round",
    links: [
      { name: "Strategic Seed Round", href: "/" },
      { name: "Why invest", href: "/#why" },
      { name: "Vesting", href: "/#vesting" },
      { name: "Data center", href: "/#data-center" },
    ],
  },
  {
    heading: "Resources",
    links: [
      {
        name: "Litepaper",
        href: "https://www.aicreates.ai/litepaper",
        external: true,
      },
      {
        name: "Eve OS",
        href: "https://www.aicreates.ai/eve-os",
        external: true,
      },
      {
        name: "NeoBank",
        href: "https://www.aicreates.ai/neobank",
        external: true,
      },
    ],
  },
  {
    heading: "Company",
    links: [
      {
        name: "About",
        href: "https://www.aicreates.ai/about",
        external: true,
      },
      {
        name: "Contact",
        href: "https://www.aicreates.ai/contact",
        external: true,
      },
      {
        name: "Privacy",
        href: "https://www.aicreates.ai/privacy",
        external: true,
      },
      {
        name: "Terms",
        href: "https://www.aicreates.ai/terms",
        external: true,
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="bg-[#0A0A0A] relative border-t border-white/5 pt-20 pb-10 mt-24"
      data-testid="footer"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-12 mb-16">
          <div className="col-span-2 md:col-span-4">
            <a
              href="https://www.aicreates.ai"
              className="inline-flex items-center mb-5"
              data-testid="link-footer-home"
            >
              <Wordmark />
            </a>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-6">
              The AIcreatesAI investor portal. Reserve, sign, fund, and track
              your allocation in the agentic intelligence layer.
            </p>
            <a
              href="https://x.com/theaicreatesai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AIcreatesAI on X"
              className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#00F5D4] transition-colors"
              data-testid="link-footer-x"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.6)]" />
              @theaicreatesai
            </a>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) =>
                  link.external ? (
                    <li key={link.href + link.name}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ) : (
                    <li key={link.href + link.name}>
                      <Link href={link.href}>
                        <span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 space-y-4">
          <p className="text-white/40 text-xs leading-relaxed">
            This page describes a Founders Commitment workflow and is not an
            offer to sell securities or solicitation of an offer to buy
            securities. SAFT terms are draft pending counsel review. AICA
            tokens, when issued, will be utility tokens for consumptive use
            within the AIcreatesAI ecosystem and are subject to vesting and
            jurisdictional restrictions.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-white/30 text-xs tracking-wide">
              © {new Date().getFullYear()} AIcreatesAI. All rights reserved.
            </p>
            <p className="text-white/30 text-xs tracking-wide">
              Engineered for the agentic era.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
