import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DeckCarousel from "@/components/DeckCarousel";
import AicaTokenMark from "@/components/AicaTokenMark";
import { useSeo } from "@/lib/useSeo";

function withGlyphs(text: string): React.ReactNode {
  const parts = text.split(/(\$AICA)/g);
  if (parts.length === 1) return text;
  return parts.map((p, i) =>
    p === "$AICA" ? (
      <span key={i} className="font-medium text-[#00F5D4]">$AICA</span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

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

function BlockRenderer({ block }: { block: Block }) {
  if (block.kind === "p") {
    return (
      <p className="text-white/70 text-base md:text-lg leading-relaxed">
        {withGlyphs(block.text)}
      </p>
    );
  }
  if (block.kind === "sub") {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="text-xs font-mono text-[#00F5D4] tracking-widest uppercase mb-2">{block.title}</div>
        <p className="text-white/70 text-base leading-relaxed">{withGlyphs(block.text)}</p>
      </div>
    );
  }
  const intro = "intro" in block ? block.intro : undefined;
  return (
    <div className="space-y-4">
      {intro && (
        <p className="text-white/70 text-base md:text-lg leading-relaxed">
          {withGlyphs(intro)}
        </p>
      )}
      <ul className="space-y-3">
        {block.items.map((it, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00F5D4] shrink-0 shadow-[0_0_6px_rgba(0,245,212,0.6)]" />
            <span className="text-white/70 text-base leading-relaxed">{withGlyphs(it)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TokenomicsCoin({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="relative my-8 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.18),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent_75%)]" />
      <div className="relative grid grid-cols-1 md:grid-cols-5 gap-6 p-7 md:p-10 items-center">
        <div className="md:col-span-2 flex justify-center">
          <AicaTokenMark className="w-56 sm:w-64 md:w-full max-w-[320px]" />
        </div>
        <div className="md:col-span-3">
          <div className="text-xs font-mono text-[#00F5D4] tracking-widest uppercase mb-2">
            {eyebrow}
          </div>
          <div className="text-2xl md:text-3xl font-serif font-semibold text-white leading-tight">
            {title}
          </div>
          <p className="mt-3 text-white/60 text-sm md:text-base leading-relaxed">
            {withGlyphs(desc)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Litepaper() {
  const { t } = useTranslation();
  useSeo({
    title: t("litepaper.seo.title"),
    description: t("litepaper.seo.description"),
    path: "/litepaper",
  });
  const [deckOpen, setDeckOpen] = useState(false);

  const SECTIONS: Section[] = [
    {
      n: "00",
      id: "executive-summary",
      title: t("litepaper.sections.executiveSummary.title"),
      blocks: [
        { kind: "p", text: t("litepaper.sections.executiveSummary.p1") },
        { kind: "p", text: t("litepaper.sections.executiveSummary.p2") },
        { kind: "p", text: t("litepaper.sections.executiveSummary.p3") },
      ],
    },
    {
      n: "01",
      id: "the-problem",
      title: t("litepaper.sections.problem.title"),
      blocks: [{ kind: "p", text: t("litepaper.sections.problem.p1") }],
    },
    {
      n: "02",
      id: "vision-and-solution",
      title: t("litepaper.sections.vision.title"),
      blocks: [
        { kind: "p", text: t("litepaper.sections.vision.p1") },
        { kind: "p", text: t("litepaper.sections.vision.p2") },
        { kind: "p", text: t("litepaper.sections.vision.p3") },
      ],
    },
    {
      n: "03",
      id: "market-opportunity",
      title: t("litepaper.sections.market.title"),
      blocks: [{ kind: "p", text: t("litepaper.sections.market.p1") }],
    },
    {
      n: "04",
      id: "product-overview",
      title: t("litepaper.sections.product.title"),
      blocks: [
        { kind: "p", text: t("litepaper.sections.product.p1") },
        {
          kind: "list",
          intro: t("litepaper.sections.product.listIntro"),
          items: [
            t("litepaper.sections.product.l1"),
            t("litepaper.sections.product.l2"),
            t("litepaper.sections.product.l3"),
            t("litepaper.sections.product.l4"),
            t("litepaper.sections.product.l5"),
            t("litepaper.sections.product.l6"),
          ],
        },
        { kind: "p", text: t("litepaper.sections.product.p2") },
      ],
    },
    {
      n: "05",
      id: "competitive-advantage",
      title: t("litepaper.sections.moat.title"),
      blocks: [
        {
          kind: "list",
          intro: t("litepaper.sections.moat.listIntro"),
          items: [
            t("litepaper.sections.moat.l1"),
            t("litepaper.sections.moat.l2"),
            t("litepaper.sections.moat.l3"),
            t("litepaper.sections.moat.l4"),
            t("litepaper.sections.moat.l5"),
            t("litepaper.sections.moat.l6"),
          ],
        },
      ],
    },
    {
      n: "06",
      id: "go-to-market",
      title: t("litepaper.sections.gtm.title"),
      blocks: [{ kind: "p", text: t("litepaper.sections.gtm.p1") }],
    },
    {
      n: "07",
      id: "use-of-funds",
      title: t("litepaper.sections.funds.title"),
      blocks: [
        {
          kind: "list",
          intro: t("litepaper.sections.funds.listIntro"),
          items: [
            t("litepaper.sections.funds.l1"),
            t("litepaper.sections.funds.l2"),
            t("litepaper.sections.funds.l3"),
            t("litepaper.sections.funds.l4"),
            t("litepaper.sections.funds.l5"),
          ],
        },
      ],
    },
    {
      n: "08",
      id: "tokenomics",
      title: t("litepaper.sections.tokenomics.title"),
      blocks: [
        { kind: "p", text: t("litepaper.sections.tokenomics.p1") },
        {
          kind: "sub",
          title: t("litepaper.sections.tokenomics.subTitle"),
          text: t("litepaper.sections.tokenomics.subText"),
        },
        {
          kind: "list",
          intro: t("litepaper.sections.tokenomics.listIntro"),
          items: [
            t("litepaper.sections.tokenomics.l1"),
            t("litepaper.sections.tokenomics.l2"),
            t("litepaper.sections.tokenomics.l3"),
            t("litepaper.sections.tokenomics.l4"),
          ],
        },
      ],
    },
    {
      n: "09",
      id: "roadmap",
      title: t("litepaper.sections.roadmap.title"),
      blocks: [
        {
          kind: "sub",
          title: t("litepaper.sections.roadmap.phase01Title"),
          text: t("litepaper.sections.roadmap.phase01Text"),
        },
        {
          kind: "sub",
          title: t("litepaper.sections.roadmap.phase2Title"),
          text: t("litepaper.sections.roadmap.phase2Text"),
        },
        {
          kind: "sub",
          title: t("litepaper.sections.roadmap.phase3Title"),
          text: t("litepaper.sections.roadmap.phase3Text"),
        },
      ],
    },
    {
      n: "10",
      id: "risks",
      title: t("litepaper.sections.risks.title"),
      blocks: [{ kind: "p", text: t("litepaper.sections.risks.p1") }],
    },
    {
      n: "11",
      id: "conclusion",
      title: t("litepaper.sections.conclusion.title"),
      blocks: [
        { kind: "p", text: t("litepaper.sections.conclusion.p1") },
        { kind: "p", text: t("litepaper.sections.conclusion.p2") },
      ],
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.08),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>{t("litepaper.hero.eyebrow")}</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl font-serif font-semibold leading-[1.04] text-gradient"
            >
              {t("litepaper.hero.title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-lg md:text-2xl text-white/70 max-w-3xl leading-relaxed font-light"
            >
              {t("litepaper.hero.sub")} <span className="text-white/30 mx-2">|</span> {t("litepaper.hero.date")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Button
                size="lg"
                onClick={() => setDeckOpen(true)}
                className="rounded-full h-12 px-7 teal-btn"
                data-testid="button-view-pitch-deck"
              >
                <BookOpen className="me-2 w-4 h-4" />
                {t("litepaper.hero.viewDeck")}
              </Button>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 glass-btn" data-testid="button-get-in-touch-hero">
                  {t("litepaper.hero.getInTouch")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="pb-16 md:pb-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* SECTIONS */}
            <article className="lg:col-span-9 lg:order-1 order-2">
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
                    {s.id === "tokenomics" && (
                      <TokenomicsCoin
                        eyebrow={t("litepaper.coin.eyebrow")}
                        title={t("litepaper.coin.title")}
                        desc={t("litepaper.coin.desc")}
                      />
                    )}
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
                      {t("litepaper.disclaimer.label")}
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed">
                      {t("litepaper.disclaimer.text")}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* TABLE OF CONTENTS (desktop, right rail) */}
            <aside className="hidden lg:block lg:col-span-3 lg:order-2">
              <div className="sticky top-28">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-5">
                  {t("litepaper.tocLabel")}
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
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="pb-16 md:pb-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-16 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px divider-line" />
            <div className="relative">
              <TrendingUp className="w-7 h-7 text-[#00F5D4] mx-auto mb-5" strokeWidth={1.5} />
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00F5D4] mb-3">{t("litepaper.cta.label")}</div>
              <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-5">
                {t("litepaper.cta.title")}
              </h2>
              <p className="text-base md:text-lg text-white/55 max-w-xl mx-auto mb-8">
                {t("litepaper.cta.sub")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://invest.aicreates.ai/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-full h-12 px-8 teal-btn" data-testid="button-investor-portal">
                    {t("litepaper.cta.open")} <ArrowRight className="ms-2 w-4 h-4" />
                  </Button>
                </a>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setDeckOpen(true)}
                  className="rounded-full h-12 px-8 glass-btn"
                  data-testid="button-view-pitch-deck-final"
                >
                  <BookOpen className="me-2 w-4 h-4" />
                  {t("litepaper.cta.viewDeck")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={deckOpen} onOpenChange={setDeckOpen}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 gap-0 border-0 bg-transparent shadow-none sm:rounded-none [&>button]:bg-black/60 [&>button]:text-white [&>button]:rounded-full [&>button]:p-1.5 [&>button]:opacity-100 [&>button]:end-2 [&>button]:top-2 [&>button]:z-10">
          <DialogHeader className="sr-only">
            <DialogTitle>{t("litepaper.dialog.title")}</DialogTitle>
            <DialogDescription>{t("litepaper.dialog.desc")}</DialogDescription>
          </DialogHeader>
          <DeckCarousel
            showHeader={false}
            testIdPrefix="deck-litepaper-modal"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
