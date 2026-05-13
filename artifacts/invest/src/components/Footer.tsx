export default function Footer() {
  return (
    <footer
      className="bg-[#0A0A0A] relative border-t border-white/5 pt-16 pb-10 mt-24 overflow-hidden"
      data-testid="footer"
    >
      {/* Disclaimer + meta row */}
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
              <a
                href="https://x.com/theaicreatesai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AIcreatesAI on X"
                className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors"
                data-testid="link-footer-x"
              >
                @theaicreatesai
              </a>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              The AIcreatesAI investor portal. Reserve, sign, fund, and track
              your allocation in the agentic intelligence layer.
            </p>
          </div>
          <p className="text-white/40 text-xs leading-relaxed max-w-xl md:text-right">
            This page is for informational purposes only and does not
            constitute an offer to sell or a solicitation to buy any
            securities or tokens. AICA tokens, when issued, will be utility
            tokens for consumptive use within the AIcreatesAI ecosystem and
            are subject to vesting and jurisdictional restrictions.
            Early-stage technology and cryptocurrency commitments involve
            significant risk and you may lose all funds.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-10 border-b border-white/5">
          <p className="text-white/30 text-xs tracking-wide">
            © {new Date().getFullYear()} AIcreatesAI. All rights reserved.
          </p>
          <p className="text-white/30 text-xs tracking-wide">
            Engineered for the agentic era.
          </p>
        </div>
      </div>

      {/* Giant wordmark - full width */}
      <div className="relative w-full pt-12 md:pt-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(0,245,212,0.08), transparent 70%)",
          }}
        />
        <a
          href="https://www.aicreates.ai"
          className="relative block w-full text-center leading-[0.85] font-semibold tracking-[-0.04em] select-none"
          style={{
            fontFamily: "Space Grotesk, system-ui, sans-serif",
            fontSize: "clamp(64px, 18vw, 320px)",
          }}
          data-testid="link-footer-wordmark"
          aria-label="AIcreatesAI"
        >
          <span className="text-[#00F5D4]">AI</span>
          <span className="text-white/85 font-light">creates</span>
          <span className="text-[#00F5D4]">AI</span>
        </a>
      </div>
    </footer>
  );
}
