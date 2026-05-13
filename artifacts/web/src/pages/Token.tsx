import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Coins, Cpu, Users, ShieldCheck } from "lucide-react";
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

const UTILITIES = [
  {
    icon: Coins,
    t: "Subscription discounts",
    d: "Pay for platform subscriptions in $AICA at preferred rates once token utility is integrated.",
  },
  {
    icon: Cpu,
    t: "Compute network participation",
    d: "Stake and contribute compute - GPU and infrastructure - to the hybrid fabric and earn rewards.",
  },
  {
    icon: Users,
    t: "Contributor rewards",
    d: "Data, GPU, and ecosystem contributors are rewarded in $AICA for the value they create.",
  },
  {
    icon: ShieldCheck,
    t: "Long-term alignment",
    d: "All tokens sold in private rounds are vested. Incentives compound around real usage, not speculation.",
  },
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

      {/* UTILITIES */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-12">
            <div className="md:col-span-5">
              <SectionLabel>Utility</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                What $AICA actually does.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                Core platform revenue is initially driven by subscriptions to ensure operational stability. The token is integrated where it earns its place - subscription discounts, compute network participation, and rewards distributed to data, GPU, and ecosystem contributors.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {UTILITIES.map((u, i) => (
              <motion.div
                key={u.t}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="glass-card p-7 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center mb-5">
                  <u.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-white mb-2">{u.t}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{u.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PARAMETERS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <SectionLabel>Parameters</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Fixed supply. Aligned incentives.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { k: "10,000,000,000", v: "Total supply" },
              { k: "22.5%", v: "Private sale (2.25B AICA)" },
              { k: "$50M", v: "Total private-sale raise" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:border-[#00F5D4]/30 transition-colors">
                <div className="text-2xl md:text-3xl font-serif font-semibold text-[#00F5D4] tracking-tight">{s.k}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">{s.v}</div>
              </div>
            ))}
          </div>

          {/* SAFT round schedule */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5">
              <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                Private SAFT round schedule
              </div>
              <div className="mt-1 text-lg font-semibold text-white" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}>
                Five rounds, $0.010 → $0.034 per AICA, targeting ~$230M FDV
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-saft-rounds">
                <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Round</th>
                    <th className="text-left px-6 py-3 font-medium">Target Raise</th>
                    <th className="text-left px-6 py-3 font-medium">Price</th>
                    <th className="text-left px-6 py-3 font-medium">Tokens Sold</th>
                    <th className="text-left px-6 py-3 font-medium">% Supply</th>
                    <th className="text-left px-6 py-3 font-medium">FDV</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Strategic Seed", price: "$0.010", tokens: "500,000,000", raise: "$5,000,000", fdv: "$100M", supplyPct: "5.00%", open: true },
                    { name: "Private Round 1", price: "$0.015", tokens: "800,000,000", raise: "$12,000,000", fdv: "$150M", supplyPct: "8.00%", open: false },
                    { name: "Private Round 2", price: "$0.020", tokens: "900,000,000", raise: "$18,000,000", fdv: "$200M", supplyPct: "9.00%", open: false },
                    { name: "Infrastructure / Strategic", price: "$0.026", tokens: "384,615,385", raise: "$10,000,000", fdv: "$260M", supplyPct: "3.85%", open: false },
                    { name: "Community / Launchpad", price: "$0.034", tokens: "147,058,824", raise: "$5,000,000", fdv: "$340M", supplyPct: "1.47%", open: false },
                  ].map((r) => (
                    <tr key={r.name} className="border-t border-white/5">
                      <td className="px-6 py-3 font-medium text-white" style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}>{r.name}</td>
                      <td className="px-6 py-3 text-white/80">{r.raise}</td>
                      <td className="px-6 py-3 text-white/80">{r.price}</td>
                      <td className="px-6 py-3 text-white/60">{r.tokens}</td>
                      <td className="px-6 py-3 text-white/60">{r.supplyPct}</td>
                      <td className="px-6 py-3 text-white/80">{r.fdv}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${r.open ? "bg-[#00F5D4]/15 text-[#00F5D4]" : "bg-white/10 text-white/60"}`}>
                          {r.open ? "Open" : "Upcoming"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key principles */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40 mb-4">
              Key token principles
            </div>
            <ul className="space-y-3 text-white/70 text-sm md:text-base leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00F5D4] shrink-0 shadow-[0_0_6px_rgba(0,245,212,0.6)]" />
                <span>Core platform revenue is initially driven by subscriptions to ensure operational stability; token utility is integrated where it earns its place.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00F5D4] shrink-0 shadow-[0_0_6px_rgba(0,245,212,0.6)]" />
                <span>Utility includes subscription discounts, compute network participation, and contributor rewards (GPU, data, ecosystem).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00F5D4] shrink-0 shadow-[0_0_6px_rgba(0,245,212,0.6)]" />
                <span>All tokens sold in private rounds are subject to appropriate vesting schedules.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#00F5D4] shrink-0 shadow-[0_0_6px_rgba(0,245,212,0.6)]" />
                <span>A sustainable economic model designed around real usage, long-term alignment, and ecosystem health.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-3">Disclaimer</div>
            <p className="text-white/50 text-sm leading-relaxed">
              This page is for informational purposes only and does not constitute an offer to sell or a solicitation to buy any securities or tokens. The AICA private sale is structured as five sequential SAFT rounds priced from $0.010 to $0.034 per AICA, totaling 2,250,000,000 AICA (22.5% of the 10,000,000,000 fixed supply) for a $50M raise targeting ~$230M FDV. SAFT terms are draft pending counsel review. AICA tokens, when issued, will be utility tokens for consumptive use within the AIcreatesAI ecosystem and are subject to vesting and jurisdictional restrictions. Early-stage technology and cryptocurrency commitments involve significant risk and you may lose all funds.
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
                  Read the full tokenomics.
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  The litepaper contains the complete positioning, architecture, and token model.
                </p>
              </div>
              <Link href="/litepaper#tokenomics">
                <Button size="lg" className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium whitespace-nowrap">
                  Read the litepaper <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
