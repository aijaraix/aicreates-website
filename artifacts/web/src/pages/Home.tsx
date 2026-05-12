import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DeckCarousel from "@/components/DeckCarousel";
import spotlightBgUrl from "@assets/Screenshot_2026-05-12_130708_1778555238412.png";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Hammer,
  Brain,
  Infinity as InfinityIcon,
} from "lucide-react";
import { useSeo } from "@/lib/useSeo";

const AUDIENCES = [
  {
    tag: "For Business",
    title: "Operate like a much larger company.",
    desc: "A coordinated virtual company across every function - on day one.",
    href: "/business",
    cta: "Eve OS for operators",
  },
  {
    tag: "For Developers",
    title: "Build on the agentic primitives.",
    desc: "The same intelligence layer that powers Eve OS, exposed to builders.",
    href: "/developers",
    cta: "See the developer surface",
  },
  {
    tag: "For Investors",
    title: "Back the agentic intelligence layer.",
    desc: "Long-term defensibility through data, product, and proprietary models.",
    href: "/invest",
    cta: "Investor materials",
  },
];

type Slide = {
  id: string;
  label: string;
  title: string;
  subline: string;
  body1: string;
  body2: string;
  ctaText: string;
  ctaHref: string;
  pills: string[];
};

const SLIDES: Slide[] = [
  {
    id: "eve-os",
    label: "Flagship Product",
    title: "Eve OS.",
    subline: "The Agentic Business Operating System.",
    body1:
      "The first platform that doesn't just assist your business - it becomes your business. Plans, executes, reviews, and improves across every function from one native desktop experience.",
    body2:
      "Marketing, Sales, Finance, Legal, Operations, Development - all coordinated on one intelligence layer.",
    ctaText: "Explore Eve OS",
    ctaHref: "/eve-os",
    pills: ["Marketing", "Sales", "Finance", "Legal", "Operations", "Development"],
  },
  {
    id: "neobank",
    label: "Secondary Product Line",
    title: "NeoBank.",
    subline: "Capital that thinks.",
    body1:
      "A consumer and business neobank built directly on top of our intelligence layer. Capital that thinks, allocates, and protects itself.",
    body2:
      "Treasury, Payments, Credit, Yield, Compliance, Identity - one agentic surface for every flow of money.",
    ctaText: "Inside NeoBank",
    ctaHref: "/neobank",
    pills: ["Treasury", "Payments", "Credit", "Yield", "Compliance", "Identity"],
  },
];

