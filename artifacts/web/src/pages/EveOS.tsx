import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  GitMerge,
  Layers,
  CheckCircle2,
  Sparkles,
  Megaphone,
  TrendingUp,
  Wallet,
  Scale,
  Workflow,
  Target,
  Cpu,
  Repeat,
  Network,
  Users
} from "lucide-react";
import { useSeo } from "@/lib/useSeo";
import { trackOutboundProductCta } from "@/lib/analytics";

import evePortrait from "@/assets/eve-human-portrait.jpg";
import eveHero from "@/assets/eve-office.jpg";
import siennaPortrait from "@/assets/eve-team/sienna.png";
import sterlingPortrait from "@/assets/eve-team/sterling.png";
import dahliaPortrait from "@/assets/eve-team/dahlia.png";
import vivianPortrait from "@/assets/eve-team/vivian.png";
import marcusPortrait from "@/assets/eve-team/marcus.png";
import dianaPortrait from "@/assets/eve-team/diana.png";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/5">
      <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-fuchsia-100/70">{children}</span>
    </div>
  );
}

export default function EveOS() {
  const { t } = useTranslation();
  useSeo({
    title: t("eveos.seo.title"),
    description: t("eveos.seo.description"),
    path: "/eve-os",
  });

  const steps = [
    { icon: Crosshair, k: "01", title: t("eveos.how.steps.s1.title"), desc: t("eveos.how.steps.s1.desc") },
    { icon: GitMerge, k: "02", title: t("eveos.how.steps.s2.title"), desc: t("eveos.how.steps.s2.desc") },
    { icon: Layers, k: "03", title: t("eveos.how.steps.s3.title"), desc: t("eveos.how.steps.s3.desc") },
    { icon: Repeat, k: "04", title: t("eveos.how.steps.s4.title"), desc: t("eveos.how.steps.s4.desc") },
    { icon: Sparkles, k: "05", title: t("eveos.how.steps.s5.title"), desc: t("eveos.how.steps.s5.desc") },
  ];

  const caps = [
    { icon: Megaphone, t: t("eveos.caps.items.marketing.t"), d: t("eveos.caps.items.marketing.d") },
    { icon: TrendingUp, t: t("eveos.caps.items.sales.t"), d: t("eveos.caps.items.sales.d") },
    { icon: Wallet, t: t("eveos.caps.items.finance.t"), d: t("eveos.caps.items.finance.d") },
    { icon: Scale, t: t("eveos.caps.items.legal.t"), d: t("eveos.caps.items.legal.d") },
    { icon: Workflow, t: t("eveos.caps.items.ops.t"), d: t("eveos.caps.items.ops.d") },
    { icon: Target, t: t("eveos.caps.items.advertising.t"), d: t("eveos.caps.items.advertising.d") },
  ];

  const diffs = [
    { icon: Network, tag: t("eveos.stands.diffs.d1.tag"), title: t("eveos.stands.diffs.d1.title"), desc: t("eveos.stands.diffs.d1.desc") },
    { icon: CheckCircle2, tag: t("eveos.stands.diffs.d2.tag"), title: t("eveos.stands.diffs.d2.title"), desc: t("eveos.stands.diffs.d2.desc") },
    { icon: Cpu, tag: t("eveos.stands.diffs.d3.tag"), title: t("eveos.stands.diffs.d3.title"), desc: t("eveos.stands.diffs.d3.desc") },
  ];

  const bullets = [
    t("eveos.who.bullets.b1"),
    t("eveos.who.bullets.b2"),
    t("eveos.who.bullets.b3"),
    t("eveos.who.bullets.b4"),
  ];

  const team = [
    {
      name: "Sienna",
      role: t("eveos.team.marketing.role", "Head of Marketing"),
      department: t("eveos.team.marketing.department", "Marketing"),
      description: t("eveos.team.marketing.desc", "Keeps your brand visible with campaigns, content, and performance insights."),
      image: siennaPortrait,
      accent: "text-orange-300",
      border: "border-orange-400/30",
      wash: "from-orange-400/20",
    },
    {
      name: "Sterling",
      role: t("eveos.team.sales.role", "Head of Sales"),
      department: t("eveos.team.sales.department", "Sales"),
      description: t("eveos.team.sales.desc", "Turns demand into momentum with lead intake, outreach, and pipeline support."),
      image: sterlingPortrait,
      accent: "text-yellow-300",
      border: "border-yellow-300/30",
      wash: "from-yellow-300/20",
    },
    {
      name: "Dahlia",
      role: t("eveos.team.advertising.role", "Head of Advertising"),
      department: t("eveos.team.advertising.department", "Advertising"),
      description: t("eveos.team.advertising.desc", "Connects the right message to the right audience through focused paid media work."),
      image: dahliaPortrait,
      accent: "text-pink-300",
      border: "border-pink-300/30",
      wash: "from-pink-300/20",
    },
    {
      name: "Vivian",
      role: t("eveos.team.finance.role", "Head of Finance"),
      department: t("eveos.team.finance.department", "Finance"),
      description: t("eveos.team.finance.desc", "Makes the numbers useful with budgets, forecasts, invoices, and financial reporting."),
      image: vivianPortrait,
      accent: "text-emerald-300",
      border: "border-emerald-300/30",
      wash: "from-emerald-300/20",
    },
    {
      name: "Marcus",
      role: t("eveos.team.operations.role", "Head of Operations"),
      department: t("eveos.team.operations.department", "Operations"),
      description: t("eveos.team.operations.desc", "Keeps the business moving with repeatable workflows, logistics, and process clarity."),
      image: marcusPortrait,
      accent: "text-violet-300",
      border: "border-violet-300/30",
      wash: "from-violet-300/20",
    },
    {
      name: "Diana",
      role: t("eveos.team.legal.role", "Head of Legal"),
      department: t("eveos.team.legal.department", "Legal & Compliance"),
      description: t("eveos.team.legal.desc", "Brings structure to contracts, policy, compliance, and risk before work reaches you."),
      image: dianaPortrait,
      accent: "text-sky-300",
      border: "border-sky-300/30",
      wash: "from-sky-300/20",
    },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(217,70,239,0.08),transparent_70%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="max-w-3xl lg:col-span-7">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <SectionLabel>{t("eveos.hero.eyebrow")}</SectionLabel>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="mt-6 text-6xl md:text-7xl lg:text-[96px] font-serif font-semibold leading-[1.0] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight"
              >
                Eve OS
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-6 text-xl md:text-3xl text-fuchsia-100/90 max-w-2xl leading-tight font-light"
              >
                {t("eveos.hero.subline")}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 text-lg md:text-xl text-white/55 max-w-2xl leading-relaxed"
              >
                {t("eveos.hero.desc")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <a
                  href="https://evecxo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackOutboundProductCta({
                      product: "eve",
                      sourcePage: "/eve-os",
                      destination: "evecxo.com",
                    })
                  }
                >
                  <Button size="lg" className="rounded-full h-12 px-7 bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-0 shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all">
                    {t("eveos.hero.joinWaitlist")} <ArrowUpRight className="ms-2 w-4 h-4" />
                  </Button>
                </a>
                <Link href="/litepaper">
                  <Button size="lg" variant="outline" className="rounded-full h-12 px-7 glass-btn hover:border-fuchsia-500/50 hover:text-fuchsia-400">
                    {t("eveos.hero.readLitepaper")}
                  </Button>
                </Link>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-5 relative hidden md:block"
            >
              <div className="absolute inset-0 bg-fuchsia-500/20 blur-[100px] rounded-full" />
              <img src={eveHero} alt="Eve OS" className="relative z-10 w-full h-auto rounded-3xl border border-white/10 object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT IS EVE OS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>{t("eveos.what.eyebrow")}</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05]">
                {t("eveos.what.title")}
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>{t("eveos.what.p1")}</p>
              <p>{t("eveos.what.p2")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* MEET THE TEAM */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(217,70,239,0.07),transparent_72%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mb-12 md:mb-16">
            <SectionLabel>{t("eveos.team.eyebrow", "Meet the team")}</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-6xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05]">
              {t("eveos.team.title", "One chief of staff. Six department heads.")}
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed max-w-2xl">
              {t("eveos.team.sub", "Eve keeps the whole company aligned while each specialist brings deep focus to the work. See who is behind every workflow.")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55 }}
              className="lg:col-span-4 relative overflow-hidden rounded-3xl border border-fuchsia-400/30 bg-gradient-to-b from-fuchsia-400/20 via-[#18051E] to-[#0B0B0B] min-h-[440px] md:min-h-[560px]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300 to-transparent" />
              <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
              <img
                src={evePortrait}
                alt="Eve, the chief of staff coordinating the AI team"
                className="absolute inset-0 w-full h-full object-cover object-top opacity-90 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-fuchsia-300 shadow-[0_0_12px_rgba(232,121,249,0.9)]" />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-200/80">
                    {t("eveos.team.eve.role", "Chief of Staff")}
                  </span>
                </div>
                <h3 className="text-4xl font-serif font-semibold text-white">Eve</h3>
                <p className="mt-3 text-white/65 leading-relaxed">
                  {t("eveos.team.eve.desc", "She takes the goal, routes the work, and brings one coordinated answer back to you.")}
                </p>
              </div>
            </motion.div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {team.map((member, i) => (
                <motion.article
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className={`group relative overflow-hidden rounded-2xl border ${member.border} bg-[#111]/90 hover:bg-[#171717] transition-colors`}
                >
                  <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${member.wash} to-transparent opacity-70`} />
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={member.image}
                      alt={`${member.name}, ${member.role}`}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover object-top grayscale-[15%] group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                  </div>
                  <div className="relative px-5 pb-5 -mt-2">
                    <p className={`text-[10px] uppercase tracking-[0.2em] ${member.accent}`}>{member.department}</p>
                    <div className="mt-2 flex items-baseline justify-between gap-3">
                      <h3 className="text-2xl font-serif font-semibold text-white">{member.name}</h3>
                      <span className="text-xs text-white/45 text-right">{member.role.replace(/^Head of /, "")}</span>
                    </div>
                    <p className="mt-3 text-sm text-white/55 leading-relaxed">{member.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 md:py-24 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,70,239,0.03),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mb-14">
            <SectionLabel>{t("eveos.how.eyebrow")}</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05]">
              {t("eveos.how.title")}
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed">
              {t("eveos.how.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent -translate-y-1/2 pointer-events-none" />
            
            {steps.map((s, i) => (
              <motion.div
                key={s.k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative bg-[#0E0E0E]/80 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:border-fuchsia-500/30 hover:bg-[#111] transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <s.icon className="w-5 h-5 text-fuchsia-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-mono text-white/20 tracking-widest">{s.k}</span>
                </div>
                <h3 className="text-base font-serif font-semibold text-white mb-3 leading-tight">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY CAPABILITIES */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>{t("eveos.caps.eyebrow")}</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05]">
              {t("eveos.caps.title")}
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed">
              {t("eveos.caps.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {caps.map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass-card p-7 hover:border-fuchsia-500/30 transition-colors bg-gradient-to-b from-white/[0.03] to-transparent"
              >
                <c.icon className="w-6 h-6 text-fuchsia-400 mb-5" strokeWidth={1.5} />
                <h3 className="text-lg font-serif font-semibold text-white mb-2.5">{c.t}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY EVE OS STANDS OUT */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>{t("eveos.stands.eyebrow")}</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05]">
              {t("eveos.stands.title")}
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed">
              {t("eveos.stands.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {diffs.map((d, i) => (
              <motion.div
                key={d.tag}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card p-8 hover:border-fuchsia-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-10 h-10 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                    <d.icon className="w-5 h-5 text-fuchsia-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{d.tag}</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-white mb-3">{d.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO EVE OS IS FOR */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>{t("eveos.who.eyebrow")}</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05]">
              {t("eveos.who.title")}
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed">
              {t("eveos.who.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bullets.map((b) => (
              <div
                key={b}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-start gap-4"
              >
                <div className="mt-1 w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-fuchsia-400" strokeWidth={1.8} />
                </div>
                <p className="text-white/75 text-base leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-fuchsia-500/20 bg-gradient-to-b from-[#18051E] to-[#0A0A0A] p-12 md:p-20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,70,239,0.15),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
            <div className="relative">
              <Users className="w-8 h-8 text-fuchsia-400 mx-auto mb-6" strokeWidth={1.5} />
              <h2 className="text-4xl md:text-6xl font-serif font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 leading-[1.05] mb-6">
                {t("eveos.cta.title")}
              </h2>
              <p className="text-lg text-white/55 max-w-xl mx-auto mb-10">
                {t("eveos.cta.sub")}
              </p>
              <a
                href="https://evecxo.com/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackOutboundProductCta({
                    product: "eve",
                    sourcePage: "/eve-os",
                    destination: "evecxo.com",
                  })
                }
              >
                <Button size="lg" className="rounded-full h-12 px-8 bg-fuchsia-600 hover:bg-fuchsia-500 text-white border-0 shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all">
                  {t("eveos.cta.button")} <ArrowUpRight className="ms-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
