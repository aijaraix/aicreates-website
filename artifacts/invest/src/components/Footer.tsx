import wordmark from "@/assets/aica-wordmark.png";

export default function Footer() {
  return (
    <footer
      className="relative border-t border-white/5 pt-16 mt-24 overflow-hidden"
      data-testid="footer"
    >
      {/* Giant wordmark - full width, faded. Texture/glow lives on the page background. */}
      <div className="relative w-full px-4 md:px-8">
        <img
          src={wordmark}
          alt="AIcreatesAI"
          draggable={false}
          decoding="async"
          loading="lazy"
          className="block w-full max-w-[1800px] h-auto mx-auto select-none opacity-90"
          data-testid="footer-wordmark"
        />
      </div>

      {/* Disclaimer - full width below wordmark */}
      <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-10">
        <p className="text-white/35 text-[10px] md:text-[11px] leading-snug text-center mx-auto max-w-[1400px]">
          This page is for informational purposes only and does not constitute an offer to sell or a solicitation to buy any securities or tokens. AICA tokens, when issued, will be utility tokens for consumptive use within the AIcreatesAI ecosystem and are subject to vesting and jurisdictional restrictions. Early-stage technology and cryptocurrency commitments involve significant risk and you may lose all funds.
        </p>
      </div>

      {/* Bottom bar - transparent, sits over the page texture */}
      <div className="container mx-auto px-4 md:px-6 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <p className="text-white/30 text-xs tracking-wide">
          © {new Date().getFullYear()} AIcreatesAI. All rights reserved.
        </p>
        <p className="text-white/30 text-xs tracking-wide">
          Engineered for the agentic era.
        </p>
      </div>
    </footer>
  );
}
