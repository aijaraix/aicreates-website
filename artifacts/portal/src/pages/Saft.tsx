import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { api } from "@/lib/api";
import {
  ACCREDITATION_OPTIONS,
  ACK_LIST,
  PAYMENT_METHODS,
  type AckKey,
} from "@/data/saftFields";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Loader2,
  Lock,
} from "lucide-react";

interface SaftCommitment {
  id: string;
  amountCents: number;
  tokenAllocation: number;
  displayName: string;
  roundSlug: string;
  state: string;
  status: string;
  saftSignedAt: string | null;
}

interface SaftResponse {
  commitment: SaftCommitment;
  submission: {
    status: string;
    signatureName: string;
    signedAt: string;
  } | null;
}

interface FormState {
  legalName: string;
  entityType: "individual" | "entity";
  email: string;
  phone: string;
  address: string;
  jurisdiction: string;
  dobOrFormation: string;
  taxId: string;
  walletAddress: string;
  paymentMethod: "card" | "ach" | "wire" | "crypto" | "";
  accreditationCategory: string;
  investmentExperience: string;
  relationshipToCompany: string;
  acknowledgments: Record<AckKey, boolean>;
  signatureName: string;
  signatureIntent: boolean;
}

const STEPS = [
  "Identity",
  "Transaction",
  "Questionnaire",
  "Acknowledgments",
  "Signature",
  "Done",
] as const;

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function maskTaxId(v: string) {
  const digits = v.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return "*".repeat(digits.length - 4) + digits.slice(-4);
}

