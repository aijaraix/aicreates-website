import { Link } from "wouter";
import { useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { LogoMark } from "./LogoMark";
import wordmark from "@/assets/aica-wordmark.png";

const COLUMNS: { heading: string; links: { name: string; href: string }[] }[] = [
  {
    heading: "Products",
    links: [
      { name: "Eve OS", href: "/eve-os" },
      { name: "NeoBank", href: "/neobank" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { name: "For Business", href: "/business" },
      { name: "For Developers", href: "/developers" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { name: "Litepaper", href: "/litepaper" },
      { name: "Roadmap", href: "/roadmap" },
      { name: "FAQ", href: "/faq" },
      { name: "Press", href: "/press" },
    ],
  },
  {
    heading: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Token", href: "/token" },
      { name: "Opportunity", href: "/opportunity" },
      { name: "Ambassadors", href: "https://invest.aicreates.ai/genesis" },
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ],
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NEWSLETTER_ENDPOINT = "https://formsubmit.co/ajax/sholom@aicreates.ai";

function NewsletterSubscribe() {
  const [email, setEmail] = useState("");
  const [honey, setHoney] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (honey.trim()) {
      // honeypot tripped: pretend success, do nothing
      setSubmitted(true);
      return;
    }
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(NEWSLETTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: "Newsletter Subscription - aicreates.ai",
          _captcha: "false",
          _template: "table",
          _honey: honey,
          email: trimmed,
          source_page: typeof window !== "undefined" ? window.location.pathname : "",
          submitted_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitted(true);
      setEmail("");
      toast({
        title: "You're on the list",
        description: "Thanks for subscribing. We'll be in touch.",
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      toast({
        title: "Subscription failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm">
      <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-3">
        Stay in the loop
      </h4>
      <div>
        {submitted ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-md border border-[#00F5D4]/30 bg-[#00F5D4]/5 px-4 py-3 text-sm text-[#00F5D4]"
          >
            You're subscribed. Watch your inbox for the next dispatch.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
            {/* Honeypot - hidden from real users, bots fill it in */}
            <input
              type="text"
              name="_honey"
              tabIndex={-1}
              autoComplete="off"
              value={honey}
              onChange={(e) => setHoney(e.target.value)}
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                disabled={submitting}
                data-testid="input-newsletter-email"
                className="flex-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#00F5D4]/60 focus:bg-white/[0.05] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={submitting}
                data-testid="button-newsletter-subscribe"
                className="inline-flex items-center justify-center rounded-md bg-[#00F5D4] px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#00F5D4]/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Subscribing..." : "Subscribe"}
              </button>
            </div>
            {error && (
              <p
                role="alert"
                className="text-xs text-red-400/90"
                data-testid="text-newsletter-error"
              >
                {error}
              </p>
            )}
          </form>
        )}
        <p className="text-white/40 text-xs leading-relaxed mt-3">
          Product updates, ecosystem milestones, and the occasional manifesto. No spam, unsubscribe any time.
        </p>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#0A0A0A] relative border-t border-white/5 pt-20 pb-10 mt-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 mb-12 md:pb-12 md:border-b md:border-white/5">
          {/* Brand + Newsletter (desktop only) */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-8">
            <div>
              <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
                <LogoMark className="h-6 w-auto shrink-0" />
                <img
                  src={wordmark}
                  alt="AIcreatesAI"
                  draggable={false}
                  decoding="async"
                  loading="eager"
                  className="h-4 w-auto"
                />
              </Link>
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 mb-5 w-[225px]">
                <span>Automate.</span>
                <span className="text-[#00F5D4]">Innovate.</span>
                <span>Elevate.</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm mb-6">
                Building the agentic intelligence layer for the next generation of companies, capital, and consumers.
              </p>
              <a
                href="https://x.com/theaicreatesai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="AIcreatesAI on X"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-[#00F5D4] transition-colors"
              >
                @theaicreatesai
              </a>
            </div>
            {/* Desktop: newsletter sits inside the brand column */}
            <div className="hidden md:block">
              <NewsletterSubscribe />
            </div>
          </div>

          {/* Link columns */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-6">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 mb-5">
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      {/^https?:\/\//.test(link.href) ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer"
                          data-testid={`link-footer-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link href={link.href}>
                          <span className="text-sm text-white/70 hover:text-[#00F5D4] transition-colors cursor-pointer">
                            {link.name}
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: newsletter band below the brand + link columns */}
        <div className="md:hidden border-t border-white/5 pt-10 pb-10 mb-2">
          <NewsletterSubscribe />
        </div>

        <div className="pt-6 border-t border-white/5 md:border-t-0 md:pt-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-white/30 text-xs tracking-wide">
            © 2026 AIcreatesAI. All rights reserved.
          </p>
          <p className="text-white/30 text-xs tracking-wide">
            Engineered for the agentic era.
          </p>
        </div>
      </div>
    </footer>
  );
}
