import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Layers,
  Network,
  Sparkles,
  Building2,
  Briefcase,
  TrendingUp,
} from "lucide-react";

type Slide = {
  id: string;
  label: string;
  title: string;
  subline: string;
  body1: string;
  body2: string;
  ctaText: string;
  ctaHref: string;
  pills: string[];
};

const SLIDES: Slide[] = [
  {
    id: "eve-os",
    label: "Flagship Product",
    title: "Eve OS.",
    subline: "The Agentic Business Operating System.",
    body1:
      "The first platform that doesn't just assist your business - it becomes your business. Plans, executes, reviews, and improves across every function from one native desktop experience.",
    body2:
      "Marketing, Sales, Finance, Legal, Operations, Development - all coordinated on one intelligence layer.",
    ctaText: "Explore Eve OS",
    ctaHref: "/eve-os",
    pills: ["Marketing", "Sales", "Finance", "Legal", "Operations", "Development"],
  },
  {
    id: "neobank",
    label: "Secondary Product Line",
    title: "NeoBank.",
    subline: "Capital that thinks.",
    body1:
      "A consumer and business neobank built directly on top of our intelligence layer. Capital that thinks, allocates, and protects itself.",
    body2:
      "Treasury, Payments, Credit, Yield, Compliance, Identity - one agentic surface for every flow of money.",
    ctaText: "Inside NeoBank",
    ctaHref: "/neobank",
    pills: ["Treasury", "Payments", "Credit", "Yield", "Compliance", "Identity"],
  },
];