export default function Saft() {
  const { user } = useUser();
  const params = useParams<{ commitId: string }>();
  const commitId = params.commitId!;
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [taxIdMasked, setTaxIdMasked] = useState(false);

  const initialAcks = useMemo(
    () =>
      ACK_LIST.reduce<Record<AckKey, boolean>>(
        (acc, a) => {
          acc[a.key] = false;
          return acc;
        },
        {} as Record<AckKey, boolean>,
      ),
    [],
  );

  const [form, setForm] = useState<FormState>({
    legalName: "",
    entityType: "individual",
    email: "",
    phone: "",
    address: "",
    jurisdiction: "",
    dobOrFormation: "",
    taxId: "",
    walletAddress: "",
    paymentMethod: "",
    accreditationCategory: "",
    investmentExperience: "",
    relationshipToCompany: "",
    acknowledgments: initialAcks,
    signatureName: "",
    signatureIntent: false,
  });

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !form.email) {
      setForm((f) => ({
        ...f,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        legalName:
          f.legalName ||
          [user.firstName, user.lastName].filter(Boolean).join(" "),
      }));
    }
  }, [user, form.email]);

  const { data, isLoading } = useQuery({
    queryKey: ["saft", commitId],
    queryFn: () => api<SaftResponse>(`/saft/${commitId}`),
  });

  const submit = useMutation({
    mutationFn: () =>
      api<{ ok: boolean }>(`/saft/${commitId}`, {
        body: {
          ...form,
          paymentMethod: form.paymentMethod || undefined,
        },
      }),
    onSuccess: () => {
      setStep(STEPS.length - 1);
    },
    onError: (err) => alert(`Submit failed: ${(err as Error).message}`),
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] text-white/60 flex items-center justify-center">
        Loading SAFT…
      </div>
    );
  }

  const c = data?.commitment;
  if (!c) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] text-white/60 flex items-center justify-center">
        Commitment not found.
      </div>
    );
  }

  const allAcks = ACK_LIST.every((a) => form.acknowledgments[a.key]);
  const sigMatches =
    form.signatureName.trim().toLowerCase() ===
      form.legalName.trim().toLowerCase() && form.signatureName.trim() !== "";

  const canNext = (() => {
    switch (step) {
      case 0:
        return (
          form.legalName.trim().length > 1 &&
          form.email.includes("@") &&
          form.address.trim().length > 4 &&
          form.jurisdiction.trim().length > 1 &&
          form.taxId.replace(/\D/g, "").length >= 4
        );
      case 1:
        return Boolean(form.paymentMethod);
      case 2:
        return Boolean(form.accreditationCategory);
      case 3:
        return allAcks;
      case 4:
        return sigMatches && form.signatureIntent;
      default:
        return true;
    }
  })();

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-white/5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-300">
          <FileText className="w-3.5 h-3.5" /> Draft for counsel review
        </span>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 md:py-14">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Commitment {c.id.slice(0, 8)}
          </div>
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight mt-1"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            Sign the <span className="text-[#00F5D4]">SAFT</span>.
          </h1>
          <div className="mt-2 text-white/60">
            {c.displayName} - {fmt(c.amountCents)} -{" "}
            {c.tokenAllocation.toLocaleString()} AICA
          </div>
        </div>

        {/* Stepper */}
        <ol className="flex flex-wrap gap-2 mb-8 text-xs">
          {STEPS.map((s, i) => (
            <li
              key={s}
              className={`px-3 py-1 rounded-full border ${
                i === step
                  ? "border-[#00F5D4]/50 bg-[#00F5D4]/10 text-[#00F5D4]"
                  : i < step
                    ? "border-white/10 bg-white/[0.04] text-white/70"
                    : "border-white/10 text-white/40"
              }`}
              data-testid={`step-${i}`}
            >
              {i + 1}. {s}
            </li>
          ))}
        </ol>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
          {step === 0 && (
            <div className="space-y-4" data-testid="saft-step-identity">
              <H title="Investor identity" />
              <Row>
                <Field
                  label="Legal name"
                  value={form.legalName}
                  onChange={(v) => setForm({ ...form, legalName: v })}
                  testId="input-saft-name"
                />
                <Pills
                  label="Type"
                  value={form.entityType}
                  options={[
                    { value: "individual", label: "Individual" },
                    { value: "entity", label: "Entity" },
                  ]}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      entityType: v as "individual" | "entity",
                    })
                  }
                />
              </Row>
              <Row>
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  testId="input-saft-email"
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
              </Row>
              <Field
                label="Address"
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
                testId="input-saft-address"
              />
              <Row>
                <Field
                  label="Jurisdiction"
                  value={form.jurisdiction}
                  onChange={(v) => setForm({ ...form, jurisdiction: v })}
                  placeholder="e.g. Delaware, USA"
                  testId="input-saft-jurisdiction"
                />
                <Field
                  label={
                    form.entityType === "entity"
                      ? "Date of formation"
                      : "Date of birth"
                  }
                  type="date"
                  value={form.dobOrFormation}
                  onChange={(v) => setForm({ ...form, dobOrFormation: v })}
                />
              </Row>
              <div>
                <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                  Tax ID (SSN or EIN) <Lock className="w-3 h-3 inline ml-1" />
                </label>
                <input
                  type={taxIdMasked ? "text" : "password"}
                  value={taxIdMasked ? maskTaxId(form.taxId) : form.taxId}
                  onChange={(e) =>
                    setForm({ ...form, taxId: e.target.value.replace(/[^\d-]/g, "") })
                  }
                  onFocus={() => setTaxIdMasked(false)}
                  onBlur={() => setTaxIdMasked(true)}
                  className="w-full mt-1 h-10 rounded-xl border border-white/10 bg-black/30 px-3 outline-none focus:border-[#00F5D4]/40 font-mono"
                  data-testid="input-saft-taxid"
                />
                <p className="mt-1 text-[11px] text-white/40">
                  Only the last 4 digits are retained in our records; the full value is never persisted.
                </p>
              </div>
              <Field
                label="Wallet address (optional, required pre-TGE)"
                value={form.walletAddress}
                onChange={(v) => setForm({ ...form, walletAddress: v })}
                placeholder="0x... or chain-specific address"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5" data-testid="saft-step-transaction">
              <H title="Transaction" />
              <div className="grid grid-cols-3 gap-3 text-sm">
                <ReadOnly label="Amount" value={fmt(c.amountCents)} />
                <ReadOnly
                  label="Allocation"
                  value={`${c.tokenAllocation.toLocaleString()} AICA`}
                />
                <ReadOnly label="Round" value={c.roundSlug} />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                  Payment method preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {PAYMENT_METHODS.map((m) => (
                    <label
                      key={m.value}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${
                        form.paymentMethod === m.value
                          ? "border-[#00F5D4]/50 bg-[#00F5D4]/5"
                          : "border-white/10 bg-black/30 hover:border-white/20"
                      }`}
                      data-testid={`radio-paymentmethod-${m.value}`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={form.paymentMethod === m.value}
                        onChange={() =>
                          setForm({
                            ...form,
                            paymentMethod: m.value as FormState["paymentMethod"],
                          })
                        }
                        className="mt-1 accent-[#00F5D4]"
                      />
                      <div>
                        <div className="font-medium">{m.label}</div>
                        <div className="text-xs text-white/50 mt-0.5">
                          {m.blurb}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5" data-testid="saft-step-questionnaire">
              <H title="Investor questionnaire (Exhibit B)" />
              <div>
                <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                  Accreditation category
                </label>
                <div className="space-y-2 mt-2">
                  {ACCREDITATION_OPTIONS.map((o) => (
                    <label
                      key={o.value}
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${
                        form.accreditationCategory === o.value
                          ? "border-[#00F5D4]/50 bg-[#00F5D4]/5"
                          : "border-white/10 bg-black/30 hover:border-white/20"
                      }`}
                      data-testid={`radio-accreditation-${o.value}`}
                    >
                      <input
                        type="radio"
                        name="accred"
                        checked={form.accreditationCategory === o.value}
                        onChange={() =>
                          setForm({
                            ...form,
                            accreditationCategory: o.value,
                          })
                        }
                        className="mt-1 accent-[#00F5D4]"
                      />
                      <span className="text-sm text-white/80">{o.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Field
                label="Investment experience (optional)"
                value={form.investmentExperience}
                onChange={(v) => setForm({ ...form, investmentExperience: v })}
                placeholder="e.g. early-stage tokens, public equities, real estate"
              />
              <Field
                label="Relationship to AICreatesAI (optional)"
                value={form.relationshipToCompany}
                onChange={(v) => setForm({ ...form, relationshipToCompany: v })}
                placeholder="e.g. introduced by, advisor, customer"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3" data-testid="saft-step-acknowledgments">
              <H title="Acknowledgments (Exhibits A, C, D)" />
              {ACK_LIST.map((a) => (
                <label
                  key={a.key}
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${
                    form.acknowledgments[a.key]
                      ? "border-[#00F5D4]/40 bg-[#00F5D4]/5"
                      : "border-white/10 bg-black/30 hover:border-white/20"
                  }`}
                  data-testid={`check-ack-${a.key}`}
                >
                  <input
                    type="checkbox"
                    checked={form.acknowledgments[a.key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        acknowledgments: {
                          ...form.acknowledgments,
                          [a.key]: e.target.checked,
                        },
                      })
                    }
                    className="mt-1 accent-[#00F5D4]"
                  />
                  <span className="text-sm text-white/80">{a.text}</span>
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4" data-testid="saft-step-signature">
              <H title="Signature" />
              <p className="text-sm text-white/60">
                Type your full legal name exactly as entered in step 1. We
                capture timestamp and IP server-side.
              </p>
              <Field
                label={`Type "${form.legalName}"`}
                value={form.signatureName}
                onChange={(v) => setForm({ ...form, signatureName: v })}
                testId="input-saft-signature"
              />
              <div
                className="rounded-xl border border-white/10 bg-black/30 p-5 text-center"
                data-testid="saft-signature-preview"
              >
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                  Signature preview
                </div>
                <div
                  className="mt-3 text-3xl text-[#00F5D4]"
                  style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                >
                  {form.signatureName || "—"}
                </div>
              </div>
              <SaftPdfPreview commitId={commitId} form={form} />
              <label
                className="flex items-start gap-3 cursor-pointer"
                data-testid="check-saft-intent"
              >
                <input
                  type="checkbox"
                  checked={form.signatureIntent}
                  onChange={(e) =>
                    setForm({ ...form, signatureIntent: e.target.checked })
                  }
                  className="mt-1 accent-[#00F5D4]"
                />
                <span className="text-sm text-white/80">
                  I intend this typed signature to be my legal signature on
                  the draft SAFT for AICreatesAI.
                </span>
              </label>
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3 text-xs text-amber-200/80">
                Draft for counsel review. The final SAFT language must be
                approved by qualified securities counsel before any funds
                are accepted. By signing here you record your intent on the
                draft terms above.
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-8" data-testid="saft-step-done">
              <div className="w-14 h-14 rounded-full bg-[#00F5D4]/15 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7 text-[#00F5D4]" />
              </div>
              <div className="mt-5 text-2xl font-semibold">
                SAFT signed.
              </div>
              <p className="mt-2 text-white/60">
                Your draft SAFT has been recorded. Choose a payment method
                to fund your commitment.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setLocation(`/checkout/${c.id}`)}
                  className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90"
                  data-testid="link-go-checkout"
                >
                  Continue to payment <ArrowRight className="ml-2 w-4 h-4" />
                </button>
                <a
                  href={`/api/saft/${c.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-white/15 hover:bg-white/[0.06]"
                  data-testid="link-download-saft"
                >
                  Download draft SAFT
                </a>
              </div>
            </div>
          )}

          {/* Step nav */}
          {step < STEPS.length - 1 && (
            <div className="mt-8 flex justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep(Math.max(0, step - 1))}
                className="px-4 py-2 rounded-full border border-white/10 text-sm hover:bg-white/[0.04] disabled:opacity-30"
              >
                Back
              </button>
              {step < 4 ? (
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setStep(step + 1)}
                  className="px-5 h-11 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 disabled:opacity-50"
                  data-testid="button-saft-next"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canNext || submit.isPending}
                  onClick={() => submit.mutate()}
                  className="px-5 h-11 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 disabled:opacity-50 inline-flex items-center"
                  data-testid="button-saft-submit"
                >
                  {submit.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing…
                    </>
                  ) : (
                    "Sign SAFT"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function SaftPdfPreview({
  commitId,
  form,
}: {
  commitId: string;
  form: FormState;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let revokeUrl: string | null = null;
    const t = setTimeout(async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/saft/${commitId}/preview`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            paymentMethod: form.paymentMethod || undefined,
          }),
        });
        if (!res.ok) throw new Error(`Preview failed (${res.status})`);
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        revokeUrl = objectUrl;
        if (!cancelled) setUrl(objectUrl);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [
    commitId,
    form.legalName,
    form.entityType,
    form.email,
    form.address,
    form.jurisdiction,
    form.taxId,
    form.walletAddress,
    form.paymentMethod,
    form.accreditationCategory,
    form.signatureName,
  ]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-white/40">
        <span>Live SAFT preview - exactly what you are signing</span>
        {loading && (
          <span className="inline-flex items-center gap-1 text-white/50">
            <Loader2 className="w-3 h-3 animate-spin" /> Updating
          </span>
        )}
      </div>
      {err ? (
        <div className="p-4 text-sm text-red-300">{err}</div>
      ) : url ? (
        <iframe
          title="SAFT preview"
          src={url}
          className="w-full h-[520px] bg-white"
          data-testid="saft-pdf-preview"
        />
      ) : (
        <div className="p-8 text-center text-white/40 text-sm">
          Generating preview…
        </div>
      )}
    </div>
  );
}

function H({ title }: { title: string }) {
  return (
    <h2
      className="text-xl font-semibold mb-2"
      style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
    >
      {title}
    </h2>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  testId?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 h-10 rounded-xl border border-white/10 bg-black/30 px-3 outline-none focus:border-[#00F5D4]/40"
        data-testid={testId}
      />
    </div>
  );
}

function Pills({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
        {label}
      </label>
      <div className="mt-1 inline-flex rounded-full border border-white/10 p-1 text-sm">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`px-4 h-8 rounded-full ${
              value === o.value
                ? "bg-[#00F5D4] text-black"
                : "text-white/60 hover:text-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
      <div
        className="mt-1 font-medium"
        style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
      >
        {value}
      </div>
    </div>
  );
}
