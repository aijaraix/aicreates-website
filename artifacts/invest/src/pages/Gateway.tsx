import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import { ArrowRight, Loader2, Check } from "lucide-react";

interface Application {
  id: string;
  status: string;
  intendedAmountCents: number | null;
  persona: string | null;
  createdAt: string;
}

interface MeResponse {
  user: { role: string };
}

const PERSONAS = [
  {
    value: "investor",
    label: "Investor",
    blurb: "Backing the agentic intelligence layer.",
  },
  {
    value: "business",
    label: "Operator / Business",
    blurb: "Running Eve OS or NeoBank for an organization.",
  },
  {
    value: "consumer",
    label: "Consumer / Power user",
    blurb: "Using the platform personally and want skin in the game.",
  },
];

const ACCRED_OPTIONS = [
  { value: "income", label: "Income > $200k (or $300k joint)" },
  { value: "net_worth", label: "Net worth > $1M (excl. residence)" },
  { value: "professional", label: "Series 7/65/82 or equivalent" },
  { value: "entity", label: "Entity > $5M assets" },
  { value: "knowledgeable", label: "Knowledgeable employee" },
  { value: "none", label: "Not currently accredited" },
];

const COUNTRIES = [
  "US",
  "CA",
  "GB",
  "AU",
  "NZ",
  "IE",
  "SG",
  "AE",
  "CH",
  "DE",
  "FR",
  "NL",
  "SE",
  "NO",
  "DK",
  "FI",
  "IL",
  "JP",
  "HK",
];

