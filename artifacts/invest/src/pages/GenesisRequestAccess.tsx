import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import { SectionLabel, BrandCard } from "@/components/brand";
import GenesisDisclaimer from "@/components/GenesisDisclaimer";
import { api } from "@/lib/api";
import { useInvestSeo } from "@/lib/useInvestSeo";

export default function GenesisRequestAccess() {
  useInvestSeo({
    title: "Request Access - Genesis Referral",
    description: "Request access to the AICreatesAi Genesis invite-only referral program.",
    path: "/genesis/request-access",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    reason: "",
    source: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.reason.trim()) {
      toast.error("Name, email, and reason are required.");
      return;
    }
    setSubmitting(true);
    try {
      await api("/genesis/request-access", { body: form });
      setDone(true);
      toast.success("Request submitted. We'll be in touch.");
    } catch (err) {
      toast.error("Could not submit. Try again or contact us.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative isolate min-h-screen text-white overflow-hidden">
      <SiteHeader homeHref="/genesis" homeTestId="link-genesis-back" sticky />
      <main className="relative z-10 mx-auto max-w-2xl px-6 pt-16 pb-20">
        <Link
          href="/genesis"
          className="inline-flex items-center gap-1.5 text-sm text-white/55 hover:text-white mb-6"
          data-testid="link-back-genesis"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Genesis
        </Link>
        <div className="mb-5 flex">
          <SectionLabel>Request Access</SectionLabel>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          Tell us how you'd like to help.
        </h1>
        <p className="mt-3 text-white/65 text-sm">
          Genesis is invite-only. We review every request manually. Approval is not
          guaranteed and is at our sole discretion.
        </p>

        {done ? (
          <BrandCard hairline className="mt-10 p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-[#00F5D4] mx-auto" />
            <div className="mt-3 font-display text-xl font-semibold">Request received.</div>
            <p className="mt-2 text-white/65 text-sm">
              If you're a fit, we'll reach out at the email you provided. No further action
              is needed.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1 text-[#00F5D4] text-sm hover:underline"
            >
              Back home
            </Link>
          </BrandCard>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-8 space-y-5"
            data-testid="form-genesis-request"
          >
            <Field
              label="Full name"
              testId="input-name"
              value={form.fullName}
              onChange={(v) => setForm({ ...form, fullName: v })}
            />
            <Field
              label="Email"
              type="email"
              testId="input-email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <Field
              label="How did you hear about us / who referred you (optional)"
              testId="input-source"
              value={form.source}
              onChange={(v) => setForm({ ...form, source: v })}
            />
            <div>
              <label className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-medium">
                Why would you be a great Genesis referrer?
              </label>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={5}
                required
                maxLength={2000}
                className="mt-2 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm placeholder:text-white/30 outline-none focus:border-[#00F5D4]/50"
                placeholder="The kinds of customers, partners, or operators you can introduce - and why you believe in agentic AI infrastructure."
                data-testid="input-reason"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="teal-btn inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-sm font-medium w-full disabled:opacity-60"
              data-testid="button-submit-request"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit request"
              )}
            </button>
            <p className="text-[11px] text-white/40 text-center">
              By submitting, you agree to receive a one-time response from AICreatesAi about
              this request. No automatic enrollment.
            </p>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  testId?: string;
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
        className="mt-2 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm placeholder:text-white/30 outline-none focus:border-[#00F5D4]/50"
        data-testid={testId}
      />
    </div>
  );
}
