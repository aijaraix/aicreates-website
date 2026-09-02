import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Mail, FileText, Image as ImageIcon, Download, Palette, Type } from "lucide-react";
import { useSeo } from "@/lib/useSeo";
import sholomPortrait from "@/assets/sholom-portrait.jpeg";

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

const LOGOS = [
  { label: "Wordmark - light on dark (SVG)", file: "/press/aicreatesai-wordmark-dark.svg" },
  { label: "Wordmark - dark on light (SVG)", file: "/press/aicreatesai-wordmark-light.svg" },
  { label: "Mark only (PNG, 1024px)", file: "/press/aicreatesai-mark.png" },
  { label: "Full media kit (ZIP)", file: "/press/aicreatesai-media-kit.zip" },
];

export default function Press() {
  useSeo({
    title: "Press and media",
    description:
      "Boilerplate, fast facts, founder bio, logo downloads, and press contact for AIcreatesAI.",
    path: "/press",
  });
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
              Boilerplate, fast facts, founder bio, logo downloads, and the right contact for media inquiries.
            </motion.p>
          </div>
        </div>
      </section>

      {/* BRAND ONE-LINER */}
      <section className="pb-6">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-2xl border border-[#00F5D4]/25 bg-[#00F5D4]/[0.04] p-7 md:p-10">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00F5D4] mb-3">Brand one-liner</div>
            <p className="text-2xl md:text-3xl font-serif text-white leading-snug">
              AIcreatesAI is building the agentic intelligence layer for the next generation of companies, capital, and consumers.
            </p>
          </div>
        </div>
      </section>

      {/* BOILERPLATE */}
      <section className="py-10 md:py-14 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionLabel>Boilerplate</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-4xl font-serif font-semibold text-gradient leading-[1.1] mb-8">
            About AIcreatesAI.
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 md:p-10 space-y-5 text-white/70 leading-relaxed">
            <p>
              AIcreatesAI is a deep-tech company building the agentic intelligence layer - a self-improving foundation for how companies, capital, and consumers will operate.
            </p>
            <p>
              Its flagship product, Eve OS, is the Agentic Business Operating System - a Company in a Box that coordinates marketing, sales, finance, legal, operations, and development on one intelligence layer with quality review built into every cycle. FinPayTek, the company's consumer and business capital surface, runs on the same layer.
            </p>
            <p>The company is headquartered in Miami, Florida.</p>
          </div>
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-10 md:py-14 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionLabel>Founder</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-4xl font-serif font-semibold text-gradient leading-[1.1] mb-8">
            Leadership.
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 md:p-10 grid grid-cols-1 md:grid-cols-[160px_1fr] gap-8 items-start">
            <div className="w-40 h-40 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <img
                src={sholomPortrait}
                alt="Sholom Hammond - Founder and CEO of AIcreatesAI"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-semibold text-white">Sholom Hammond</h3>
              <div className="text-sm text-[#00F5D4] mt-1 mb-4">Founder & CEO, AIcreatesAI</div>
              <p className="text-white/65 leading-relaxed mb-3">
                Sholom Hammond is the founder of AIcreatesAI, a deep-tech company building the agentic intelligence layer that powers Eve OS and FinPayTek.
              </p>
              <p className="text-white/55 leading-relaxed text-sm">
                A high-resolution founder photo is available on request - email{" "}
                <a href="mailto:sholom@aicreates.ai" className="text-white hover:text-[#00F5D4]">sholom@aicreates.ai</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAST FACTS */}
      <section className="py-10 md:py-14 relative">
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

      {/* LOGOS / DOWNLOADS */}
      <section className="py-10 md:py-14 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionLabel>Logos and downloads</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-4xl font-serif font-semibold text-gradient leading-[1.1] mb-8">
            Brand assets.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LOGOS.map((l) => (
              <a
                key={l.file}
                href={l.file}
                download
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-[#00F5D4]/30 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ImageIcon className="w-4 h-4 text-[#00F5D4] shrink-0" strokeWidth={1.75} />
                  <span className="text-sm text-white/80 truncate">{l.label}</span>
                </div>
                <Download className="w-4 h-4 text-white/40 group-hover:text-[#00F5D4] shrink-0" strokeWidth={1.75} />
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/40">
            Files are hosted under <span className="font-mono">/press/</span>. If a download is missing, email{" "}
            <a href="mailto:sholom@aicreates.ai" className="text-white/60 hover:text-[#00F5D4]">sholom@aicreates.ai</a>.
          </p>
        </div>
      </section>

      {/* BRAND COLORS & TYPOGRAPHY */}
      <section className="py-10 md:py-14 relative">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <SectionLabel>Brand system</SectionLabel>
          <h2 className="mt-5 text-3xl md:text-4xl font-serif font-semibold text-gradient leading-[1.1] mb-8">
            Colors and typography.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Palette className="w-4 h-4 text-[#00F5D4]" strokeWidth={1.75} />
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Color palette</div>
              </div>
              <ul className="space-y-3">
                {[
                  { name: "Background", hex: "#0A0A0A", swatch: "#0A0A0A", border: true },
                  { name: "Surface", hex: "#121212", swatch: "#121212", border: true },
                  { name: "Text - primary", hex: "#F5F5F5", swatch: "#F5F5F5" },
                  { name: "Text - muted", hex: "#A1A1AA", swatch: "#A1A1AA" },
                  { name: "Accent", hex: "#00F5D4", swatch: "#00F5D4" },
                ].map((c) => (
                  <li key={c.hex} className="flex items-center gap-4">
                    <span
                      className={`w-9 h-9 rounded-md shrink-0 ${c.border ? "border border-white/15" : ""}`}
                      style={{ backgroundColor: c.swatch }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{c.name}</div>
                      <div className="text-xs font-mono text-white/40">{c.hex}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Type className="w-4 h-4 text-[#00F5D4]" strokeWidth={1.75} />
                <div className="text-[10px] uppercase tracking-[0.22em] text-white/40">Typography</div>
              </div>
              <ul className="space-y-5">
                <li>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">Display</div>
                  <div className="font-serif text-2xl text-white">Space Grotesk</div>
                </li>
                <li>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">Body</div>
                  <div className="font-sans text-lg text-white">Inter</div>
                </li>
                <li>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">Mono</div>
                  <div className="font-mono text-base text-white">JetBrains Mono</div>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-white/40">
            Copy convention: hyphens only - no em dashes, no en dashes.
          </p>
        </div>
      </section>

      {/* RESOURCES */}
      <section className="py-10 md:py-14 relative">
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
            <Link href="/platform">
              <div className="glass-card p-7 cursor-pointer hover:border-[#00F5D4]/30 transition-colors h-full">
                <ImageIcon className="w-5 h-5 text-[#00F5D4] mb-4" strokeWidth={1.5} />
                <h3 className="text-base font-semibold text-white mb-2">Platform overview</h3>
                <p className="text-white/55 text-sm leading-relaxed">Adam, Eve, Jarvis, and the named architecture in one place.</p>
              </div>
            </Link>
            <Link href="/contact?interest=Press">
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
                <Button size="lg" className="rounded-full h-12 px-8 teal-btn">
                  Contact press <ArrowRight className="ms-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
