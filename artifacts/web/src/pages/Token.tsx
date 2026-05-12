import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Coins, Cpu, Users, ShieldCheck } from "lucide-react";
import aicaCoin from "@/assets/aica-coin.png";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

const UTILITIES = [
  { icon: Coins, t: "Subscription discounts", d: "Pay for platform subscriptions in $AICA at preferred rates." },
  { icon: Cpu, t: "Compute network participation", d: "Stake and contribute compute to the hybrid fabric and earn rewards." },
  { icon: Users, t: "Contributor rewards", d: "Data, GPU, and ecosystem contributors are rewarded in $AICA." },
  { icon: ShieldCheck, t: "Long-term alignment", d: "Vesting and policy ensure incentives compound over real usage." },
];

export default function Token() {
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
              <img
                src={aicaCoin}
                alt="$AICA token"
                className="w-64 md:w-full max-w-[360px] aspect-square object-contain drop-shadow-[0_0_60px_rgba(0,245,212,0.4)]"
                draggable={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* UTILITIES */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Utility</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              What $AICA actually does.
            </h2>
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
          <div className="max-w-3xl mb-14">
            <SectionLabel>Parameters</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Fixed supply. Aligned incentives.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { k: "10,000,000,000", v: "Total supply" },
              { k: "Vested", v: "All private rounds" },
              { k: "Usage-driven", v: "Economic model" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 hover:border-[#00F5D4]/30 transition-colors">
                <div className="text-2xl md:text-3xl font-serif font-semibold text-[#00F5D4] tracking-tight">{s.k}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>Principles</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                Built around real usage.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                Core platform revenue is initially driven by subscriptions to ensure operational stability. Token utility is integrated where it earns its place.
              </p>
              <p>
                The token underwrites participation in the compute network, contributor rewards, and ecosystem health - not speculative loops.
              </p>
              <p>
                All tokens sold in private rounds are subject to appropriate vesting. The economic model is designed for long-term alignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DISCLAIMER */}
      <section className="pb-12">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40 mb-3">Disclaimer</div>
            <p className="text-white/50 text-sm leading-relaxed">
              This page is for informational purposes only and does not constitute an offer to sell or a solicitation to buy any securities or tokens. Token utility, parameters, and timing are subject to change based on development progress, market conditions, and regulatory factors.
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
