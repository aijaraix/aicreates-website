export default function Footer() {
  return (
    <footer
      className="bg-[#0A0A0A] relative border-t border-white/5 pt-16 pb-8 mt-24 overflow-hidden"
      data-testid="footer"
    >
      {/* Giant wordmark - full width, faded, with hero-style texture glowing from bottom */}
      <div className="relative w-full">
        <div className="absolute inset-0 bg-grid bg-grid-fade-bottom pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,245,212,0.06),transparent_60%)] blur-3xl pointer-events-none" />
        <a
          href="https://www.aicreates.ai"
          className="relative block w-full text-center leading-[0.85] font-semibold tracking-[-0.04em] select-none opacity-60 hover:opacity-80 transition-opacity"
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

      {/* Disclaimer - full width below wordmark */}
      <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-16">
        <p className="text-white/35 text-[10px] md:text-[11px] leading-snug text-center mx-auto max-w-[1400px]">
          This page is for informational purposes only and does not constitute an offer to sell or a solicitation to buy any securities or tokens. AICA tokens, when issued, will be utility tokens for consumptive use within the AIcreatesAI ecosystem and are subject to vesting and jurisdictional restrictions. Early-stage technology and cryptocurrency commitments involve significant risk and you may lose all funds.
        </p>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-white/30 text-xs tracking-wide">
            © {new Date().getFullYear()} AIcreatesAI. All rights reserved.
          </p>
          <p className="text-white/30 text-xs tracking-wide">
            Engineered for the agentic era.
          </p>
        </div>
      </div>
    </footer>
  );
}
