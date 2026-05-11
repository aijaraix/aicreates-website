import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download } from "lucide-react";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

type Block =
  | { kind: "p"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "list"; intro: string; items: string[] }
  | { kind: "sub"; title: string; text: string };

type Section = {
  n: string;
  id: string;
  title: string;
  blocks: Block[];
};

const SECTIONS: Section[] = [
  {
    n: "00",
    id: "executive-summary",
    title: "Executive Summary",
    blocks: [
      {
        kind: "p",
        text: "AICreatesAi is building the world's first Agentic Business Operating System - a complete \"Company in a Box\" that enables every business owner to run a coordinated, intelligent, and continuously improving virtual company.",
      },
      {
        kind: "p",
        text: "We are raising $50 million primarily to develop proprietary AI intelligence, advanced compute infrastructure, and the core operating system. The platform will deliver reliable business outcomes through a phased approach, with long-term ownership of our own AI models.",
      },
      {
        kind: "p",
        text: "Key features include a desktop-native experience, closed-loop quality systems, agentic wallets with real user control, and a sustainable token economy designed to reward contributors.",
      },
    ],
  },
  {
    n: "01",
    id: "the-problem",
    title: "The Problem",
    blocks: [
      {
        kind: "p",
        text: "Most small business owners and solopreneurs struggle to manage multiple complex functions without the resources of larger companies. Current AI tools are fragmented, unreliable for real business tasks, or require significant technical expertise. There is a clear need for a single, trustworthy system that acts like a real company - with intelligent coordination, quality control, and continuous improvement.",
      },
    ],
  },
  {
    n: "02",
    id: "vision-and-solution",
    title: "Our Vision & Solution",
    blocks: [
      {
        kind: "p",
        text: "AICreatesAi is creating a new category: the Agentic Business Operating System.",
      },
      {
        kind: "p",
        text: "Our platform enables users to describe business goals in natural language and receive coordinated, high-quality execution across marketing, sales, finance, legal, operations, and development - with built-in quality review and continuous improvement.",
      },
      {
        kind: "p",
        text: "We are executing a disciplined, phased strategy that delivers real value early while building long-term defensibility through data, product experience, and proprietary model development.",
      },
    ],
  },
  {
    n: "03",
    id: "market-opportunity",
    title: "Market Opportunity",
    blocks: [
      {
        kind: "p",
        text: "The demand for AI-powered tools that genuinely help run businesses is growing rapidly. Our primary focus is on solopreneurs, small business owners, and service-based teams who need enterprise-grade capabilities without enterprise complexity or cost.",
      },
    ],
  },
  {
    n: "04",
    id: "product-overview",
    title: "Product Overview",
    blocks: [
      {
        kind: "p",
        text: "AICreatesAi delivers a unified platform accessible through web, mobile, and a powerful native desktop experience.",
      },
      {
        kind: "list",
        intro: "Core Capabilities (High-Level):",
        items: [
          "Coordinated multi-function business workflows",
          "Automatic quality review and improvement systems",
          "Persistent business memory and context awareness",
          "Agentic wallets with user-controlled permissions",
          "Future Skills Marketplace",
          "Long-term development of proprietary AI models optimized for business use",
        ],
      },
      {
        kind: "p",
        text: "The $50M raise is dedicated to building the core AI intelligence, compute systems, and the \"Company in a Box\" operating system.",
      },
    ],
  },
  {
    n: "05",
    id: "competitive-advantage",
    title: "Competitive Advantage & Moat",
    blocks: [
      {
        kind: "list",
        intro: "Our strategy focuses on several key advantages:",
        items: [
          "Superior desktop-native user experience",
          "Closed-loop AI systems that improve output quality",
          "Hybrid compute with strong privacy and performance foundations",
          "Practical agentic wallet controls",
          "A powerful data and model improvement flywheel",
          "Disciplined, phased execution that reduces risk",
        ],
      },
    ],
  },
  {
    n: "06",
    id: "go-to-market",
    title: "Go-to-Market Strategy",
    blocks: [
      {
        kind: "p",
        text: "We will initially target solopreneurs and small business owners - the segment that benefits most from a unified, reliable system. Our approach emphasizes product-led growth, community building, and clear demonstration of real business outcomes.",
      },
    ],
  },
  {
    n: "07",
    id: "use-of-funds",
    title: "Use of Funds ($50 Million)",
    blocks: [
      {
        kind: "list",
        intro: "The majority of the raise will be allocated to:",
        items: [
          "Development of proprietary AI models and intelligence",
          "Advanced compute infrastructure",
          "Core product development and engineering",
          "Go-to-market activities and team building",
          "Strategic reserve",
        ],
      },
    ],
  },
  {
    n: "08",
    id: "tokenomics",
    title: "Tokenomics",
    blocks: [
      {
        kind: "p",
        text: "AICreatesAi plans to introduce a utility token ($AICA) to support long-term ecosystem participation and contributor rewards.",
      },
      {
        kind: "list",
        intro: "Key Principles:",
        items: [
          "Core platform revenue will initially be driven by stablecoin and fiat subscriptions to ensure operational stability.",
          "The token will provide utility through subscription discounts, participation in the compute network, governance rights, and rewards for contributors.",
          "A sustainable economic model is being designed with a focus on real usage, long-term alignment, and ecosystem health.",
        ],
      },
      {
        kind: "p",
        text: "Detailed tokenomics, including allocation, vesting schedules, and full utility mechanics, will be provided separately on a dedicated Tokenomics page.",
      },
    ],
  },
  {
    n: "09",
    id: "roadmap",
    title: "High-Level Roadmap",
    blocks: [
      {
        kind: "sub",
        title: "Phase 0-1 (2026)",
        text: "Build core platform, closed-loop quality systems, and initial workflows. Achieve early product-market fit.",
      },
      {
        kind: "sub",
        title: "Phase 2 (2027)",
        text: "Expand capabilities, launch marketplace features, deepen proprietary model development, and scale user base.",
      },
      {
        kind: "sub",
        title: "Phase 3 (2028+)",
        text: "Scale intelligence and compute participation, deliver advanced autonomous capabilities, and grow ecosystem.",
      },
    ],
  },
  {
    n: "10",
    id: "risks",
    title: "Risks & Mitigations",
    blocks: [
      {
        kind: "p",
        text: "We acknowledge the ambitious nature of this vision. Our phased approach, focus on quality systems, and emphasis on real user outcomes are designed to manage execution, technical, and market risks effectively.",
      },
    ],
  },
  {
    n: "11",
    id: "conclusion",
    title: "Conclusion",
    blocks: [
      {
        kind: "p",
        text: "AICreatesAi is building the operating system for the agentic era of business.",
      },
      {
        kind: "p",
        text: "With a $50 million raise focused on core AI intelligence, compute infrastructure, and the \"Company in a Box\" product, we are positioned to create a category-defining platform that delivers immediate value while building lasting competitive advantages.",
      },
    ],
  },
];

