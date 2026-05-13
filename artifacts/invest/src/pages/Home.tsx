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
import DeckCarousel from "@/components/DeckCarousel";
import RoundsTable from "@/components/RoundsTable";
import AllocationCalculator from "@/components/AllocationCalculator";
import aicaUtilityLayerUrl from "@/assets/tokenomics/aica-utility-layer.png";
import aicaTokenUtilityMapUrl from "@/assets/tokenomics/aica-token-utility-map.png";
import VestingCalendar from "@/components/VestingCalendar";
import { SectionLabel } from "@/components/brand";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import HeroVideoReel from "@/components/HeroVideoReel";
import { computeVesting } from "@/lib/vesting";
import { useInvestSeo } from "@/lib/useInvestSeo";

const HERO_VIDEO_BASE = import.meta.env.BASE_URL;
const HERO_CLIPS = [
  {
    desktop: `${HERO_VIDEO_BASE}videos/hero_server_room.mp4`,
    mobile: `${HERO_VIDEO_BASE}videos/hero_server_room.mobile.mp4`,
  },
  {
    desktop: `${HERO_VIDEO_BASE}videos/hero_gpu_tower.mp4`,
    mobile: `${HERO_VIDEO_BASE}videos/hero_gpu_tower.mobile.mp4`,
  },
  {
    desktop: `${HERO_VIDEO_BASE}videos/hero_facility_dusk.mp4`,
    mobile: `${HERO_VIDEO_BASE}videos/hero_facility_dusk.mobile.mp4`,
  },
];

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

