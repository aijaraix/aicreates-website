import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Mail, FileText, Image as ImageIcon } from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const FACTS = [
  { k: "Headquarters", v: "Miami, Florida" },
  { k: "Founded", v: "2025" },
  { k: "Flagship", v: "Eve OS - Agentic Business Operating System" },
  { k: "Token", v: "$AICA - 10,000,000,000 fixed supply" },
];

export default function Press() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>Press</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl font-serif font-semibold leading-[1.04] text-gradient"
            >
              Press and media.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed"
            >
              Boilerplate, fast facts, and the right contact for media inquiries.
            </motion.p>
          </div>
        </div>
      </section>

      {/* BOILERPLATE */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionLabel>Boilerplate</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-4xl font-serif font-semibold text-gradient leading-[1.1] mb-8">
            About AICreatesAi.
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 md:p-10 space-y-5 text-white/70 leading-relaxed">
            <p>
              AICreatesAi is a deep-tech company building the agentic intelligence layer - a self-improving foundation for how companies, capital, and consumers will operate.
            </p>
            <p>
              Its flagship product, Eve OS, is the Agentic Business Operating System - a Company in a Box that coordinates marketing, sales, finance, legal, operations, and development on one intelligence layer with quality review built into every cycle. NeoBank, the company's consumer and business capital surface, runs on the same layer.
            </p>
            <p>
              The company is headquartered in Miami, Florida.
            </p>
          </div>
        </div>
      </section>

      {/* FACT SHEET */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionLabel>Fast facts</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-4xl font-serif font-semibold text-gradient leading-[1.1] mb-8">
            Quick reference.
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FACTS.map((f) => (
              <div key={f.k} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-white/40 mb-2">{f.k}</dt>
                <dd className="text-white text-base md:text-lg">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* RESOURCES */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionLabel>Resources</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-4xl font-serif font-semibold text-gradient leading-[1.1] mb-8">
            For your story.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/litepaper">
              <div className="glass-card p-7 cursor-pointer hover:border-[#00F5D4]/30 transition-colors h-full">
                <FileText className="w-5 h-5 text-[#00F5D4] mb-4" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-white mb-2">Litepaper</h3>
                <p className="text-white/55 text-sm leading-relaxed">Long-form positioning, architecture, and roadmap.</p>
              </div>
            </Link>
            <a href="mailto:sholom@aicreates.ai?subject=Media%20kit%20request" className="contents">
              <div className="glass-card p-7 cursor-pointer hover:border-[#00F5D4]/30 transition-colors h-full">
                <ImageIcon className="w-5 h-5 text-[#00F5D4] mb-4" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-white mb-2">Media kit</h3>
                <p className="text-white/55 text-sm leading-relaxed">Logos, wordmark, and product imagery on request.</p>
              </div>
            </a>
            <Link href="/contact">
              <div className="glass-card p-7 cursor-pointer hover:border-[#00F5D4]/30 transition-colors h-full">
                <Mail className="w-5 h-5 text-[#00F5D4] mb-4" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-white mb-2">Interviews and quotes</h3>
                <p className="text-white/55 text-sm leading-relaxed">Reach out via the contact form, selecting Press.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-16 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="relative">
              <Mail className="w-7 h-7 text-[#00F5D4] mx-auto mb-5" strokeWidth={1.5} />
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-5">
                Press inquiries.
              </h2>
              <p className="text-lg text-white/55 max-w-xl mx-auto mb-8">
                Email <a href="mailto:sholom@aicreates.ai" className="text-white hover:text-[#00F5D4]">sholom@aicreates.ai</a> or use the contact form.
              </p>
              <Link href="/contact?interest=Press">
                <Button size="lg" className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  Contact press <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
