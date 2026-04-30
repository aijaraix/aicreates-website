import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Network, Shield, Zap } from "lucide-react";
import technologyVisual from "@/assets/technology.png";
import adamVisual from "@/assets/adam.png";
import eveVisual from "@/assets/eve.png";

export default function Technology() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border-white/10 mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-medium text-white/80 tracking-wide uppercase">Core Architecture</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
                Architected for <br/><span className="text-gradient-primary">autonomy.</span>
              </h1>
              <p className="text-xl text-white/60 leading-relaxed max-w-xl">
                Our agentic AI architecture transforms complex logic into seamless execution. We build systems that perceive, reason, and act with unprecedented precision.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <img 
                src={technologyVisual} 
                alt="Agentic AI Flows" 
                className="w-full h-auto rounded-2xl relative z-10 opacity-90 object-cover aspect-[16/9]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* INTELLIGENCE LAYERS */}
      <section className="py-24 bg-background relative z-20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">The Intelligence Layers</h2>
            <p className="text-lg text-white/60">
              Our systems are powered by two distinct architectural primitives, operating in tandem to bridge complex backend logic with intuitive human interfaces.
            </p>
          </div>

          <div className="space-y-24">
            {/* ADAM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="order-2 md:order-1"
              >
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Adam</h3>
                <p className="text-primary text-sm uppercase tracking-widest font-semibold mb-6">Internal Executive Intelligence</p>
                <p className="text-white/60 text-lg leading-relaxed mb-6">
                  Adam is the deeply integrated cognitive engine powering organizational operations. Designed to support strategy, workflows, analytics, and business infrastructure, Adam operates behind the scenes to synthesize data and execute complex, multi-step backend processes.
                </p>
                <ul className="space-y-4">
                  {[
                    "Data synthesis and analytical reasoning",
                    "Automated infrastructure management",
                    "Strategic operational workflows",
                    "Predictive system scaling"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="order-1 md:order-2 glass-card p-4 aspect-square max-w-md mx-auto"
              >
                <img src={adamVisual} alt="Adam Intelligence Layer" className="w-full h-full object-cover rounded-xl opacity-80" />
              </motion.div>
            </div>

            {/* EVE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="glass-card p-4 aspect-square max-w-md mx-auto"
              >
                <img src={eveVisual} alt="Eve Intelligence Layer" className="w-full h-full object-cover rounded-xl opacity-80" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Eve</h3>
                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold mb-6">Customer-Facing Intelligence</p>
                <p className="text-white/60 text-lg leading-relaxed mb-6">
                  Eve is the empathetic, highly responsive interaction layer. Designed to guide users, explain complex products, support seamless onboarding, and create intelligent customer experiences that feel entirely human but scale infinitely.
                </p>
                <ul className="space-y-4">
                  {[
                    "Context-aware user guidance",
                    "Dynamic product explanation",
                    "Frictionless onboarding flows",
                    "Adaptive customer support"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section className="py-24 relative z-20 bg-background overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Cpu, title: "Custom Models", desc: "Specialized, fine-tuned architectures for proprietary data." },
              { icon: Shield, title: "Deterministic Ops", desc: "Rigorous boundaries ensuring consistent, safe execution." },
              { icon: Zap, title: "Real-time Inference", desc: "Low-latency processing for immediate application response." },
              { icon: Network, title: "Tokenized Systems", desc: "Modern payment infrastructure meeting AI intelligence." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-6 border-white/5 hover:border-white/20 transition-colors"
              >
                <item.icon className="w-8 h-8 text-white/80 mb-4" strokeWidth={1.5} />
                <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative z-20 bg-background text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">Ready to explore the architecture?</h2>
          <Link href="/contact">
            <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 h-14 px-10 text-lg">
              Speak with our engineers
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
