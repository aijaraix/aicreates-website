import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useSeo } from "@/lib/useSeo";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

type QA = { q: string; a: string };
type Group = { title: string; items: QA[] };

const GROUPS: Group[] = [
  {
    title: "Company",
    items: [
      {
        q: "What does AICreatesAi do?",
        a: "We build the agentic intelligence layer - a self-improving foundation for how companies, capital, and consumers will operate. Eve OS is our flagship product on top of that layer; NeoBank is our consumer and business capital surface.",
      },
      {
        q: "Why this, why now?",
        a: "AI is moving from assistant to operator. The next decade will be defined by software that plans, executes, reviews, and improves on its own. The infrastructure that coordinates that work is what we are building.",
      },
      {
        q: "Where is the company based?",
        a: "Headquartered in Miami, Florida.",
      },
    ],
  },
  {
    title: "Platform and product",
    items: [
      {
        q: "What is the agentic intelligence layer?",
        a: "A unified runtime for coordinated agentic execution - planning, action, review, and memory - across every business function, with hybrid compute, closed-loop quality, and policy-aware autonomy.",
      },
      {
        q: "How is Eve OS different from a chatbot or AI assistant?",
        a: "Eve OS is a Company in a Box. Marketing, sales, finance, legal, operations, and development run together as one coordinated team, with quality review built in. It is execution, not conversation.",
      },
      {
        q: "Do I need technical skills to use it?",
        a: "No. Eve OS is designed for operators. You describe goals in plain language; the layer handles the coordination.",
      },
      {
        q: "When can I use it?",
        a: "Private waitlist now. Eve OS rolls out in staged cohorts as the agentic intelligence layer matures and capacity expands. Join the waitlist via Contact and we will reach out as your cohort opens.",
      },
      {
        q: "Is it available in my country?",
        a: "Eve OS is rolling out globally, with initial cohort access prioritized in the United States. Some regions may be limited at launch by infrastructure availability or local regulation; the waitlist captures your jurisdiction so we can confirm availability for you.",
      },
      {
        q: "Where does my data live?",
        a: "Hybrid compute lets work run locally, at the edge, or in the cloud based on the task. Sensitive data and tenancy controls keep you in command of what leaves your boundary.",
      },
    ],
  },
  {
    title: "$AICA token",
    items: [
      {
        q: "What does $AICA do?",
        a: "It powers subscription discounts, compute network participation, and contributor rewards across the agentic intelligence layer.",
      },
      {
        q: "What is the supply?",
        a: "Total supply is fixed at 10,000,000,000 $AICA.",
      },
      {
        q: "How much of the supply is being sold in the private sale?",
        a: "22.5% (2,250,000,000 $AICA) is allocated to the private sale across five SAFT rounds for a $50M target raise (~$230M FDV). Pricing ladders from $0.010 (Strategic Seed) to $0.034 (Community / Launchpad).",
      },
      {
        q: "What are the five SAFT rounds?",
        a: "Strategic Seed - $0.010 per AICA, 500M tokens, $5M, $100M FDV (open now). Private Round 1 - $0.015, 800M, $12M, $150M FDV. Private Round 2 - $0.020, 900M, $18M, $200M FDV. Infrastructure / Strategic - $0.026, 384,615,385, $10M, $260M FDV. Community / Launchpad - $0.034, 147,058,824, $5M, $340M FDV. Aggregate: 2,250,000,000 AICA = 22.5% of the 10,000,000,000 fixed supply, $50M target raise, ~$230M FDV.",
      },
      {
        q: "Which round is open right now?",
        a: "Strategic Seed is the only round currently open. Investors can reserve allocation today at $0.010 per AICA with tiered bonuses at $5k (+10%) and $25k (+20%). Subsequent rounds open later in sequence as Strategic Seed fills.",
      },
      {
        q: "What does the GPU cluster do?",
        a: "Anchored by a $3.5M initial high-end GPU cluster, the Hybrid Compute Fabric brings inference economics in-house. The cluster trains and serves the proprietary models that power Eve OS and the agentic intelligence layer.",
      },
      {
        q: "When is TGE?",
        a: "Target token generation event is December 1, 2026. Updates are posted to investors and on the materials page.",
      },
      {
        q: "Are private-round tokens vested?",
        a: "Yes. All tokens sold in private rounds are subject to appropriate vesting schedules.",
      },
      {
        q: "Is the token a security?",
        a: "Token utility, parameters, and offering structure are designed with applicable regulation in mind. This page is informational and not an offer or solicitation.",
      },
    ],
  },
  {
    title: "Investing",
    items: [
      {
        q: "How can I invest?",
        a: "Reach out via the contact form selecting Investor, or visit the investor portal to begin the allocation process.",
      },
      {
        q: "Who can participate?",
        a: "Participation is restricted to eligible investors meeting accreditation and jurisdictional requirements.",
      },
      {
        q: "What are the materials?",
        a: "The litepaper is the public long-form. The whitepaper and additional investor materials are available for download or upon request.",
      },
    ],
  },
];

function Item({ qa }: { qa: QA }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-6 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-base md:text-lg text-white/90 font-medium leading-snug group-hover:text-[#00F5D4] transition-colors">
          {qa.q}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-white/45 shrink-0 transition-transform ${open ? "rotate-180 text-[#00F5D4]" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-white/60 leading-relaxed text-sm md:text-base">{qa.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  useSeo({
    title: "FAQ - questions, answered",
    description:
      "Common questions on AIcreatesAI, the platform, the $AICA token, and investing - all in one place.",
    path: "/faq",
  });
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>FAQ</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl font-serif font-semibold leading-[1.04] text-gradient"
            >
              Questions, answered.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed"
            >
              The most common questions we get on the company, the platform, the token, and investing.
            </motion.p>
          </div>
        </div>
      </section>

      {/* GROUPS */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {GROUPS.map((g) => (
              <div key={g.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40 mb-4">{g.title}</h2>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 md:px-8">
                  {g.items.map((qa, i) => (
                    <Item key={i} qa={qa} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-16 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-5">
                Did not find your answer?
              </h2>
              <p className="text-lg text-white/55 max-w-xl mx-auto mb-8">
                Reach out and we will route you to the right person.
              </p>
              <Link href="/contact">
                <Button size="lg" className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  Get in touch <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
