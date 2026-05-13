import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  Network,
  Users,
  Building2,
  Briefcase,
  Activity,
} from "lucide-react";
import { useSeo } from "@/lib/useSeo";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

export default function NeoBank() {
  useSeo({
    title: "NeoBank - Capital That Thinks",
    description:
      "A consumer and business neobank built on the agentic intelligence layer. Balances allocate themselves, risk manages itself, and capital becomes self-organizing.",
    path: "/neobank",
  });
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-28 pb-14 md:pt-36 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <SectionLabel>Secondary Product Line</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] text-gradient"
            >
              NeoBank.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-8 text-lg md:text-2xl text-white/65 max-w-3xl leading-relaxed"
            >
              Capital that thinks. A consumer and business neobank built directly on the agentic intelligence layer - so balances allocate themselves, risk manages itself, and money does work for you, not the other way around.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Button
                type="button"
                size="lg"
                aria-disabled="true"
                onClick={(e) => e.preventDefault()}
                className="rounded-full h-12 px-7 teal-btn"
              >
                Coming soon
              </Button>
              <Link href="/eve-os">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 glass-btn">
                  See the layer behind it
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>The shape of it</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              A bank with a brain.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Wallet, t: "One unified wallet", d: "Balances, accounts, and assets in a single coherent surface." },
              { icon: TrendingUp, t: "Autonomous yield", d: "The layer allocates capital across instruments tuned to your risk profile." },
              { icon: ShieldCheck, t: "Active risk mesh", d: "Continuous monitoring, exposure caps, and policy-driven protection." },
              { icon: Network, t: "Programmable rails", d: "Move, settle, and account for capital across any modern rail." },
            ].map((p) => (
              <motion.div
                key={p.t}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className="glass-card p-6 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{p.t}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TIERS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Built for everyone</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              From first dollar to corporate treasury.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Users,
                tag: "Personal",
                title: "An intelligent edge for everyday capital.",
                points: [
                  "Single wallet, fully owned by you",
                  "Autonomous yield strategies",
                  "Adaptive guidance, not static dashboards",
                ],
              },
              {
                icon: Briefcase,
                tag: "Business",
                title: "Banking that operates with you.",
                points: [
                  "Scoped cards and per-team controls",
                  "Programmable invoicing and payouts",
                  "Real-time reconciliation and reporting",
                ],
              },
              {
                icon: Building2,
                tag: "Enterprise",
                title: "Agentic treasury at institutional scale.",
                points: [
                  "Multi-currency, multi-rail treasury",
                  "Idle-fund yield with risk envelopes",
                  "SSO, audit trails, sovereign tenancy",
                ],
              },
            ].map((t, i) => (
              <motion.div
                key={t.tag}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card p-8 flex flex-col hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-7">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center">
                    <t.icon className="w-5 h-5 text-white/80" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{t.tag}</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-white mb-5 leading-tight">{t.title}</h3>
                <ul className="space-y-2.5 mt-auto pt-4 border-t border-white/5">
                  {t.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-white/65 text-sm">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#00F5D4] shrink-0" />
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
              <SectionLabel>Why it works</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                Not a fintech wrapper. A new bank shape.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                NeoBank is built on the same agentic intelligence layer that powers Eve OS. It does not bolt AI on top of legacy banking primitives. It rethinks them.
              </p>
              <p>
                The same closed-loop quality engine that runs business operations runs treasury allocation. The same hybrid compute fabric that delivers low-latency decisions for ops delivers them for capital. Capital, like operations, becomes self-organizing.
              </p>
              <p>
                The result is a bank that gets sharper, safer, and more useful the longer you use it.
              </p>
            </div>
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
                <Activity className="w-7 h-7 text-[#00F5D4] mb-5" strokeWidth={1.5} />
                <h2 className="text-3xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05] mb-4">
                  Capital that thinks for itself.
                </h2>
                <p className="text-lg text-white/55 max-w-xl">
                  Our NeoBank is in active development. Stay tuned, we will share more soon.
                </p>
              </div>
              <Button
                type="button"
                size="lg"
                aria-disabled="true"
                onClick={(e) => e.preventDefault()}
                className="rounded-full h-12 px-8 teal-btn whitespace-nowrap"
              >
                Coming soon
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
