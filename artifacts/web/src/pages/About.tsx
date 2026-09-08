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
  Brain,
  Bot,
  Wallet,
  Compass,
  Search,
  Code2,
  Megaphone,
  Briefcase,
  Headphones,
  Calculator,
  Scale,
  Rocket,
  Network,
} from "lucide-react";
import { useSeo } from "@/lib/useSeo";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
        {children}
      </span>
    </div>
  );
}

const PLATFORM_COMPONENTS = [
  {
    icon: Brain,
    name: "Adam",
    role: "Internal executive intelligence",
    desc: "Supports AI Creates AI's own strategy, priorities and company operations.",
  },
  {
    icon: Sparkles,
    name: "Eve",
    role: "Customer executive intelligence",
    desc: "Helps EVE CXO customers turn business goals into coordinated work across their departments.",
  },
  {
    icon: Layers,
    name: "Hermes",
    role: "Shared orchestration runtime",
    desc: "Coordinates tasks, handoffs, approvals and durable execution beneath Adam and Eve.",
  },
  {
    icon: Bot,
    name: "Jarvis",
    role: "Builder and engineering",
    desc: "The dedicated building experience for software, websites and technical implementation.",
  },
  {
    icon: ShieldCheck,
    name: "Review and approvals",
    role: "Human control",
    desc: "Review work and retain approval over consequential business actions.",
  },
  {
    icon: Wallet,
    name: "Usage and billing",
    role: "Operational accountability",
    desc: "Track usage and billing within the account's existing plans and entitlements.",
  },
];

const PLATFORM_PILLARS = [
  {
    icon: Cpu,
    title: "Connected Tools",
    desc: "Bring approved business systems into workflows through scoped integrations.",
  },
  {
    icon: Database,
    title: "Business Memory",
    desc: "Keep business context and working records associated with their workspace.",
  },
  {
    icon: Workflow,
    title: "Durable Workflows",
    desc: "Track progress and preserve state so interrupted work can be reviewed and recovered.",
  },
  {
    icon: GitBranch,
    title: "Clear Authority",
    desc: "Roles, tool permissions and approvals define which actions each agent may take.",
  },
];

const AGENT_ROLES = [
  {
    icon: Compass,
    name: "Strategy",
    remit: "Frames goals, sequences priorities, and writes decision memos.",
  },
  {
    icon: Search,
    name: "Research",
    remit: "Investigates markets, competitors, customers, and unknowns.",
  },
  {
    icon: Code2,
    name: "Coding",
    remit:
      "Implements features, integrations, and automation against your stack.",
  },
  {
    icon: Megaphone,
    name: "Marketing",
    remit: "Positions, writes, schedules, and measures campaigns.",
  },
  {
    icon: Briefcase,
    name: "Sales",
    remit:
      "Builds pipeline, drafts outreach, qualifies leads, and runs follow-through.",
  },
  {
    icon: Headphones,
    name: "Support",
    remit:
      "Handles inbound questions, drafts replies, and escalates intelligently.",
  },
  {
    icon: Calculator,
    name: "Finance",
    remit:
      "Reconciles books, invoices, tracks runway, and prepares financial reporting.",
  },
  {
    icon: Scale,
    name: "Compliance",
    remit: "Reviews against policy, regulation, and contractual obligations.",
  },
  {
    icon: ShieldCheck,
    name: "QA",
    remit:
      "Reviews work product, scores it against rubrics, and rewrites for quality.",
  },
  {
    icon: Rocket,
    name: "Deployment",
    remit:
      "Ships changes through environments, monitors, and rolls back on failure.",
  },
];

const COMPANY_JOURNEY = [
  {
    n: "01",
    t: "Business Selection",
    d: "Pick your industry, model, and operating context. Eve loads the right defaults and starting playbooks.",
  },
  {
    n: "02",
    t: "Objective",
    d: "State the goal in plain language. The layer converts it into a measurable plan with milestones.",
  },
  {
    n: "03",
    t: "Asset Generation",
    d: "Brand, copy, site, decks, contracts, and product collateral generated from your objective.",
  },
  {
    n: "04",
    t: "Agent Deployment",
    d: "The right agents are provisioned across every workspace area with policy, scope, and credits.",
  },
  {
    n: "05",
    t: "Launch Stack",
    d: "Connect approved web, billing and communication services, then verify each workflow before activation.",
  },
  {
    n: "06",
    t: "CRM",
    d: "Customer records, conversations, and lifecycle hooks wired into the system of record.",
  },
  {
    n: "07",
    t: "Automation",
    d: "Connect recurring work to explicit permissions, review steps and approved providers.",
  },
  {
    n: "08",
    t: "Optimization",
    d: "Review outcomes, capture useful context and improve the next operating cycle.",
  },
];

