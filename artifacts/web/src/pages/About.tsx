import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import aboutArchitecture from "@/assets/about-architecture.png";
import { Brand } from "@/components/Brand";

export default function About() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(110,86,207,0.15),transparent_50%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
              Intelligence as <br/><span className="text-gradient">infrastructure.</span>
            </h1>
            <p className="text-xl text-white/60 leading-relaxed max-w-2xl mb-6">
              <Brand /> is a technology company building agentic AI systems, intelligent business infrastructure, and next-generation digital products. We believe the future of software is autonomous, self-healing, and deeply integrated with human intent.
            </p>
            <p className="text-lg text-white/50 leading-relaxed max-w-2xl">
              For the past three and a half years we've been quietly building our own AI operating system from the ground up. Today we're launching our first product on top of it - <Link href="/products/fin" className="text-white hover:text-primary underline-offset-4 hover:underline transition-colors">Fin</Link>, a tokenized neobank and new-age digital piggy bank.
            </p>
          </motion.div>
        </div>
      </section>

      {/* THESIS SECTION */}
      <section className="py-24 bg-background relative z-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden glass-card border-white/10 relative p-2">
                <img 
                  src={aboutArchitecture} 
                  alt="AI Architecture" 
                  className="w-full h-full object-cover rounded-xl opacity-80"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Our Thesis</h2>
              <div className="space-y-6 text-white/60 text-lg leading-relaxed">
                <p>
                  The era of static software is ending. Applications are no longer just tools; they are evolving into active participants in business workflows.
                </p>
                <p>
                  At <Brand />, we construct systems that understand context, execute multi-step reasoning, and operate with supervised autonomy. We are moving from software that requires operation to software that operates itself.
                </p>
                <p>
                  By creating foundational intelligence layers-both internal and external-we enable organizations to scale logic, precision, and execution far beyond human constraints.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATORS */}
      <section className="py-24 relative z-20 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Why we exist.</h2>
            <p className="text-lg text-white/60">
              We approach AI not as a feature, but as the core architectural primitive of modern business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Agentic First",
                desc: "We don't bolt AI onto legacy systems. We design architectures where autonomous agents are the primary drivers of logic and state."
              },
              {
                title: "Precise Execution",
                desc: "Intelligence without reliability is a liability. Our systems are engineered for deterministic outcomes in non-deterministic environments."
              },
              {
                title: "Infinite Scale",
                desc: "By removing human bottlenecks from cognitive workflows, we build infrastructure that scales logic infinitely and instantly."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 group hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative z-20 bg-background text-center">
        <div className="container mx-auto px-4">
          <div className="glass-card max-w-4xl mx-auto p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 relative z-10">Partner with us.</h2>
            <p className="text-lg text-white/60 mb-8 max-w-xl mx-auto relative z-10">
              Whether you are looking to integrate agentic AI into your operations or build next-generation products, we should talk.
            </p>
            <Link href="/contact">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 h-14 px-8 text-base relative z-10">
                Contact <Brand /> <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