export default function Gateway() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });
  const existing = useQuery({
    queryKey: ["me", "gateway"],
    queryFn: () => api<{ application: Application | null }>("/me/gateway"),
  });

  const [persona, setPersona] = useState("investor");
  const [accreditation, setAccreditation] = useState("income");
  const [country, setCountry] = useState("US");
  const [intendedAmount, setIntendedAmount] = useState(25_000);
  const [thesisFit, setThesisFit] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [experience, setExperience] = useState("");
  const [conflictDisclosure, setConflictDisclosure] = useState("");
  const [agreeNotSecurity, setAgreeNotSecurity] = useState(false);
  const [agreeRisk, setAgreeRisk] = useState(false);

  const submit = useMutation({
    mutationFn: () =>
      api<{ application: Application }>("/gateway", {
        body: {
          persona,
          accreditation,
          country,
          intendedAmountCents: Math.round(intendedAmount * 100),
          thesisFit,
          referralSource,
          experience,
          conflictDisclosure,
          agreeNotSecurity,
          agreeRisk,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "gateway"] });
      setLocation("/invest");
    },
    onError: (err) => alert(`Submit failed: ${(err as Error).message}`),
  });

  const isAdmin = me.data?.user.role === "admin";
  const app = existing.data?.application;
  const canSubmit =
    thesisFit.trim().length >= 20 &&
    intendedAmount >= 1000 &&
    agreeNotSecurity &&
    agreeRisk &&
    country.length > 0;

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />
      <PageHeader
        eyebrow="AI Allocation Gateway"
        title={<>Tell us about your fit.</>}
        subtitle={
          <>
            We allocate the Founders Round selectively. This short intake lets
            us route you and prioritize your commitment.
            {user?.firstName ? ` Thanks, ${user.firstName}.` : ""}
          </>
        }
      />
      <main className="mx-auto max-w-3xl px-6 py-10 md:py-12">
        {app && (
          <div
            className="mb-8 rounded-2xl border border-[#00F5D4]/30 bg-[#00F5D4]/5 p-5"
            data-testid="block-existing-application"
          >
            <div className="flex items-center gap-2 text-[#00F5D4] text-sm">
              <Check className="w-4 h-4" />
              Application on file - status:{" "}
              <span className="font-medium uppercase tracking-wider text-xs">
                {app.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/60">
              You already have an application from{" "}
              {new Date(app.createdAt).toLocaleDateString()}. You may
              proceed to reserve a tier, or resubmit with updated details
              below.
            </p>
            <button
              onClick={() => setLocation("/invest")}
              className="mt-4 inline-flex items-center px-4 h-10 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90"
              data-testid="button-continue-to-invest"
            >
              Continue to /invest <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          <Section title="Who are you backing as?">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PERSONAS.map((p) => (
                <label
                  key={p.value}
                  className={`rounded-xl border p-3 cursor-pointer ${
                    persona === p.value
                      ? "border-[#00F5D4]/50 bg-[#00F5D4]/5"
                      : "border-white/10 bg-black/30 hover:border-white/20"
                  }`}
                  data-testid={`radio-persona-${p.value}`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    checked={persona === p.value}
                    onChange={() => setPersona(p.value)}
                  />
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-xs text-white/50 mt-1">{p.blurb}</div>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Country of residence">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none focus:border-[#00F5D4]/40"
              data-testid="select-country"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-white/40">
              We currently allocate from the listed jurisdictions only.
            </p>
          </Section>

          <Section title="Accreditation">
            <div className="space-y-2">
              {ACCRED_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${
                    accreditation === o.value
                      ? "border-[#00F5D4]/50 bg-[#00F5D4]/5"
                      : "border-white/10 bg-black/30 hover:border-white/20"
                  }`}
                  data-testid={`radio-accred-${o.value}`}
                >
                  <input
                    type="radio"
                    name="accreditation"
                    checked={accreditation === o.value}
                    onChange={() => setAccreditation(o.value)}
                    className="mt-1 accent-[#00F5D4]"
                  />
                  <span className="text-sm text-white/80">{o.label}</span>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Intended commitment (USD)">
            <input
              type="number"
              min={1000}
              max={10_000_000}
              step={1000}
              value={intendedAmount}
              onChange={(e) =>
                setIntendedAmount(Math.max(0, Number(e.target.value) || 0))
              }
              className="w-full h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none focus:border-[#00F5D4]/40"
              data-testid="input-intended-amount"
            />
            <p className="mt-2 text-xs text-white/40">
              Indicative only. You can change the exact amount when you
              reserve a tier.
            </p>
          </Section>

          <Section title="Thesis fit">
            <textarea
              rows={4}
              value={thesisFit}
              onChange={(e) => setThesisFit(e.target.value)}
              placeholder="Why this round, why now, and what part of the agentic intelligence layer matters most to you?"
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-[#00F5D4]/40"
              data-testid="textarea-thesis-fit"
            />
            <p className="mt-1 text-xs text-white/40">
              Min 20 characters. Used by the team to prioritize allocations.
            </p>
          </Section>

          <Section title="How did you hear about us? (optional)">
            <input
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              className="w-full h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none focus:border-[#00F5D4]/40"
              data-testid="input-referral"
            />
          </Section>

          <Section title="Relevant experience (optional)">
            <input
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. early-stage tokens, AI infra operator, neobank ops"
              className="w-full h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none focus:border-[#00F5D4]/40"
              data-testid="input-experience"
            />
          </Section>

          <Section title="Conflicts to disclose? (optional)">
            <textarea
              rows={2}
              value={conflictDisclosure}
              onChange={(e) => setConflictDisclosure(e.target.value)}
              placeholder="Affiliations with competing platforms, regulators, etc."
              className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none focus:border-[#00F5D4]/40"
              data-testid="textarea-conflicts"
            />
          </Section>

          <div className="space-y-3 pt-2 border-t border-white/5">
            <label
              className="flex items-start gap-3 cursor-pointer"
              data-testid="check-agree-not-security"
            >
              <input
                type="checkbox"
                checked={agreeNotSecurity}
                onChange={(e) => setAgreeNotSecurity(e.target.checked)}
                className="mt-1 accent-[#00F5D4]"
              />
              <span className="text-sm text-white/80">
                I understand AICA tokens are acquired for consumptive use
                in the AICreatesAI ecosystem and do not represent equity
                in the company.
              </span>
            </label>
            <label
              className="flex items-start gap-3 cursor-pointer"
              data-testid="check-agree-risk"
            >
              <input
                type="checkbox"
                checked={agreeRisk}
                onChange={(e) => setAgreeRisk(e.target.checked)}
                className="mt-1 accent-[#00F5D4]"
              />
              <span className="text-sm text-white/80">
                I understand this is a high-risk early-stage commitment
                and I may lose all funds.
              </span>
            </label>
          </div>

          <button
            type="button"
            disabled={!canSubmit || submit.isPending}
            onClick={() => submit.mutate()}
            className="w-full inline-flex items-center justify-center h-12 px-6 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 disabled:opacity-40"
            data-testid="button-submit-gateway"
          >
            {submit.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Submit and continue <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.16em] text-white/50 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}
