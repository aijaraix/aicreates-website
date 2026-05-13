import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import {
  ArrowRight,
  CreditCard,
  Building2,
  Loader2,
  Copy,
  CheckCircle2,
  Download,
  ImageIcon,
} from "lucide-react";
import {
  WIRE_INSTRUCTIONS,
  wireInstructionsPdfUrl,
  wireInstructionsImageUrl,
} from "@/data/rounds";

interface SaftResponse {
  commitment: {
    id: string;
    amountCents: number;
    tokenAllocation: number;
    displayName: string;
    state: string;
    status: string;
    paymentMethod: string | null;
    saftSignedAt: string | null;
  };
}

type Method = "fiat" | "wire";

const METHODS: Array<{
  value: Method;
  label: string;
  blurb: string;
  Icon: typeof CreditCard;
  recommendedAtCents: number;
}> = [
  {
    value: "fiat",
    label: "Fiat (card or ACH)",
    blurb: "Pay by card, Apple Pay, Google Pay, or US bank transfer (ACH). Pick the rail on the next screen.",
    Icon: CreditCard,
    recommendedAtCents: 0,
  },
  {
    value: "wire",
    label: "Bank Transfer (wire)",
    blurb: "Recommended for $25,000+. Real Bank of America wire instructions shown below.",
    Icon: Building2,
    recommendedAtCents: 2_500_000,
  },
];

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function Checkout() {
  const params = useParams<{ commitId: string }>();
  const commitId = params.commitId!;
  const [method, setMethod] = useState<Method>("fiat");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [manualConfirmed, setManualConfirmed] = useState<"wire" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["saft", commitId],
    queryFn: () => api<SaftResponse>(`/saft/${commitId}`),
  });
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ user: { role: string } }>("/me"),
  });
  const isAdmin = me.data?.user.role === "admin";

  const checkout = useMutation({
    mutationFn: () =>
      api<{ url?: string; wire?: boolean }>("/checkout", {
        body: { commitmentId: commitId, paymentMethod: method },
      }),
    onSuccess: (res) => {
      if (res.url) {
        window.location.href = res.url;
      } else if (res.wire) {
        setManualConfirmed("wire");
      }
    },
    onError: (err) => alert(`Checkout failed: ${(err as Error).message}`),
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] text-white/60 flex items-center justify-center">
        Loading…
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
  if (!c.saftSignedAt && c.state === "pending_saft") {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/60 mb-4">SAFT signing required first.</div>
          <Link href={`/saft/${commitId}`} className="brand-cta">
            Go to SAFT
          </Link>
        </div>
      </div>
    );
  }

  const recommended = [...METHODS]
    .reverse()
    .find((m) => c.amountCents >= m.recommendedAtCents)!;

  const onCopy = async (key: string, v: string) => {
    await navigator.clipboard.writeText(v);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1200);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />

      <PageHeader
        eyebrow={`Commitment ${c.id.slice(0, 8)} - Step 2 of 2`}
        title={<>Fund your commitment.</>}
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
      />

      <main className="mx-auto max-w-3xl px-6 py-10 md:py-12">
        {manualConfirmed ? (
          <div
            className="brand-card brand-hairline-teal p-6"
            data-testid={`${manualConfirmed}-confirmation`}
          >
            <CheckCircle2 className="w-8 h-8 text-[#00F5D4]" />
            <div className="mt-4 text-xl font-semibold">
              Wire commitment recorded - waiting admin confirmation.
            </div>
            <p className="mt-2 text-white/60 text-sm">
              Use your Commitment ID as the wire reference. Your dashboard will show "Pending - waiting admin confirmation" until an admin confirms the funds have arrived (typically 1-3 business days), at which point the row flips to Confirmed and your vesting schedule activates.
            </p>
            <Link href="/dashboard" className="brand-cta-outline mt-6">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-3" data-testid="checkout-method-picker">
            {METHODS.map((m) => {
              const isSelected = method === m.value;
              const isRecommended = m.value === recommended.value;
              return (
                <label
                  key={m.value}
                  className={`brand-card flex items-start gap-4 p-5 cursor-pointer transition ${
                    isSelected
                      ? "!border-[#00F5D4]/50 !bg-[#00F5D4]/5"
                      : "hover:!border-white/20"
                  }`}
                  data-testid={`radio-method-${m.value}`}
                >
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => setMethod(m.value)}
                    className="mt-1 accent-[#00F5D4]"
                  />
                  <m.Icon className="w-5 h-5 text-[#00F5D4] mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{m.label}</span>
                      {isRecommended && (
                        <span className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-[#00F5D4]/20 text-[#00F5D4]">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/50 mt-1">{m.blurb}</div>
                    {m.value === "wire" && (
                      <div className="text-[11px] text-white/40 mt-1.5 italic">
                        Bank transfers require manual verification. Allocation is reserved while we wait for the wire to clear (1-3 business days).
                      </div>
                    )}
                  </div>
                </label>
              );
            })}

            {method === "wire" && (
              <div
                className="relative rounded-2xl border border-[#00F5D4]/20 bg-gradient-to-b from-black/60 to-black/30 p-6 mt-4 shadow-[0_0_60px_-30px_rgba(0,245,212,0.5)]"
                data-testid="wire-instructions"
              >
                <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-white/5">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#00F5D4] mb-1">
                      Official wire instructions
                    </div>
                    <div className="font-display text-lg text-white">
                      AIcreatesAI - Funding instructions
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      Held until SAFT confirmation. Use the reference value below on your wire.
                    </div>
                  </div>
                  <div className="hidden sm:block text-right text-[10px] uppercase tracking-[0.2em] text-white/40">
                    Doc ID
                    <div className="font-mono text-white/60 normal-case tracking-normal text-xs mt-1">
                      {c.id.slice(0, 8)}
                    </div>
                  </div>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {Object.entries({
                    Beneficiary: WIRE_INSTRUCTIONS.beneficiary,
                    "Beneficiary address": WIRE_INSTRUCTIONS.beneficiaryAddress,
                    Bank: WIRE_INSTRUCTIONS.bankName,
                    "Bank branch": WIRE_INSTRUCTIONS.bankBranch,
                    Account: WIRE_INSTRUCTIONS.accountNumber,
                    "Wire routing": WIRE_INSTRUCTIONS.routingNumber,
                    "ACH routing": WIRE_INSTRUCTIONS.achRouting,
                    "SWIFT (USD)": WIRE_INSTRUCTIONS.swift,
                    "SWIFT (foreign currency)": WIRE_INSTRUCTIONS.swiftForeign,
                    "Intermediary (USD)": WIRE_INSTRUCTIONS.intermediaryUS,
                    "Intermediary (foreign)": WIRE_INSTRUCTIONS.intermediaryForeign,
                  }).map(([k, v]) => (
                    <div key={k} className="group">
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40 flex items-center justify-between">
                        <span>{k}</span>
                        <button
                          type="button"
                          onClick={() => onCopy(k, v)}
                          className="opacity-0 group-hover:opacity-100 transition px-1.5 py-0.5 text-[10px] rounded border border-white/10 hover:bg-white/[0.06] inline-flex items-center gap-1"
                          data-testid={`copy-wire-${k.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`}
                        >
                          {copiedKey === k ? "Copied" : <Copy className="w-3 h-3" />}
                        </button>
                      </dt>
                      <dd className="font-mono text-white/80 break-all">{v}</dd>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                      Reference / memo (use this exact value)
                    </dt>
                    <dd className="mt-1 inline-flex items-center gap-2 rounded-lg border border-[#00F5D4]/30 bg-[#00F5D4]/5 px-3 py-2 font-mono text-[#00F5D4]">
                      {c.id}
                      <button
                        onClick={() => onCopy("ref", c.id)}
                        className="ml-2 px-2 py-0.5 text-xs rounded border border-white/10 hover:bg-white/[0.04]"
                        data-testid="copy-wire-reference"
                      >
                        {copiedKey === "ref" ? "Copied" : <Copy className="w-3 h-3" />}
                      </button>
                    </dd>
                    <div className="mt-1 text-[11px] text-white/45">
                      Memo guidance: {WIRE_INSTRUCTIONS.memo}.
                    </div>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={wireInstructionsPdfUrl(c.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-full teal-btn text-sm"
                    data-testid="link-wire-instructions-pdf"
                  >
                    <Download className="w-3.5 h-3.5" /> Download wire instructions (PDF)
                  </a>
                  <a
                    href={wireInstructionsImageUrl(c.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-full glass-btn text-sm"
                    data-testid="link-wire-instructions-image"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> View as image
                  </a>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => checkout.mutate()}
              disabled={checkout.isPending}
              className="brand-cta w-full mt-6 !h-12"
              data-testid="button-checkout-pay"
            >
              {checkout.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing…
                </>
              ) : method === "wire" ? (
                <>
                  I&apos;ve sent the wire - confirm payment <ArrowRight className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  Pay {fmt(c.amountCents)} - Card or ACH
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
