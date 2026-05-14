import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Sparkles, Shield, Users, ChevronRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { SectionLabel, BrandCard, StatTile } from "@/components/brand";
import GenesisDisclaimer from "@/components/GenesisDisclaimer";
import { useInvestSeo } from "@/lib/useInvestSeo";

const TIERS = [
  {
    title: "Family & Friends",
    blurb:
      "Closest circle. Personal introductions to friends, family, and trusted contacts who become early customers, partners, or supporters.",
  },
  {
    title: "Trusted Introducer",
    blurb:
      "High-signal operators making warm introductions to enterprise customers, channel partners, or strategic accounts.",
  },
  {
    title: "Genesis Partner",
    blurb:
      "Long-term advocates who help us build the early ecosystem - design partners, advisors, and the first cohort of strategic allies.",
  },
];

const HOW = [
  {
    n: "01",
    t: "Receive your invite",
    b: "We approve referrers manually. There is no public sign-up. If you weren't directly invited, you can request access below.",
  },
  {
    n: "02",
    t: "Get your private link",
    b: "Once approved, you receive a unique referral code (aicreates.ai/r/your-code) and a small dashboard to track introductions and points.",
  },
  {
    n: "03",
    t: "Make warm introductions",
    b: "Share your link, or submit introductions manually. Every action is reviewed by our team for quality and fit before points are awarded.",
  },
  {
    n: "04",
    t: "Earn $AICA token rewards",
    b: "Points convert to $AICA tokens at launch (subject to vesting). You can also opt into platform credit or hybrid compensation.",
  },
];

export default function Genesis() {
  useInvestSeo({
    title: "Genesis Referral Program - Invite-Only",
    description:
      "Genesis is the AICreatesAi referral program for our family-and-friends circle. Invite-only.",
    path: "/genesis",
  });
  return (
    <div className="relative isolate min-h-screen text-white overflow-hidden">
      <SiteHeader homeHref="/" homeTestId="link-genesis-home" sticky />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-24">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-5">
            <SectionLabel>Genesis Referral Program</SectionLabel>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight">
            Built by our <span className="text-gradient-teal">family and friends</span>.
          </h1>
          <p className="mt-5 text-white/70 text-lg leading-relaxed">
            Genesis is the original referral cohort for AICreatesAi. It is an invite-only
            program that rewards the people who help us reach our first customers,
            partners, and supporters - with $AICA tokens, platform credit, or a hybrid mix.
          </p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs text-[#00F5D4]/90 font-mono">
            <Lock className="w-3.5 h-3.5" />
            Phase 1 - private mode. Public referral access is not yet open.
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/genesis/dashboard"
              className="teal-btn inline-flex items-center gap-2 rounded-full h-11 px-6 text-sm font-medium"
              data-testid="link-genesis-i-was-referred"
            >
              I Was Referred <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/genesis/request-access"
              className="glass-btn inline-flex items-center gap-2 rounded-full h-11 px-6 text-sm font-medium"
              data-testid="link-genesis-request"
            >
              Request Genesis Partner Access
            </Link>
            <Link
              href="/sign-in"
              className="glass-btn inline-flex items-center gap-2 rounded-full h-11 px-6 text-sm font-medium"
              data-testid="link-genesis-signin"
            >
              Sign In
            </Link>
          </div>
        </motion.section>

        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatTile label="Token Pool" value="250M $AICA" hint="Reserved for Genesis cohort" />
          <StatTile label="Vesting" value="6mo cliff / 24mo" hint="Linear after cliff at TGE" />
          <StatTile label="Cohort Size" value="Invite-only" hint="Reviewed manually" accent />
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#00F5D4]" />
            <SectionLabel>Tiers</SectionLabel>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIERS.map((t) => (
              <BrandCard key={t.title} hairline className="p-6">
                <div className="text-xs uppercase tracking-[0.16em] text-[#00F5D4]/85 font-medium">
                  {t.title}
                </div>
                <p className="mt-3 text-white/75 text-sm leading-relaxed">{t.blurb}</p>
              </BrandCard>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-4 h-4 text-[#00F5D4]" />
            <SectionLabel>How it works</SectionLabel>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HOW.map((s) => (
              <BrandCard key={s.n} hairline className="p-6">
                <div className="font-mono text-xs text-white/40">{s.n}</div>
                <div className="mt-2 font-display text-xl font-semibold">{s.t}</div>
                <p className="mt-2 text-white/70 text-sm leading-relaxed">{s.b}</p>
              </BrandCard>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <BrandCard hairline glow className="p-8 md:p-10">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-[#00F5D4] mt-1 shrink-0" />
              <div>
                <div className="font-display text-xl md:text-2xl font-semibold">
                  This is not a public airdrop or affiliate program.
                </div>
                <p className="mt-3 text-white/75 text-sm md:text-base leading-relaxed max-w-3xl">
                  All introductions are reviewed by the AICreatesAi team. See the full
                  compliance disclaimer below before sharing your link.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href="/genesis/request-access"
                    className="glass-btn inline-flex items-center gap-1 rounded-full h-9 px-4 text-sm"
                  >
                    Request access <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/genesis/dashboard"
                    className="glass-btn inline-flex items-center gap-1 rounded-full h-9 px-4 text-sm"
                  >
                    Sign in to dashboard
                  </Link>
                </div>
              </div>
            </div>
          </BrandCard>
        </section>
        <section className="mt-16">
          <GenesisDisclaimer variant="investor" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
