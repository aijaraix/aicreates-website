import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { useSeo } from "@/lib/useSeo";

const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/sholom@aicreates.ai";

const INTERESTS = [
  "Eve OS Waitlist",
  "FinPayTek Waitlist",
  "Developer Waitlist",
  "Investor",
  "Press",
  "Other",
] as const;
type Interest = typeof INTERESTS[number];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.7)]" />
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">{children}</span>
    </div>
  );
}

export default function Contact() {
  useSeo({
    title: "Contact",
    description:
      "Get in touch with AIcreatesAI - waitlists for Eve OS and FinPayTek, investor relations, press, and partnerships.",
    path: "/contact",
  });
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [interest, setInterest] = useState<Interest>("Eve OS Waitlist");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("interest") || window.location.hash.replace(/^#/, "");
    if (!raw) return;
    const decoded = decodeURIComponent(raw).toLowerCase();
    // Exact match first, then a few legacy aliases.
    let match: Interest | undefined = INTERESTS.find((i) => i.toLowerCase() === decoded);
    if (!match) {
      const aliases: Record<string, Interest> = {
        "eve os": "Eve OS Waitlist",
        "neobank": "FinPayTek Waitlist",
        "developer": "Developer Waitlist",
        "developers": "Developer Waitlist",
      };
      match = aliases[decoded];
    }
    if (match) setInterest(match);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || submitted) return;
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const payload: Record<string, string> = {
      _subject: `New AIcreatesAI inquiry · ${interest} · ${fd.get("name") || "Anonymous"}`,
      _captcha: "false",
      _template: "table",
      interest,
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      company: String(fd.get("company") || ""),
      role: String(fd.get("role") || ""),
      message: String(fd.get("message") || ""),
      _honey: String(fd.get("_honey") || ""),
    };

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSubmitted(true);
      toast({
        title: "Message sent.",
        description: "We will be in touch shortly.",
        className: "bg-[#0E0E0E] border-white/10 text-white",
      });
      form.reset();
    } catch (err) {
      toast({
        title: "Couldn't reach the server.",
        description: "Email us directly at sholom@aicreates.ai and we will respond promptly.",
        className: "bg-[#0E0E0E] border-red-400/30 text-white",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid bg-grid-fade pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,245,212,0.10),transparent_70%)] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5"
            >
              <SectionLabel>Contact</SectionLabel>
              <h1 className="mt-6 text-5xl md:text-6xl font-serif font-semibold text-gradient leading-[1.05] mb-6">
                Start a conversation.
              </h1>
              <p className="text-lg text-white/60 leading-relaxed mb-12 max-w-md">
                Tell us what you are building, deploying, or underwriting. We will route you to the right person.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#00F5D4]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-medium text-white/40 mb-1.5 uppercase tracking-[0.2em]">Direct</h4>
                    <a href="mailto:sholom@aicreates.ai" className="text-white hover:text-[#00F5D4] transition-colors">
                      sholom@aicreates.ai
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/[0.02] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#00F5D4]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-medium text-white/40 mb-1.5 uppercase tracking-[0.2em]">Headquarters</h4>
                    <p className="text-white">Miami, Florida</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className="glass-card p-8 md:p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,212,0.08),transparent_60%)] pointer-events-none" />
                {submitted ? (
                  <div className="relative text-center py-10">
                    <div className="w-14 h-14 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="w-7 h-7 text-[#00F5D4]" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-2xl font-serif font-semibold text-white mb-3">Message received.</h3>
                    <p className="text-white/55 max-w-md mx-auto mb-6">
                      Thank you. We will reply from <span className="text-white/80">sholom@aicreates.ai</span> shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-sm text-white/45 hover:text-white underline underline-offset-4"
                    >
                      Send another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="relative space-y-5" noValidate>
                    <input type="text" name="_honey" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                    <div className="space-y-2">
                      <Label className="text-white/60 text-[10px] uppercase tracking-[0.18em]">I'm reaching out as</Label>
                      <div className="flex flex-wrap gap-2">
                        {INTERESTS.map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setInterest(opt)}
                            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                              interest === opt
                                ? "bg-[#00F5D4] text-black border-[#00F5D4]"
                                : "bg-white/[0.02] text-white/65 border-white/10 hover:bg-white/[0.06] hover:text-white"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white/60 text-[10px] uppercase tracking-[0.18em]">Full name</Label>
                        <Input
                          id="name" name="name" required
                          className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/25 h-11 focus-visible:ring-[#00F5D4] focus-visible:border-[#00F5D4]/40"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/60 text-[10px] uppercase tracking-[0.18em]">Email</Label>
                        <Input
                          id="email" name="email" type="email" required
                          className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/25 h-11 focus-visible:ring-[#00F5D4] focus-visible:border-[#00F5D4]/40"
                          placeholder="you@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-white/60 text-[10px] uppercase tracking-[0.18em]">Company</Label>
                        <Input
                          id="company" name="company"
                          className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/25 h-11 focus-visible:ring-[#00F5D4] focus-visible:border-[#00F5D4]/40"
                          placeholder="Organization"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-white/60 text-[10px] uppercase tracking-[0.18em]">Role</Label>
                        <Input
                          id="role" name="role"
                          className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/25 h-11 focus-visible:ring-[#00F5D4] focus-visible:border-[#00F5D4]/40"
                          placeholder="Founder, investor, operator"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white/60 text-[10px] uppercase tracking-[0.18em]">Message</Label>
                      <Textarea
                        id="message" name="message" required
                        className="bg-white/[0.02] border-white/10 text-white placeholder:text-white/25 min-h-[120px] resize-none focus-visible:ring-[#00F5D4] focus-visible:border-[#00F5D4]/40"
                        placeholder="What are you building, deploying, or underwriting?"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full rounded-full teal-btn h-12 text-sm disabled:opacity-70"
                    >
                      {submitting ? (
                        <><Loader2 className="me-2 w-4 h-4 animate-spin" /> Sending</>
                      ) : (
                        <>Send message <Send className="ms-2 w-4 h-4" /></>
                      )}
                    </Button>
                    <p className="text-xs text-white/35 text-center">
                      Or email <a href="mailto:sholom@aicreates.ai" className="text-white/55 hover:text-[#00F5D4]">sholom@aicreates.ai</a>.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
