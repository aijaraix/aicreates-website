import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import heroOrb from "@/assets/hero-orb.png";
import { Brand } from "@/components/Brand";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Background glow & noise */}
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
            <span className="text-xs font-medium text-white/80 tracking-wide uppercase">Intelligent Business Infrastructure</span>
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

        {/* Hero Visual */}
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

      {/* FLAGSHIP PRODUCT */}
      <section className="py-24 relative z-20 bg-background overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-[600px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6">
          <div className="glass-card p-8 md:p-16 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-black/50 to-transparent z-10 hidden md:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-20">
              <div className="flex flex-col justify-center">
                <span className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">First Flagship Product</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Fin.</h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  An agentic tokenized neobank concept designed to combine AI-guided finance, digital wallets, crypto acceptance, business accounts, and modern payment infrastructure.
                </p>
                <div>
                  <Link href="/products/fin">
                    <Button variant="outline" className="rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 group">
                      Explore Fin <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-end">
                 {/* Placeholder for Fin abstract visual if needed */}
                 <div className="w-64 h-64 rounded-full border border-white/10 relative flex items-center justify-center">
                   <div className="absolute inset-0 rounded-full border border-primary/30 animate-[spin_10s_linear_infinite]" />
                   <div className="absolute inset-4 rounded-full border border-blue-500/20 animate-[spin_15s_linear_infinite_reverse]" />
                   <div className="w-16 h-16 rounded-full bg-white shadow-[0_0_40px_rgba(255,255,255,0.8)]" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative z-20 bg-background text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">Build the future with us.</h2>
          <Link href="/contact">
            <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 h-14 px-10 text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Contact <Brand />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
