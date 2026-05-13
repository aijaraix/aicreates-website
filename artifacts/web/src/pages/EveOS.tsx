import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MonitorCog,
  LayoutDashboard,
  MousePointerClick,
  CheckCircle2,
  Sparkles,
  Megaphone,
  TrendingUp,
  Wallet,
  Scale,
  Workflow,
  Code2,
  Cpu,
  Repeat,
  Brain,
  Eye,
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

export default function EveOS() {
  useSeo({
    title: "Eve OS - The Agentic Business Operating System",
    description:
      "Eve OS is the world's first Agentic Business Operating System - a desktop-native platform that plans, executes, reviews, and improves every business function from one unified surface.",
    path: "/eve-os",
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
              <SectionLabel>Flagship Product</SectionLabel>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="mt-6 text-6xl md:text-8xl lg:text-[112px] font-serif font-semibold leading-[1.0] text-gradient tracking-tight"
            >
              Eve OS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="mt-6 text-xl md:text-3xl text-white/80 max-w-3xl leading-tight font-light"
            >
              The Agentic Business Operating System.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 text-lg md:text-xl text-white/55 max-w-3xl leading-relaxed"
            >
              The first platform that doesn't just assist your business - it becomes your business. A complete operating system that plans, executes, reviews, and improves across every function - all from one native desktop experience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mt-10 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/contact?interest=Eve%20OS%20Waitlist">
                <Button size="lg" className="rounded-full h-12 px-7 teal-btn">
                  Join the Waitlist <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/litepaper">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 glass-btn">
                  Read the Litepaper
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT IS EVE OS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>What is Eve OS?</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                A platform that runs your entire company.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                Eve OS is the world's first Agentic Business Operating System - a full-featured platform designed to run your entire company. Instead of juggling multiple tools and teams, Eve OS acts as a single, coordinated system that understands your goals and executes them end-to-end.
              </p>
              <p>
                Built as a native desktop application (with web and mobile access), it combines a clean, intuitive interface with powerful AI that handles complex work in the background. The result is a reliable, intelligent operating layer for the modern business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Designed for simplicity and power.
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed">
              No complex prompting required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                icon: MonitorCog,
                k: "01",
                title: "Open the Desktop App",
                desc: "Launch Eve OS on your computer. The clean, modern interface gives you a full overview of your business at a glance.",
              },
              {
                icon: LayoutDashboard,
                k: "02",
                title: "Use the Dashboard & Department Panels",
                desc: "Navigate through dedicated sections for Marketing, Sales, Finance, Legal, Operations, and Development. Each panel contains the tools and workflows you need.",
              },
              {
                icon: MousePointerClick,
                k: "03",
                title: "Start Workflows with Simple Clicks",
                desc: "Use intuitive buttons and guided flows to launch campaigns, generate reports, manage deals, create content, or handle day-to-day operations.",
              },
              {
                icon: CheckCircle2,
                k: "04",
                title: "Review & Approve",
                desc: "Get clear summaries and recommendations. Approve outputs with a single click when you're ready.",
              },
              {
                icon: Sparkles,
                k: "05",
                title: "Let Intelligence Improve Over Time",
                desc: "Eve OS learns from your business patterns and improves its recommendations and automation the more you use it.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.k}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass-card p-6 hover:border-[#00F5D4]/30 transition-colors flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-mono text-white/30 tracking-widest">{s.k}</span>
                </div>
                <h3 className="text-base font-serif font-semibold text-white mb-3 leading-tight">{s.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* KEY CAPABILITIES */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Key Capabilities</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Every business function. One unified system.
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed">
              All departments work together intelligently, so your business runs as one coordinated system rather than disconnected tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Megaphone,
                t: "Marketing",
                d: "Campaign planning, content creation, performance tracking, and optimization.",
              },
              {
                icon: TrendingUp,
                t: "Sales",
                d: "Lead management, outreach sequences, pipeline tracking, and deal support.",
              },
              {
                icon: Wallet,
                t: "Finance",
                d: "Reporting, budgeting, forecasting, and financial analysis.",
              },
              {
                icon: Scale,
                t: "Legal & Compliance",
                d: "Document generation, contract support, and risk monitoring.",
              },
              {
                icon: Workflow,
                t: "Operations",
                d: "Workflow automation, task management, and process optimization.",
              },
              {
                icon: Code2,
                t: "Development",
                d: "Software creation and code support through our integrated environment.",
              },
            ].map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass-card p-7 hover:border-[#00F5D4]/30 transition-colors"
              >
                <c.icon className="w-6 h-6 text-[#00F5D4] mb-5" strokeWidth={1.5} />
                <h3 className="text-lg font-serif font-semibold text-white mb-2.5">{c.t}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY EVE OS STANDS OUT */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Why Eve OS Stands Out</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Built as a true operating system.
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed">
              Most AI tools focus on single tasks or require constant prompting. Eve OS is different.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Cpu,
                tag: "Differentiator 01",
                title: "Desktop-Native Foundation",
                desc: "Unlike web-based AI tools, Eve OS is built as a true desktop operating system - giving you speed, privacy, deep system integration, and the ability to contribute to a distributed intelligence network.",
              },
              {
                icon: Repeat,
                tag: "Differentiator 02",
                title: "Closed-Loop Quality Engine",
                desc: "We don't just generate. We review, refine, and improve every output before it reaches you. This closed-loop system dramatically increases reliability and quality across all business functions.",
              },
              {
                icon: Brain,
                tag: "Differentiator 03",
                title: "Intelligence That Compounds",
                desc: "Every interaction strengthens the system. Our long-term vision is to develop proprietary models specifically trained on real business execution - creating an advantage that grows with every user.",
              },
            ].map((d, i) => (
              <motion.div
                key={d.tag}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card p-8 hover:border-[#00F5D4]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="w-10 h-10 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center">
                    <d.icon className="w-5 h-5 text-[#00F5D4]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-mono text-white/30 tracking-widest uppercase">{d.tag}</span>
                </div>
                <h3 className="text-xl font-serif font-semibold text-white mb-3">{d.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{d.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* THE VISION */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-5">
              <SectionLabel>The Vision</SectionLabel>
              <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
                Designed to evolve with your business.
              </h2>
            </div>
            <div className="md:col-span-7 space-y-6 text-white/65 text-lg leading-relaxed">
              <p>
                Eve OS is designed to evolve with your business. In the beginning, it delivers reliable execution across key business functions with minimal effort.
              </p>
              <p>
                Over time, it becomes increasingly autonomous - handling more complex workflows while always staying aligned with your goals and under your control.
              </p>
              <p>
                Our long-term vision is to build proprietary AI intelligence specifically optimized for business operations, creating a platform that truly scales with your company.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO EVE OS IS FOR */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mb-14">
            <SectionLabel>Who Eve OS Is For</SectionLabel>
            <h2 className="mt-6 text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]">
              Built for founders, solopreneurs, and growing teams.
            </h2>
            <p className="mt-6 text-lg text-white/55 leading-relaxed">
              Whether you're running a solo operation or managing a growing team, Eve OS gives you the power of a full company - without the overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Run your business with greater efficiency and consistency.",
              "Reduce time spent on repetitive or complex tasks.",
              "Access powerful capabilities without needing a large team or technical expertise.",
              "Build a business that can scale intelligently.",
            ].map((b) => (
              <div
                key={b}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex items-start gap-4"
              >
                <div className="mt-1 w-8 h-8 rounded-lg bg-[#00F5D4]/10 border border-[#00F5D4]/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#00F5D4]" strokeWidth={1.8} />
                </div>
                <p className="text-white/75 text-base leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-12 md:p-20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px divider-line" />
            <div className="relative">
              <Eye className="w-7 h-7 text-[#00F5D4] mx-auto mb-6" strokeWidth={1.5} />
              <h2 className="text-4xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05] mb-6">
                Ready to run your business with an intelligent operating system?
              </h2>
              <p className="text-lg text-white/55 max-w-xl mx-auto mb-10">
                Join the Waitlist to be among the first to experience Eve OS.
              </p>
              <Link href="/contact?interest=Eve%20OS%20Waitlist">
                <Button size="lg" className="rounded-full h-12 px-8 teal-btn">
                  Join the Waitlist <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
