import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import finVisual from "@/assets/fin.png";
import adamVisual from "@/assets/adam.png";
import eveVisual from "@/assets/eve.png";

export default function Products() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(110,86,207,0.1),transparent_70%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-serif font-bold text-white mb-6"
          >
            Digital products, <br/><span className="text-gradient">reimagined.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-xl text-white/60 leading-relaxed mx-auto max-w-2xl"
          >
            We deploy our foundational intelligence layers into highly focused, paradigm-shifting applications.
          </motion.p>
        </div>
      </section>

      {/* FLAGSHIP: FIN */}
      <section className="py-24 bg-background relative z-20">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-2 border-white/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">
              <div className="p-10 md:p-16 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 w-max">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-medium text-white/80 tracking-wide uppercase">Flagship Product</span>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Fin.</h2>
                <p className="text-xl text-white/60 leading-relaxed mb-10 max-w-md">
                  An agentic tokenized neobank concept being designed to combine AI-guided finance, digital wallets, crypto acceptance, business accounts, and modern payment infrastructure.
                </p>
                
                <Link href="/products/fin">
                  <Button size="lg" className="w-max rounded-full bg-white text-black hover:bg-white/90 h-12 px-8">
                    Explore Fin <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="relative aspect-square lg:aspect-auto h-full min-h-[400px] overflow-hidden rounded-xl m-2">
                <img 
                  src={finVisual} 
                  alt="Fin Product" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-background/80 lg:from-transparent lg:to-background/80 to-transparent" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PLATFORM LAYERS */}
      <section className="py-24 bg-background relative z-20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">The Engine Behind It All</h2>
            <p className="text-white/60">
              Our products are built upon our proprietary intelligence primitives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/technology">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 border-white/10 hover:border-white/30 transition-all group cursor-pointer h-full flex flex-col"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden mb-6 border border-white/10">
                  <img src={adamVisual} alt="Adam" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-3 flex items-center justify-between">
                  Adam
                  <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                </h3>
                <p className="text-white/50 leading-relaxed flex-1">
                  The internal executive intelligence layer powering complex backend operations, data synthesis, and workflow infrastructure.
                </p>
              </motion.div>
            </Link>

            <Link href="/technology">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card p-8 border-white/10 hover:border-white/30 transition-all group cursor-pointer h-full flex flex-col"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden mb-6 border border-white/10">
                  <img src={eveVisual} alt="Eve" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-3 flex items-center justify-between">
                  Eve
                  <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" />
                </h3>
                <p className="text-white/50 leading-relaxed flex-1">
                  The customer-facing intelligence layer responsible for intuitive interactions, product guidance, and seamless onboarding.
                </p>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative z-20 bg-background text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8">Discuss custom implementation</h2>
          <Link href="/contact">
            <Button variant="outline" size="lg" className="rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 h-14 px-10 text-lg">
              Contact Sales
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
