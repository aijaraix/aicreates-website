import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Cpu,
  Workflow,
  ShieldCheck,
  Layers,
  Repeat,
  GitBranch,
  Activity,
  Building2,
  Rocket,
  Sparkles,
} from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

export default function CompanyInABox() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>Flagship Product</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] text-gradient"
            >
              Company in a Box.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 text-lg md:text-2xl text-white/65 max-w-3xl leading-relaxed"
            >
              An end-to-end agentic operating system that runs entire business functions. One intelligence layer. Every department. Always on.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  Engage with us <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/litepaper">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]">
                  Read the Litepaper
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT IT IS */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>What it is</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                A company that runs itself, supervised by you.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                Company in a Box turns the modern company into a single coherent system. Strategy, operations, growth, finance, customer experience, and back office become coordinated agents on one intelligence layer.
              </p>
              <p>
                The work that used to require dozens of hires, a stack of SaaS, and constant context switching is compressed into a self-organizing surface. You set direction. The layer executes, learns, and reports.
              </p>
              <p>
                It is not a chatbot, a copilot, or a workflow tool. It is the operating substrate underneath all of them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PRIMITIVES */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-16">
            <SectionLabel>Core primitives</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Three primitives. One coherent system.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Brain,
                tag: "Primitive 01",
                title: "Agentic Intelligence Layer",
                desc: "A unified reasoning substrate where specialized agents interpret intent, decompose it into actions, and coordinate across every system you already run.",
                bullets: ["Intent decomposition", "Cross-system coordination", "Persistent organizational memory"],
              },
              {
                icon: Cpu,
                tag: "Primitive 02",
                title: "Hybrid Compute Fabric",
                desc: "Inference, retrieval, and execution distributed across the right surface for the task. Edge for latency, depth for analysis, durable storage for state.",
                bullets: ["Latency-aware routing", "Adaptive cost envelope", "Sovereign-ready deployment"],
              },
              {
                icon: Repeat,
                tag: "Primitive 03",
                title: "Closed-Loop Quality Engine",
                desc: "Every action is verified, scored, and fed back into the layer. The system measures itself, retrains the agents that need it, and never degrades silently.",
                bullets: ["Outcome-grade scoring", "Continuous policy refinement", "Drift detection and rollback"],
              },
            ].map((p, i) => (
              <motion.div
                key={p.tag}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card p-8 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{p.tag}</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-white mb-3">{p.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-6">{p.desc}</p>
                <ul className="space-y-2 pt-4 border-t border-white/5">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-white/65 text-sm">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#00F5D4] shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCTIONS / DEPARTMENTS */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Functional surface</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Every function. Same layer.
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed">
              No more siloed tools, fragmented data, or hand-offs lost between systems. Each function is a lens onto the same intelligence layer, accountable to the same closed loop.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { icon: Layers, t: "Strategy" },
              { icon: Workflow, t: "Operations" },
              { icon: Activity, t: "Growth" },
              { icon: Sparkles, t: "Customer Surface" },
              { icon: GitBranch, t: "Product" },
              { icon: Rocket, t: "Finance" },
              { icon: ShieldCheck, t: "Compliance" },
              { icon: Brain, t: "Knowledge" },
            ].map((f) => (
              <div
                key={f.t}
                className="glass-card p-6 hover:border-[#00F5D4]/30 hover:bg-white/[0.04] transition-colors"
              >
                <f.icon className="w-5 h-5 text-[#00F5D4] mb-4" strokeWidth={1.5} />
                <p className="text-white/85 font-medium text-sm">{f.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>Outcomes</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                Outcomes, not seats.
              </h2>
              <p className="mt-6 text-lg text-white/55">
                You are not buying software. You are buying delivered work that compounds.
              </p>
            </div>
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { k: "Compression", v: "Functions that took teams now run as orchestrated agents." },
                { k: "Continuity", v: "The layer never sleeps, never forgets, never loses context." },
                { k: "Compounding", v: "Every cycle improves the policies that drive the next one." },
                { k: "Sovereignty", v: "Your data, your tenancy, your governance, end-to-end." },
              ].map((o) => (
                <div key={o.k} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                  <div className="text-xs font-mono uppercase tracking-widest text-[#00F5D4] mb-3">{o.k}</div>
                  <p className="text-white/75 text-sm leading-relaxed">{o.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHO IT IS FOR */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Who it is for</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Built for the operators who move first.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                tag: "Founders & Operators",
                title: "Run a real company without scaling headcount linearly.",
                desc: "From day one, every function is operated by agents tuned to your stage, your stack, and your stakes.",
              },
              {
                tag: "Growth-Stage Companies",
                title: "Compress entire departments into the layer.",
                desc: "Shed the SaaS sprawl. Replace coordination overhead with a single coherent operating system.",
              },
              {
                tag: "Enterprises & Sovereigns",
                title: "Deploy the layer with full sovereignty.",
                desc: "Tenanted, governed, and observable. Drop into your environment with the controls your risk team requires.",
              },
            ].map((a) => (
              <div key={a.tag} className="glass-card p-8 hover:border-[#00F5D4]/30 transition-colors">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5">{a.tag}</div>
                <h3 className="text-xl font-serif font-semibold text-white mb-3 leading-tight">{a.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <Building2 className="w-7 h-7 text-[#00F5D4] mb-5" strokeWidth={1.5} />
                <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-4">
                  Run your company on the layer.
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  Tell us what your company looks like today. We will tell you what it looks like as a Company in a Box.
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
