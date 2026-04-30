import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Wallet,
  Coins,
  Gamepad2,
  MapPin,
  TrendingUp,
  Sparkles,
  Building2,
  Users,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import finMascot from "@/assets/fin-mascot.png";
import appWelcome from "@/assets/app-welcome.jpg";
import appHome from "@/assets/app-home.jpg";
import appInvest from "@/assets/app-invest.jpg";
import appMarkets from "@/assets/app-markets.jpg";
import appPredict from "@/assets/app-predict.jpg";
import appGames from "@/assets/app-games.jpg";
import appTournaments from "@/assets/app-tournaments.jpg";
import appArDrops from "@/assets/app-ardrops.jpg";
import appLiveMap from "@/assets/app-livemap.jpg";
import bizTreasury from "@/assets/biz-treasury.jpg";
import bizCards from "@/assets/biz-cards.jpg";

const WAITLIST_ENDPOINT = "https://formsubmit.co/ajax/sholom@aicreates.ai";

const consumerScreens = [
  { src: appWelcome, label: "Sign In" },
  { src: appHome, label: "NeoBank Home" },
  { src: appInvest, label: "Investments" },
  { src: appMarkets, label: "Markets" },
  { src: appPredict, label: "Prediction Markets" },
  { src: appGames, label: "Games Arena" },
  { src: appTournaments, label: "Tournaments" },
  { src: appArDrops, label: "AR GEO Drops" },
  { src: appLiveMap, label: "Live Drop Map" },
];

