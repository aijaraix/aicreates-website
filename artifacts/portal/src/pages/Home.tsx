import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white flex flex-col">
      <header className="px-6 md:px-10 py-6 flex items-center justify-between border-b border-white/5">
        <a href="https://www.aicreates.ai" className="flex items-center gap-2">
          <span
            className="font-semibold text-lg tracking-tight"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            AI<span className="text-[#00F5D4]">creates</span>AI
          </span>
        </a>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/sign-in"
            className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/[0.04] transition"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
              Investor Portal
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.05] tracking-tight"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            Reserve your allocation in the{" "}
            <span className="text-[#00F5D4]">Agentic Intelligence Layer</span>.
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
            Founders Commitment access for the $50M raise and $3.5M GPU cluster
            buildout. Sign in to view tiers, complete a commitment, and track
            your allocation.
          </p>
          <p className="mt-3 text-xs text-white/40 max-w-xl mx-auto">
            This is a Founders Commitment, not an offer to sell securities.
            Final terms are pending. All commitments are refundable until
            definitive documents are signed.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition"
              data-testid="link-portal-signup"
            >
              Create your investor account
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-white/15 hover:bg-white/[0.06] transition"
              data-testid="link-portal-signin"
            >
              Already have access? Sign in
            </Link>
          </div>
        </div>
      </main>

      <footer className="px-6 md:px-10 py-6 border-t border-white/5 text-xs text-white/40 flex items-center justify-between">
        <span>&copy; {new Date().getFullYear()} AICreatesAi</span>
        <a href="https://www.aicreates.ai" className="hover:text-white/70">
          aicreates.ai
        </a>
      </footer>
    </div>
  );
}
