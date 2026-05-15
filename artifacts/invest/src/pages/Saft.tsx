import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import VestingPreview from "@/components/VestingPreview";
import { useInvestSeo } from "@/lib/useInvestSeo";
import {
  ACCREDITATION_OPTIONS,
  ACK_LIST,
  PAYMENT_METHODS,
  RISK_DISCLOSURES,
  WALLET_CHAINS,
  type AckKey,
  type RiskKey,
} from "@/data/saftFields";
import {
  profileLegalName,
  profileDisplayName,
  type InvestorProfile,
} from "@/lib/profile";
import { ArrowRight, Check, FileText, Loader2 } from "lucide-react";

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

interface AllocationLine {
  roundSlug: string;
  roundLabel: string;
  tokens: number;
  usdCents: number;
  pricePerTokenMillicents: number;
}

interface SaftResponse {
  commitment: SaftCommitment;
  submission: {
    status: string;
    signatureName: string;
    signedAt: string;
  } | null;
  allocations: AllocationLine[];
  profile: InvestorProfile | null;
}

interface FormState {
  walletAddress: string;
  walletChain: string;
  paymentMethod: "fiat" | "card" | "ach" | "wire" | "crypto" | "";
  accreditationCategory: string;
  investmentExperience: string;
  relationshipToCompany: string;
  acknowledgments: Record<AckKey, boolean>;
  riskAcknowledgments: Record<RiskKey, boolean>;
  signatureName: string;
  signatureIntent: boolean;
}