function ProductSpotlight() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduce || paused) return;
    intervalRef.current = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 7000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reduce, paused, active]);

  const slide = SLIDES[active];

  return (
    <section className="py-14 md:py-24 relative min-h-[100dvh] sm:min-h-0 flex items-center">
      <div className="container mx-auto px-4 md:px-6 w-full">
       <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-[78%] md:w-[68%] pointer-events-none opacity-[0.9] [mask-image:linear-gradient(to_left,black_30%,transparent_92%)]"
            style={{
              backgroundImage: `url(${spotlightBgUrl})`,
              backgroundSize: "auto 110%",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.18),transparent_60%)] pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-7 sm:p-10 md:p-14 lg:p-20 min-h-[480px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${slide.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl"
              >
                <SectionLabel>{slide.label}</SectionLabel>
                <h2 className="mt-5 text-4xl sm:text-5xl md:text-7xl font-serif font-semibold text-white leading-[1.0] mb-4 tracking-tight">
                  {slide.title}
                </h2>
                <p className="text-lg sm:text-xl text-white/80 leading-tight mb-5 font-light">
                  {slide.subline}
                </p>
                <p className="text-sm sm:text-base text-white/55 leading-relaxed mb-3">{slide.body1}</p>
                <p className="text-sm sm:text-base text-white/45 leading-relaxed mb-8">{slide.body2}</p>
                <Link href={slide.ctaHref}>
                  <Button
                    size="lg"
                    className="rounded-full h-12 px-7 bg-white text-black hover:bg-white/90 group"
                    data-testid={`button-cta-${slide.id}`}
                  >
                    {slide.ctaText}{" "}
                    <ArrowUpRight className="ml-1.5 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </AnimatePresence>
            <div aria-hidden className="hidden lg:block" />
          </div>
        </motion.div>

        {/* Pagination dots */}
        <div className="flex justify-center items-center gap-3 mt-8">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${s.title.replace(".", "")}`}
              aria-current={active === i}
              data-testid={`dot-${s.id}`}
              className={`h-2 rounded-full transition-all ${
                active === i
                  ? "w-8 bg-[#00F5D4] shadow-[0_0_10px_rgba(0,245,212,0.6)]"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
       </div>
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

export default function Home() {
  useSeo({
    title: "The operating layer for the agentic era",
    description:
      "AIcreatesAI builds the agentic intelligence layer that companies, capital, and consumers will run on. One layer. Many products. Self-improving by design.",
    path: "/",
  });
  const [deckOpen, setDeckOpen] = useState(false);
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative min-h-[100dvh] flex items-center pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,245,212,0.06),transparent_60%)] blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <SectionLabel>Agentic Intelligence Layer</SectionLabel>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-[40px] sm:text-5xl md:text-7xl lg:text-[88px] font-serif font-semibold leading-[1.02] mb-6 text-gradient"
            >
              The operating layer for the agentic era.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              AICreatesAi builds the intelligence infrastructure that companies, capital, and consumers will run on. One layer. Many products. Self-improving by design.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link href="/eve-os">
                <Button size="lg" className="rounded-full h-12 px-7 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium">
                  Explore Eve OS <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-7 border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06]">
                  Engage with us
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-14 md:mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-xs uppercase tracking-[0.2em] text-white/35"
            >
              <span>Hybrid Compute Fabric</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-white/20" />
              <span>Closed-Loop Quality Engine</span>
              <span className="hidden md:inline w-1 h-1 rounded-full bg-white/20" />
              <span>Self-Healing Workflows</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRODUCT SPOTLIGHT (Eve OS / NeoBank carousel) */}
      <ProductSpotlight />

      {/* AUDIENCE SELECTOR - consumer / business / investor entry */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
         <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mb-12">
            <SectionLabel>Three doors in</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]"
            >
              Pick the path that matches you.
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AUDIENCES.map((a, i) => (
              <motion.div
                key={a.href}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
              >
                <Link href={a.href}>
                  <div className="glass-card p-7 cursor-pointer hover:border-[#00F5D4]/30 transition-colors h-full flex flex-col" data-testid={`audience-${a.href.slice(1)}`}>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#00F5D4]/80 mb-5">{a.tag}</div>
                    <h3 className="text-2xl font-serif font-semibold text-white mb-3 leading-tight">{a.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed mb-6 flex-1">{a.desc}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-white group">
                      <span>{a.cta}</span>
                      <ArrowRight className="w-4 h-4 text-[#00F5D4] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
         </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section className="py-16 md:py-24 relative min-h-[100dvh] sm:min-h-0 flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(0,245,212,0.05),transparent_70%)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative w-full">
          <div className="max-w-4xl mx-auto">
            <SectionLabel>About Us</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="mt-5 text-3xl sm:text-4xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05]"
            >
              We're Building the Operating System for the Agentic Era.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-8 space-y-5 text-base sm:text-lg md:text-xl text-white/65 leading-relaxed"
            >
              <p>
                AICreatesAi is a deep-tech company creating intelligent systems that will power the next generation of business and life.
              </p>
              <p>
                We use advanced AI to build platforms that act as complete operating systems - giving individuals and companies the ability to operate with greater intelligence, efficiency, and autonomy.
              </p>
              <p>
                Our mission is to create a self-improving intelligence layer that compounds in value over time, laying the foundation for how humans and businesses will work in the future.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 pt-6 border-t border-white/10"
            >
              <p className="text-base md:text-lg text-white/80 font-medium">
                One company. One vision.
              </p>
              <p className="text-base md:text-lg text-white/45 mt-1">
                Building the infrastructure for an agentic world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="py-16 md:py-24 relative min-h-[100dvh] sm:min-h-0 flex items-center">
        <div className="container mx-auto px-4 md:px-6 w-full">
          <div className="max-w-4xl mx-auto">
            <SectionLabel>Our Mission</SectionLabel>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="mt-5 text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-gradient leading-[1.05]"
            >
              Applying AI to build the services people actually live and work on.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-8 space-y-5 text-base sm:text-lg text-white/60 leading-relaxed"
            >
              <p>
                We exist to take AI out of the demo and turn it into real services. Real software, real infrastructure, real workflows that hold up under daily use. Our work is to design, build, and operate intelligent systems that make individuals, teams, and institutions measurably more capable.
              </p>
              <p>
                Every system we build feeds the same agentic intelligence layer. The more it runs, the sharper it gets. That compounding is the long arc of our mission - an intelligence foundation that quietly improves the surface of how the world operates.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                {
                  icon: Hammer,
                  t: "Build",
                  d: "We engineer real systems and ship working services, not prototypes.",
                },
                {
                  icon: Brain,
                  t: "Apply",
                  d: "We use AI where it earns its place - inside execution, not on top of it.",
                },
                {
                  icon: InfinityIcon,
                  t: "Compound",
                  d: "Every cycle feeds the layer. Quality and capability grow with usage.",
                },
              ].map((p) => (
                <div
                  key={p.t}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-[#00F5D4]/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <p.icon className="w-4 h-4 text-[#00F5D4]" strokeWidth={1.75} />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">{p.t}</span>
                  </div>
                  <p className="text-white/55 text-sm leading-relaxed">{p.d}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* VISUAL WHITEPAPER */}
      <section className="py-14 md:py-20 relative">
        <div className="container mx-auto px-4 md:px-6 w-full">
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-b from-[#0E0E0E] to-[#0A0A0A] p-10 sm:p-12 md:p-20 overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px divider-line" />
            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05]"
              >
                The agentic era is not waiting.
              </motion.h2>
              <p className="mt-5 text-base sm:text-lg text-white/65 leading-relaxed max-w-2xl mx-auto">
                The full thesis, architecture, and economic engine of the agentic intelligence layer - laid out in one document.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => setDeckOpen(true)}
                  className="rounded-full h-12 px-8 bg-[#00F5D4] text-black hover:bg-[#00F5D4]/90 font-medium"
                  data-testid="button-view-whitepaper"
                >
                  View Whitepaper <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <a
                  href={`${import.meta.env.BASE_URL}litepaper.pdf`}
                  download="AiCreatesAi Whitepaper.pdf"
                  rel="noopener noreferrer"
                  data-testid="button-download-litepaper"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-12 px-7 border-white/15 bg-transparent text-white hover:bg-white/5"
                  >
                    Download
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Dialog open={deckOpen} onOpenChange={setDeckOpen}>
        <DialogContent className="max-w-5xl w-[95vw] p-0 gap-0 border-0 bg-transparent shadow-none sm:rounded-none [&>button]:bg-black/60 [&>button]:text-white [&>button]:rounded-full [&>button]:p-1.5 [&>button]:opacity-100 [&>button]:right-2 [&>button]:top-2 [&>button]:z-10">
          <DialogHeader className="sr-only">
            <DialogTitle>AICA Visual Whitepaper</DialogTitle>
            <DialogDescription>Step through the AIcreatesAI pitch deck.</DialogDescription>
          </DialogHeader>
          <DeckCarousel
            showHeader={false}
            testIdPrefix="deck-home-modal"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
