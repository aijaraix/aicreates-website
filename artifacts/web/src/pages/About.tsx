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
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const PLATFORM_COMPONENTS = [
  {
    icon: Brain,
    name: "Adam",
    role: "Foundational Intelligence Core",
    desc: "The base reasoning and learning model that anchors the layer. Every specialized agent inherits capability from Adam.",
  },
  {
    icon: Sparkles,
    name: "Eve",
    role: "Operating Surface",
    desc: "The user-facing intelligence that translates intent into coordinated work across functions. Eve is what the operator talks to.",
  },
  {
    icon: Bot,
    name: "Jarvis",
    role: "Execution & Tooling Plane",
    desc: "The action layer - tool use, integrations, and autonomous execution against the operator's systems with policy and approvals enforced.",
  },
  {
    icon: Layers,
    name: "Unified Agent Layer",
    role: "Coordination Fabric",
    desc: "Shared memory, planning, and routing that lets every agent operate as one team rather than isolated chats.",
  },
  {
    icon: ShieldCheck,
    name: "Quality Engine",
    role: "Closed-Loop Review",
    desc: "Every output is scored against rubrics, critiqued, and rewritten before it reaches the operator. Failures repair themselves.",
  },
  {
    icon: Wallet,
    name: "Credit Ledger",
    role: "Programmable Spend",
    desc: "Scoped budgets, spend caps, and audit trails for every autonomous action. The economic accountability layer.",
  },
];

const PLATFORM_PILLARS = [
  { icon: Cpu, title: "Hybrid Compute Fabric", desc: "Local, edge, and cloud compute orchestrated to balance privacy, latency, and cost on every task." },
  { icon: Database, title: "Persistent Business Memory", desc: "Context, decisions, and outcomes accumulate as a durable, queryable substrate over time." },
  { icon: Workflow, title: "Self-Healing Workflows", desc: "Workflows detect their own failures, repair, retry, and learn from each cycle." },
  { icon: GitBranch, title: "Agentic Wallet Controls", desc: "Scoped permissions, spend caps, and human approvals keep autonomous action in policy." },
];

const AGENT_ROLES = [
  { icon: Compass, name: "Strategy", remit: "Frames goals, sequences priorities, and writes decision memos." },
  { icon: Search, name: "Research", remit: "Investigates markets, competitors, customers, and unknowns." },
  { icon: Code2, name: "Coding", remit: "Implements features, integrations, and automation against your stack." },
  { icon: Megaphone, name: "Marketing", remit: "Positions, writes, schedules, and measures campaigns." },
  { icon: Briefcase, name: "Sales", remit: "Builds pipeline, drafts outreach, qualifies leads, and runs follow-through." },
  { icon: Headphones, name: "Support", remit: "Handles inbound questions, drafts replies, and escalates intelligently." },
  { icon: Calculator, name: "Finance", remit: "Reconciles books, invoices, tracks runway, and prepares financial reporting." },
  { icon: Scale, name: "Compliance", remit: "Reviews against policy, regulation, and contractual obligations." },
  { icon: ShieldCheck, name: "QA", remit: "Reviews work product, scores it against rubrics, and rewrites for quality." },
  { icon: Rocket, name: "Deployment", remit: "Ships changes through environments, monitors, and rolls back on failure." },
];

const COMPANY_JOURNEY = [
  { n: "01", t: "Business Selection", d: "Pick your industry, model, and operating context. Eve loads the right defaults and starting playbooks." },
  { n: "02", t: "Objective", d: "State the goal in plain language. The layer converts it into a measurable plan with milestones." },
  { n: "03", t: "Asset Generation", d: "Brand, copy, site, decks, contracts, and product collateral generated from your objective." },
  { n: "04", t: "Agent Deployment", d: "The right agents are provisioned across every workspace area with policy, scope, and credits." },
  { n: "05", t: "Launch Stack", d: "Web, payments, email, and core infrastructure stood up and connected, ready to operate." },
  { n: "06", t: "CRM", d: "Customer records, conversations, and lifecycle hooks wired into the system of record." },
  { n: "07", t: "Automation", d: "Recurring workflows - outreach, billing, support, fulfillment - automated end-to-end." },
  { n: "08", t: "Optimization", d: "The Quality Engine scores outputs, repairs failures, and improves the next cycle automatically." },
];

