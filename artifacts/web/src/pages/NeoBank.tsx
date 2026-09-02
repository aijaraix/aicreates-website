import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Wallet,
  Building2,
  Activity,
  ArrowRight,
  ArrowUpRight,
  Globe,
  Lock,
  ArrowRightLeft,
  Coins
} from "lucide-react";
import { useSeo } from "@/lib/useSeo";
import { trackOutboundProductCta } from "@/lib/analytics";

import finpaytekImg from "@/assets/fin.png"; 

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-blue-100/70">{children}</span>
    </div>
  );
}

export default function NeoBank() {
  const { t } = useTranslation();
  useSeo({
    title: t("neobank.seo.title"),
    description: t("neobank.seo.description"),
    path: "/neobank",
  });

  const pillars = [
    { icon: Globe, t: t("neobank.pillars.items.p1.t"), d: t("neobank.pillars.items.p1.d") },
    { icon: Building2, t: t("neobank.pillars.items.p2.t"), d: t("neobank.pillars.items.p2.d") },
    { icon: ArrowRightLeft, t: t("neobank.pillars.items.p3.t"), d: t("neobank.pillars.items.p3.d") },
    { icon: Lock, t: t("neobank.pillars.items.p4.t"), d: t("neobank.pillars.items.p4.d") },
  ];

  const tiers = [
    {
      icon: Wallet,
      tag: t("neobank.tiers.personal.tag"),
      title: t("neobank.tiers.personal.title"),
      points: [
        t("neobank.tiers.personal.point1"),
        t("neobank.tiers.personal.point2"),
        t("neobank.tiers.personal.point3"),
      ],
    },
    {
      icon: ArrowRightLeft,
      tag: t("neobank.tiers.business.tag"),
      title: t("neobank.tiers.business.title"),
      points: [
        t("neobank.tiers.business.point1"),
        t("neobank.tiers.business.point2"),
        t("neobank.tiers.business.point3"),
      ],
    },
    {
      icon: Coins,
      tag: t("neobank.tiers.enterprise.tag"),
      title: t("neobank.tiers.enterprise.title"),
      points: [
        t("neobank.tiers.enterprise.point1"),
        t("neobank.tiers.enterprise.point2"),
        t("neobank.tiers.enterprise.point3"),
      ],
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="max-w-3xl lg:col-span-7">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <SectionLabel>{t("neobank.hero.eyebrow")}</SectionLabel>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight"
              >
                {t("neobank.hero.title")}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-6 text-xl md:text-2xl text-blue-100/90 max-w-2xl leading-relaxed font-light"
              >
                {t("neobank.hero.subline")}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 text-lg text-white/55 max-w-2xl leading-relaxed"
              >
                {t("neobank.hero.seeLayer")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <a
                  href="https://finpaytek.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackOutboundProductCta({
                      product: "finpaytek",
                      sourcePage: "/neobank",
                      destination: "finpaytek.com",
                    })
                  }
                >
                  <Button size="lg" className="rounded-full h-12 px-7 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                    {t("neobank.hero.coming")} <ArrowUpRight className="ms-2 w-4 h-4" />
                  </Button>
                </a>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-5 relative hidden md:block"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
              <img src={finpaytekImg} alt="FinPayTek" className="relative z-10 w-full h-auto rounded-3xl border border-white/10 mix-blend-screen" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>{t("neobank.pillars.eyebrow")}</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05]">
              {t("neobank.pillars.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((p, i) => (
              <motion.div
                key={p.t}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="glass-card p-6 hover:border-blue-500/30 transition-colors bg-gradient-to-b from-white/[0.03] to-transparent"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{p.t}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIERS (The 5-step flow) */}
      <section className="py-14 md:py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mb-14">
            <SectionLabel>{t("neobank.tiers.eyebrow")}</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05]">
              {t("neobank.tiers.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-y-1/2 pointer-events-none" />
            
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.tag}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative bg-[#0E0E0E]/80 backdrop-blur-md border border-white/5 p-8 flex flex-col rounded-2xl hover:border-blue-500/30 hover:bg-[#111] transition-all group"
              >
                <div className="flex items-center justify-between mb-7">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <tier.icon className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{tier.tag}</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-white mb-5 leading-tight">{tier.title}</h3>
                <ul className="space-y-3 mt-auto pt-4 border-t border-white/5">
                  {tier.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-white/65 text-sm">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0 shadow-[0_0_6px_rgba(59,130,246,0.8)]" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY IT WORKS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>{t("neobank.why.eyebrow")}</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05]">
                {t("neobank.why.title")}
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>{t("neobank.why.p1")}</p>
              <p>{t("neobank.why.p2")}</p>
              <p>{t("neobank.why.p3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-blue-500/20 bg-gradient-to-b from-[#051025] to-[#0A0A0A] p-12 md:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <Activity className="w-8 h-8 text-blue-400 mb-6" strokeWidth={1.5} />
                <h2 className="text-3xl md:text-5xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05] mb-4">
                  {t("neobank.cta.title")}
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  {t("neobank.cta.sub")}
                </p>
              </div>
              <a
                href="https://finpaytek.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackOutboundProductCta({
                    product: "finpaytek",
                    sourcePage: "/neobank",
                    destination: "finpaytek.com",
                  })
                }
              >
                <Button size="lg" className="rounded-full h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all whitespace-nowrap">
                  {t("neobank.cta.coming")} <ArrowUpRight className="ms-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