function BlockRenderer({ block }: { block: Block }) {
  if (block.kind === "p") {
    return <p className="text-white/70 text-base md:text-lg leading-relaxed">{block.text}</p>;
  }
  if (block.kind === "sub") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="text-xs font-mono text-[#00F5D4] tracking-widest uppercase mb-2">{block.title}</div>
        <p className="text-white/70 text-base leading-relaxed">{block.text}</p>
      </div>
    );
  }
  // list
  const intro = "intro" in block ? block.intro : undefined;
  return (
    <div className="space-y-4">
      {intro && <p className="text-white/70 text-base md:text-lg leading-relaxed">{intro}</p>}
      <ul className="space-y-3">
        {block.items.map((it, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00F5D4] shrink-0 shadow-[0_0_6px_rgba(0,245,212,0.6)]" />
            <span className="text-white/70 text-base leading-relaxed">{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Litepaper() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.08),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>Whitepaper · v3.2</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl font-serif font-semibold leading-[1.04] text-gradient"
            >
              AICreatesAi Whitepaper v3.2
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-lg md:text-2xl text-white/70 max-w-3xl leading-relaxed font-light"
            >
              The Agentic Business Operating System <span className="text-white/30 mx-2">|</span> May 2026
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Button
                size="lg"
                disabled
                className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium disabled:opacity-100 disabled:cursor-default"
                data-testid="button-download-pdf"
              >
                <Download className="mr-2 w-4 h-4" />
                Download PDF
              </Button>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]">
                  Engage with us
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="pb-24 md:pb-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* TABLE OF CONTENTS (desktop) */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-5">
                  Contents
                </div>
                <nav className="flex flex-col gap-1.5">
                  {SECTIONS.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="group flex items-baseline gap-3 py-1.5 px-2 -mx-2 rounded text-sm text-white/55 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="font-mono text-[10px] text-white/30 group-hover:text-[#00F5D4] transition-colors w-5">
                        {s.n}
                      </span>
                      <span className="leading-snug">{s.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* SECTIONS */}
            <article className="lg:col-span-9 max-w-3xl">
              <div className="space-y-16">
                {SECTIONS.map((s, idx) => (
                  <motion.section
                    key={s.id}
                    id={s.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    className="scroll-mt-28"
                  >
                    {idx > 0 && <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />}
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-mono text-xs text-[#00F5D4] tracking-widest">{s.n}</span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif font-semibold text-white mb-7 leading-tight">
                      {s.title}
                    </h2>
                    <div className="space-y-5">
                      {s.blocks.map((b, i) => (
                        <BlockRenderer key={i} block={b} />
                      ))}
                    </div>
                  </motion.section>
                ))}

                {/* DISCLAIMER */}
                <div className="pt-8">
                  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-3">
                      Disclaimer
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">
                      This whitepaper is for informational purposes only and does not constitute an offer to sell securities or tokens. Early-stage technology and cryptocurrency investments involve significant risk. Forward-looking statements are subject to change based on development progress, market conditions, and other factors.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-24 md:pb-32 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-16 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px divider-line" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-5">
                Want to go deeper?
              </h2>
              <p className="text-base md:text-lg text-white/55 max-w-xl mx-auto mb-8">
                Reach out for the full investor materials, product walkthroughs, or partnership conversations.
              </p>
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
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