function WaitlistForm() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tier, setTier] = useState<"Personal" | "Business" | "Enterprise">("Personal");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || submitted) return;
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const payload: Record<string, string> = {
      _subject: `Fin waitlist · ${tier} · ${fd.get("name") || "Anonymous"}`,
      _captcha: "false",
      _template: "table",
      product: "Fin (agentic neobank)",
      interest: tier,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      country: String(fd.get("country") || ""),
      _honey: String(fd.get("_honey") || ""),
    };

    try {
      const res = await fetch(WAITLIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitted(true);
      toast({
        title: "You're on the list.",
        description: "Welcome aboard. We'll be in touch the moment Fin opens to your tier.",
        className: "glass-card border-white/20 text-white",
      });
      form.reset();
    } catch (err) {
      toast({
        title: "Couldn't reach the server.",
        description: "Please email us directly at sholom@aicreates.ai and we'll add you manually.",
        className: "glass-card border-red-400/30 text-white",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" strokeWidth={1.75} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-3">You're on the list.</h3>
        <p className="text-white/60 max-w-md mx-auto mb-6">
          Thanks for joining the Fin waitlist. We'll reach out from <span className="text-white/90">sholom@aicreates.ai</span> the moment your tier opens.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="text-sm text-white/50 hover:text-white underline underline-offset-4"
        >
          Add another person
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 relative z-10" noValidate>
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="space-y-2">
        <Label className="text-white/70 text-xs uppercase tracking-wider">I'm interested as</Label>
        <div className="grid grid-cols-3 gap-2">
          {(["Personal", "Business", "Enterprise"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`h-11 rounded-lg text-sm font-medium border transition-all ${
                tier === t
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="wl-name" className="text-white/70 text-xs uppercase tracking-wider">Full Name</Label>
          <Input
            id="wl-name" name="name" required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-primary"
            placeholder="Jane Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="wl-email" className="text-white/70 text-xs uppercase tracking-wider">Email Address</Label>
          <Input
            id="wl-email" name="email" type="email" required
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-primary"
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="wl-country" className="text-white/70 text-xs uppercase tracking-wider">Country / Region (optional)</Label>
        <Input
          id="wl-country" name="country"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 focus-visible:ring-primary"
          placeholder="United States"
        />
      </div>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full rounded-full bg-white text-black hover:bg-white/90 h-14 px-8 text-base disabled:opacity-70"
      >
        {submitting ? (
          <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Joining…</>
        ) : (
          <>Join the Fin Waitlist <ArrowRight className="ml-2 w-4 h-4" /></>
        )}
      </Button>
      <p className="text-xs text-white/40 text-center">
        Or email us directly at <a href="mailto:sholom@aicreates.ai" className="text-white/70 hover:text-primary">sholom@aicreates.ai</a>.
      </p>
    </form>
  );
}

export default function Fin() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.18),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(110,86,207,0.12),transparent_55%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/10 mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-medium text-white/80 tracking-wide uppercase">First Product · In Active Development</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-[1.05]">
                Meet <span className="text-gradient">Fin.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-4">
                The world's first agentic, tokenized neobank — a new-age digital piggy bank that does more than hold your money. Fin grows it, plays with it, and puts it to work, autonomously.
              </p>
              <p className="text-base md:text-lg text-white/55 leading-relaxed mb-10">
                After three and a half years building our own AI operating system, Fin is the first product we're bringing to the world.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#waitlist">
                  <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 h-14 px-8 text-base">
                    Join the Waitlist <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </a>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base border-white/15 bg-white/5 text-white hover:bg-white/10">
                    See How It Works
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.35),transparent_60%)] blur-2xl" />
              <div className="relative w-full max-w-md aspect-square rounded-[2.5rem] glass-card border-white/10 overflow-hidden flex items-center justify-center p-6">
                <img
                  src={finMascot}
                  alt="Fin — the AIcreatesAI mascot"
                  className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(59,130,246,0.4)]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHAT IS FIN */}
      <section className="py-24 bg-background relative z-20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              A neobank that <span className="text-gradient">thinks for itself.</span>
            </h2>
            <p className="text-lg text-white/60 leading-relaxed">
              Fin is what happens when a savings account, a brokerage, a prediction market, and an arcade are all run by the same intelligent agent. Top up your account and Fin's AI puts your balance to work across yield, crypto, prediction markets, skill-based games, and real-world AR rewards — all from a single wallet you fully own.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Wallet, title: "Top up & save", desc: "Round-ups and direct deposits flow into a single wallet, fully owned by you." },
              { icon: TrendingUp, title: "AI yield strategies", desc: "Pick a risk profile. Fin's agent handles allocation across stable yield and crypto." },
              { icon: Gamepad2, title: "Earn through play", desc: "Skill-based tournaments, savings sprints, and trading duels with real prize pools." },
              { icon: MapPin, title: "AR GEO Drops", desc: "Discover USDC rewards in the real world. Open camera, scan, collect." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass-card p-7 border-white/5 hover:bg-white/[0.03] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* APP SCREENSHOT GALLERY */}
      <section className="py-24 bg-background relative z-20 border-t border-white/5 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Inside the app.</h2>
            <p className="text-lg text-white/60">
              Banking that feels like a game. Investing that feels like discovery. Every surface is shaped by the AI underneath.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5 md:gap-7 max-w-6xl mx-auto">
            {consumerScreens.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="group"
              >
                <div className="relative aspect-[9/19.5] rounded-[2rem] overflow-hidden glass-card border-white/10 p-1.5 shadow-[0_20px_60px_-15px_rgba(59,130,246,0.25)]">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 z-10 pointer-events-none rounded-[1.7rem]" />
                  <img
                    src={s.src}
                    alt={`Fin app — ${s.label}`}
                    className="w-full h-full object-cover rounded-[1.7rem] group-hover:scale-[1.02] transition-transform duration-700"
                  />
                </div>
                <p className="text-center text-white/55 text-xs md:text-sm mt-3 tracking-wide uppercase">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE TIERS */}
      <section className="py-24 bg-background relative z-20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Built for <span className="text-gradient">everyone.</span>
            </h2>
            <p className="text-lg text-white/60">
              From the first dollar in a digital piggy bank to multi-million-dollar corporate treasuries — Fin scales with you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Users,
                tag: "Personal",
                title: "The new-age piggy bank",
                points: [
                  "Single wallet, fully owned by you",
                  "AI-driven yield (5–15% APY)",
                  "Earn through games, drops & markets",
                  "Round-ups and auto-invest",
                ],
              },
              {
                icon: Briefcase,
                tag: "Business",
                title: "Banking for builders",
                points: [
                  "Virtual & physical scoped cards",
                  "Per-employee spend limits",
                  "Crypto-native invoicing & payouts",
                  "Real-time transaction reconciliation",
                ],
              },
              {
                icon: Building2,
                tag: "Enterprise",
                title: "Agentic treasury",
                points: [
                  "Multi-currency treasury management",
                  "Idle-fund yield (4%+ annualized)",
                  "Multi-wallet linked accounts",
                  "Compliance, reporting & SSO",
                ],
              },
            ].map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card p-8 border-white/5 hover:bg-white/[0.04] transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <tier.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs uppercase tracking-widest text-white/40">{tier.tag}</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-3">{tier.title}</h3>
                <ul className="space-y-2.5 mt-2">
                  {tier.points.map((p, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-white/65 text-sm leading-relaxed">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-primary shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Business preview screenshots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto mt-14">
            {[{ src: bizTreasury, label: "Agentic Treasury" }, { src: bizCards, label: "Card Management" }].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="glass-card p-2 rounded-3xl overflow-hidden border-white/10"
              >
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={s.src} alt={`Fin Business — ${s.label}`} className="w-full h-auto object-cover" />
                </div>
                <p className="text-center text-white/55 text-sm mt-3 mb-1 tracking-wide uppercase">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / PARTNERSHIPS */}
      <section id="how-it-works" className="py-24 bg-background relative z-20 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(110,86,207,0.10),transparent_55%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">
              Powered by <span className="text-gradient">best-in-class rails.</span>
            </h2>
            <p className="text-lg text-white/60">
              Fin runs on a hand-picked stack of partners and protocols, orchestrated by our agentic OS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 md:p-10 border-white/5"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-xs uppercase tracking-widest text-white/40">Stablecoin Backend</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">Crossmint</h3>
              <p className="text-white/60 leading-relaxed text-base">
                We're building Fin's stablecoin infrastructure on Crossmint — issuance, custody, scoped cards, and on-chain settlement. Crossmint powers the wallets, the cards, and the rails behind every transaction.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-8 md:p-10 border-white/5"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
                <span className="text-xs uppercase tracking-widest text-white/40">Crypto On-Ramp</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-3">Transak</h3>
              <p className="text-white/60 leading-relaxed text-base">
                A Transak widget is embedded directly inside Fin so users can purchase crypto with a card, bank transfer, or local payment method — without ever leaving the app.
              </p>
            </motion.div>
          </div>

          {/* The flow */}
          <div className="max-w-5xl mx-auto mt-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "01", title: "Top up", desc: "Card, bank, or crypto via the Transak widget." },
                { step: "02", title: "Allocate", desc: "Fin's agent picks yield, crypto, or markets." },
                { step: "03", title: "Earn & play", desc: "Games, AR Drops, and prediction markets." },
                { step: "04", title: "Spend & settle", desc: "Crossmint-issued scoped cards." },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="glass-card p-6 border-white/5"
                >
                  <div className="text-xs font-mono text-primary mb-3">{s.step}</div>
                  <h4 className="text-white font-bold mb-2">{s.title}</h4>
                  <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WAYS TO EARN */}
      <section className="py-24 bg-background relative z-20 border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Five ways your money grows.</h2>
            <p className="text-lg text-white/60">
              Fin's AI doesn't just sit on your balance. It puts it to work — across every surface in the app.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 max-w-6xl mx-auto">
            {[
              { icon: TrendingUp, title: "Yield Strategies", desc: "Stable yield farming, 5–15% APY, low to high risk profiles." },
              { icon: Sparkles, title: "Crypto Round-ups", desc: "Spare change auto-invested into curated crypto baskets." },
              { icon: Gamepad2, title: "Skill Games", desc: "Crypto Quizzes, Speed Trading Duels, Savings Sprints." },
              { icon: MapPin, title: "AR GEO Drops", desc: "Real-world USDC rewards discoverable through the camera." },
              { icon: ShieldCheck, title: "Prediction Markets", desc: "Copy-trade top Polymarket positions in one tap." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass-card p-6 border-white/5 hover:bg-white/[0.04] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h4 className="text-white font-bold mb-2">{f.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section id="waitlist" className="py-32 relative z-20 bg-background border-t border-white/5 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="glass-card max-w-3xl mx-auto p-8 md:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.18),transparent_60%)] pointer-events-none" />
            <div className="relative z-10 text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-white/10 mb-5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-medium text-white/80 tracking-wide uppercase">Early Access · Limited Spots</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Be among the first to meet Fin.</h2>
              <p className="text-lg text-white/60 max-w-xl mx-auto">
                Personal early access, business pilots, and enterprise treasury partnerships are open now.
              </p>
            </div>
            <div className="relative z-10 max-w-xl mx-auto">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
