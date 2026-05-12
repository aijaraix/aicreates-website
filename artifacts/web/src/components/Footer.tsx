import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] relative border-t border-white/5 pt-20 pb-10 mt-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-12 mb-16">
          <div className="col-span-2 md:col-span-3">
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

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/platform"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Platform</span></Link></li>
              <li><Link href="/agents"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Agents</span></Link></li>
              <li><Link href="/company-in-a-box"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Company in a Box</span></Link></li>
              <li><Link href="/token"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Token</span></Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">Products</h4>
            <ul className="space-y-3">
              <li><Link href="/eve-os"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Eve OS</span></Link></li>
              <li><Link href="/neobank"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">NeoBank</span></Link></li>
              <li><Link href="/business"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">For Business</span></Link></li>
              <li><Link href="/developers"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">For Developers</span></Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="/litepaper"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Litepaper</span></Link></li>
              <li><Link href="/roadmap"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Roadmap</span></Link></li>
              <li><Link href="/faq"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">FAQ</span></Link></li>
              <li><Link href="/press"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Press</span></Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">Company</h4>
            <ul className="space-y-3">
              <li><Link href="/contact"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Contact</span></Link></li>
              <li><Link href="/invest"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Invest</span></Link></li>
              <li><Link href="/privacy"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Privacy</span></Link></li>
              <li><Link href="/terms"><span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">Terms</span></Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">Social</h4>
            <a
              href="https://x.com/theaicreatesai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AIcreatesAI on X"
              className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors"
            >
              @theaicreatesai
            </a>
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
