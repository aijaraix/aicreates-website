import { useId, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
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

type QA = { q: string; a: string };
type Group = { title: string; items: QA[] };

const GROUPS: Group[] = [
  {
    title: "Company",
    items: [
      {
        q: "What does AI Creates AI do?",
        a: "AI Creates AI is the company behind EVE CXO, the AI Operating System for Business. The product brings executive direction, department work and connected tools into one operating experience.",
      },
      {
        q: "How do Adam, Eve and Hermes fit together?",
        a: "Adam supports AI Creates AI internally. Eve is the customer-facing executive intelligence in EVE CXO. Hermes is the shared orchestration runtime beneath both. Jarvis provides the dedicated builder and engineering experience.",
      },
    ],
  },
  {
    title: "EVE CXO",
    items: [
      {
        q: "Which departments does EVE CXO cover?",
        a: "The commercial experience brings together Marketing, Sales, Finance, Legal, Operations, HR and Engineering. Department heads coordinate specialist work, while existing workspace roles and agents retain their own identities.",
      },
      {
        q: "Do I need technical skills to get started?",
        a: "You can describe business goals in plain language. Connecting accounts and activating particular workflows may require an administrator or technical setup.",
      },
      {
        q: "Where can I see the product and current access options?",
        a: "Visit evecxo.com for the product, sign-in and current access options. Contact AI Creates AI if you need help assessing a deployment or business workflow.",
      },
      {
        q: "Can agents take action without my review?",
        a: "Authority depends on workspace roles, tool permissions and the selected workflow. Consequential actions require the applicable approval. Connecting a tool is separate from approving a particular action.",
      },
      {
        q: "Where does my business data live?",
        a: "Data handling depends on the deployment and connected providers. Review the applicable product privacy information and integration permissions before supplying sensitive information; contact us for deployment-specific requirements.",
      },
    ],
  },
  {
    title: "Investor and legacy enquiries",
    items: [
      {
        q: "How do I contact investor relations?",
        a: "Use the Investor option on the contact form. Materials and access are provided through the approved investor process; this website does not confirm an allocation or investment.",
      },
      {
        q: "What about earlier token or SAFT materials?",
        a: "Earlier informational pages remain available as legacy context. Existing investor records and agreements have not been changed by this website update. Contact the company about your specific records or documents.",
      },
    ],
  },
];

function Item({ qa }: { qa: QA }) {
  const [open, setOpen] = useState(false);
  const answerId = useId();
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-6 py-5 text-start group"
        id={`${answerId}-question`}
        aria-controls={open ? answerId : undefined}
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
            id={answerId}
            role="region"
            aria-labelledby={`${answerId}-question`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-white/60 leading-relaxed text-sm md:text-base">
              {qa.a}
            </p>
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
      "Questions about AI Creates AI, EVE CXO, workspace control and investor enquiries.",
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
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
              Questions about the company, EVE CXO and how to get in touch.
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
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40 mb-4">
                  {g.title}
                </h2>
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
              <Button
                size="lg"
                className="rounded-full h-12 px-8 teal-btn"
                asChild
              >
                <Link href="/contact">
                  Get in touch <ArrowRight className="ms-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
