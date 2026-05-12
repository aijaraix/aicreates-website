import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Download,
  Server,
  Rocket,
  Cpu,
  Sparkles,
  Layers,
  Banknote,
  Building2,
  TrendingUp,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import HeroAurora from "@/components/HeroAurora";
import RoundsTable from "@/components/RoundsTable";
import AllocationCalculator from "@/components/AllocationCalculator";
import VestingCalendar from "@/components/VestingCalendar";
import DataCenterRequestForm from "@/components/DataCenterRequestForm";
import { Wordmark, SectionLabel } from "@/components/brand";
import SiteHeader from "@/components/SiteHeader";
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
      className={`relative px-6 md:px-10 py-20 md:py-28 ${className}`}
    >
      <div className="mx-auto max-w-6xl">
        {(eyebrow || title) && (
          <div className="mb-12">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
                  {eyebrow}
                </span>
              </div>
            )}
            {title && (
              <h2
                className="text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
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
        ctas={[
          {
            href: "https://www.aicreates.ai/litepaper",
            label: "Litepaper",
            variant: "outline",
            external: true,
            testId: "link-portal-litepaper",
          },
          {
            href: "/sign-in",
            label: "Sign in",
            variant: "outline",
            testId: "link-portal-signin",
          },
          {
            href: "/sign-up",
            label: "Reserve allocation",
            variant: "primary",
            testId: "link-portal-signup",
          },
        ]}
      />

      <section className="relative isolate min-h-[100dvh] flex items-center px-6 md:px-10 pt-10 pb-24">
        <HeroAurora />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-8 flex justify-center">
            <SectionLabel>AICA Founders Round 2026 - Now open</SectionLabel>
          </div>
          <h1 className="font-display text-[40px] sm:text-5xl md:text-7xl lg:text-[88px] font-semibold leading-[1.02] tracking-tight text-white">
            The Agentic Intelligence Layer.
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Reserve your allocation in the AICA Founders Round. $50M raise to
            ship the Agentic Business Operating System and the Hybrid Compute
            Fabric powering the next wave of AI-native companies.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
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
            Founders Commitment workflow. Not an offer to sell securities. All
            commitments are refundable until definitive documents are signed.
          </p>
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
              Eve OS replaces the dozens of disconnected tools a modern business
              runs on with a single agentic operator. Sales, finance, ops,
              support, hiring - one shared memory, one observable runtime, one
              accountable outcome owner.
            </p>
            <ul className="space-y-2 text-sm">
              <li>- Agentic CRM, ERP, helpdesk, and back-office in one runtime.</li>
              <li>- Native voice, vision, and document workflows.</li>
              <li>- Counted in outcomes shipped, not seats sold.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 relative overflow-hidden">
            <div className="absolute inset-0 portal-aurora opacity-30" />
            <div className="relative grid grid-cols-2 gap-3 text-xs">
              {[
                "Inbox triage",
                "Lead enrichment",
                "Quote → Cash",
                "Hiring pipeline",
                "Support ops",
                "Bookkeeping",
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
            A consumer + business <span className="text-[#00F5D4]">NeoBank</span>{" "}
            built on the layer.
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
            "Closed-loop evaluation + auto-repair",
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
              { label: "Closed-loop evaluation engine", pct: 9 },
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

      {/* ----------------------------- TOKENOMICS ----------------------------- */}
      <Section
        id="tokenomics"
        eyebrow="Tokenomics"
        title={<>10B AICA - utility for the entire <span className="text-[#00F5D4]">layer</span>.</>}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <div className="text-sm uppercase tracking-[0.18em] text-white/40 mb-3">
              Supply
            </div>
            <div
              className="text-4xl font-semibold"
              style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
            >
              10,000,000,000{" "}
              <span className="text-[#00F5D4] text-2xl">AICA</span>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-white/70">
              <li>- 30% Ecosystem + agent rewards</li>
              <li>- 22% Founders, team, and advisors (vesting)</li>
              <li>- 20% Treasury + future raises</li>
              <li>- 18% Public sale + secondary</li>
              <li>- 10% Founders Round (this raise)</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <div className="text-sm uppercase tracking-[0.18em] text-white/40 mb-3">
              Utility
            </div>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <span className="text-[#00F5D4]">Compute credits</span> across
                the Hybrid Compute Fabric.
              </li>
              <li>
                <span className="text-[#00F5D4]">Agent rewards</span> for
                builders shipping reusable workflows.
              </li>
              <li>
                <span className="text-[#00F5D4]">Quality staking</span> on the
                closed-loop evaluation engine.
              </li>
              <li>
                <span className="text-[#00F5D4]">NeoBank fee discounts</span> +
                preferred routing.
              </li>
            </ul>
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

      {/* ----------------------------- MATERIALS ----------------------------- */}
      <Section
        id="materials"
        eyebrow="Get the materials"
        title="Read deeper. Or get hands-on."
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col">
            <Download className="w-7 h-7 text-[#00F5D4]" />
            <div
              className="mt-5 text-xl font-semibold"
              style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
            >
              Download the Litepaper
            </div>
            <p className="mt-3 text-white/60 text-sm flex-1">
              The full visual whitepaper covering thesis, architecture, market,
              tokenomics, and roadmap.
            </p>
            <a
              href="/invest/litepaper.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition"
              data-testid="link-materials-litepaper"
            >
              Download PDF <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col">
            <Server className="w-7 h-7 text-[#00F5D4]" />
            <div
              className="mt-5 text-xl font-semibold"
              style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
            >
              Request data-center access
            </div>
            <div className="mt-4">
              <DataCenterRequestForm />
            </div>
          </div>
        </div>
      </Section>

      {/* ----------------------------- FINAL CTA ----------------------------- */}
      <section className="relative px-6 md:px-10 py-24 md:py-32 isolate overflow-hidden">
        <div className="absolute inset-0 portal-aurora opacity-40" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h2
            className="text-4xl md:text-5xl font-semibold tracking-tight"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            Reserve your allocation in the{" "}
            <span className="text-[#00F5D4]">Founders Round</span>.
          </h2>
          <p className="mt-5 text-white/70">
            Sign up, sign the SAFT, and fund by card, ACH, wire, or crypto.
            Your vesting calendar activates the moment your commitment funds.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition shadow-[0_0_40px_rgba(0,245,212,0.3)]"
              data-testid="link-final-reserve"
            >
              Reserve allocation <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-white/15 hover:bg-white/[0.06] transition"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ----------------------------- DISCLAIMER + FOOTER ----------------------------- */}
      <footer className="px-6 md:px-10 py-10 border-t border-white/5 text-xs text-white/40">
        <div className="mx-auto max-w-6xl space-y-4">
          <p>
            This page describes a Founders Commitment workflow and is not an
            offer to sell securities or solicitation of an offer to buy
            securities. SAFT terms are draft pending counsel review. AICA
            tokens, when issued, will be utility tokens for consumptive use
            within the AIcreatesAI ecosystem and are subject to vesting and
            jurisdictional restrictions.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
            <span>&copy; {new Date().getFullYear()} AICreatesAi</span>
            <a href="https://www.aicreates.ai" className="hover:text-white/70">
              aicreates.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