const STEPS = [
  "Confirm details",
  "Allocation",
  "Questionnaire",
  "Risk",
  "Wallet",
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

function priceStr(millicents: number) {
  return `$${(millicents / 1000).toFixed(3)}`;
}

export default function Saft() {
  useInvestSeo({
    title: "SAFT",
    description:
      "Complete your Simple Agreement for Future Tokens - identity, address, KYC, payment method, accreditation, and signature.",
    path: "/saft",
  });
  const params = useParams<{ commitId: string }>();
  const commitId = params.commitId!;
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);

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

  const { data, isLoading } = useQuery({
    queryKey: ["saft", commitId],
    queryFn: () => api<SaftResponse>(`/saft/${commitId}`),
  });
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ user: { role: string } }>("/me"),
  });
  const isAdmin = me.data?.user.role === "admin";

  // Pre-fill signature with the legal name from profile.
  useEffect(() => {
    if (!data?.profile) return;
    setForm((f) =>
      f.signatureName ? f : { ...f, signatureName: profileLegalName(data.profile!) },
    );
  }, [data?.profile]);

  const submit = useMutation({
    mutationFn: () =>
      api<{ ok: boolean }>(`/saft/${commitId}`, {
        body: {
          walletAddress: form.walletAddress.trim() || undefined,
          walletChain: form.walletAddress.trim()
            ? form.walletChain
            : undefined,
          paymentMethod: form.paymentMethod || undefined,
          accreditationCategory: form.accreditationCategory,
          investmentExperience: form.investmentExperience,
          relationshipToCompany: form.relationshipToCompany,
          acknowledgments: form.acknowledgments,
          riskAcknowledgments: form.riskAcknowledgments,
          signatureName: form.signatureName,
          signatureIntent: form.signatureIntent,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me", "allocations"] });
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
  const profile = data?.profile;
  const allocations = data?.allocations ?? [];
  if (!c) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] text-white/60 flex items-center justify-center">
        Commitment not found.
      </div>
    );
  }
  if (!profile) {
    setLocation(`/profile?next=${encodeURIComponent(`/saft/${commitId}`)}`);
    return null;
  }

  const expectedSig = profileLegalName(profile);
  const allAcks = ACK_LIST.every((a) => form.acknowledgments[a.key]);
  const allRisks = RISK_DISCLOSURES.every(
    (r) => form.riskAcknowledgments[r.key],
  );
  const sigMatches =
    form.signatureName.trim().toLowerCase() === expectedSig.toLowerCase() &&
    expectedSig.length > 0;

  const canNext = (() => {
    switch (step) {
      case 0:
        return true; // confirm-details is read-only
      case 1:
        return Boolean(form.paymentMethod);
      case 2:
        return true; // Questionnaire is optional
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

  const totalCents = allocations.reduce((s, l) => s + l.usdCents, 0) || c.amountCents;
  const totalTokens = allocations.reduce((s, l) => s + l.tokens, 0) || c.tokenAllocation;

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />

      <PageHeader
        eyebrow={`Commitment ${c.id.slice(0, 8)} · Step 1 of 2`}
        title={<>Sign the SAFT.</>}
        subtitle={
          <>
            <span className="text-[#00F5D4] font-medium">{fmt(totalCents)}</span>{" "}
            <span className="text-white/30">·</span>{" "}
            {totalTokens.toLocaleString()} AICA across{" "}
            {allocations.length || 1} round
            {(allocations.length || 1) > 1 ? "s" : ""}
          </>
        }
        back={{ href: "/dashboard", label: "Back to dashboard" }}
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`/api/saft/${commitId}/draft.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00F5D4]/40 bg-[#00F5D4]/5 text-[11px] uppercase tracking-[0.2em] text-[#00F5D4] hover:bg-[#00F5D4]/10"
              data-testid="link-preview-saft-template"
              title="Download a SAFT pre-filled with your profile + commitment details (unsigned draft)"
            >
              <FileText className="w-3.5 h-3.5" /> Download my draft
            </a>
            <a
              href="/api/saft/template.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/[0.02] text-[11px] uppercase tracking-[0.2em] text-white/60 hover:bg-white/[0.05]"
              data-testid="link-blank-saft-template"
              title="Blank SAFT template (no investor data)"
            >
              <FileText className="w-3.5 h-3.5" /> Blank template
            </a>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-300/40 bg-amber-300/5 text-[11px] uppercase tracking-[0.2em] text-amber-300">
              Draft for counsel review
            </span>
          </div>
        }
      />

      <main className="mx-auto max-w-3xl px-6 py-10 md:py-12">
        <ol
          className="relative mb-10 grid gap-2 text-xs"
          style={{
            gridTemplateColumns: `repeat(${STEPS.length}, minmax(0, 1fr))`,
          }}
          aria-label="SAFT progress"
        >
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li
                key={s}
                className="flex flex-col items-center gap-2 min-w-0"
                data-testid={`step-${i}`}
              >
                <div className="relative w-full flex items-center">
                  <div
                    className={`h-px flex-1 ${
                      i === 0 ? "opacity-0" : done || active ? "bg-[#00F5D4]/40" : "bg-white/10"
                    }`}
                  />
                  <div
                    className={`relative z-10 w-7 h-7 rounded-full grid place-items-center text-[11px] font-medium border transition ${
                      active
                        ? "border-[#00F5D4] bg-[#00F5D4]/15 text-[#00F5D4] shadow-[0_0_14px_rgba(0,245,212,0.35)]"
                        : done
                          ? "border-[#00F5D4]/50 bg-[#00F5D4]/10 text-[#00F5D4]"
                          : "border-white/15 bg-white/[0.02] text-white/40"
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <div
                    className={`h-px flex-1 ${
                      i === STEPS.length - 1
                        ? "opacity-0"
                        : done
                          ? "bg-[#00F5D4]/40"
                          : "bg-white/10"
                    }`}
                  />
                </div>
                <span
                  className={`hidden sm:block text-center truncate w-full ${
                    active ? "text-[#00F5D4]" : done ? "text-white/70" : "text-white/40"
                  }`}
                  title={s}
                >
                  {s}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="brand-card p-6 md:p-8">
          {step === 0 && (
            <div className="space-y-5" data-testid="saft-step-confirm">
              <div className="flex items-start justify-between gap-3">
                <H title="Confirm your details" />
                <Link
                  href={`/profile?next=${encodeURIComponent(`/saft/${commitId}`)}`}
                  className="text-xs text-[#00F5D4] hover:underline"
                  data-testid="link-edit-profile"
                >
                  Edit profile →
                </Link>
              </div>
              <p className="text-sm text-white/55">
                These details are pulled from your investor profile and used
                to fill the SAFT. If any value is wrong, edit your profile
                first - we'll bring you right back.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <ReadOnly
                  label="Investor type"
                  value={profile.kind === "business" ? "Business / Entity" : "Individual"}
                />
                <ReadOnly label="Legal name" value={profileDisplayName(profile)} />
                {profile.kind === "business" && (
                  <>
                    <ReadOnly label="Entity type" value={profile.entityType ?? "-"} />
                    <ReadOnly
                      label="Jurisdiction"
                      value={profile.jurisdictionOfFormation ?? "-"}
                    />
                    <ReadOnly
                      label="Authorized signatory"
                      value={
                        `${profile.signatoryName ?? ""}${profile.signatoryTitle ? `, ${profile.signatoryTitle}` : ""}` ||
                        "-"
                      }
                    />
                  </>
                )}
                <ReadOnly label="Email" value={profile.email} />
                <ReadOnly
                  label="Phone"
                  value={profile.phone ?? "-"}
                />
                <ReadOnly
                  label="Address"
                  value={[
                    profile.addressLine1,
                    profile.addressLine2,
                    `${profile.city}, ${profile.region} ${profile.postalCode}`,
                    profile.country,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5" data-testid="saft-step-allocation">
              <H title="Your allocation" />
              <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.03] text-white/45 uppercase tracking-[0.14em] text-[10px]">
                    <tr>
                      <th className="text-left px-3 py-2">Round</th>
                      <th className="text-right px-3 py-2">Tokens</th>
                      <th className="text-right px-3 py-2">Price</th>
                      <th className="text-right px-3 py-2">USD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(allocations.length > 0
                      ? allocations
                      : [
                          {
                            roundSlug: c.roundSlug,
                            roundLabel: c.roundSlug,
                            tokens: c.tokenAllocation,
                            pricePerTokenMillicents: 0,
                            usdCents: c.amountCents,
                          },
                        ]
                    ).map((l) => (
                      <tr key={l.roundSlug} data-testid={`saft-line-${l.roundSlug}`}>
                        <td className="px-3 py-2">{l.roundLabel}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {l.tokens.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-white/60">
                          {l.pricePerTokenMillicents
                            ? priceStr(l.pricePerTokenMillicents)
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums text-[#00F5D4]">
                          {fmt(l.usdCents)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-white/[0.02] font-medium">
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {totalTokens.toLocaleString()}
                      </td>
                      <td className="px-3 py-2"></td>
                      <td className="px-3 py-2 text-right tabular-nums text-[#00F5D4]">
                        {fmt(totalCents)}
                      </td>
                    </tr>
                  </tbody>
                </table>
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
              <H title="Investor questionnaire (optional)" />
              <p className="text-sm text-white/55">
                Every field on this step is optional - skip any that don't
                apply and click Continue.
              </p>
              <div>
                <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                  Accreditation category (optional)
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
                placeholder="e.g. early-stage tokens, public equities"
              />
              <Field
                label="Relationship to AIcreatesAI (optional)"
                value={form.relationshipToCompany}
                onChange={(v) =>
                  setForm({ ...form, relationshipToCompany: v })
                }
                placeholder="e.g. introduced by, advisor"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3" data-testid="saft-step-risk">
              <H title="Risk disclosure" />
              <p className="text-sm text-white/60">
                Acknowledge each material risk before continuing.
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
                    <div className="text-xs text-white/60 mt-0.5">{r.body}</div>
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
                allocation at TGE, or skip to map later.
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
                Triple-check this address. Tokens sent to the wrong address
                cannot be recovered.
              </p>
              <div>
                <div className="text-[11px] uppercase tracking-[0.14em] text-white/50 mb-2">
                  Vesting preview for this commitment
                </div>
                <VestingPreview totalTokens={totalTokens} compact />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3" data-testid="saft-step-acknowledgments">
              <H title="Acknowledgments" />
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
                  <span className="text-sm text-white/85">{a.text}</span>
                </label>
              ))}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5" data-testid="saft-step-signature">
              <H title="Sign" />
              <p className="text-sm text-white/60">
                Type your full legal name to sign. This SAFT is a binding
                commitment to fund the amount above on the terms shown.
              </p>
              <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                  Expected signer
                </div>
                <div
                  className="mt-1 font-medium"
                  style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                  data-testid="text-expected-signer"
                >
                  {expectedSig || "(profile missing legal name)"}
                </div>
              </div>
              <Field
                label="Type your legal name to sign"
                value={form.signatureName}
                onChange={(v) => setForm({ ...form, signatureName: v })}
                testId="input-signature-name"
              />
              {!sigMatches && form.signatureName.length > 0 && (
                <p className="text-xs text-amber-300">
                  Signature must match the legal name above exactly.
                </p>
              )}
              <label
                className="flex items-start gap-3 rounded-xl border p-3 cursor-pointer border-white/10 bg-black/30"
                data-testid="check-sign-intent"
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
                  I intend my typed name above to act as my legally binding
                  electronic signature on this SAFT, under E-SIGN, UETA, and
                  any other applicable e-signature law.
                </span>
              </label>
            </div>
          )}

          {step === STEPS.length - 1 && (
            <div className="space-y-4" data-testid="saft-step-done">
              <H title="SAFT signed - ready for payment." />
              <p className="text-sm text-white/65">
                Your draft SAFT has been recorded. Continue to payment to
                lock in your allocation.
              </p>
              <Link
                href={`/checkout/${commitId}`}
                className="brand-cta inline-flex"
                data-testid="link-go-checkout"
              >
                Go to payment <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {step < STEPS.length - 1 && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="text-sm text-white/60 hover:text-white disabled:opacity-30"
              data-testid="button-back"
            >
              ← Back
            </button>
            {step < STEPS.length - 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext}
                className="brand-cta"
                data-testid="button-next"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => submit.mutate()}
                disabled={!canNext || submit.isPending}
                className="brand-cta"
                data-testid="button-submit-saft"
              >
                {submit.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing…
                  </>
                ) : (
                  <>
                    Sign SAFT <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </main>
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
        className="brand-input mt-1"
        data-testid={testId}
      />
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
