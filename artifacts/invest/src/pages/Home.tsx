import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Download,
  Rocket,
  Cpu,
  Sparkles,
  Layers,
  Banknote,
  Building2,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Brain,
  Bot,
  Database,
  Boxes,
} from "lucide-react";
import RoundsTable from "@/components/RoundsTable";
import AllocationCalculator from "@/components/AllocationCalculator";
import VestingCalendar from "@/components/VestingCalendar";
import { SectionLabel } from "@/components/brand";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { computeVesting } from "@/lib/vesting";

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: "easeOut" },
} as const;

function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      {...sectionMotion}
      className={`relative py-14 md:py-24 ${className}`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          {(eyebrow || title) && (
            <div className="mb-12 max-w-3xl">
              {eyebrow && (
                <div className="mb-5">
                  <SectionLabel>{eyebrow}</SectionLabel>
                </div>
              )}
              {title && (
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] tracking-tight">
                  {title}
                </h2>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </motion.section>
  );
}

export default function Home() {
  const sample = computeVesting(10_000);
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* ----------------------------- HERO ----------------------------- */}
      <SiteHeader
        homeHref="https://www.aicreates.ai"
        homeExternal
        sticky
        ctas={[
          {
            href: "/sign-in",
            label: "Sign in",
            variant: "primary",
            testId: "link-portal-signin",
          },
        ]}
      />

      <section className="relative min-h-[100dvh] flex items-center pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,245,212,0.06),transparent_60%)] blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <SectionLabel>AICA Strategic Seed Round - Now open</SectionLabel>
            </div>
            <h1 className="text-[40px] sm:text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] mb-6 text-gradient">
              The Agentic Intelligence Layer.
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
              Reserve your allocation in the AICA Strategic Seed - the first
              of five SAFT rounds in a ~$50M private sale to ship the Agentic
              Business Operating System and the Hybrid Compute Fabric powering
              the next wave of AI-native companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition"
                data-testid="link-hero-reserve"
              >
                Reserve allocation
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <a
                href="/invest/litepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] transition"
                data-testid="link-hero-litepaper"
              >
                <Download className="mr-2 w-4 h-4" /> Download Litepaper
              </a>
            </div>
            <p className="mt-6 text-xs text-white/40 max-w-xl mx-auto">
              AICA Strategic Seed Round - SAFT-based commitments. Not an offer
              to sell securities. All commitments are refundable until
              definitive documents are signed.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------- VISION ----------------------------- */}
      <Section
        id="vision"
        eyebrow="Vision"
        title={
          <>
            We are building the layer{" "}
            <span className="text-[#00F5D4]">companies, capital, and consumers</span>{" "}
            will run on.
          </>
        }
      >
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Sparkles,
              title: "Agentic-first",
              body: "Self-healing workflows replace the static SaaS layer. Every business process becomes a closed-loop quality engine.",
            },
            {
              icon: Layers,
              title: "Hybrid compute fabric",
              body: "Owned GPU clusters + multi-cloud reach. Latency-sensitive inference at the edge, training at the core.",
            },
            {
              icon: ShieldCheck,
              title: "Closed-loop quality",
              body: "Every agent action is observed, evaluated, and improved automatically - the engine that makes agents trustworthy at scale.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-7"
            >
              <c.icon className="w-7 h-7 text-[#00F5D4]" />
              <div
                className="mt-5 text-xl font-semibold"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                {c.title}
              </div>
              <p className="mt-3 text-white/60 text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------- PROBLEM ----------------------------- */}
      <Section
        id="problem"
        eyebrow="The Problem"
        title="The SaaS stack was built for humans clicking buttons - not for agents executing outcomes."
      >
        <div className="grid md:grid-cols-2 gap-5 text-white/70">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <div className="text-sm uppercase tracking-[0.18em] text-white/40">
              Today
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              <li>- Fragmented point-tools, no shared memory.</li>
              <li>- Agents that hallucinate, drift, and cannot self-recover.</li>
              <li>- Compute as a recurring cost center, not an asset.</li>
              <li>- Founders spending months wiring the same plumbing.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-[#00F5D4]/30 bg-gradient-to-br from-[#00F5D4]/10 to-transparent p-7">
            <div className="text-sm uppercase tracking-[0.18em] text-[#00F5D4]">
              Tomorrow
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              <li>- One Agentic OS that remembers, learns, and self-heals.</li>
              <li>- Compute owned and amortized, not rented and burned.</li>
              <li>- Founders launch in days, not quarters.</li>
              <li>- A measurable, trusted layer for capital + consumers alike.</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* ----------------------------- SOLUTION ----------------------------- */}
      <Section
        id="solution"
        eyebrow="Our Solution"
        title="Three primitives. One coherent intelligence layer."
      >
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: Cpu,
              title: "Hybrid Compute Fabric",
              body: "Owned GPU cluster + multi-cloud orchestration that routes every workload to the right silicon at the right cost.",
            },
            {
              icon: Layers,
              title: "Closed-Loop Quality Engine",
              body: "Continuous evaluation, repair, and red-teaming so agents become more reliable each cycle, not less.",
            },
            {
              icon: Rocket,
              title: "Self-Healing Workflows",
              body: "Long-running agents that detect drift, restart safely, and complete the outcome they were tasked with.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:border-[#00F5D4]/40 transition"
            >
              <c.icon className="w-7 h-7 text-[#00F5D4]" />
              <div
                className="mt-5 text-xl font-semibold"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                {c.title}
              </div>
              <p className="mt-3 text-white/60 text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------- PLATFORM COMPONENTS ----------------------------- */}
      <Section
        id="platform"
        eyebrow="Platform components"
        title={
          <>
            Named architecture.{" "}
            <span className="text-[#00F5D4]">One coordinated layer.</span>
          </>
        }
      >
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Brain,
              name: "Adam",
              role: "Foundational intelligence core",
              desc: "Base reasoning and learning model that anchors the layer.",
            },
            {
              icon: Sparkles,
              name: "Eve",
              role: "Operating surface",
              desc: "Translates operator intent into coordinated work across functions.",
            },
            {
              icon: Bot,
              name: "Jarvis",
              role: "Execution and tooling plane",
              desc: "Tool use, integrations, and autonomous execution under policy.",
            },
            {
              icon: Cpu,
              name: "Hybrid Compute Fabric",
              role: "Owned GPU + multi-cloud",
              desc: "Routes every workload to the right silicon at the right cost.",
            },
            {
              icon: ShieldCheck,
              name: "Closed-Loop Quality Engine",
              role: "Continuous evaluation",
              desc: "Scores, critiques, and rewrites every output before it ships.",
            },
            {
              icon: Rocket,
              name: "Self-Healing Workflows",
              role: "Resilient long-running agents",
              desc: "Detect drift, repair, retry, and complete the assigned outcome.",
            },
            {
              icon: Database,
              name: "Persistent Business Memory",
              role: "Durable substrate",
              desc: "Context, decisions, and outcomes accumulate as a queryable store.",
            },
            {
              icon: Boxes,
              name: "Skills Marketplace",
              role: "Distribution surface",
              desc: "Publish skills, plug into the credit ledger, and earn revenue share.",
            },
          ].map((c) => (
            <div
              key={c.name}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-[#00F5D4]/30 transition"
            >
              <c.icon className="w-6 h-6 text-[#00F5D4]" />
              <div
                className="mt-4 text-base font-semibold"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                {c.name}
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">
                {c.role}
              </div>
              <p className="mt-3 text-white/60 text-xs leading-relaxed">
                {c.desc}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="https://www.aicreates.ai/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-white/15 bg-white/[0.02] text-sm text-white hover:bg-white/[0.06] hover:text-[#00F5D4] transition"
            data-testid="link-platform-about"
          >
            Read the layer architecture <ArrowRight className="ml-2 w-4 h-4" />
          </a>
          <a
            href="https://www.aicreates.ai/eve-os"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-white/15 bg-white/[0.02] text-sm text-white hover:bg-white/[0.06] hover:text-[#00F5D4] transition"
            data-testid="link-platform-eve-os"
          >
            Eve OS <ArrowRight className="ml-2 w-4 h-4" />
          </a>
          <a
            href="https://www.aicreates.ai/neobank"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-white/15 bg-white/[0.02] text-sm text-white hover:bg-white/[0.06] hover:text-[#00F5D4] transition"
            data-testid="link-platform-neobank"
          >
            NeoBank <ArrowRight className="ml-2 w-4 h-4" />
          </a>
          <a
            href="https://www.aicreates.ai/litepaper#tokenomics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-white/15 bg-white/[0.02] text-sm text-white hover:bg-white/[0.06] hover:text-[#00F5D4] transition"
            data-testid="link-platform-tokenomics"
          >
            Tokenomics <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </Section>

      {/* ----------------------------- EVE OS ----------------------------- */}
      <Section
        id="eve"
        eyebrow="Flagship product"
        title={
          <>
            <span className="text-[#00F5D4]">Eve OS</span> - the Agentic Business
            Operating System.
          </>
        }
      >
        <div className="grid md:grid-cols-[1.1fr,1fr] gap-8 items-center">
          <div className="space-y-4 text-white/70 leading-relaxed">
            <p>
              Eve OS is the Company in a Box. One agentic operator coordinates
              marketing, sales, finance, legal, operations, and development -
              one shared memory, one observable runtime, one accountable
              outcome owner.
            </p>
            <ul className="space-y-2 text-sm">
              <li>- Coordinated execution across every business function.</li>
              <li>- Native voice, vision, and document workflows.</li>
              <li>- Counted in outcomes shipped, not seats sold.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 relative overflow-hidden">
            <div className="absolute inset-0 portal-aurora opacity-30" />
            <div className="relative grid grid-cols-2 gap-3 text-xs">
              {[
                "Marketing",
                "Sales",
                "Finance",
                "Legal",
                "Operations",
                "Development",
              ].map((m) => (
                <div
                  key={m}
                  className="rounded-lg border border-white/10 bg-black/40 p-3"
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#00F5D4]">
                    Agent
                  </div>
                  <div className="mt-1 font-medium">{m}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ----------------------------- NEOBANK ----------------------------- */}
      <Section
        id="neobank"
        eyebrow="Secondary product line"
        title={
          <>
            <span className="text-[#00F5D4]">Capital that thinks.</span> A
            consumer + business NeoBank built on the layer.
          </>
        }
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <Banknote className="w-7 h-7 text-[#00F5D4]" />
            <div
              className="mt-4 text-xl font-semibold"
              style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
            >
              Consumer
            </div>
            <p className="mt-3 text-white/60 text-sm">
              An agent-managed bank account that negotiates bills, optimizes
              cashflow, and acts on your behalf - not just stores your money.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <Building2 className="w-7 h-7 text-[#00F5D4]" />
            <div
              className="mt-4 text-xl font-semibold"
              style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
            >
              Business
            </div>
            <p className="mt-3 text-white/60 text-sm">
              Treasury + payments + AR/AP delivered as agentic services native
              to Eve OS - not bolted on through brittle integrations.
            </p>
          </div>
        </div>
      </Section>

      {/* ----------------------------- MARKET ----------------------------- */}
      <Section
        id="market"
        eyebrow="Market opportunity"
        title="A $1T+ rebundling of SaaS, BPO, and bank-rails into an agentic layer."
      >
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { figure: "$650B", label: "Global SaaS spend by 2028" },
            { figure: "$420B", label: "BPO + outsourced ops" },
            { figure: "$230B", label: "Embedded finance + banking software" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-7"
            >
              <div
                className="text-4xl font-semibold text-[#00F5D4]"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                {m.figure}
              </div>
              <div className="mt-2 text-sm text-white/60">{m.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------- CAPABILITIES ----------------------------- */}
      <Section
        id="capabilities"
        eyebrow="Core capabilities"
        title="What the layer does, end-to-end."
      >
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            "Long-running agents with stable memory",
            "Multi-modal voice + vision + docs",
            "Native tool-use + system control",
            "Closed-Loop Quality Engine + auto-repair",
            "Owned GPU + cloud bursting",
            "Compliance + audit trails by default",
            "Agent-to-agent secure messaging",
            "Outcome billing and observability",
            "Open API + on-prem deployable",
          ].map((c) => (
            <div
              key={c}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-white/80"
            >
              <span className="text-[#00F5D4] mr-2">•</span>
              {c}
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------- USE OF FUNDS ----------------------------- */}
      <Section
        id="use-of-funds"
        eyebrow="Use of funds"
        title="$50M raise. Built for compounding leverage."
      >
        <div className="grid md:grid-cols-[1fr,1fr] gap-8 items-center">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            {[
              { label: "GPU cluster + data-center build", pct: 40 },
              { label: "Eve OS R&D + engineering", pct: 28 },
              { label: "NeoBank + go-to-market", pct: 18 },
              { label: "Closed-Loop Quality Engine", pct: 9 },
              { label: "Operating + reserves", pct: 5 },
            ].map((row) => (
              <div key={row.label} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm">
                  <span>{row.label}</span>
                  <span className="text-[#00F5D4] font-medium">{row.pct}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00F5D4] to-[#3b82f6]"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4 text-white/70">
            <p>
              Anchored by a $3.5M GPU cluster buildout that brings inference
              economics in-house. The cluster powers Eve OS, NeoBank, and a
              growing list of partner deployments.
            </p>
            <p>
              Capital is sequenced against shipping milestones, not headcount
              targets. Every dollar is mapped to a measurable artifact.
            </p>
          </div>
        </div>
      </Section>

      {/* ----------------------------- TOKENOMICS / TOKEN UTILITY ----------------------------- */}
      <Section
        id="tokenomics"
        eyebrow="$AICA Token Utility"
        title={<>The economic engine of the <span className="text-[#00F5D4]">layer</span>.</>}
      >
        <div className="space-y-6 text-white/75 text-base md:text-lg leading-relaxed">
          <p>
            The $AICA token is the economic engine of the AIcreatesAI ecosystem. It is designed to reward real contributions, drive high-quality participation, and create a sustainable, usage-driven economy.
          </p>
          <p>
            While core platform revenue comes from stablecoin and fiat subscriptions, the $AICA token serves as the primary mechanism to incentivize network growth, improve intelligence quality, and align long-term participants with the success of the platform.
          </p>
        </div>

        {/* Supply + Philosophy */}
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">Total supply</div>
            <div className="text-4xl font-semibold" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}>
              10,000,000,000 <span className="text-[#00F5D4] text-2xl">AICA</span>
            </div>
            <p className="mt-4 text-sm text-white/65 leading-relaxed">
              Fixed supply. 22.5% allocated to the private sale across 5 SAFT rounds ($50M raise, ~$230M FDV blended). All private-round tokens subject to vesting (25% at TGE, 6-month cliff, then linear over 24 months).
            </p>
          </div>
          <div className="rounded-2xl border border-[#00F5D4]/25 bg-[#00F5D4]/[0.04] p-7">
            <div className="text-xs uppercase tracking-[0.18em] text-[#00F5D4] mb-3">Core philosophy</div>
            <p className="text-white/80 text-base leading-relaxed">
              Every token earned or spent should either improve the network (through meaningful contributions) or enhance user experience (through access and utility). The token economy is built around a closed-loop "recycle" model where platform revenue and fees continuously fund rewards for active contributors.
            </p>
          </div>
        </div>
      </Section>

      {/* ----------------------------- CORE INCENTIVES ----------------------------- */}
      <Section
        id="core-incentives"
        eyebrow="Core Incentives"
        title={<>Three primary ways to <span className="text-[#00F5D4]">earn</span>.</>}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          {[
            {
              category: "GPU Contributions (Validators)",
              what: "Run the desktop client in Validator Mode or dedicated nodes.",
              how: "See detailed breakdown below.",
              why: "Powers the decentralized compute layer.",
            },
            {
              category: "Data Supplying",
              what: "Share high-quality business or synthetic data (opt-in).",
              how: "Earn based on data quality, volume, and usefulness to model improvement.",
              why: "Fuels the self-improving intelligence flywheel.",
            },
            {
              category: "Skills Development",
              what: "Create, submit, and get approved skills on the Marketplace.",
              how: "Earn royalties on usage plus creation bonuses and performance rewards.",
              why: "Builds a rich, community-driven skills ecosystem.",
            },
          ].map((row, idx) => (
            <div key={row.category} className={`p-6 md:p-7 grid md:grid-cols-12 gap-4 md:gap-6 ${idx > 0 ? "border-t border-white/5" : ""}`}>
              <div className="md:col-span-3">
                <div className="text-base font-semibold text-white" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}>{row.category}</div>
              </div>
              <div className="md:col-span-3 text-sm text-white/70 leading-relaxed">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">What participants do</div>
                {row.what}
              </div>
              <div className="md:col-span-3 text-sm text-white/70 leading-relaxed">
                <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">How rewards work</div>
                {row.how}
              </div>
              <div className="md:col-span-3 text-sm text-[#00F5D4]/90 leading-relaxed">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#00F5D4]/70 mb-1">Why it matters</div>
                {row.why}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------- VALIDATOR REWARDS ----------------------------- */}
      <Section
        id="validator-rewards"
        eyebrow="Validator Rewards"
        title={<>The backbone of decentralized <span className="text-[#00F5D4]">compute</span>.</>}
      >
        <p className="text-white/65 text-base md:text-lg leading-relaxed mb-8 max-w-3xl">
          Validators are the backbone of our decentralized compute network. We operate a two-tier system designed to reward both casual participants and serious operators.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] bg-white/10 text-white/60">Tier 1</span>
            </div>
            <h3 className="text-2xl font-serif font-semibold text-white mb-1">Retail Validators</h3>
            <p className="text-white/55 text-sm mb-5">Easy entry point. Run in the background when idle. Ideal for side income and broad user acquisition.</p>
            <dl className="space-y-3 text-sm border-t border-white/5 pt-5">
              {[
                ["Target", "Everyday users"],
                ["Hardware", "Consumer GPUs (via desktop app)"],
                ["Staking", "Not required"],
                ["Reward level", "Steady baseline"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-white/40 pt-0.5">{k}</dt>
                  <dd className="text-white/80">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl border border-[#00F5D4]/30 bg-gradient-to-b from-[#00F5D4]/[0.04] to-transparent p-7">
            <div className="flex items-start justify-between mb-5">
              <div className="w-11 h-11 rounded-lg bg-[#00F5D4]/15 border border-[#00F5D4]/30 flex items-center justify-center">
                <Boxes className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] bg-[#00F5D4]/15 text-[#00F5D4]">Tier 2 - 2.5x to 4x</span>
            </div>
            <h3 className="text-2xl font-serif font-semibold text-white mb-1">Large / Professional Validators</h3>
            <p className="text-white/55 text-sm mb-5">Dedicated hardware with staking commitment. Receive priority task routing and higher reward multipliers.</p>
            <dl className="space-y-3 text-sm border-t border-white/5 pt-5">
              {[
                ["Target", "Serious operators & companies"],
                ["Hardware", "High-end GPUs (Blackwell, H100, A100+)"],
                ["Staking", "Yes (minimum required)"],
                ["Reward level", "Significantly higher (2.5x to 4x multiplier)"],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[120px_1fr] gap-3">
                  <dt className="text-[10px] uppercase tracking-[0.18em] text-white/40 pt-0.5">{k}</dt>
                  <dd className="text-white/80">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-3">How validator rewards work</div>
          <p className="text-white/70 text-base leading-relaxed">
            Rewards are distributed from the Community & Rewards pool. Base rewards are calculated on effective VRAM hours contributed, uptime, and task success rate. Large / Professional Validators receive a multiplier due to higher reliability and staking commitment. Top performers in both tiers receive additional performance bonuses.
          </p>
        </div>
      </Section>

      {/* ----------------------------- ADDITIONAL INCENTIVES ----------------------------- */}
      <Section
        id="additional-incentives"
        eyebrow="Additional Incentives"
        title={<>Rewarded for everything that improves the <span className="text-[#00F5D4]">system</span>.</>}
      >
        <div className="grid gap-4">
          {[
            {
              name: "Workflow & Outcome Rewards",
              desc: "Bonus $AICA for workflows that deliver measurable business results - successful marketing campaigns with strong ROI, closed deals, accurate financial reports.",
              benefit: "Encourages real-world, high-value usage.",
            },
            {
              name: "High-Quality Feedback & Evaluation",
              desc: "Users earn $AICA by providing detailed feedback on outputs - accuracy ratings, usefulness scores, business value assessment, error corrections, and improvement suggestions. Rewards scale with depth, consistency, and measurable impact on model improvement.",
              benefit: "Directly strengthens the closed-loop quality system and continuously improves Eve OS.",
            },
            {
              name: "Validator Performance Tiers",
              desc: "Extra bonus rewards for validators (both Retail and Large) with exceptional uptime, low latency, or high task success rates.",
              benefit: "Improves overall network reliability and quality.",
            },
            {
              name: "Premium Feature Access",
              desc: "Use $AICA to unlock advanced swarms, higher usage limits, priority compute, or exclusive skills.",
              benefit: "Creates ongoing demand for the token.",
            },
            {
              name: "Referral & Growth Rewards",
              desc: "Earn $AICA for successfully referring active users or new validators.",
              benefit: "Accelerates network growth.",
            },
          ].map((row) => (
            <div key={row.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7 grid md:grid-cols-12 gap-5">
              <div className="md:col-span-3">
                <div className="text-base md:text-lg font-semibold text-white" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}>{row.name}</div>
              </div>
              <div className="md:col-span-6 text-white/70 text-sm md:text-base leading-relaxed">{row.desc}</div>
              <div className="md:col-span-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#00F5D4]/70 mb-1">Benefit</div>
                <div className="text-[#00F5D4]/90 text-sm leading-relaxed">{row.benefit}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------- RECYCLE MODEL ----------------------------- */}
      <Section
        id="recycle-model"
        eyebrow="Recycle Model"
        title={<>A closed-loop, self-sustaining <span className="text-[#00F5D4]">economy</span>.</>}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 space-y-4 text-white/70 text-base leading-relaxed">
          <p>A portion of stablecoin subscription revenue is used to buy $AICA and seed the Compute Reward Pool.</p>
          <p>All $AICA earned by the platform - marketplace fees, transaction fees, slashing, discount redemptions - flows back into the same pool.</p>
          <p>Rewards are distributed to validators, data providers, skill creators, high-quality feedback providers, and users who achieve strong business outcomes.</p>
          <p className="text-[#00F5D4]/90 font-medium">The result: platform usage continuously fuels token demand, and token rewards continuously fuel platform contribution.</p>
        </div>
      </Section>

      {/* ----------------------------- UTILITY SUMMARY ----------------------------- */}
      <Section
        id="utility-summary"
        eyebrow="Summary"
        title={<>$AICA token utility <span className="text-[#00F5D4]">summary</span>.</>}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-utility-summary">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                <tr>
                  <th className="text-left px-6 py-4 font-medium">Utility type</th>
                  <th className="text-left px-6 py-4 font-medium">Primary beneficiaries</th>
                  <th className="text-left px-6 py-4 font-medium">Key purpose</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { type: "Compute Rewards (Validators)", who: "Retail + Large/Professional Validators", purpose: "Decentralized compute power" },
                  { type: "Data Rewards", who: "Data providers", purpose: "Model improvement flywheel" },
                  { type: "Skills Marketplace", who: "Skill creators & users", purpose: "Community-driven capabilities" },
                  { type: "Workflow & Outcome Rewards", who: "Active users", purpose: "Real business impact" },
                  { type: "High-Quality Feedback", who: "All users", purpose: "Continuous system improvement" },
                  { type: "Premium Feature Access", who: "Active users", purpose: "Token demand & utility" },
                  { type: "Referral & Growth Rewards", who: "Community", purpose: "Network growth" },
                  { type: "Validator Performance Bonuses", who: "Top-performing validators", purpose: "Network quality & reliability" },
                ].map((row) => (
                  <tr key={row.type} className="border-t border-white/5">
                    <td className="px-6 py-4 font-semibold text-white whitespace-nowrap" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}>{row.type}</td>
                    <td className="px-6 py-4 text-white/70">{row.who}</td>
                    <td className="px-6 py-4 text-[#00F5D4]/85">{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* ----------------------------- ROADMAP ----------------------------- */}
      <Section
        id="roadmap"
        eyebrow="Roadmap"
        title="Four phases, twelve milestones."
      >
        <div className="grid md:grid-cols-4 gap-3">
          {[
            { phase: "Q2 2026", title: "Layer", body: "Hybrid Compute Fabric live. Eve OS private beta." },
            { phase: "Q4 2026", title: "Launch", body: "TGE. NeoBank consumer waitlist opens." },
            { phase: "Q2 2027", title: "Scale", body: "GPU cluster online. Eve OS GA + partner program." },
            { phase: "Q4 2027", title: "Network", body: "On-chain settlement. Cross-org agent network." },
          ].map((p) => (
            <div
              key={p.phase}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
            >
              <Calendar className="w-5 h-5 text-[#00F5D4]" />
              <div className="mt-3 text-xs uppercase tracking-[0.18em] text-white/40">
                {p.phase}
              </div>
              <div
                className="mt-1 text-lg font-semibold"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                {p.title}
              </div>
              <p className="mt-2 text-xs text-white/60">{p.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ----------------------------- WHAT YOU'RE BUYING ----------------------------- */}
      <Section
        id="what-you-buy"
        eyebrow="What you're buying"
        title="Concrete terms. Transparent vesting."
      >
        <div className="space-y-8">
          <RoundsTable />
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#00F5D4]" />
              <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                Vesting calendar (sample 10,000 AICA)
              </div>
            </div>
            <VestingCalendar schedule={sample.schedule} total={10_000} />
            <p className="mt-4 text-xs text-white/40">
              25% at TGE, 6-month cliff, then linear over 24 months. The
              vesting calendar updates with your real funded date once your
              commitment settles.
            </p>
          </div>
          <AllocationCalculator />
        </div>
      </Section>

      {/* ----------------------------- FINAL CTA ----------------------------- */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 w-full">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-10 sm:p-12 md:p-20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px divider-line" />
            <div className="relative">
              <div className="mb-6 flex justify-center">
                <SectionLabel>AICA Strategic Seed Round</SectionLabel>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05] tracking-tight">
                Reserve your allocation in the Strategic Seed Round.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-white/65 leading-relaxed max-w-2xl mx-auto">
                Sign up, sign the SAFT, and fund by card, wire, or crypto.
                Your vesting calendar activates the moment your commitment
                funds.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition"
                  data-testid="link-final-reserve"
                >
                  Reserve allocation <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-white/15 bg-transparent text-white hover:bg-white/5 transition"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
