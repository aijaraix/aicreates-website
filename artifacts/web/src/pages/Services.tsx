import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Box, Cpu, Workflow, BarChart3, WalletCards, Layers } from "lucide-react";
import servicesVisual from "@/assets/services.png";

export default function Services() {
  const services = [
    {
      title: "AI Product Development",
      icon: Box,
      description: "End-to-end conceptualization, design, and engineering of next-generation applications centered entirely around native artificial intelligence capabilities."
    },
    {
      title: "AI Agents & Automation",
      icon: Workflow,
      description: "Deployment of autonomous, reasoning agents that execute multi-step workflows, bridging legacy APIs with modern semantic understanding."
    },
    {
      title: "Business Operating Systems",
      icon: Layers,
      description: "Custom internal intelligence layers (similar to our Adam architecture) that synthesize data and drive organizational operations at scale."
    },
    {
      title: "Media & Marketing AI",
      icon: BarChart3,
      description: "Intelligent systems for dynamic content generation, audience analysis, and hyper-personalized engagement at an unprecedented volume."
    },
    {
      title: "Financial Technology & Tokenized Systems",
      icon: WalletCards,
      description: "Infrastructure bridging traditional finance with tokenized economies, featuring AI-guided risk assessment and transaction orchestration."
    },
    {
      title: "Custom AI Models & Specialized Assistants",
      icon: Cpu,
      description: "Fine-tuned, proprietary models and customer-facing interactions (similar to our Eve architecture) trained on your specific institutional knowledge."
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-5xl md:text-7xl font-serif font-bold text-white mb-6"
            >
              Applied <span className="text-gradient">intelligence.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="text-xl text-white/60 leading-relaxed mb-12"
            >
              We partner with forward-thinking organizations to build bespoke agentic systems and highly specialized business infrastructure.
            </motion.p>
          </div>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-6xl mx-auto px-4"
        >
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden glass-card p-2">
            <img 
              src={servicesVisual} 
              alt="AI Services" 
              className="w-full h-full object-cover rounded-xl opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 bg-background relative z-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 border-white/5 hover:border-white/20 transition-all duration-300 group flex flex-col h-full"
              >
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                  <service.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm flex-1">{service.description}</p>
                <div className="mt-8 flex items-center text-sm font-medium text-white/40 group-hover:text-primary transition-colors">
                  Discuss implementation <ArrowRight className="ml-2 w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative z-20 bg-background text-center border-t border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-8">Ready to transform your infrastructure?</h2>
          <Link href="/contact">
            <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 h-14 px-10 text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Engage our team
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
