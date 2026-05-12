import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { useSeo } from "@/lib/useSeo";
import Figure, { WorkspaceAreasFigure, ServicesImage } from "@/components/Figure";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const JOURNEY = [
  { n: "01", t: "Business Selection", d: "Pick your industry, model, and operating context. Eve loads the right defaults and starting playbooks." },
  { n: "02", t: "Objective", d: "State the goal in plain language. The layer converts it into a measurable plan with milestones." },
  { n: "03", t: "Asset Generation", d: "Brand, copy, site, decks, contracts, and product collateral generated from your objective." },
  { n: "04", t: "Agent Deployment", d: "The right agents are provisioned across every workspace area with policy, scope, and credits." },
  { n: "05", t: "Launch Stack", d: "Web, payments, email, and core infrastructure stood up and connected, ready to operate." },
  { n: "06", t: "CRM", d: "Customer records, conversations, and lifecycle hooks wired into the system of record." },
  { n: "07", t: "Automation", d: "Recurring workflows - outreach, billing, support, fulfillment - automated end-to-end." },
  { n: "08", t: "Analytics", d: "Live dashboards across funnel, revenue, ops, and quality - read by both you and the agents." },
  { n: "09", t: "Optimization", d: "The Quality Engine scores outputs, repairs failures, and improves the next cycle automatically." },
];

const WORKSPACE_AREAS = [
  {
    area: "AI Command Center",
    purpose: "Talk to Eve, set goals, approve plans, and see what every agent is doing.",
    examples: "Goals, plans, approvals, status",
  },
  {
    area: "Apps",
    purpose: "The functional surfaces - marketing, sales, finance, legal, ops, support - each with resident agents.",
    examples: "Marketing studio, CRM, books, contracts",
  },
  {
    area: "Wallet & Credits",
    purpose: "Programmable spend through the Credit Ledger - scoped budgets, caps, and audit per action.",
    examples: "Top-ups, spend caps, action receipts",
  },
  {
    area: "Memory & Files",
    purpose: "Persistent business memory and document store the agents read from and write to.",
    examples: "Decisions, briefs, contracts, transcripts",
  },
  {
    area: "Activity Feed",
    purpose: "The real-time stream of agent work, reviews, and outcomes across the company.",
    examples: "Drafts, reviews, ships, alerts",
  },
  {
    area: "Business Data",
    purpose: "Connected systems of record - CRM, accounting, analytics, vertical tools - exposed safely to agents.",
    examples: "Customers, ledgers, products, metrics",
  },
];

export default function CompanyInABox() {
  useSeo({
    title: "Company in a Box - 8-step journey",
    description:
      "A coordinated virtual company across eight workspace areas - Marketing, Sales, Finance, Legal, Operations, Development, Support, and Strategy - running on the agentic intelligence layer.",
    path: "/company-in-a-box",
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
              Eight workspace areas. One coordinated team. Run by Eve, executed by Jarvis, reviewed by the Quality Engine.
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

      {/* 8-STEP JOURNEY */}
      <section id="journey" className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>The 8-step journey</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              From sentence to compounding company.
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {JOURNEY.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="text-xs font-mono text-[#00F5D4] tracking-widest mb-3">{s.n}</div>
                <div className="text-base font-semibold text-white mb-2">{s.t}</div>
                <p className="text-sm text-white/55 leading-relaxed">{s.d}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* WORKSPACE AREAS TABLE */}
      <section id="workspace-areas" className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <SectionLabel>Workspace Areas - Figure 5</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Six surfaces. One Company in a Box.
            </h2>
          </div>
          <Figure number="Figure 5" caption="The Company in a Box surface (whitepaper visual) - coordinated services running on the layer.">
            <ServicesImage />
          </Figure>
          <Figure number="Figure 5a" caption="Schematic - the AI Command Center at the center, with Apps, Wallet & Credits, Memory & Files, Activity Feed, and Business Data.">
            <WorkspaceAreasFigure />
          </Figure>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden mt-8">
            <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-4 border-b border-white/10 bg-white/[0.03]">
              <div className="col-span-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Workspace area</div>
              <div className="col-span-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Purpose</div>
              <div className="col-span-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">What lives there</div>
            </div>
            <div className="divide-y divide-white/5">
              {WORKSPACE_AREAS.map((row, i) => (
                <motion.div
                  key={row.area}
                  initial={{ opacity: 0, x: 8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 px-6 py-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="md:col-span-3 flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.6)] shrink-0" />
                    <span className="text-base font-semibold text-white">{row.area}</span>
                  </div>
                  <div className="md:col-span-5 text-sm text-white/65">{row.purpose}</div>
                  <div className="md:col-span-4 text-sm text-white/55">{row.examples}</div>
                </motion.div>
              ))}
            </div>
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
