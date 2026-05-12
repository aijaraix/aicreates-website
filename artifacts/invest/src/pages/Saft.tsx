import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/react";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import {
  ACCREDITATION_OPTIONS,
  ACK_LIST,
  PAYMENT_METHODS,
  RISK_DISCLOSURES,
  WALLET_CHAINS,
  type AckKey,
  type RiskKey,
} from "@/data/saftFields";
import { wireInstructionsPdfUrl } from "@/data/rounds";
import VestingPreview from "@/components/VestingPreview";
import {
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
  walletChain: string;
  paymentMethod: "card" | "ach" | "wire" | "crypto" | "";
  accreditationCategory: string;
  investmentExperience: string;
  relationshipToCompany: string;
  acknowledgments: Record<AckKey, boolean>;
  riskAcknowledgments: Record<RiskKey, boolean>;
  signatureName: string;
  signatureIntent: boolean;
}

const STEPS = [
  "Identity",
  "Transaction",
  "Questionnaire",
  "Risk Disclosure",
  "Wallet Mapping",
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
  const initialRisks = useMemo(
    () =>
      RISK_DISCLOSURES.reduce<Record<RiskKey, boolean>>(
        (acc, r) => {
          acc[r.key] = false;
          return acc;
        },
        {} as Record<RiskKey, boolean>,
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
    walletChain: "ethereum",
    paymentMethod: "",
    accreditationCategory: "",
    investmentExperience: "",
    relationshipToCompany: "",
    acknowledgments: initialAcks,
    riskAcknowledgments: initialRisks,
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
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ user: { role: string } }>("/me"),
  });
  const isAdmin = me.data?.user.role === "admin";

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
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#00F5D4]" /> Loading SAFT…
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
  const allRisks = RISK_DISCLOSURES.every(
    (r) => form.riskAcknowledgments[r.key],
  );
  const validWallet = form.walletAddress.trim().length >= 8;
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
        return allRisks;
      case 4:
        return true;
      case 5:
        return allAcks;
      case 6:
        return sigMatches && form.signatureIntent;
      default:
        return true;
    }
  })();

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />

      <PageHeader
        eyebrow={`Commitment ${c.id.slice(0, 8)} - Step 1 of 2`}
        title={<>Sign the SAFT.</>}
        subtitle={
          <>
            {c.displayName} <span className="text-white/30">·</span>{" "}
            <span className="text-[#00F5D4] font-medium">
              {fmt(c.amountCents)}
            </span>{" "}
            <span className="text-white/30">·</span>{" "}
            {c.tokenAllocation.toLocaleString()} AICA
          </>
        }
        back={{ href: "/dashboard", label: "Back to dashboard" }}
        actions={
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-300/40 bg-amber-300/5 text-[11px] uppercase tracking-[0.2em] text-amber-300">
            <FileText className="w-3.5 h-3.5" /> Draft for counsel review
          </span>
        }
      />

      <main className="mx-auto max-w-3xl px-6 py-10 md:py-12">

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
              <TokenMath
                amountCents={c.amountCents}
                tokenAllocation={c.tokenAllocation}
                roundSlug={c.roundSlug}
              />
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
            <div className="space-y-3" data-testid="saft-step-risk">
              <H title="Risk disclosure" />
              <p className="text-sm text-white/60">
                Acknowledge each material risk before continuing. These
                mirror the risk factors in the SAFT and on /faq.
              </p>
              {RISK_DISCLOSURES.map((r) => (
                <label
                  key={r.key}
                  className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer ${
                    form.riskAcknowledgments[r.key]
                      ? "border-[#00F5D4]/40 bg-[#00F5D4]/5"
                      : "border-white/10 bg-black/30 hover:border-white/20"
                  }`}
                  data-testid={`check-risk-${r.key}`}
                >
                  <input
                    type="checkbox"
                    checked={form.riskAcknowledgments[r.key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        riskAcknowledgments: {
                          ...form.riskAcknowledgments,
                          [r.key]: e.target.checked,
                        },
                      })
                    }
                    className="mt-1 accent-[#00F5D4]"
                  />
                  <div>
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="text-xs text-white/60 mt-0.5">
                      {r.body}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5" data-testid="saft-step-wallet">
              <H title="Wallet mapping" />
              <p className="text-sm text-white/60">
                Provide the wallet address that will receive your AICA
                allocation at TGE, or click <span className="text-white/80">Skip for now</span> to
                map your wallet later. You can update this any time
                before TGE.
              </p>
              <button
                type="button"
                onClick={() => {
                  setForm({ ...form, walletAddress: "", walletChain: "" });
                  setStep(step + 1);
                }}
                className="text-xs text-[#00F5D4] hover:underline"
                data-testid="button-skip-wallet"
              >
                Skip for now →
              </button>
              <div>
                <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                  Chain
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                  {WALLET_CHAINS.map((ch) => (
                    <label
                      key={ch.value}
                      className={`rounded-xl border p-3 cursor-pointer text-center ${
                        form.walletChain === ch.value
                          ? "border-[#00F5D4]/50 bg-[#00F5D4]/5"
                          : "border-white/10 bg-black/30 hover:border-white/20"
                      }`}
                      data-testid={`radio-chain-${ch.value}`}
                    >
                      <input
                        type="radio"
                        className="hidden"
                        checked={form.walletChain === ch.value}
                        onChange={() =>
                          setForm({ ...form, walletChain: ch.value })
                        }
                      />
                      <div className="text-sm font-medium">{ch.label}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">
                        {ch.hint}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <Field
                label="Wallet address"
                value={form.walletAddress}
                onChange={(v) => setForm({ ...form, walletAddress: v })}
                placeholder="0x... or chain-specific address"
                testId="input-wallet-address"
              />
              <p className="text-[11px] text-white/40">
                Triple-check this address. Tokens sent to the wrong
                address cannot be recovered.
              </p>
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/50 mb-2">
                  Vesting preview for this commitment
                </div>
                <VestingPreview totalTokens={c.tokenAllocation} compact />
              </div>
            </div>
          )}

          {step === 5 && (
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

          {step === 6 && (
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

          {step === 7 && (
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

              {/* Commitment ID / wire memo block */}
              <div
                className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#00F5D4]/30 bg-[#00F5D4]/5 p-4 text-left"
                data-testid="block-wire-memo"
              >
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#00F5D4]">
                  Use this as your wire reference / memo
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <code
                    className="font-mono text-sm sm:text-base text-white break-all"
                    data-testid="text-commitment-id"
                  >
                    {c.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(c.id)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/15 bg-black/30 text-xs text-white/80 hover:bg-white/[0.06]"
                    data-testid="button-copy-commitment-id"
                  >
                    Copy
                  </button>
                </div>
                <p className="mt-2 text-xs text-white/55">
                  Paste this Commitment ID exactly into the wire reference
                  / memo field so we can match your funds to your SAFT.
                </p>
              </div>

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
                <a
                  href={wireInstructionsPdfUrl(c.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-[#00F5D4]/40 bg-[#00F5D4]/10 text-[#00F5D4] hover:bg-[#00F5D4]/20"
                  data-testid="link-download-wire-instructions"
                >
                  Download wire transfer instructions (PDF)
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
              {step < STEPS.length - 2 ? (
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

function TokenMath({
  amountCents,
  tokenAllocation,
  roundSlug,
}: {
  amountCents: number;
  tokenAllocation: number;
  roundSlug: string;
}) {
  const round = useQuery({
    queryKey: ["rounds", "active"],
    queryFn: () =>
      api<{
        round: { slug: string; pricePerTokenCents: number; label: string };
      }>("/rounds/active"),
  });
  const pricePerTokenCents = round.data?.round.pricePerTokenCents ?? 10;
  const baseTokens = Math.floor(amountCents / pricePerTokenCents);
  const bonus = Math.max(0, tokenAllocation - baseTokens);
  const bonusPct =
    baseTokens > 0 ? Math.round((bonus / baseTokens) * 1000) / 10 : 0;
  const effectivePriceCents =
    tokenAllocation > 0 ? amountCents / tokenAllocation : pricePerTokenCents;
  const dollarsCommitted = (amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const pricePerTokenStr = `$${(pricePerTokenCents / 100).toFixed(2)}`;
  const effectivePriceStr = `$${effectivePriceCents.toFixed(4)}`;
  return (
    <div
      className="rounded-xl border border-[#00F5D4]/30 bg-[#00F5D4]/[0.04] p-4"
      data-testid="saft-token-math"
    >
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#00F5D4] mb-2">
        Token math
      </div>
      <div
        className="text-sm text-white/80 leading-relaxed"
        style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
      >
        If you commit{" "}
        <span className="text-white font-semibold">{dollarsCommitted}</span> at{" "}
        <span className="text-white font-semibold">{pricePerTokenStr}</span> per
        AICA, you receive{" "}
        <span className="text-white font-semibold">
          ~{tokenAllocation.toLocaleString()} AICA
        </span>{" "}
        in the {roundSlug} round.
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-lg border border-white/10 bg-black/30 p-2">
          <div className="text-white/40 uppercase tracking-[0.12em] text-[10px]">
            Base tokens
          </div>
          <div className="mt-0.5 text-white">
            {baseTokens.toLocaleString()} AICA
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 p-2">
          <div className="text-white/40 uppercase tracking-[0.12em] text-[10px]">
            Tier bonus
          </div>
          <div className="mt-0.5 text-[#00F5D4]">
            +{bonus.toLocaleString()} AICA
            {bonus > 0 && (
              <span className="text-white/50"> ({bonusPct}%)</span>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/30 p-2">
          <div className="text-white/40 uppercase tracking-[0.12em] text-[10px]">
            Effective price
          </div>
          <div className="mt-0.5 text-white">{effectivePriceStr} / AICA</div>
        </div>
      </div>
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