function AgentCard({
  icon: Icon,
  name,
  desc,
  align,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  name: string;
  desc: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={`group relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm p-3.5 md:p-4 hover:border-[#00F5D4]/30 hover:bg-black/60 transition-all flex items-center gap-3 ${
        align === "right" ? "md:flex-row-reverse md:text-right" : ""
      }`}
      data-testid={`agent-card-${name.toLowerCase()}`}
    >
      <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-[#00F5D4]" strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-[#00F5D4]/80">
          Agent
        </div>
        <div
          className="text-sm md:text-base font-semibold text-white leading-tight truncate"
          style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
        >
          {name}
        </div>
        <div className="text-[10px] md:text-xs text-white/50 leading-tight mt-0.5 truncate">
          {desc}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  useInvestSeo({
    title: "Reserve Your AICA Allocation",
    fullTitle: "AIcreatesAI Invest | Reserve Your AICA Allocation",
    description:
      "Reserve your allocation in the AICA Strategic Seed Round - first of five SAFT rounds in the ~$50M private sale.",
    path: "/",
  });
  const sample = computeVesting(10_000);
  return (
    <div className="min-h-[100dvh] text-white overflow-x-hidden">
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
        <HeroVideoReel clips={HERO_CLIPS} />
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,245,212,0.06),transparent_60%)] blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="relative max-w-5xl mx-auto text-center">
            {/* Dark legibility halo behind hero copy - lifts text off the video */}
            <div
              aria-hidden
              className="absolute -inset-x-4 sm:-inset-x-10 -inset-y-10 sm:-inset-y-16 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(10,10,10,0.85),rgba(10,10,10,0.55)_45%,transparent_75%)] blur-[2px]"
            />
            <div className="mb-7 sm:mb-8 flex justify-center">
              <SectionLabel>AICA Strategic Seed Round - Now open</SectionLabel>
            </div>
            <h1 className="text-[36px] sm:text-5xl md:text-6xl lg:text-[88px] font-serif font-bold leading-[1.04] sm:leading-[1.02] mb-5 sm:mb-6 text-white tracking-tight [text-shadow:0_2px_36px_rgba(0,245,212,0.18),0_2px_24px_rgba(0,0,0,0.75)]">
              The Agentic Intelligence Layer.
            </h1>
            <p className="text-[15px] sm:text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed mb-7 sm:mb-8 [text-shadow:0_1px_16px_rgba(0,0,0,0.7)]">
              Reserve your allocation in the AICA Strategic Seed - the first
              of five SAFT rounds in a ~$50M private sale to ship the Agentic
              Business Operating System and the Hybrid Compute Fabric powering
              the next wave of AI-native companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full teal-btn"
                data-testid="link-hero-reserve"
              >
                Reserve allocation
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <a
                href="/invest/litepaper.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full glass-btn"
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
            className="inline-flex items-center justify-center h-10 px-5 rounded-full glass-btn text-sm"
            data-testid="link-platform-about"
          >
            Read the layer architecture <ArrowRight className="ml-2 w-4 h-4" />
          </a>
          <a
            href="https://www.aicreates.ai/eve-os"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full glass-btn text-sm"
            data-testid="link-platform-eve-os"
          >
            Eve OS <ArrowRight className="ml-2 w-4 h-4" />
          </a>
          <a
            href="https://www.aicreates.ai/neobank"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full glass-btn text-sm"
            data-testid="link-platform-neobank"
          >
            NeoBank <ArrowRight className="ml-2 w-4 h-4" />
          </a>
          <a
            href="https://www.aicreates.ai/litepaper#tokenomics"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full glass-btn text-sm"
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
        <div className="space-y-4 text-white/70 leading-relaxed mb-10 max-w-3xl">
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

        {/* Agent constellation */}
        <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-6 md:p-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent_85%)]" />

          {/* Central core */}
          <div className="relative grid md:grid-cols-[1fr_auto_1fr] gap-6 md:gap-10 items-center">
            {/* Left column: 3 agents */}
            <div className="space-y-3 md:space-y-4">
              {[
                { icon: Sparkles, name: "Marketing", desc: "Campaigns, content, attribution loops" },
                { icon: TrendingUp, name: "Sales", desc: "Pipeline, outreach, deal cycles" },
                { icon: Banknote, name: "Finance", desc: "Books, forecasts, treasury" },
              ].map((a) => (
                <AgentCard key={a.name} icon={a.icon} name={a.name} desc={a.desc} align="right" />
              ))}
            </div>

            {/* Center: Eve core */}
            <div className="flex flex-col items-center justify-center py-4 md:py-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#00F5D4]/20 blur-2xl" />
                <div
                  className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-2 border-[#00F5D4]/40 bg-gradient-to-br from-[#00F5D4]/15 to-[#00F5D4]/5 flex flex-col items-center justify-center shadow-[0_0_60px_rgba(0,245,212,0.25)]"
                  data-testid="eve-core"
                >
                  <Brain className="w-9 h-9 md:w-12 md:h-12 text-[#00F5D4]" strokeWidth={1.5} />
                  <div
                    className="mt-2 text-base md:text-lg font-semibold text-white tracking-tight"
                    style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                  >
                    Eve OS
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#00F5D4]/80">
                    Operator
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-[0.22em] text-white/40 text-center">
                Shared memory · Observable runtime
              </div>
            </div>

            {/* Right column: 3 agents */}
            <div className="space-y-3 md:space-y-4">
              {[
                { icon: ShieldCheck, name: "Legal", desc: "Contracts, compliance, risk" },
                { icon: Layers, name: "Operations", desc: "Workflows, vendors, logistics" },
                { icon: Bot, name: "Development", desc: "Specs, code, deploys, support" },
              ].map((a) => (
                <AgentCard key={a.name} icon={a.icon} name={a.name} desc={a.desc} align="left" />
              ))}
            </div>
          </div>

          {/* Footer stat strip */}
          <div className="relative mt-8 md:mt-10 pt-6 border-t border-white/5 grid grid-cols-3 gap-4">
            {[
              { k: "1", v: "Operator" },
              { k: "6", v: "Coordinated functions" },
              { k: "24/7", v: "Observable runtime" },
            ].map((s) => (
              <div key={s.v} className="text-center">
                <div
                  className="text-2xl md:text-3xl font-semibold text-[#00F5D4] tracking-tight"
                  style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                >
                  {s.k}
                </div>
                <div className="mt-1 text-[10px] md:text-xs uppercase tracking-[0.18em] text-white/45">
                  {s.v}
                </div>
              </div>
            ))}
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
        title={<>$50M raise. Built for <span className="text-[#00F5D4]">compounding leverage</span>.</>}
      >
        <div className="grid md:grid-cols-[1.15fr,1fr] gap-8 items-stretch">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 space-y-5">
            {[
              {
                label: "GPU cluster + data-center build",
                pct: 40,
                detail: "Anchored by a $3.5M Blackwell-class GPU cluster - inference economics in-house",
                icon: Cpu,
              },
              {
                label: "Eve OS R&D + engineering",
                pct: 28,
                detail: "Operator runtime, shared memory, agent skills, voice + vision",
                icon: Brain,
              },
              {
                label: "NeoBank + go-to-market",
                pct: 18,
                detail: "Consumer + business launch, treasury + payment rails",
                icon: Banknote,
              },
              {
                label: "Closed-Loop Quality Engine",
                pct: 9,
                detail: "Auto-repair, evals, feedback rewards loop",
                icon: ShieldCheck,
              },
              {
                label: "Operating + reserves",
                pct: 5,
                detail: "Runway, legal, compliance, contingency",
                icon: Layers,
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center shrink-0">
                      <row.icon className="w-3.5 h-3.5 text-[#00F5D4]" strokeWidth={1.75} />
                    </span>
                    <span className="font-medium text-white truncate">{row.label}</span>
                  </div>
                  <span
                    className="text-[#00F5D4] font-semibold tabular-nums"
                    style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                  >
                    {row.pct}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00F5D4] to-[#3b82f6] shadow-[0_0_12px_rgba(0,245,212,0.35)]"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-white/45 leading-relaxed pl-9">{row.detail}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4">
            <div className="rounded-2xl border border-[#00F5D4]/25 bg-gradient-to-br from-[#00F5D4]/[0.06] to-transparent p-6 md:p-7">
              <div className="text-xs uppercase tracking-[0.18em] text-[#00F5D4] mb-3">
                Anchor capex
              </div>
              <div
                className="text-3xl md:text-4xl font-semibold text-white tracking-tight"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                $3.5M GPU cluster
              </div>
              <p className="mt-3 text-sm text-white/65 leading-relaxed">
                Blackwell-class build that brings inference economics in-house and powers Eve OS, NeoBank, and partner deployments from day one.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7">
              <div className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">
                Discipline
              </div>
              <p className="text-white/70 text-sm leading-relaxed">
                Capital is sequenced against shipping milestones, not headcount targets. Every dollar is mapped to a measurable artifact.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/65">
                {[
                  "Outcome-gated tranching across phases",
                  "Real-time burn vs milestone reporting",
                  "Reserves preserve > 18 months runway",
                ].map((it) => (
                  <li key={it} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00F5D4] shrink-0 shadow-[0_0_6px_rgba(0,245,212,0.6)]" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
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

        {/* Visual: $AICA Utility Layer */}
        <figure className="mt-10 rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
          <img
            src={aicaUtilityLayerUrl}
            alt="$AICA Utility Layer diagram showing AI Credits, Compute Credits, Agent Runs, Marketplace, Enterprise Pools, Rewards & Staking, Developer Rewards, and Access Layer surrounding the $AICA token"
            loading="lazy"
            decoding="async"
            className="w-full h-auto block"
            data-testid="img-aica-utility-layer"
          />
          <figcaption className="px-5 py-3 text-xs uppercase tracking-[0.18em] text-white/40 border-t border-white/5">
            $AICA Utility Layer - one token, eight surfaces of demand.
          </figcaption>
        </figure>

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

        {/* Visual: $AICA Token Utility Map (whitepaper sheet) */}
        <figure className="mt-8 rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden">
          <img
            src={aicaTokenUtilityMapUrl}
            alt="$AICA Token Utility Map: GPU contributions, data rewards, skills development, workflow rewards, premium access, referral rewards, validator tiers, marketplace payments, compute reward pool, and ecosystem incentives"
            loading="lazy"
            decoding="async"
            className="w-full h-auto block"
            data-testid="img-aica-token-utility-map"
          />
          <figcaption className="px-5 py-3 text-xs uppercase tracking-[0.18em] text-white/40 border-t border-white/5">
            $AICA is a utility and coordination token - not the product itself.
          </figcaption>
        </figure>
      </Section>

      {/* ----------------------------- VISUAL WHITEPAPER DECK ----------------------------- */}
      <Section
        id="visual-whitepaper"
        eyebrow="Visual Whitepaper"
        title={<>The full <span className="text-[#00F5D4]">investor deck</span>, page by page.</>}
      >
        <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-3xl">
          Step through the entire AIcreatesAI whitepaper deck right here. Use the arrows or swipe on mobile, open it fullscreen for a presentation view, or download the PDF to share offline.
        </p>
        <div className="mt-8">
          <DeckCarousel
            basePath={`${import.meta.env.BASE_URL}deck`}
            manifestUrl={`${import.meta.env.BASE_URL}deck/manifest.json`}
            title="AIcreatesAI Whitepaper Deck"
            subline="Swipe through the deck, open it fullscreen, or download the PDF."
            testIdPrefix="deck-portal"
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={`${import.meta.env.BASE_URL}whitepaper-deck.pdf`}
            download="AIcreatesAI Whitepaper Deck.pdf"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition-colors"
            data-testid="link-download-presentation"
          >
            <Download className="mr-2 w-4 h-4" /> Download the Presentation
          </a>
          <a
            href={`${import.meta.env.BASE_URL}litepaper.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full glass-btn"
            data-testid="link-download-litepaper-deck-section"
          >
            <Download className="mr-2 w-4 h-4" /> Download Litepaper
          </a>
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
                  className="inline-flex items-center justify-center h-12 px-8 rounded-full teal-btn"
                  data-testid="link-final-reserve"
                >
                  Reserve allocation <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  href="/sign-in"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-full glass-btn"
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
