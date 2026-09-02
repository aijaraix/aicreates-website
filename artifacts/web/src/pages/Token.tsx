import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Server, Recycle } from "lucide-react";
import { useSeo } from "@/lib/useSeo";
import AicaTokenMark from "@/components/AicaTokenMark";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const CORE_INCENTIVES = [
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
];

const ADDITIONAL_INCENTIVES = [
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
];

const UTILITY_SUMMARY = [
  { type: "Compute Rewards (Validators)", who: "Retail + Large/Professional Validators", purpose: "Decentralized compute power" },
  { type: "Data Rewards", who: "Data providers", purpose: "Model improvement flywheel" },
  { type: "Skills Marketplace", who: "Skill creators & users", purpose: "Community-driven capabilities" },
  { type: "Workflow & Outcome Rewards", who: "Active users", purpose: "Real business impact" },
  { type: "High-Quality Feedback", who: "All users", purpose: "Continuous system improvement" },
  { type: "Premium Feature Access", who: "Active users", purpose: "Token demand & utility" },
  { type: "Referral & Growth Rewards", who: "Community", purpose: "Network growth" },
  { type: "Validator Performance Bonuses", who: "Top-performing validators", purpose: "Network quality & reliability" },
];

export default function Token() {
  useSeo({
    title: "$AICA - the native asset of the layer",
    description:
      "$AICA powers subscription discounts, compute network participation, and contributor rewards across the agentic intelligence layer. Fixed supply: 10,000,000,000.",
    path: "/token",
  });
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <SectionLabel>$AICA Token</SectionLabel>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="mt-6 text-5xl md:text-7xl font-serif font-semibold leading-[1.02] text-gradient"
              >
                The native asset of the layer.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-8 text-lg md:text-2xl text-white/65 max-w-2xl leading-relaxed"
              >
                Subscriptions, compute participation, and contributor rewards - settled in $AICA. A sustainable economic model built around real usage.
              </motion.p>
            </div>
            <div className="md:col-span-5 flex justify-center">
              <AicaTokenMark className="w-64 md:w-full max-w-[360px]" testId="img-aica-coin" />
            </div>
          </div>
        </div>
      </section>

      {/* UTILITY - INTRO + PHILOSOPHY */}
      <section id="utility" className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>Token Utility</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                $AICA Token Utility.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/70 text-base md:text-lg leading-relaxed">
              <p>
                The $AICA token is the economic engine of the AIcreatesAI ecosystem. It is designed to reward real contributions, drive high-quality participation, and create a sustainable, usage-driven economy.
              </p>
              <p>
                While core platform revenue comes from stablecoin and fiat subscriptions, the $AICA token serves as the primary mechanism to incentivize network growth, improve intelligence quality, and align long-term participants with the success of the platform.
              </p>
            </div>
          </div>

          {/* Core Philosophy */}
          <div className="mt-12 rounded-2xl border border-[#00F5D4]/20 bg-[#00F5D4]/[0.03] p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#00F5D4] mb-3">
              Core Philosophy
            </div>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              Every token earned or spent should either improve the network (through meaningful contributions) or enhance user experience (through access and utility). The token economy is built around a closed-loop "recycle" model where platform revenue and fees continuously fund rewards for active contributors.
            </p>
          </div>
        </div>
      </section>

      {/* CORE INCENTIVE MECHANISMS */}
      <section className="py-14 md:py-20 relative border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <SectionLabel>Core Incentives</SectionLabel>
            <h2 className="mt-6 text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Three primary ways to earn.
            </h2>
            <p className="mt-5 text-white/60 text-base md:text-lg leading-relaxed">
              Compute, data, and skills - the three contributions that compound the intelligence layer over time.
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <table className="w-full text-sm" data-testid="table-core-incentives">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                <tr>
                  <th className="text-start px-6 py-4 font-medium w-[24%]">Category</th>
                  <th className="text-start px-6 py-4 font-medium w-[28%]">What participants do</th>
                  <th className="text-start px-6 py-4 font-medium w-[28%]">How rewards work</th>
                  <th className="text-start px-6 py-4 font-medium w-[20%]">Why it matters</th>
                </tr>
              </thead>
              <tbody>
                {CORE_INCENTIVES.map((row) => (
                  <tr key={row.category} className="border-t border-white/5 align-top">
                    <td className="px-6 py-5 font-semibold text-white" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}>{row.category}</td>
                    <td className="px-6 py-5 text-white/70 leading-relaxed">{row.what}</td>
                    <td className="px-6 py-5 text-white/70 leading-relaxed">{row.how}</td>
                    <td className="px-6 py-5 text-[#00F5D4]/90 leading-relaxed">{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden grid gap-4">
            {CORE_INCENTIVES.map((row) => (
              <div key={row.category} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <div className="text-base font-semibold text-white mb-4" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}>{row.category}</div>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">What participants do</dt>
                    <dd className="text-white/70 leading-relaxed">{row.what}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">How rewards work</dt>
                    <dd className="text-white/70 leading-relaxed">{row.how}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-1">Why it matters</dt>
                    <dd className="text-[#00F5D4]/90 leading-relaxed">{row.why}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALIDATOR REWARDS - DETAILED BREAKDOWN */}
      <section className="py-14 md:py-20 relative border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <SectionLabel>Validator Rewards</SectionLabel>
            <h2 className="mt-6 text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              The backbone of decentralized compute.
            </h2>
            <p className="mt-5 text-white/60 text-base md:text-lg leading-relaxed">
              Validators are the backbone of our decentralized compute network. We operate a two-tier system designed to reward both casual participants and serious operators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Retail */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:border-[#00F5D4]/30 transition-colors"
            >
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
            </motion.div>

            {/* Large / Professional */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="rounded-2xl border border-[#00F5D4]/30 bg-gradient-to-b from-[#00F5D4]/[0.04] to-transparent p-7 hover:border-[#00F5D4]/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-11 h-11 rounded-lg bg-[#00F5D4]/15 border border-[#00F5D4]/30 flex items-center justify-center">
                  <Server className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
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
            </motion.div>
          </div>

          {/* How rewards work */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-3">
              How validator rewards work
            </div>
            <p className="text-white/70 text-base leading-relaxed">
              Rewards are distributed from the Community & Rewards pool. Base rewards are calculated on effective VRAM hours contributed, uptime, and task success rate. Large / Professional Validators receive a multiplier due to higher reliability and staking commitment. Top performers in both tiers receive additional performance bonuses.
            </p>
          </div>
        </div>
      </section>

      {/* ADDITIONAL INCENTIVE MECHANISMS */}
      <section className="py-14 md:py-20 relative border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <SectionLabel>Additional Incentives</SectionLabel>
            <h2 className="mt-6 text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Rewarded for everything that improves the system.
            </h2>
          </div>

          <div className="grid gap-4">
            {ADDITIONAL_INCENTIVES.map((row, i) => (
              <motion.div
                key={row.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-7 hover:border-[#00F5D4]/25 transition-colors grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6"
              >
                <div className="md:col-span-3">
                  <div className="text-base md:text-lg font-semibold text-white" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}>{row.name}</div>
                </div>
                <div className="md:col-span-6 text-white/70 text-sm md:text-base leading-relaxed">
                  {row.desc}
                </div>
                <div className="md:col-span-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#00F5D4]/70 mb-1">Benefit</div>
                  <div className="text-[#00F5D4]/90 text-sm leading-relaxed">{row.benefit}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RECYCLE MODEL */}
      <section className="py-14 md:py-20 relative border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-5">
              <SectionLabel>Recycle Model</SectionLabel>
              <h2 className="mt-6 text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                A closed-loop, self-sustaining economy.
              </h2>
              <div className="mt-8 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00F5D4]/10 border border-[#00F5D4]/30">
                <Recycle className="w-7 h-7 text-[#00F5D4]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="md:col-span-7 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8 space-y-5 text-white/70 text-base leading-relaxed">
              <p>
                A portion of stablecoin subscription revenue is used to buy $AICA and seed the Compute Reward Pool.
              </p>
              <p>
                All $AICA earned by the platform - marketplace fees, transaction fees, slashing, discount redemptions - flows back into the same pool.
              </p>
              <p>
                Rewards are distributed to validators, data providers, skill creators, high-quality feedback providers, and users who achieve strong business outcomes.
              </p>
              <p className="text-[#00F5D4]/90 font-medium">
                The result: platform usage continuously fuels token demand, and token rewards continuously fuel platform contribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL UTILITY SUMMARY */}
      <section className="py-14 md:py-20 relative border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <SectionLabel>Summary</SectionLabel>
            <h2 className="mt-6 text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              $AICA token utility summary.
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-utility-summary">
                <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                  <tr>
                    <th className="text-start px-6 py-4 font-medium">Utility type</th>
                    <th className="text-start px-6 py-4 font-medium">Primary beneficiaries</th>
                    <th className="text-start px-6 py-4 font-medium">Key purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {UTILITY_SUMMARY.map((row) => (
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
        </div>
      </section>

      {/* PARAMETERS */}
      <section id="parameters" className="py-14 md:py-20 relative border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <SectionLabel>Supply</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Fixed supply. Aligned incentives.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { k: "10,000,000,000", v: "Total fixed supply (AICA)" },
              { k: "Closed-loop", v: "Recycle reward economy" },
              { k: "Vested", v: "All private allocations" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:border-[#00F5D4]/30 transition-colors">
                <div className="text-2xl md:text-3xl font-serif font-semibold text-[#00F5D4] tracking-tight">{s.k}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-3">Disclaimer</div>
            <p className="text-white/50 text-sm leading-relaxed">
              This page is for informational purposes only and does not constitute an offer to sell or a solicitation to buy any securities or tokens. AICA tokens, when issued, will be utility tokens for consumptive use within the AIcreatesAI ecosystem and are subject to vesting and jurisdictional restrictions. Early-stage technology and cryptocurrency commitments involve significant risk and you may lose all funds. Detailed private-sale terms are available to accredited investors via the investor portal.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-4">
                  Accredited investor?
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  The investor portal contains the complete private-sale terms, round schedule, and SAFT documents.
                </p>
              </div>
              <a href="https://invest.aicreates.ai" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="rounded-full h-12 px-8 teal-btn whitespace-nowrap" data-testid="link-investor-portal">
                  Open investor portal <ArrowRight className="ms-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
