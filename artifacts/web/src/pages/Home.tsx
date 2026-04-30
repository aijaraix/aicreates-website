import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
  Cpu,
  Zap,
  Layers,
  Globe,
  Building2,
  User,
  Briefcase,
} from "lucide-react";
import heroOrb from "@/assets/hero-orb.png";
import finMascot from "@/assets/fin-mascot.png";
import { Brand } from "@/components/Brand";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(110,86,207,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/10 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-white/80 tracking-wide uppercase">
              Intelligent Business Infrastructure
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-gradient mb-6 max-w-5xl leading-[1.1]"
          >
            Agentic AI systems for the next generation.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed"
          >
            <Brand /> is a technology company building intelligent business infrastructure and digital products powered by deeply integrated executive intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/contact">
              <Button size="lg" className="w-full sm:w-auto rounded-full bg-white text-black hover:bg-white/90 h-14 px-8 text-base">
                Engage with us
              </Button>
            </Link>
            <Link href="/technology">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-white/20 text-white hover:bg-white/10 h-14 px-8 text-base bg-transparent">
                Explore Technology <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="absolute bottom-0 w-full max-w-6xl mx-auto px-4 translate-y-1/3 md:translate-y-1/4 pointer-events-none"
        >
          <div className="relative aspect-[16/9] w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
            <img
              src={heroOrb}
              alt="AIcreatesAI Agentic Core"
              className="w-full h-full object-cover rounded-t-3xl opacity-80"
            />
          </div>
        </motion.div>
      </section>

      <div className="h-24 md:h-48 bg-background relative z-20"></div>

      {/* THE MOMENT */}
      <section className="py-24 md:py-32 relative z-20 bg-background overflow-hidden">
        <div className="absolute right-0 top-1/4 w-1/3 h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-6 inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> The Moment
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-[1.1]">
              The world is entering its <span className="text-gradient">agentic era</span>.
            </h2>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed mb-6">
              For seventy years, software did exactly what it was told. For the last three, it learned to talk. Now, for the first time in history, software can think, decide, and act on its own.
            </p>
            <p className="text-white/50 text-base md:text-lg leading-relaxed">
              We've spent three and a half years preparing for this moment. While the rest of the industry was chasing a bigger chatbot, we were quietly building the operating system that runs the agents that run everything else. Today, that work becomes products you can use.
            </p>
          </motion.div>
        </div>
      </section>

      {/* INTELLIGENCE LAYERS */}
      <section className="py-24 relative z-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Dual intelligence layers.</h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Our architecture is defined by two foundational primitives: an internal executive layer driving operations, and an external layer orchestrating customer experiences.
              </p>

              <div className="space-y-6">
                <div className="glass-card p-6 border-l-2 border-l-primary group hover:bg-white/[0.08] transition-colors">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    Adam <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Internal Layer</span>
                  </h3>
                  <p className="text-white/50 text-sm">
                    Designed to support strategy, operations, workflows, analytics, and business infrastructure across the organization.
                  </p>
                </div>

                <div className="glass-card p-6 border-l-2 border-l-blue-500 group hover:bg-white/[0.08] transition-colors">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    Eve <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">External Layer</span>
                  </h3>
                  <p className="text-white/50 text-sm">
                    Designed to guide users, explain products, support onboarding, and create intelligent, responsive customer experiences.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 relative">
              <div className="aspect-square w-full max-w-md mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-blue-600/20 rounded-full blur-[100px]" />
                <div className="glass-card absolute inset-8 border-white/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
                  <div className="text-center z-10">
                    <p className="font-serif text-2xl text-white">Adam & Eve</p>
                    <p className="text-white/40 text-sm mt-1">Core Architecture</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF / BY THE NUMBERS */}
      <section className="py-24 md:py-32 relative z-20 bg-background overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-2/3 h-[400px] bg-blue-600/10 rounded-full blur-[180px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-6 inline-block">
              The Work So Far
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Three and a half years. Built quietly.
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              No funding rounds. No press cycles. Just relentless engineering on the operating system the rest of the industry hasn't started building yet.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "3.5", label: "Years building", suffix: " yrs" },
              { value: "Dozens", label: "Specialist models trained" },
              { value: "1", label: "Operating system: Jarvis" },
              { value: "0", label: "Outside funding" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 text-center"
              >
                <div className="text-4xl md:text-5xl font-serif font-bold text-gradient mb-2">
                  {stat.value}
                  <span className="text-2xl">{stat.suffix ?? ""}</span>
                </div>
                <div className="text-white/50 text-sm uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                icon: Cpu,
                title: "Trained from the ground up",
                desc: "Curated multi-domain corpora across code, finance, contracts, and scientific writing. Not a wrapper on someone else's API.",
              },
              {
                icon: Layers,
                title: "Orchestrated, not single-shot",
                desc: "Specialist models for research, finance, content, and ops, conducted by Jarvis as a single cohesive system.",
              },
              {
                icon: Zap,
                title: "Long-horizon and self-correcting",
                desc: "Reinforcement on multi-step tasks. Jarvis critiques its own work, retries, and persists memory across sessions.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 hover:bg-white/[0.06] transition-colors"
              >
                <item.icon className="w-7 h-7 text-primary mb-4" />
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FLAGSHIP PRODUCT */}
      <section className="py-24 relative z-20 bg-background overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6">
          <div className="glass-card p-8 md:p-16 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-black/50 to-transparent z-10 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-20">
              <div className="flex flex-col justify-center">
                <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
                  First Flagship Product
                </span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Fin.</h2>
                <p className="text-white/60 text-lg mb-4 leading-relaxed">
                  The world's first agentic, tokenized neobank. A new-age digital piggy bank that doesn't just hold your money. It grows it, plays with it, and puts it to work, autonomously.
                </p>
                <p className="text-white/40 text-base mb-8 leading-relaxed">
                  AI-driven yield, prediction markets, skill games, business treasuries, scoped corporate cards, on-chain settlement. One wallet you fully own.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/products/fin">
                    <Button className="rounded-full bg-white text-black hover:bg-white/90 group">
                      Explore Fin <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/products/fin#waitlist">
                    <Button variant="outline" className="rounded-full bg-transparent border-white/20 text-white hover:bg-white/10">
                      Join the waitlist
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="relative w-72 h-72">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-3xl" />
                  <img
                    src={finMascot}
                    alt="Fin mascot"
                    className="relative w-full h-full object-contain drop-shadow-[0_0_40px_rgba(110,86,207,0.4)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE WORK WITH */}
      <section className="py-24 md:py-32 relative z-20 bg-background overflow-hidden">
        <div className="absolute right-1/4 bottom-0 w-1/3 h-[400px] bg-primary/10 rounded-full blur-[180px] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-[0.2em] mb-6 inline-block">
              How we engage
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Built for the few who move first.
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              From a single visionary to a sovereign-scale institution, we work with operators who understand that infrastructure compounds.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: User,
                tier: "Personal",
                title: "Individual operators",
                desc: "Founders, executives, and power users who want their own private agentic stack. We provision Adam and Eve as your personal infrastructure.",
              },
              {
                icon: Briefcase,
                tier: "Business",
                title: "Growing companies",
                desc: "Teams ready to compress entire functions into agents. We embed Adam into your operations and Eve into your customer surface.",
              },
              {
                icon: Building2,
                tier: "Enterprise",
                title: "Institutions and sovereigns",
                desc: "Mission-critical deployments with full sovereignty, dedicated infrastructure, and bespoke specialist models trained on your domain.",
              },
            ].map((tier, i) => (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 hover:bg-white/[0.08] transition-colors group"
              >
                <div className="flex items-center justify-between mb-6">
                  <tier.icon className="w-8 h-8 text-primary" />
                  <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/60 uppercase tracking-wider">
                    {tier.tier}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{tier.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">{tier.desc}</p>
                <Link href="/contact">
                  <span className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Start the conversation <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S NEXT */}
      <section className="py-24 relative z-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="max-w-5xl mx-auto"
          >
            <div className="glass-card p-10 md:p-16 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-primary/30 to-blue-600/20 blur-3xl pointer-events-none" />
              <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-center">
                <div>
                  <Globe className="w-7 h-7 text-primary mb-4" />
                  <h3 className="text-2xl md:text-4xl font-serif font-bold text-white mb-4">
                    Fin is the first. The roadmap is much bigger.
                  </h3>
                  <p className="text-white/60 text-base md:text-lg leading-relaxed">
                    Fin is one product on top of our operating system. The next ones are already in motion across finance, commerce, education, and creative tools. If your industry hasn't been rebuilt agentically yet, we should talk.
                  </p>
                </div>
                <Link href="/products">
                  <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 whitespace-nowrap">
                    See the roadmap <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative z-20 bg-background text-center">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              Build the future with us.
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
              The agentic era won't wait. The companies that move first will define the next decade.
            </p>
            <Link href="/contact">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 h-14 px-10 text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Contact <Brand />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
