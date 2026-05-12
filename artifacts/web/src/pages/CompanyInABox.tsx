import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Megaphone,
  Coins,
  Scale,
  Wrench,
  Cog,
  Code2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const FUNCTIONS = [
  { icon: Megaphone, name: "Marketing", desc: "Positioning, content, campaigns, and growth experiments." },
  { icon: Sparkles, name: "Sales", desc: "Pipeline, outreach, qualification, and follow-through." },
  { icon: Coins, name: "Finance", desc: "Bookkeeping, runway, invoicing, and treasury hygiene." },
  { icon: Scale, name: "Legal", desc: "Drafting, review, redlines, and policy alignment." },
  { icon: Cog, name: "Operations", desc: "Process design, vendor coordination, and project execution." },
  { icon: Code2, name: "Development", desc: "Product builds, integrations, and engineering throughput." },
];

const STEPS = [
  "Describe a goal in plain language.",
  "The layer drafts a coordinated plan across functions.",
  "Specialized agents execute against your tools and data.",
  "Closed-loop review scores, critiques, and rewrites.",
  "You approve, edit, or hand back for another pass.",
  "Outcomes are remembered and used to sharpen the next run.",
];

export default function CompanyInABox() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>Company in a Box</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] text-gradient"
            >
              A coordinated virtual company, on demand.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 text-lg md:text-2xl text-white/65 max-w-3xl leading-relaxed"
            >
              Marketing, Sales, Finance, Legal, Operations, and Development - running together on one intelligence layer, with quality review built into every cycle.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  Request access <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/platform">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]">
                  See the platform
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FUNCTIONS GRID */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Six functions, one company</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Every department your business needs.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FUNCTIONS.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="glass-card p-6 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.name}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>How it runs</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                One sentence. One coordinated outcome.
              </h2>
              <p className="mt-6 text-white/55 leading-relaxed">
                The Company in a Box is not a chatbot or a stack of tools. It is a coordinated execution system that turns intent into work, reviews itself, and improves over time.
              </p>
            </div>
            <ol className="md:col-span-7 space-y-3">
              {STEPS.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center font-mono text-xs text-[#00F5D4]">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-white/70 leading-relaxed pt-1.5">{s}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Who it is for</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Operators who want a real company, not more tools.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { t: "Solopreneurs", d: "Run a multi-function company without hiring one. Output that looks like a team built it." },
              { t: "Small business owners", d: "Replace fragmented SaaS with a single coordinated system that gets sharper with use." },
              { t: "Service teams", d: "Give every operator the leverage of an experienced cross-functional org." },
              { t: "Growing companies", d: "Scale process and quality without scaling headcount linearly." },
            ].map((p) => (
              <div key={p.t} className="glass-card p-7 hover:border-[#00F5D4]/30 transition-colors">
                <h3 className="text-xl font-serif font-semibold text-white mb-3">{p.t}</h3>
                <p className="text-white/60 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTCOMES */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <SectionLabel>Outcomes</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-10">
              What changes when the company runs itself.
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Cycle time on routine work collapses from days to minutes.",
                "Quality is measured and improved by the system, not just promised.",
                "Institutional knowledge accumulates instead of leaving with people.",
                "Founders move from operator to owner of an operating system.",
              ].map((o) => (
                <li key={o} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <CheckCircle2 className="w-5 h-5 text-[#00F5D4] shrink-0 mt-0.5" strokeWidth={1.75} />
                  <span className="text-white/70 leading-relaxed">{o}</span>
                </li>
              ))}
            </ul>
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
                <Wrench className="w-7 h-7 text-[#00F5D4] mb-5" strokeWidth={1.5} />
                <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-4">
                  Run a real company. From day one.
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  Get on the early-access list and be among the first to deploy.
                </p>
              </div>
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium whitespace-nowrap">
                  Request access <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