const COMPANY_AREAS = [
  { area: "AI Command Center", purpose: "Talk to Eve, set goals, approve plans, and see what every agent is doing." },
  { area: "Apps", purpose: "Functional surfaces - marketing, sales, finance, legal, ops, support - each with resident agents." },
  { area: "Wallet & Credits", purpose: "Programmable spend through the Credit Ledger - scoped budgets, caps, and audit per action." },
  { area: "Memory & Files", purpose: "Persistent business memory and document store the agents read from and write to." },
  { area: "Activity Feed", purpose: "The real-time stream of agent work, reviews, and outcomes across the company." },
  { area: "Business Data", purpose: "Connected systems of record - CRM, accounting, analytics, vertical tools - exposed safely to agents." },
];

export default function About() {
  useSeo({
    title: "About - Platform, Agents, and Company in a Box",
    description:
      "AIcreatesAI is the agentic intelligence layer. One platform, a coordinated team of specialized agents, and a Company in a Box surface that runs your operation end-to-end.",
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
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>About AIcreatesAI</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-6xl md:text-8xl lg:text-[112px] font-serif font-semibold leading-[1.0] text-gradient tracking-tight"
            >
              One layer. Many products.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-xl md:text-3xl text-white/80 max-w-3xl leading-tight font-light"
            >
              The agentic intelligence layer the next generation of companies will run on.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 text-lg md:text-xl text-white/55 max-w-3xl leading-relaxed"
            >
              Three things make it work. A platform of named architectural components. A team of specialized agents that coordinate as one. A Company in a Box surface that turns the layer into a real operating company from day one.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/eve-os">
                <Button size="lg" className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  See it as Eve OS <ArrowRight className="ml-2 w-4 h-4" />
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
                The intelligence layer is built around named architectural components, each with a distinct role and a clear contract with the others. Adam reasons. Eve operates. Jarvis executes. The Unified Agent Layer coordinates. The Quality Engine reviews. The Credit Ledger holds spend accountable.
              </p>
              <p>
                Underneath, four primitives - hybrid compute, persistent memory, self-healing workflows, and the agentic wallet - make the system durable, fast, and safe by construction.
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
                    <c.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">Component</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-white">{c.name}</h3>
                <p className="text-xs uppercase tracking-[0.18em] text-[#00F5D4]/80 mt-1 mb-3">{c.role}</p>
                <p className="text-white/60 text-sm leading-relaxed">{c.desc}</p>
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
                  <p.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{p.desc}</p>
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
                Ten specialized agents - Strategy, Research, Coding, Marketing, Sales, Support, Finance, Compliance, QA, and Deployment - that plan, execute, review, and improve. They share memory, context, and policy through the Unified Agent Layer.
              </p>
              <p>
                A plan written by Strategy is executed by Coding, reviewed by QA, and shipped by Deployment. The Quality Engine scores every output. Failures repair themselves. Successful patterns are remembered and reused.
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
                    <a.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">Agent</span>
                </div>
                <h3 className="text-base font-serif font-semibold text-white mb-2">{a.name}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{a.remit}</p>
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
                The platform and agents come together as a Company in a Box - a coordinated virtual company across every workspace area. Eve runs it. Jarvis executes it. The Quality Engine reviews everything that ships.
              </p>
              <p>
                Eight steps from a single sentence to a compounding company. Six workspace areas - command center, apps, wallet, memory, activity, and data - that operators and agents share as one operating surface.
              </p>
            </div>
          </div>

          <div className="mb-10">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 mb-4">The 8-step journey</div>
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
                  <div className="text-xs font-mono text-[#00F5D4] tracking-widest mb-3">{s.n}</div>
                  <div className="text-base font-semibold text-white mb-2">{s.t}</div>
                  <p className="text-sm text-white/55 leading-relaxed">{s.d}</p>
                </motion.li>
              ))}
            </ol>
          </div>

          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 mb-4">Workspace areas</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
              <div className="divide-y divide-white/5">
                {COMPANY_AREAS.map((row, i) => (
                  <motion.div
                    key={row.area}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.3, delay: i * 0.03 }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 px-6 py-5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="md:col-span-4 flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.6)] shrink-0" />
                      <span className="text-base font-semibold text-white">{row.area}</span>
                    </div>
                    <div className="md:col-span-8 text-sm text-white/65 leading-relaxed">{row.purpose}</div>
                  </motion.div>
                ))}
              </div>
            </div>
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
                <Network className="w-7 h-7 text-[#00F5D4] mb-5" strokeWidth={1.5} />
                <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-4">
                  One layer. Many surfaces.
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  Talk to us about deploying the layer inside your company, or building on top of it.
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
