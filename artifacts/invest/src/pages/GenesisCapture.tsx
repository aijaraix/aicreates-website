import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowRight, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { SectionLabel, BrandCard } from "@/components/brand";
import GenesisDisclaimer from "@/components/GenesisDisclaimer";
import { api } from "@/lib/api";
import { useInvestSeo } from "@/lib/useInvestSeo";

interface ReferrerResp {
  referrer: { code: string; tier: string; displayName: string };
}

const INTERESTS = [
  { v: "customer", l: "Customer (consumer)" },
  { v: "enterprise", l: "Customer (enterprise)" },
  { v: "developer", l: "Developer / builder" },
  { v: "agency", l: "Agency / integrator" },
  { v: "partner", l: "Strategic partner" },
  { v: "investor", l: "Investor (compliance review)" },
  { v: "other", l: "Other" },
] as const;

export default function GenesisCapture() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toLowerCase();
  useInvestSeo({
    title: "You've Been Invited - AICreatesAi",
    description: "An AICreatesAi Genesis member has invited you to learn more.",
    path: `/r/${code}`,
  });

  const ref = useQuery({
    queryKey: ["genesis", "r", code],
    queryFn: () => api<ReferrerResp>(`/genesis/r/${encodeURIComponent(code)}`),
    retry: false,
  });

  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    region: "",
    interestType: "customer" as (typeof INTERESTS)[number]["v"],
    estimatedInvestmentRange: "",
    notes: "",
    consentAccepted: false,
  });

  // Capture first-touch path
  const [firstTouch] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
  );

  if (ref.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }
  if (ref.isError || !ref.data) {
    return (
      <div className="relative isolate min-h-screen text-white">
        <SiteHeader homeHref="/" sticky />
        <main className="mx-auto max-w-xl px-6 pt-32 pb-20 text-center">
          <SectionLabel>Invite Not Found</SectionLabel>
          <h1 className="mt-4 font-display text-3xl font-semibold">
            This referral link isn't valid.
          </h1>
          <p className="mt-3 text-white/60 text-sm">
            It may have been disabled or never existed. Visit aicreates.ai for the public
            site.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block teal-btn rounded-full h-10 px-6 text-sm font-medium"
          >
            Go home
          </Link>
        </main>
      </div>
    );
  }

  const referrer = ref.data.referrer;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consentAccepted) {
      toast.error("Please accept the consent statement.");
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/genesis/leads", {
        body: {
          referralCode: code,
          ...form,
          firstTouchPath: firstTouch,
          lastTouchPath:
            typeof window !== "undefined" ? window.location.pathname : "",
          utm: extractUtm(firstTouch),
          consentAccepted: true as const,
        },
      });
      setDone(true);
      toast.success("Thanks - we'll be in touch.");
    } catch {
      toast.error("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative isolate min-h-screen text-white overflow-hidden">
      <SiteHeader homeHref="/" sticky />
      <main className="relative z-10 mx-auto max-w-2xl px-6 pt-16 pb-20">
        <div className="mb-5 flex">
          <SectionLabel>Personal Invite</SectionLabel>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          <span className="text-gradient-teal">{referrer.displayName}</span> invited you to
          AICreatesAi.
        </h1>
        <p className="mt-3 text-white/65 text-sm">
          AICreatesAi is building the agentic intelligence layer that companies, capital,
          and consumers will run on. Tell us a little about you and we'll get in touch.
        </p>

        {done ? (
          <BrandCard hairline className="mt-10 p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#00F5D4] mx-auto" />
            <div className="mt-3 font-display text-xl font-semibold">Got it.</div>
            <p className="mt-2 text-white/65 text-sm">
              We'll review your interest and someone from the team will reach out shortly.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1 text-[#00F5D4] text-sm hover:underline"
            >
              Explore aicreates.ai <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </BrandCard>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5" data-testid="form-genesis-capture">
            <input
              type="hidden"
              name="ref"
              value={code}
              data-testid="input-ref-code"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testId="input-name" required />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} testId="input-email" required />
              <Field label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testId="input-phone" />
              <Field label="Company (optional)" value={form.company} onChange={(v) => setForm({ ...form, company: v })} testId="input-company" />
              <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} testId="input-country" />
              <Field label="State / Region" value={form.region} onChange={(v) => setForm({ ...form, region: v })} testId="input-region" />
              <div>
                <label className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-medium">Interest</label>
                <select
                  value={form.interestType}
                  onChange={(e) => setForm({ ...form, interestType: e.target.value as typeof form.interestType })}
                  className="mt-2 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#00F5D4]/50"
                  data-testid="select-interest"
                >
                  {INTERESTS.map((i) => (
                    <option key={i.v} value={i.v} className="bg-[#0A0A0A]">
                      {i.l}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {form.interestType === "investor" && (
              <Field
                label="Estimated investment range (USD)"
                value={form.estimatedInvestmentRange}
                onChange={(v) => setForm({ ...form, estimatedInvestmentRange: v })}
                testId="input-range"
              />
            )}
            <div>
              <label className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-medium">
                Anything we should know? (optional)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                maxLength={2000}
                className="mt-2 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#00F5D4]/50"
                data-testid="input-notes"
              />
            </div>
            <label className="flex items-start gap-3 text-xs text-white/65 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.consentAccepted}
                onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-[#00F5D4]"
                data-testid="checkbox-consent"
              />
              <span>
                I agree that AICreatesAi may contact me about this introduction. I
                understand this is not an offer to sell securities and that any investor
                interest is routed to a separate compliance-review track.
              </span>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="teal-btn inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium w-full disabled:opacity-60"
              data-testid="button-submit-lead"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Send introduction
                </>
              )}
            </button>
          </form>
        )}
        <div className="mt-10">
          <GenesisDisclaimer variant="investor" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  testId,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  testId?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-medium">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#00F5D4]/50"
        data-testid={testId}
      />
    </div>
  );
}

function extractUtm(qs: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const url = new URL(qs, "https://x");
    url.searchParams.forEach((v, k) => {
      if (k.startsWith("utm_")) out[k] = v;
    });
  } catch {
    // ignore
  }
  return out;
}
