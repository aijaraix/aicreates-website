import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const SECTIONS = [
  {
    n: "01",
    title: "Thesis",
    body: "The agentic era marks a shift from software that responds to software that acts. This section will outline why intelligence, not interfaces, becomes the new substrate of value.",
  },
  {
    n: "02",
    title: "The Agentic Intelligence Layer",
    body: "A formal description of the layer, its primitives, and the principles by which agents reason, coordinate, and persist context across systems.",
  },
  {
    n: "03",
    title: "Hybrid Compute Fabric",
    body: "How inference, retrieval, and execution are routed across surfaces to balance latency, depth, cost, and sovereignty in a single substrate.",
  },
  {
    n: "04",
    title: "Closed-Loop Quality Engine",
    body: "The verification, scoring, and feedback machinery that makes the layer self-improving without manual intervention.",
  },
  {
    n: "05",
    title: "Product Surface",
    body: "Eve OS and NeoBank as the first two consumer-grade and enterprise-grade products that prove the layer at scale.",
  },
  {
    n: "06",
    title: "Trust, Governance, and Sovereignty",
    body: "Tenanting, observability, and the controls required for institutions to operate the layer with confidence.",
  },
  {
    n: "07",
    title: "Roadmap",
    body: "The product, capability, and infrastructure milestones we are building toward, and how they compound.",
  },
];

export default function Litepaper() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.08),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>Litepaper · Draft</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl font-serif font-semibold leading-[1.04] text-gradient"
            >
              The Agentic Intelligence Layer.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed"
            >
              A working draft of our positioning, architecture, and roadmap. Sections below outline the structure. Full content is forthcoming.
            </motion.p>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.2em] text-white/40">
              <span>Version 0.1 Draft</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-white/20 self-center" />
              <span>Last updated · Forthcoming</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-white/20 self-center" />
              <span>Estimated read · 12 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENTS + BODY */}
      <section className="py-12 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* TOC */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-5">Contents</p>
                <ul className="space-y-3">
                  {SECTIONS.map((s) => (
                    <li key={s.n}>
                      <a
                        href={`#section-${s.n}`}
                        className="group flex items-baseline gap-3 text-sm text-white/55 hover:text-[#00F5D4] transition-colors"
                      >
                        <span className="font-mono text-[10px] text-white/30 group-hover:text-[#00F5D4] transition-colors">{s.n}</span>
                        <span>{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* BODY */}
            <article className="lg:col-span-9 space-y-16">
              {SECTIONS.map((s) => (
                <motion.section
                  key={s.n}
                  id={`section-${s.n}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5 }}
                  className="scroll-mt-28"
                >
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="font-mono text-xs text-[#00F5D4] tracking-[0.2em]">{s.n}</span>
                    <div className="flex-1 h-px divider-line" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-5 leading-tight">{s.title}</h2>
                  <p className="text-white/65 text-lg leading-relaxed">{s.body}</p>

                  <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-4">
                    <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-widest text-white/35">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Forthcoming · Full section content in progress</span>
                    </div>
                  </div>
                </motion.section>
              ))}
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-16 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-gradient leading-[1.1] mb-5">
                Want the full draft as it ships?
              </h2>
              <p className="text-white/55 mb-8 max-w-lg mx-auto">
                Reach out and we will send you each section as it is published.
              </p>
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  Get in touch <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
