import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Blocks, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import finVisual from "@/assets/fin.png";

export default function Fin() {
  return (
    <div className="flex flex-col w-full">
      {/* PRODUCT HERO */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-primary flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
              <span className="font-serif font-bold text-2xl text-white">F</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Intelligence meets <br/>infrastructure.
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl mb-10">
              An agentic tokenized neobank concept. AI-guided finance, digital wallets, crypto acceptance, and modern payment infrastructure in one seamless ecosystem.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-medium text-white/80 tracking-wide">In Active Development</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VISUAL SHOWCASE */}
      <section className="pb-24 relative z-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-5xl mx-auto glass-card p-2 rounded-3xl overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 z-10 pointer-events-none" />
            <img 
              src={finVisual} 
              alt="Fin Platform Interface" 
              className="w-full h-auto aspect-[16/9] object-cover rounded-2xl opacity-90"
            />
          </motion.div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-24 bg-background relative z-20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Designed for the tokenized economy.</h2>
            <p className="text-lg text-white/60">
              Fin bridges the gap between traditional fiat operations and modern digital asset rails, entirely guided by the Eve intelligence layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Wallet,
                title: "Digital Wallets",
                desc: "Unified balances across fiat and digital assets, instantly accessible and autonomously optimized."
              },
              {
                icon: Blocks,
                title: "Crypto Acceptance",
                desc: "Native integration for receiving, holding, and liquidating digital assets without third-party friction."
              },
              {
                icon: CreditCard,
                title: "Business Accounts",
                desc: "Corporate banking primitives enhanced with AI-driven reconciliation and spend management."
              },
              {
                icon: Activity,
                title: "AI-Guided Finance",
                desc: "Eve acts as a proactive financial copilot, analyzing cash flow and suggesting strategic allocations."
              },
              {
                icon: ShieldCheck,
                title: "Institutional Security",
                desc: "Enterprise-grade custody and cryptographic proofs safeguarding every transaction."
              },
              {
                icon: ArrowRight,
                title: "Modern Rails",
                desc: "Instant settlement networks replacing legacy batch processing delays."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 border-white/5 hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative z-20 bg-background text-center">
        <div className="container mx-auto px-4">
          <div className="glass-card max-w-4xl mx-auto p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.15),transparent_60%)] pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 relative z-10">Join the Fin waitlist.</h2>
            <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto relative z-10">
              We are currently accepting early inquiries for institutional and corporate partners.
            </p>
            <Link href="/contact">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 h-14 px-8 text-base relative z-10">
                Request Access <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