function ProductSpotlight() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduce || paused) return;
    intervalRef.current = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 7000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reduce, paused, active]);

  const slide = SLIDES[active];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.12),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_80%_30%,black,transparent_70%)]" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 md:p-16 lg:p-20 min-h-[520px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${slide.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
              >
                <SectionLabel>{slide.label}</SectionLabel>
                <h2 className="mt-6 text-5xl md:text-7xl font-serif font-semibold text-white leading-[1.0] mb-4 tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-xl text-white/80 leading-tight mb-6 font-light">
                  {slide.subline}
                </p>
                <p className="text-base text-white/55 leading-relaxed mb-4">{slide.body1}</p>
                <p className="text-base text-white/45 leading-relaxed mb-10">{slide.body2}</p>
                <Link href={slide.ctaHref}>
                  <Button
                    size="lg"
                    className="rounded-full h-12 px-7 bg-white text-black hover:bg-white/90 group"
                    data-testid={`button-cta-${slide.id}`}
                  >
                    {slide.ctaText}{" "}
                    <ArrowUpRight className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </AnimatePresence>

            <div className="relative min-h-[320px] flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border border-[#00F5D4]/20 animate-[spin_40s_linear_infinite]" />
                <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full border border-white/10 animate-[spin_30s_linear_infinite_reverse]" />
                <div className="absolute w-40 h-40 md:w-52 md:h-52 rounded-full border border-white/5" />
                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#00F5D4]/30 to-transparent blur-xl" />
                <div className="absolute w-3 h-3 rounded-full bg-[#00F5D4] shadow-[0_0_30px_rgba(0,245,212,0.9)]" />
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`pills-${slide.id}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5 }}
                  className="relative z-10 grid grid-cols-2 gap-3 text-xs"
                >
                  {slide.pills.map((t) => (
                    <div
                      key={t}
                      className="px-3 py-2 rounded-full bg-black/60 backdrop-blur border border-white/10 text-white/70 text-center"
                    >
                      {t}
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Pagination dots */}
        <div className="flex justify-center items-center gap-3 mt-8">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${s.title.replace(".", "")}`}
              aria-current={active === i}
              data-testid={`dot-${s.id}`}
              className={`h-2 rounded-full transition-all ${
                active === i
                  ? "w-8 bg-[#00F5D4] shadow-[0_0_10px_rgba(0,245,212,0.6)]"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
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

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-28 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,245,212,0.06),transparent_60%)] blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <SectionLabel>Agentic Intelligence Layer</SectionLabel>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] mb-7 text-gradient"
            >
              The operating layer for the agentic era.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              AIcreatesAI builds the intelligence infrastructure that companies, capital, and consumers will run on. One layer. Many products. Self-improving by design.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/eve-os">
                <Button size="lg" className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  Explore Eve OS <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]">
                  Engage with us
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-24 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-[0.2em] text-white/35"
            >
              <span>Hybrid Compute Fabric</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-white/20" />
              <span>Closed-Loop Quality Engine</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-white/20" />
              <span>Self-Healing Workflows</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* THESIS */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <SectionLabel>The Thesis</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05]">
              Software is becoming a workforce.
            </h2>
            <p className="mt-8 text-lg md:text-xl text-white/60 leading-relaxed">
              The next generation of value will not be created by larger models. It will be created by intelligence that organizes itself - that perceives intent, decomposes it, executes across systems, and improves with every cycle. We build that layer, and we build the products that prove what it can do.
            </p>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Layers,
                k: "01",
                title: "Agentic Intelligence Layer",
                desc: "A unified substrate where specialized agents reason, coordinate, and act across any system of record.",
              },
              {
                icon: Cpu,
                k: "02",
                title: "Hybrid Compute Fabric",
                desc: "Inference, retrieval, and execution distributed across the right surface for the task. Latency where it matters, depth where it counts.",
              },
              {
                icon: Network,
                k: "03",
                title: "Closed-Loop Quality Engine",
                desc: "Every output is verified, scored, and fed back. The system gets sharper the more it runs.",
              },
            ].map((p, i) => (
              <motion.div
                key={p.k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card p-8 group hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-mono text-white/30 tracking-widest">{p.k}</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-white mb-3">{p.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT SPOTLIGHT (Eve OS / NeoBank carousel) */}
      <ProductSpotlight />

      {/* ABOUT US */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(0,245,212,0.05),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="max-w-4xl mx-auto">
            <SectionLabel>About Us</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="mt-6 text-4xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05]"
            >
              We're Building the Operating System for the Agentic Era.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-10 space-y-6 text-lg md:text-xl text-white/65 leading-relaxed"
            >
              <p>
                AIcreatesAI is a deep-tech company creating intelligent systems that will power the next generation of business and life.
              </p>
              <p>
                We use advanced AI to build platforms that act as complete operating systems - giving individuals and companies the ability to operate with greater intelligence, efficiency, and autonomy.
              </p>
              <p>
                Our mission is to create a self-improving intelligence layer that compounds in value over time, laying the foundation for how humans and businesses will work in the future.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12 pt-8 border-t border-white/10"
            >
              <p className="text-base md:text-lg text-white/80 font-medium">
                One company. One vision.
              </p>
              <p className="text-base md:text-lg text-white/45 mt-1">
                Building the infrastructure for an agentic world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Who we serve</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              One layer. Three audiences. Compounding outcomes.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Sparkles,
                tag: "Consumer",
                title: "An intelligent edge for everyday life.",
                desc: "Banking, decisions, and capital that work on your behalf, around the clock.",
                cta: "Join NeoBank",
                href: "/neobank",
              },
              {
                icon: Briefcase,
                tag: "Business",
                title: "A whole company, run by agents.",
                desc: "Compress functions, eliminate ops drag, and ship outcomes instead of tasks.",
                cta: "Explore Eve OS",
                href: "/eve-os",
              },
              {
                icon: TrendingUp,
                tag: "Investor",
                title: "An infrastructure thesis you can underwrite.",
                desc: "A self-reinforcing intelligence layer with multiple flagship products on top.",
                cta: "Read the Litepaper",
                href: "/litepaper",
              },
            ].map((a, i) => (
              <motion.div
                key={a.tag}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card p-8 flex flex-col group hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <a.icon className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{a.tag}</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-white mb-3 leading-tight">{a.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-8 flex-1">{a.desc}</p>
                <Link href={a.href}>
                  <span className="text-sm text-[#00F5D4] font-medium inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    {a.cta} <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px divider-line" />
            <div className="relative">
              <Building2 className="w-7 h-7 text-[#00F5D4] mx-auto mb-6" strokeWidth={1.5} />
              <h2 className="text-4xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05] mb-6">
                The agentic era is not waiting.
              </h2>
              <p className="text-lg text-white/55 max-w-xl mx-auto mb-10">
                If your industry has not been rebuilt agentically yet, we should be the conversation you have first.
              </p>
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  Engage with us <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
