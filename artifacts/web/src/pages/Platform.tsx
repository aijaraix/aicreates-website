import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Layers,
  Cpu,
  ShieldCheck,
  Workflow,
  Database,
  GitBranch,
  Sparkles,
  Network,
} from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const PILLARS = [
  {
    icon: Layers,
    title: "Agentic Intelligence Layer",
    desc: "A unified runtime where intent becomes coordinated execution across every business function.",
  },
  {
    icon: Cpu,
    title: "Hybrid Compute Fabric",
    desc: "Local, edge, and cloud compute orchestrated to balance privacy, latency, and cost on every task.",
  },
  {
    icon: ShieldCheck,
    title: "Closed-Loop Quality Engine",
    desc: "Every output is reviewed, scored, and improved by the system before it reaches you.",
  },
  {
    icon: Workflow,
    title: "Self-Healing Workflows",
    desc: "Workflows detect their own failures, repair, retry, and learn from each cycle.",
  },
  {
    icon: Database,
    title: "Persistent Business Memory",
    desc: "Context, decisions, and outcomes accumulate as a durable, queryable substrate over time.",
  },
  {
    icon: GitBranch,
    title: "Agentic Wallet Controls",
    desc: "Scoped permissions, spend caps, and human approvals keep autonomous action in policy.",
  },
];

const FLOW = [
  { n: "01", t: "Intent", d: "You describe a goal in natural language." },
  { n: "02", t: "Plan", d: "The layer decomposes the goal into a coordinated plan across functions." },
  { n: "03", t: "Execute", d: "Specialized agents run the plan against your tools, data, and policies." },
  { n: "04", t: "Review", d: "The closed-loop quality engine scores, critiques, and rewrites." },
  { n: "05", t: "Improve", d: "Outcomes feed memory, models, and routing - the layer gets sharper." },
];

export default function Platform() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>Platform</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] text-gradient"
            >
              The Agentic Intelligence Layer.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 text-lg md:text-2xl text-white/65 max-w-3xl leading-relaxed"
            >
              One platform. Many products. A self-improving foundation for how companies, capital, and consumers will operate.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/eve-os">
                <Button size="lg" className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  See it as Eve OS <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/litepaper">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]">
                  Read the litepaper
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>The shape of the layer</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Six primitives. One coherent system.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="glass-card p-6 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>How the layer runs</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Intent in. Coordinated action out.
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {FLOW.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="text-xs font-mono text-[#00F5D4] tracking-widest mb-3">{s.n}</div>
                <div className="text-base font-semibold text-white mb-2">{s.t}</div>
                <p className="text-sm text-white/55 leading-relaxed">{s.d}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* PRODUCTS BUILT ON THE LAYER */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Built on the layer</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Many products, one foundation.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { tag: "Flagship", title: "Eve OS", desc: "The Agentic Business Operating System. A complete Company in a Box.", href: "/eve-os" },
              { tag: "Capital", title: "NeoBank", desc: "Consumer and business banking with capital that thinks.", href: "/neobank" },
              { tag: "Builders", title: "Developers", desc: "Build with the same primitives we use to build Eve OS.", href: "/developers" },
            ].map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="glass-card p-7 flex flex-col hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <Sparkles className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{c.tag}</span>
                </div>
                <h3 className="text-2xl font-serif font-semibold text-white mb-3">{c.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-6 flex-1">{c.desc}</p>
                <Link href={c.href}>
                  <Button variant="outline" className="w-full rounded-full h-10 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] group">
                    Explore <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <Network className="w-7 h-7 text-[#00F5D4] mb-5" strokeWidth={1.5} />
                <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-4">
                  One layer. Many surfaces.
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  Talk to us about deploying the layer inside your company, or building on top of it.
                </p>
              </div>
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium whitespace-nowrap">
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
