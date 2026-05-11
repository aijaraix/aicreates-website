import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Download,
  FileText,
  BookOpen,
  Cpu,
  Layers,
  Network,
  Users,
} from "lucide-react";
import DeckCarousel from "@/components/DeckCarousel";
import aicaCoinShield from "@/assets/aica-coin-shield.png";
import aicaCoin from "@/assets/aica-coin.png";

function AicaGlyph({ className = "" }: { className?: string }) {
  return (
    <img
      src={aicaCoin}
      alt=""
      aria-hidden="true"
      className={`inline-block align-[-0.18em] w-[1.05em] h-[1.05em] mx-1 select-none drop-shadow-[0_0_8px_rgba(0,245,212,0.35)] ${className}`}
      draggable={false}
    />
  );
}

function withGlyphs(text: string): React.ReactNode {
  const parts = text.split(/(\$AICA)/g);
  if (parts.length === 1) return text;
  return parts.map((p, i) =>
    p === "$AICA" ? (
      <span key={i} className="inline-flex items-baseline">
        <AicaGlyph />
        <span className="font-medium text-[#00F5D4]">$AICA</span>
      </span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

export default function Invest() {
  const reduce = useReducedMotion();
  const fadeUp = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay } }
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay } };
  const fadeIn = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay } }
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay } };
  const inView = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.3, delay } }
      : { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.5, delay } };
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 min-h-[100dvh] sm:min-h-0 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
          <div className="max-w-5xl">
            <motion.div {...fadeIn(0)}>
              <SectionLabel>Invest</SectionLabel>
            </motion.div>
            <motion.h1
              {...fadeUp(0.05)}
              className="mt-6 text-[40px] sm:text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] text-gradient tracking-tight"
            >
              Invest in the Future of Intelligent Business.
            </motion.h1>
            <motion.p
              {...fadeUp(0.15)}
              className="mt-7 text-lg sm:text-xl md:text-2xl text-white/70 max-w-3xl leading-relaxed font-light"
            >
              Join us in building the operating system for the agentic era.
            </motion.p>

            <motion.div
              {...fadeUp(0.25)}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <a
                href="https://portal.aicreates.ai/invest"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium"
                  data-testid="button-reserve-allocation"
                >
                  Reserve Your Allocation <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <a
                href="/litepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-7 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]"
                  data-testid="button-hero-download-deck"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Download Pitch Deck
                </Button>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* THE OPPORTUNITY */}
      <section className="py-14 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start max-w-6xl mx-auto">
            <div className="md:col-span-5">
              <SectionLabel>The Opportunity</SectionLabel>
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                The infrastructure for the next generation of business.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-5 text-white/65 text-base sm:text-lg leading-relaxed">
              <p>
                We are building the foundational infrastructure for the next generation of business. As AI becomes deeply embedded in every company, the demand for intelligent, autonomous operating systems will explode.
              </p>
              <p>
                AICreatesAi is positioned at the center of this shift, creating the platforms and intelligence layer that will power how businesses operate in the future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPUTE INFRASTRUCTURE */}
      <section className="py-14 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-6xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#101010] to-[#0A0A0A] p-8 sm:p-10 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.10),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_80%_20%,black,transparent_70%)]" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-7">
                <SectionLabel>Compute</SectionLabel>
                <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                  Building world-class compute infrastructure.
                </h2>
                <div className="mt-7 space-y-5 text-white/65 text-base sm:text-lg leading-relaxed">
                  <p>
                    As part of our $50M raise, we are investing heavily in high-performance computing. Our initial system is a $3.5 million high-end GPU cluster designed for advanced model training, inference, and continuous improvement of our proprietary AI systems.
                  </p>
                  <p>
                    This infrastructure forms the backbone of our self-improving intelligence layer and gives us a significant technical advantage from day one.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {[
                  { k: "$50M", v: "Strategic raise" },
                  { k: "$3.5M", v: "Initial GPU cluster" },
                  { k: "24/7", v: "Continuous training" },
                  { k: "Day 1", v: "Technical advantage" },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-[#00F5D4]/30 transition-colors"
                  >
                    <div className="text-2xl md:text-3xl font-serif font-semibold text-[#00F5D4] tracking-tight">{s.k}</div>
                    <div className="mt-1.5 text-xs uppercase tracking-[0.18em] text-white/45">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PITCH DECK & LITEPAPER */}
      <section className="py-14 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-12 mx-auto text-center">
            <div className="inline-flex"><SectionLabel>Materials</SectionLabel></div>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Learn more about our vision.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/55 leading-relaxed">
              Read the full thesis or download the pitch deck for offline review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: FileText,
                title: "View Investor Portal",
                desc: "Long-scroll thesis, vesting calculator, and reserve-allocation flow.",
                disabled: false,
                href: "/portal/" as string | undefined,
                external: true,
                cta: "Open the portal",
                testId: "button-view-deck",
              },
              {
                icon: Download,
                title: "Download Pitch Deck",
                desc: "PDF version of the investor deck for offline review.",
                disabled: false,
                href: "/litepaper.pdf" as string | undefined,
                external: true,
                cta: "Download PDF",
                testId: "button-download-deck",
              },
              {
                icon: BookOpen,
                title: "Read the Litepaper",
                desc: "The full positioning, architecture, roadmap, and tokenomics.",
                disabled: false,
                href: "/litepaper",
                external: false,
                cta: "Read the Litepaper",
                testId: "button-read-litepaper",
              },
            ].map((card) => (
              <motion.div
                key={card.title}
                {...inView(0)}
                className="glass-card p-7 flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center mb-5">
                  <card.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-6 flex-1">{card.desc}</p>
                {card.disabled ? (
                  <Button
                    disabled
                    variant="outline"
                    className="rounded-full h-10 px-5 border-white/10 bg-white/[0.02] text-white/55 disabled:opacity-100 disabled:cursor-default justify-between"
                    data-testid={card.testId}
                  >
                    <span>{card.cta}</span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">Soon</span>
                  </Button>
                ) : card.external ? (
                  <a
                    href={card.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-10 px-5 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] group"
                      data-testid={card.testId}
                    >
                      {card.cta} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </a>
                ) : (
                  <Link href={card.href!}>
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-10 px-5 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] group"
                      data-testid={card.testId}
                    >
                      {card.cta} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOKEN */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-6xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#101010] to-[#0A0A0A] p-8 sm:p-10 md:p-14 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,245,212,0.10),transparent_60%)] pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
              <div className="md:col-span-2 flex justify-center">
                <img
                  src={aicaCoinShield}
                  alt="$AICA token"
                  className="w-48 sm:w-56 md:w-full max-w-[280px] aspect-square object-contain drop-shadow-[0_0_40px_rgba(0,245,212,0.4)]"
                  draggable={false}
                  data-testid="img-aica-coin"
                />
              </div>
              <div className="md:col-span-3">
                <SectionLabel>The Token</SectionLabel>
                <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                  {withGlyphs("$AICA powers the layer.")}
                </h2>
                <p className="mt-5 text-base sm:text-lg text-white/65 leading-relaxed">
                  {withGlyphs(
                    "The $AICA token underwrites subscriptions, compute network participation, and contributor rewards across the agentic intelligence layer. Fixed supply, vested allocations, and a sustainable economic model designed around real usage.",
                  )}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/litepaper#tokenomics">
                    <Button
                      variant="outline"
                      className="rounded-full h-10 px-5 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] group"
                      data-testid="button-token-litepaper"
                    >
                      Read tokenomics{" "}
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY INVEST */}
      <section className="py-14 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-12">
            <SectionLabel>Why Invest</SectionLabel>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Why invest in AICreatesAi?
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/55 leading-relaxed">
              A category-defining bet on the layer that companies, capital, and consumers will run on.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {[
              {
                icon: Layers,
                tag: "01",
                title: "Long-term compounding value",
                desc: "Proprietary AI models and a closed-loop quality engine that get sharper with every cycle of real-world use.",
              },
              {
                icon: Cpu,
                tag: "02",
                title: "Strong technical foundation",
                desc: "Dedicated high-performance compute from day one, anchored by an initial $3.5M GPU cluster.",
              },
              {
                icon: Network,
                tag: "03",
                title: "Multiple revenue streams",
                desc: "A clear path across subscriptions, an emerging skills marketplace, and ecosystem participation.",
              },
              {
                icon: Users,
                tag: "04",
                title: "Experienced team, massive market",
                desc: "Deep operator and engineering experience building inside a market that AI is rebuilding from the ground up.",
              },
            ].map((p, i) => (
              <motion.div
                key={p.tag}
                {...inView(i * 0.06)}
                className="glass-card p-7 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Pillar {p.tag}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-semibold text-white mb-2.5 leading-tight">{p.title}</h3>
                <p className="text-white/55 text-sm sm:text-base leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VISUAL DECK */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="mb-8 text-center max-w-3xl mx-auto">
            <SectionLabel>Visual Deck</SectionLabel>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              The agentic thesis at a glance.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-white/55 leading-relaxed">
              Step through the visual whitepaper. Use arrows, swipe, or open it fullscreen.
            </p>
          </div>
          <DeckCarousel
            title="AICA Visual Whitepaper"
            subline="28 slides - swipe, arrow keys, or fullscreen."
            testIdPrefix="deck-invest"
          />
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="pb-14 md:pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-3">
              Disclaimer
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              This page is for informational purposes only and does not constitute an offer to sell or a solicitation to buy any securities or tokens. Early-stage technology investments involve significant risk. Forward-looking statements describe current intent and direction, not guarantees, and are subject to change based on development progress, market conditions, and other factors.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
