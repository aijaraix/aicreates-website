import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Search,
  Code2,
  Megaphone,
  Briefcase,
  Headphones,
  Calculator,
  Scale,
  ShieldCheck,
  Rocket,
  Bot,
} from "lucide-react";
import { useSeo } from "@/lib/useSeo";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

type Role = {
  icon: typeof Compass;
  name: string;
  remit: string;
  example: string;
};

// Appendix B - Role library.
const ROLES: Role[] = [
  {
    icon: Compass,
    name: "Strategy",
    remit: "Frames goals, sequences priorities, and writes decision memos.",
    example: "Quarterly plan with three prioritized bets and explicit trade-offs.",
  },
  {
    icon: Search,
    name: "Research",
    remit: "Investigates markets, competitors, customers, and unknowns.",
    example: "Competitive landscape brief with sourced citations and gap analysis.",
  },
  {
    icon: Code2,
    name: "Coding",
    remit: "Implements features, integrations, and automation against your stack.",
    example: "Pull request with diff, tests, and rollout notes for an API integration.",
  },
  {
    icon: Megaphone,
    name: "Marketing",
    remit: "Positions, writes, schedules, and measures campaigns.",
    example: "Launch campaign: positioning doc, three-channel content, and KPI dashboard.",
  },
  {
    icon: Briefcase,
    name: "Sales",
    remit: "Builds pipeline, drafts outreach, qualifies leads, and runs follow-through.",
    example: "Outbound sequence with personalized first-touch and CRM update on reply.",
  },
  {
    icon: Headphones,
    name: "Support",
    remit: "Handles inbound questions, drafts replies, and escalates intelligently.",
    example: "Triaged ticket with proposed reply, KB article suggestion, and tag.",
  },
  {
    icon: Calculator,
    name: "Finance",
    remit: "Reconciles books, invoices, tracks runway, and prepares financial reporting.",
    example: "Monthly close package: P&L, cash position, and runway commentary.",
  },
  {
    icon: Scale,
    name: "Compliance",
    remit: "Reviews against policy, regulation, and contractual obligations.",
    example: "Vendor agreement redline with flagged risks and suggested rewrites.",
  },
  {
    icon: ShieldCheck,
    name: "QA",
    remit: "Reviews work product, scores it against rubrics, and rewrites for quality.",
    example: "Score card with strengths, defects, and revised draft on every output.",
  },
  {
    icon: Rocket,
    name: "Deployment",
    remit: "Ships changes through environments, monitors, and rolls back on failure.",
    example: "Staged rollout with health checks, smoke tests, and post-deploy summary.",
  },
];

export default function Agents() {
  useSeo({
    title: "Agents - the role library",
    description:
      "Strategy, Research, Coding, Marketing, Sales, Support, Finance, Compliance, QA, and Deployment - the ten resident agents of the agentic intelligence layer.",
    path: "/agents",
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
              <SectionLabel>Agents - Appendix B</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] text-gradient"
            >
              The role library.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 text-lg md:text-2xl text-white/65 max-w-3xl leading-relaxed"
            >
              Ten specialized agents that plan, execute, review, and improve - working together on one intelligence layer instead of in isolated chats.
            </motion.p>
          </div>
        </div>
      </section>

      {/* AGENT GRID */}
      <section id="role-library" className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROLES.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.03 }}
                className="glass-card p-6 flex flex-col hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                    <a.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">Agent</span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-white mb-2">{a.name}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-5">{a.remit}</p>
                <div className="mt-auto pt-4 border-t border-white/5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 mb-1.5">
                    Example output
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed font-mono">{a.example}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SWARMS CALLOUT */}
      <section id="swarms" className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-[#00F5D4]/30 bg-gradient-to-br from-[#00F5D4]/[0.06] to-transparent p-10 md:p-14 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,245,212,0.18),transparent_60%)] pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <Bot className="w-6 h-6 text-[#00F5D4]" strokeWidth={1.5} />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#00F5D4]">Swarms</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-5">
                Agents work as swarms, not soloists.
              </h2>
              <p className="text-lg text-white/65 max-w-3xl leading-relaxed mb-4">
                A swarm is a coordinated group of agents working a single objective in parallel - branching, debating, and converging on the strongest output before it ever reaches you.
              </p>
              <p className="text-white/55 max-w-3xl leading-relaxed">
                Strategy proposes. Research challenges. Coding builds in parallel branches. QA scores them against rubrics. Deployment ships the winner. The swarm decides faster, with more diversity of approach, than any single agent could.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { t: "Parallel branches", d: "Multiple solutions explored at once and scored against each other." },
                  { t: "Internal debate", d: "Critique agents stress-test plans before they leave the swarm." },
                  { t: "Single best output", d: "Only the strongest, scored, repaired result reaches you." },
                ].map((s) => (
                  <div key={s.t} className="rounded-2xl border border-white/10 bg-[#0A0A0A]/60 p-5">
                    <div className="text-sm font-semibold text-white mb-2">{s.t}</div>
                    <p className="text-sm text-white/55 leading-relaxed">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW THEY COORDINATE */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>How they coordinate</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                A real team, not a tab of chats.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                Agents share memory, context, and policy through the Unified Agent Layer. A plan written by Strategy is executed by Coding, reviewed by QA, and shipped by Deployment.
              </p>
              <p>
                Every output is scored against quality rubrics by the closed-loop Quality Engine. Failures are repaired automatically. Successful patterns are remembered and reused.
              </p>
              <p>
                You stay in the loop where it matters - approvals, spend through the Credit Ledger, and sensitive decisions - and out of the loop where it does not.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MARKETPLACE TEASER */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-10 md:p-14 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.10),transparent_60%)] pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-5">
                <Bot className="w-6 h-6 text-[#00F5D4]" strokeWidth={1.5} />
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/45">Skills Marketplace</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-5">
                A growing library of specialized skills.
              </h2>
              <p className="text-lg text-white/55 max-w-2xl">
                Future releases will extend the role library through a Skills Marketplace - new agent capabilities and verticalized workflows that plug straight into your company without configuration.
              </p>
              <div className="mt-8">
                <Link href="/roadmap">
                  <Button variant="outline" className="rounded-full h-10 px-5 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-[#00F5D4] group">
                    See the roadmap <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
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
                  See the agents in action.
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  Eve OS puts the team in front of you on day one. Request early access.
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
