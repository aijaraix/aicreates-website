import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSeo } from "@/lib/useSeo";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const PHASES = [
  {
    n: "Phase 0",
    title: "Foundations",
    desc: "Core platform architecture, agentic primitives, and the closed-loop quality engine.",
    bullets: ["Intelligence layer scaffolding", "Quality rubric and review loop", "Hybrid compute fabric v0"],
  },
  {
    n: "Phase 1",
    title: "Eve OS launch",
    desc: "Initial Company-in-a-Box experience with coordinated multi-function workflows.",
    bullets: ["Marketing, Sales, Finance, Legal, Ops, Dev agents", "Persistent business memory", "Early access cohort"],
  },
  {
    n: "Phase 2",
    title: "Marketplace and depth",
    desc: "Skills Marketplace, deeper proprietary models, broader user base.",
    bullets: ["Skills Marketplace launch", "Vertical workflow depth", "Proprietary model training at scale"],
  },
  {
    n: "Phase 3",
    title: "Capital surface",
    desc: "FinPayTek consumer and business surfaces on the agentic intelligence layer.",
    bullets: ["Programmable wallets and rails", "Agentic treasury and yield", "Capital surface for businesses"],
  },
  {
    n: "Phase 4",
    title: "Compute participation",
    desc: "Open the hybrid compute fabric to network participants with token-aligned rewards.",
    bullets: ["Compute network participation", "Contributor rewards live", "Sovereign tenancy options"],
  },
  {
    n: "Phase 5",
    title: "Scale intelligence",
    desc: "Advanced autonomous capabilities and ecosystem expansion.",
    bullets: ["Cross-org coordination", "Marketplace economy maturation", "Deeper enterprise deployments"],
  },
  {
    n: "Phase 6",
    title: "Layer ubiquity",
    desc: "The agentic intelligence layer as default infrastructure for new companies.",
    bullets: ["Broad ecosystem integrations", "Industry-specific surfaces", "Programmatic agent deployment"],
  },
  {
    n: "Phase 7",
    title: "Compounding era",
    desc: "Self-improving foundation that quietly upgrades how the world operates.",
    bullets: ["Continuous model improvement", "Cross-surface intelligence", "Long-arc value capture"],
  },
];

export default function Roadmap() {
  useSeo({
    title: "Roadmap - a disciplined, phased build",
    description:
      "Eight phases from foundations to compounding intelligence - real value early, long-term defensibility through data, product, and proprietary models.",
    path: "/roadmap",
  });
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>Roadmap</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] text-gradient"
            >
              A disciplined, phased build.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 text-lg md:text-2xl text-white/65 max-w-3xl leading-relaxed"
            >
              Real value early. Long-term defensibility through data, product experience, and proprietary model development.
            </motion.p>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute start-5 md:start-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#00F5D4]/40 via-white/10 to-transparent" />
            <ol className="space-y-6">
              {PHASES.map((p, i) => (
                <motion.li
                  key={p.n}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="relative ps-14 md:ps-20"
                >
                  <div className="absolute start-2.5 md:start-3.5 top-2 w-5 h-5 rounded-full bg-[#0A0A0A] border-2 border-[#00F5D4] shadow-[0_0_12px_rgba(0,245,212,0.6)]" />
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-[#00F5D4]/30 transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-mono text-[#00F5D4] tracking-widest">{p.n}</span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <h3 className="text-2xl font-serif font-semibold text-white mb-2">{p.title}</h3>
                    <p className="text-white/60 leading-relaxed mb-4">{p.desc}</p>
                    <ul className="space-y-2">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-white/65 text-sm">
                          <span className="mt-2 w-1 h-1 rounded-full bg-[#00F5D4] shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-3">Forward-looking</div>
            <p className="text-white/50 text-sm leading-relaxed">
              Roadmap describes current intent and direction. Sequence, scope, and timing may change based on development progress, market conditions, and other factors.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-5">
                Want the long-form?
              </h2>
              <p className="text-lg text-white/55 max-w-xl mx-auto mb-8">
                The litepaper covers the full positioning, architecture, tokenomics, and roadmap.
              </p>
              <Link href="/litepaper">
                <Button size="lg" className="rounded-full h-12 px-8 teal-btn">
                  Read the litepaper <ArrowRight className="ms-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
