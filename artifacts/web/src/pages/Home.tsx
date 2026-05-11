import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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

      {/* FLAGSHIP - COMPANY IN A BOX */}
      <section className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.12),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_80%_30%,black,transparent_70%)]" />

            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 md:p-16 lg:p-20">
              <div>
                <SectionLabel>Flagship Product</SectionLabel>
                <h2 className="mt-6 text-5xl md:text-7xl font-serif font-semibold text-white leading-[1.0] mb-4 tracking-tight">
                  Eve OS.
                </h2>
                <p className="text-xl text-white/80 leading-tight mb-6 font-light">
                  The Agentic Business Operating System.
                </p>
                <p className="text-base text-white/55 leading-relaxed mb-4">
                  The first platform that doesn't just assist your business - it becomes your business. Plans, executes, reviews, and improves across every function from one native desktop experience.
                </p>
                <p className="text-base text-white/45 leading-relaxed mb-10">
                  Marketing, Sales, Finance, Legal, Operations, Development - all coordinated on one intelligence layer.
                </p>
                <Link href="/eve-os">
                  <Button size="lg" className="rounded-full h-12 px-7 bg-white text-black hover:bg-white/90 group">
                    Explore Eve OS <ArrowUpRight className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="relative min-h-[320px] flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border border-[#00F5D4]/20 animate-[spin_40s_linear_infinite]" />
                  <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full border border-white/10 animate-[spin_30s_linear_infinite_reverse]" />
                  <div className="absolute w-40 h-40 md:w-52 md:h-52 rounded-full border border-white/5" />
                  <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#00F5D4]/30 to-transparent blur-xl" />
                  <div className="absolute w-3 h-3 rounded-full bg-[#00F5D4] shadow-[0_0_30px_rgba(0,245,212,0.9)]" />
                </div>
                <div className="relative z-10 grid grid-cols-2 gap-3 text-xs">
                  {["Marketing","Sales","Finance","Legal","Operations","Development"].map((t) => (
                    <div key={t} className="px-3 py-2 rounded-full bg-black/60 backdrop-blur border border-white/10 text-white/70 text-center">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECONDARY - NEOBANK */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center"
          >
            <div className="md:col-span-5">
              <SectionLabel>Secondary Product Line</SectionLabel>
              <h2 className="mt-6 text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-6">
                NeoBank.
              </h2>
              <p className="text-lg text-white/60 leading-relaxed mb-8">
                A consumer and business neobank built directly on top of our intelligence layer. Capital that thinks, allocates, and protects itself.
              </p>
              <Link href="/neobank">
                <Button variant="outline" className="rounded-full h-11 px-6 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]">
                  Inside NeoBank <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="md:col-span-7">
              <div className="relative aspect-[16/10] rounded-2xl border border-white/10 bg-[#0E0E0E] overflow-hidden">
                <div className="absolute inset-0 bg-grid opacity-50" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)]" />
                <div className="absolute inset-0 flex items-center justify-center p-10">
                  <div className="w-full max-w-md grid grid-cols-2 gap-3">
                    {[
                      { l: "Yield Engine", v: "Active" },
                      { l: "Risk Mesh", v: "Stable" },
                      { l: "Treasury Agent", v: "Allocating" },
                      { l: "Settlement", v: "On-chain" },
                    ].map((c) => (
                      <div key={c.l} className="rounded-xl border border-white/10 bg-black/50 backdrop-blur p-4">
                        <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">{c.l}</div>
                        <div className="text-sm text-[#00F5D4] font-mono">{c.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
