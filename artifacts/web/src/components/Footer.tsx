import { Link } from "wouter";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] relative border-t border-white/5 pt-20 pb-10 mt-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] shadow-[0_0_10px_rgba(0,245,212,0.6)]" />
              <span className="font-sans font-semibold tracking-tight text-white text-lg leading-none">
                <span className="text-[#00F5D4]">AI</span>
                <span className="font-light">creates</span>
                <span className="text-[#00F5D4]">AI</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-sm">
              Building the agentic intelligence layer for the next generation of companies, capital, and consumers.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/eve-os"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Eve OS</span></Link></li>
              <li><Link href="/neobank"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">NeoBank</span></Link></li>
              <li><Link href="/litepaper"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Litepaper</span></Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Privacy</span></Link></li>
              <li><Link href="/terms"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Terms</span></Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">Connect</h4>
            <div className="flex flex-col gap-4">
              <Link href="/contact" className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors">
                Contact
              </Link>
              <a
                href="https://x.com/theaicreatesai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AIcreatesAI on X"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#00F5D4] transition-colors group"
              >
                <span className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#00F5D4]/40 transition-colors">
                  <XIcon className="w-4 h-4" />
                </span>
                @theaicreatesai
              </a>
            </div>
          </div>
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