export default function About() {
  useSeo({
    title: "About - Platform, Agents, and Company in a Box",
    description:
      "AI Creates AI is the company behind EVE CXO, with Adam for internal operations, Eve for customers and Hermes for shared orchestration.",
    path: "/about",
  });
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel>About AI Creates AI</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-6xl md:text-8xl lg:text-[112px] font-serif font-semibold leading-[1.0] text-gradient tracking-tight"
            >
              The company behind EVE CXO.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-xl md:text-3xl text-white/80 max-w-3xl leading-tight font-light"
            >
              Executive intelligence for a coordinated business.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 text-lg md:text-xl text-white/55 max-w-3xl leading-relaxed"
            >
              AI Creates AI brings together executive direction, department
              specialists and a shared orchestration runtime. EVE CXO is the
              commercial product that puts this work in the hands of business
              operators.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Button
                size="lg"
                className="rounded-full h-12 px-7 teal-btn"
                asChild
              >
                <Link href="/eve-cxo">
                  See it as EVE CXO <ArrowRight className="ms-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-12 px-7 glass-btn"
                asChild
              >
                <Link href="/contact">Contact the company</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PLATFORM SECTION */}
      <section id="platform" className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-14">
            <div className="md:col-span-5">
              <SectionLabel>Platform</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                Six named components. One coherent system.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                AI Creates AI is the parent company. Adam supports its internal
                executive work; Eve is the customer-facing executive
                intelligence in EVE CXO. Hermes is the shared orchestration
                runtime. Jarvis provides the dedicated building and engineering
                experience.
              </p>
              <p>
                Connected tools, workspace memory, durable workflows and
                explicit authority support this architecture. Each integration
                and deployment has its own access and verification requirements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {PLATFORM_COMPONENTS.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="glass-card p-6 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                    <c.icon
                      className="w-5 h-5 text-[#00F5D4]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">
                    Component
                  </span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-white">
                  {c.name}
                </h3>
                <p className="text-xs uppercase tracking-[0.18em] text-[#00F5D4]/80 mt-1 mb-3">
                  {c.role}
                </p>
                <p className="text-white/60 text-sm leading-relaxed">
                  {c.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.04 }}
                className="glass-card p-6 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center mb-5">
                  <p.icon
                    className="w-5 h-5 text-[#00F5D4]"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">
                  {p.title}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENTS SECTION */}
      <section id="agents" className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-14">
            <div className="md:col-span-5">
              <SectionLabel>Agents</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                A coordinated team across every function.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                Department heads and specialist agents support strategy,
                research, coding, marketing, sales, support, finance,
                compliance, review and deployment. The roles below illustrate
                areas of work; existing workspace identities and reporting
                structures remain distinct.
              </p>
              <p>
                A plan can pass from research to implementation and review, with
                its context carried through the workflow. External actions
                depend on the connected tools, permissions and approvals in that
                workspace.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {AGENT_ROLES.map((a, i) => (
              <motion.div
                key={a.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="glass-card p-6 hover:border-[#00F5D4]/30 transition-colors flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                    <a.icon
                      className="w-5 h-5 text-[#00F5D4]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">
                    Agent
                  </span>
                </div>
                <h3 className="text-base font-serif font-semibold text-white mb-2">
                  {a.name}
                </h3>
                <p className="text-white/55 text-sm leading-relaxed">
                  {a.remit}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANY IN A BOX SECTION */}
      <section id="company-in-a-box" className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-14">
            <div className="md:col-span-5">
              <SectionLabel>Company in a Box</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                A coordinated virtual company, on demand.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                EVE CXO brings an executive view to coordinated department work.
                Eve helps the customer direct it, Hermes coordinates execution,
                and Jarvis supports building and engineering.
              </p>
              <p>
                An illustrative operating journey connects goals, working assets
                and customer follow-through. Availability depends on the
                workspace and its approved integrations.
              </p>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 mb-4">
              The 8-step journey
            </div>
            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COMPANY_JOURNEY.map((s, i) => (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-[#00F5D4]/30 transition-colors"
                >
                  <div className="text-xs font-mono text-[#00F5D4] tracking-widest mb-3">
                    {s.n}
                  </div>
                  <div className="text-base font-semibold text-white mb-2">
                    {s.t}
                  </div>
                  <p className="text-sm text-white/55 leading-relaxed">{s.d}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <Network
                  className="w-7 h-7 text-[#00F5D4] mb-5"
                  strokeWidth={1.5}
                />
                <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-4">
                  Bring your business into focus.
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  Talk to us about deploying the layer inside your company, or
                  building on top of it.
                </p>
              </div>
              <Button
                size="lg"
                className="rounded-full h-12 px-8 teal-btn whitespace-nowrap"
                asChild
              >
                <Link href="/contact">
                  Engage with us <ArrowRight className="ms-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
