import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Cpu,
  Network,
  Shield,
  Zap,
  Brain,
  Code2,
  MessageSquare,
  LineChart,
  Database,
  Workflow,
  Eye,
  Mic,
  Wrench,
  Scale,
  Image as ImageIcon,
  Search,
  Lock,
  Layers,
} from "lucide-react";
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

      {/* JARVIS — THE AI OPERATING SYSTEM */}
      <section className="py-24 md:py-28 bg-background relative z-20 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(110,86,207,0.12),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.10),transparent_55%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/10 mb-6">
              <Brain className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-white/80 tracking-widest uppercase">Three and a half years in the making</span>
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-[1.1]">
              Building <span className="text-gradient">Jarvis</span> — the first true AI operating system.
            </h2>
            <p className="text-lg md:text-xl text-white/60 leading-relaxed">
              Most of the industry chases a single bigger model. We took a different bet. For three and a half years we've been training, fine-tuning, and orchestrating dozens of specialist models into one cohesive system that runs other AI systems — the way an operating system runs other software.
            </p>
          </div>

          {/* TRAINING TIMELINE */}
          <div className="max-w-5xl mx-auto mb-24">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 text-center">The training journey</h3>
            <p className="text-white/55 text-center mb-12 max-w-2xl mx-auto">
              Five distinct phases of training, each unlocking a new tier of autonomy.
            </p>

            <div className="relative">
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-white/10 to-transparent md:-translate-x-px" />

              {[
                {
                  phase: "Phase 01",
                  period: "Late 2022 — Mid 2023",
                  title: "Foundation & Reasoning",
                  desc: "Trained core reasoning models on curated multi-domain corpora — code, finance, contracts, scientific writing. Established the base layer Jarvis uses to understand instructions and decompose them into sub-tasks.",
                },
                {
                  phase: "Phase 02",
                  period: "Mid 2023 — Early 2024",
                  title: "Tool Use & Function Calling",
                  desc: "Taught models to invoke tools, call APIs, query databases, and chain function calls. Introduced reliable structured-output training so every action is machine-verifiable, not just text.",
                },
                {
                  phase: "Phase 03",
                  period: "2024",
                  title: "Multi-Agent Orchestration",
                  desc: "Trained Jarvis to delegate. Specialist models for research, coding, finance, content, and ops were fine-tuned independently — Jarvis learned when to spawn them, what context to hand off, and how to merge their results.",
                },
                {
                  phase: "Phase 04",
                  period: "Late 2024 — Mid 2025",
                  title: "Self-Correction & Memory",
                  desc: "Reinforcement loops on long-horizon tasks. Jarvis learned to critique its own outputs, retry with new strategies, and persist memory across sessions — the leap from chat assistant to operator.",
                },
                {
                  phase: "Phase 05",
                  period: "Mid 2025 — Today",
                  title: "Production Hardening",
                  desc: "Adversarial red-teaming, latency optimization, deterministic guardrails, and live deployment as the engine behind our first commercial product, Fin. Jarvis now runs in production, supervised but autonomous.",
                },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className={`relative pl-16 md:pl-0 md:w-1/2 mb-12 last:mb-0 ${
                    i % 2 === 0 ? "md:pr-12 md:text-right md:ml-0" : "md:pl-12 md:ml-auto"
                  }`}
                >
                  <div
                    className={`absolute top-2 left-6 md:left-auto w-3 h-3 rounded-full bg-primary shadow-[0_0_20px_rgba(110,86,207,0.6)] -translate-x-1/2 ${
                      i % 2 === 0 ? "md:right-0 md:left-auto md:translate-x-1/2" : "md:left-0 md:-translate-x-1/2"
                    }`}
                  />
                  <div className="glass-card p-6 md:p-7 border-white/5">
                    <div className="text-xs font-mono text-primary/90 mb-1 tracking-widest">{p.phase}</div>
                    <div className="text-xs text-white/40 mb-3 uppercase tracking-wider">{p.period}</div>
                    <h4 className="text-xl font-serif font-bold text-white mb-2">{p.title}</h4>
                    <p className="text-white/60 leading-relaxed text-sm">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AUTONOMY LEVELS */}
          <div className="max-w-6xl mx-auto mb-24">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 text-center">Five levels of autonomy</h3>
            <p className="text-white/55 text-center mb-12 max-w-2xl mx-auto">
              Inspired by SAE's autonomous-driving framework, every Jarvis-managed agent is rated on what it's allowed to do without human approval.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { level: "L1", title: "Assisted", desc: "Suggests next actions; human executes." },
                { level: "L2", title: "Partial", desc: "Executes single steps under explicit approval." },
                { level: "L3", title: "Conditional", desc: "Runs full workflows; escalates edge cases." },
                { level: "L4", title: "High", desc: "Operates an entire domain end-to-end with audit trails." },
                { level: "L5", title: "Full", desc: "Self-directed across domains; supervised by Jarvis itself." },
              ].map((lv, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="glass-card p-6 border-white/5 hover:bg-white/[0.04] transition-colors text-center"
                >
                  <div className="text-3xl font-serif font-bold text-gradient mb-2">{lv.level}</div>
                  <div className="text-sm font-bold text-white mb-2 uppercase tracking-wider">{lv.title}</div>
                  <p className="text-white/50 text-xs leading-relaxed">{lv.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SKILL DOMAINS */}
          <div className="max-w-6xl mx-auto mb-24">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 text-center">Twelve skill domains, deeply trained</h3>
            <p className="text-white/55 text-center mb-12 max-w-2xl mx-auto">
              Each specialist model behind Jarvis was independently fine-tuned on its own dataset, evaluated against domain-specific benchmarks, and only graduated into production once it beat the previous best.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { icon: Code2, title: "Code Generation", desc: "Multi-language code synthesis & repair." },
                { icon: MessageSquare, title: "Conversation", desc: "Long-context, multi-turn dialogue." },
                { icon: LineChart, title: "Financial Reasoning", desc: "Markets, risk, and portfolio analysis." },
                { icon: Database, title: "Data & SQL", desc: "Schema-aware queries and analytics." },
                { icon: Workflow, title: "Workflow Automation", desc: "Multi-step task decomposition." },
                { icon: Eye, title: "Vision", desc: "Document, chart, and UI understanding." },
                { icon: Mic, title: "Speech", desc: "Real-time transcription and synthesis." },
                { icon: Wrench, title: "Tool Use", desc: "API calls, function chaining, retries." },
                { icon: Scale, title: "Compliance & Legal", desc: "Contracts, policies, and regulation." },
                { icon: ImageIcon, title: "Creative & Brand", desc: "Long-form writing and image direction." },
                { icon: Search, title: "Research & Retrieval", desc: "RAG over private corpora at scale." },
                { icon: Lock, title: "Security & Red-Team", desc: "Adversarial testing of every output." },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                  className="glass-card p-5 border-white/5 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <s.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1.5">{s.title}</h4>
                  <p className="text-white/50 text-xs leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* HOW JARVIS RUNS OTHER MODELS */}
          <div className="max-w-6xl mx-auto">
            <div className="glass-card p-8 md:p-12 border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_60%)] pointer-events-none" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div>
                  <div className="inline-flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-white/70 tracking-widest uppercase">The OS Layer</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-5 leading-tight">
                    How Jarvis runs other AI systems.
                  </h3>
                  <p className="text-white/60 leading-relaxed mb-4">
                    Jarvis is not one model — it's the conductor. When a task arrives, Jarvis interprets intent, picks the right specialist (one of ours, or a third-party model like GPT, Claude, or Gemini), allocates context, runs it, verifies the output, and decides whether to ship it, retry it, or hand it to another agent.
                  </p>
                  <p className="text-white/60 leading-relaxed">
                    The same way Linux scheduled processes for the last forty years, Jarvis schedules cognition for the next forty. Models become processes. Prompts become syscalls. Memory becomes shared state. Outputs become contract-verified return values.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { k: "Router", v: "Selects the right specialist for every sub-task" },
                    { k: "Scheduler", v: "Parallelizes agents and manages dependencies" },
                    { k: "Memory", v: "Shared long-term and per-task working memory" },
                    { k: "Verifier", v: "Validates every output against typed contracts" },
                    { k: "Guardrails", v: "Policy, safety, and cost limits enforced at runtime" },
                    { k: "Telemetry", v: "Full observability across every agent run" },
                  ].map((row, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="flex items-center justify-between gap-6 px-5 py-4 rounded-xl bg-white/[0.03] border border-white/5"
                    >
                      <span className="font-mono text-xs text-primary tracking-widest uppercase shrink-0">{row.k}</span>
                      <span className="text-white/70 text-sm text-right">{row.v}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* By-the-numbers */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {[
                { n: "3.5 yrs", l: "of continuous training" },
                { n: "12+", l: "specialist models" },
                { n: "5", l: "autonomy levels" },
                { n: "1", l: "operating system" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="glass-card p-6 border-white/5 text-center"
                >
                  <div className="text-3xl md:text-4xl font-serif font-bold text-gradient mb-1">{stat.n}</div>
                  <div className="text-xs text-white/50 uppercase tracking-widest">{stat.l}</div>
                </motion.div>
              ))}
            </div>
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
