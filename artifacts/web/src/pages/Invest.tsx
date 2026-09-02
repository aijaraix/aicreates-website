import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Download,
  FileText,
  BookOpen,
  Cpu,
  Layers,
  Network,
  Users,
} from "lucide-react";
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

export default function Invest() {
  const { t } = useTranslation();
  useSeo({
    title: t("invest.seo.title"),
    description: t("invest.seo.description"),
    path: "/opportunity",
  });
  const [deckOpen, setDeckOpen] = useState(false);
  const reduce = useReducedMotion();
  const fadeUp = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay } }
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay } };
  const fadeIn = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay } }
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay } };
  const inView = (delay = 0) =>
    reduce
      ? { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.3, delay } }
      : { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.5, delay } };

  const stats = [
    { k: t("invest.compute.stat1k"), v: t("invest.compute.stat1v") },
    { k: t("invest.compute.stat2k"), v: t("invest.compute.stat2v") },
    { k: t("invest.compute.stat3k"), v: t("invest.compute.stat3v") },
    { k: t("invest.compute.stat4k"), v: t("invest.compute.stat4v") },
  ];

  const materials = [
    {
      icon: FileText,
      title: t("invest.materials.litepaperTitle"),
      desc: t("invest.materials.litepaperDesc"),
      disabled: false,
      href: "/litepaper" as string | undefined,
      external: false,
      cta: t("invest.materials.litepaperCta"),
      testId: "button-view-litepaper-card",
    },
    {
      icon: BookOpen,
      title: t("invest.materials.deckTitle"),
      desc: t("invest.materials.deckDesc"),
      disabled: false,
      onClick: () => setDeckOpen(true),
      cta: t("invest.materials.deckCta"),
      testId: "button-view-pitch-deck-card",
    },
    {
      icon: Download,
      title: t("invest.materials.whitepaperTitle"),
      desc: t("invest.materials.whitepaperDesc"),
      disabled: false,
      href: `${import.meta.env.BASE_URL}litepaper.pdf` as string | undefined,
      download: "AIcreatesAI Whitepaper.pdf",
      external: true,
      cta: t("invest.materials.whitepaperCta"),
      testId: "button-download-whitepaper-card",
    },
  ];

  const pillars = [
    { icon: Layers, tag: "01", title: t("invest.why.p1Title"), desc: t("invest.why.p1Desc") },
    { icon: Cpu, tag: "02", title: t("invest.why.p2Title"), desc: t("invest.why.p2Desc") },
    { icon: Network, tag: "03", title: t("invest.why.p3Title"), desc: t("invest.why.p3Desc") },
    { icon: Users, tag: "04", title: t("invest.why.p4Title"), desc: t("invest.why.p4Desc") },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 min-h-[100dvh] sm:min-h-0 flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 w-full">
          <div className="max-w-5xl">
            <motion.div {...fadeIn(0)}>
              <SectionLabel>{t("invest.hero.eyebrow")}</SectionLabel>
            </motion.div>
            <motion.h1
              {...fadeUp(0.05)}
              className="mt-6 text-[40px] sm:text-5xl md:text-7xl lg:text-[88px] font-serif font-bold leading-[1.02] text-white tracking-tight [text-shadow:0_2px_30px_rgba(0,245,212,0.25),0_2px_24px_rgba(0,0,0,0.6)]"
            >
              {t("invest.hero.title")}
            </motion.h1>
            <motion.p
              {...fadeUp(0.15)}
              className="mt-7 text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl leading-relaxed font-light"
            >
              {t("invest.hero.subtitle")}
            </motion.p>

            <motion.div
              {...fadeUp(0.25)}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <a
                href={import.meta.env.PROD ? "https://invest.aicreates.ai/invest/" : "/invest/"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="rounded-full h-12 px-7 teal-btn"
                  data-testid="button-reserve-allocation"
                >
                  {t("invest.hero.reserve")} <ArrowRight className="ms-2 w-4 h-4" />
                </Button>
              </a>
              <Link href="/litepaper">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-7 glass-btn"
                  data-testid="button-hero-read-litepaper"
                >
                  {t("invest.hero.readLitepaper")}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* THE OPPORTUNITY */}
      <section className="py-14 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start max-w-6xl mx-auto">
            <div className="md:col-span-5">
              <SectionLabel>{t("invest.opportunity.eyebrow")}</SectionLabel>
              <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                {t("invest.opportunity.title")}
              </h2>
            </div>
            <div className="md:col-span-7 space-y-5 text-white/65 text-base sm:text-lg leading-relaxed">
              <p>{t("invest.opportunity.p1")}</p>
              <p>{t("invest.opportunity.p2")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPUTE INFRASTRUCTURE */}
      <section className="py-14 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-6xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#101010] to-[#0A0A0A] p-8 sm:p-10 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.10),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_80%_20%,black,transparent_70%)]" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              <div className="lg:col-span-7">
                <SectionLabel>{t("invest.compute.eyebrow")}</SectionLabel>
                <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                  {t("invest.compute.title")}
                </h2>
                <div className="mt-7 space-y-5 text-white/65 text-base sm:text-lg leading-relaxed">
                  <p>{t("invest.compute.p1")}</p>
                  <p>{t("invest.compute.p2")}</p>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.v}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-[#00F5D4]/30 transition-colors"
                  >
                    <div className="text-2xl md:text-3xl font-serif font-semibold text-[#00F5D4] tracking-tight">{s.k}</div>
                    <div className="mt-1.5 text-xs uppercase tracking-[0.18em] text-white/45">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHITEPAPER & LITEPAPER */}
      <section className="py-14 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-12 mx-auto text-center">
            <div className="inline-flex"><SectionLabel>{t("invest.materials.eyebrow")}</SectionLabel></div>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              {t("invest.materials.title")}
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/55 leading-relaxed">
              {t("invest.materials.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">
            {materials.map((card) => (
              <motion.div
                key={card.title}
                {...inView(0)}
                className="glass-card p-7 flex flex-col"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center mb-5">
                  <card.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white mb-2">{card.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-6 flex-1">{card.desc}</p>
                {card.disabled ? (
                  <Button
                    disabled
                    variant="outline"
                    className="rounded-full h-10 px-5 border-white/10 bg-white/[0.02] text-white/55 disabled:opacity-100 disabled:cursor-default justify-between"
                    data-testid={card.testId}
                  >
                    <span>{card.cta}</span>
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">{t("invest.materials.soon")}</span>
                  </Button>
                ) : "onClick" in card && card.onClick ? (
                  <Button
                    variant="outline"
                    onClick={card.onClick}
                    className="w-full rounded-full h-10 px-5 glass-btn group"
                    data-testid={card.testId}
                  >
                    {card.cta} <ArrowRight className="ms-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                ) : "download" in card && card.download ? (
                  <a
                    href={card.href!}
                    download={card.download}
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-10 px-5 glass-btn group"
                      data-testid={card.testId}
                    >
                      {card.cta} <ArrowRight className="ms-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </a>
                ) : card.external ? (
                  <a
                    href={card.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-10 px-5 glass-btn group"
                      data-testid={card.testId}
                    >
                      {card.cta} <ArrowRight className="ms-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </a>
                ) : (
                  <Link href={card.href!}>
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-10 px-5 glass-btn group"
                      data-testid={card.testId}
                    >
                      {card.cta} <ArrowRight className="ms-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TOKEN */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-6xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#101010] to-[#0A0A0A] p-8 sm:p-10 md:p-14 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,245,212,0.10),transparent_60%)] pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
              <div className="md:col-span-2 flex justify-center">
                <AicaTokenMark
                  className="w-48 sm:w-56 md:w-full max-w-[280px]"
                  testId="img-aica-coin"
                />
              </div>
              <div className="md:col-span-3">
                <SectionLabel>{t("invest.token.eyebrow")}</SectionLabel>
                <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                  {withGlyphs(t("invest.token.title"))}
                </h2>
                <p className="mt-5 text-base sm:text-lg text-white/65 leading-relaxed">
                  {withGlyphs(t("invest.token.desc"))}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/litepaper#tokenomics">
                    <Button
                      variant="outline"
                      className="rounded-full h-10 px-5 glass-btn group"
                      data-testid="button-token-litepaper"
                    >
                      {t("invest.token.cta")}{" "}
                      <ArrowRight className="ms-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY INVEST */}
      <section className="py-14 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-12">
            <SectionLabel>{t("invest.why.eyebrow")}</SectionLabel>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              {t("invest.why.title")}
            </h2>
            <p className="mt-5 text-base sm:text-lg text-white/55 leading-relaxed">
              {t("invest.why.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {pillars.map((p, i) => (
              <motion.div
                key={p.tag}
                {...inView(i * 0.06)}
                className="glass-card p-7 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{t("invest.why.pillar")} {p.tag}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-semibold text-white mb-2.5 leading-tight">{p.title}</h3>
                <p className="text-white/55 text-sm sm:text-base leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VISUAL WHITEPAPER */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 w-full">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-10 sm:p-12 md:p-20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px divider-line" />
            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05]"
              >
                {t("invest.cta.title")}
              </motion.h2>
              <p className="mt-5 text-base sm:text-lg text-white/65 leading-relaxed max-w-2xl mx-auto">
                {t("invest.cta.subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <a
                  href={import.meta.env.PROD ? "https://invest.aicreates.ai/" : "/invest/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="button-open-portal-cta"
                >
                  <Button
                    size="lg"
                    className="rounded-full h-12 px-8 teal-btn"
                  >
                    {t("invest.cta.open")} <ArrowRight className="ms-2 w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={deckOpen} onOpenChange={setDeckOpen}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 gap-0 border-0 bg-transparent shadow-none sm:rounded-none [&>button]:bg-black/60 [&>button]:text-white [&>button]:rounded-full [&>button]:p-1.5 [&>button]:opacity-100 [&>button]:end-2 [&>button]:top-2 [&>button]:z-10">
          <DialogHeader className="sr-only">
            <DialogTitle>{t("invest.dialog.title")}</DialogTitle>
            <DialogDescription>{t("invest.dialog.desc")}</DialogDescription>
          </DialogHeader>
          <DeckCarousel
            showHeader={false}
            testIdPrefix="deck-invest-modal"
          />
        </DialogContent>
      </Dialog>

      {/* DISCLAIMER */}
      <section className="pb-14 md:pb-20">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-3">
              {t("invest.disclaimer.label")}
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              {t("invest.disclaimer.text")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
