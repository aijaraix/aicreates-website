import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Plug, Layers, ShieldCheck, Workflow, Boxes } from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const PRIMITIVES = [
  { icon: Layers, t: "Intelligence Layer", d: "Programmatic access to coordinated planning, execution, review, and memory." },
  { icon: Workflow, t: "Workflows", d: "Compose multi-agent flows with policy, approvals, and self-healing built in." },
  { icon: Plug, t: "Connectors", d: "Bring your tools, data, and identity into the layer with scoped permissions." },
  { icon: ShieldCheck, t: "Wallet & Policy", d: "Scoped budgets, approvals, and audit trails for every autonomous action." },
  { icon: Boxes, t: "Skills Marketplace", d: "Distribute and consume specialized skills across the ecosystem (roadmap)." },
  { icon: Code2, t: "SDKs", d: "First-class clients for the surfaces developers actually ship in." },
];

export default function Developers() {
  return (
    <div className="flex flex-col w-full">
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>For Developers</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] text-gradient"
            >
              Build on the same primitives we use.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 text-lg md:text-2xl text-white/65 max-w-3xl leading-relaxed"
            >
              The same agentic intelligence layer that powers Eve OS will be available to builders - workflows, policy, memory, and a Skills Marketplace.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  Join the developer waitlist <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/roadmap">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]">
                  See the roadmap
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRIMITIVES */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Primitives</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              The building blocks of agentic software.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRIMITIVES.map((p, i) => (
              <motion.div
                key={p.t}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="glass-card p-6 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{p.t}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>Principles</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                Designed for production.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                Real workloads, not demos. The platform exposes typed contracts, deterministic policy, and observable execution from day one.
              </p>
              <p>
                Quality is a first-class primitive - rubrics, scoring, and rewrites are baked in, not left to the integrator to bolt on.
              </p>
              <p>
                Privacy and tenancy are not optional. Hybrid compute lets you choose where work runs and what data leaves your boundary.
              </p>
            </div>
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
                <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-4">
                  Build with us.
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  Developer access is rolling out in phases. Get on the list and we will be in touch.
                </p>
              </div>
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium whitespace-nowrap">
                  Join the waitlist <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
