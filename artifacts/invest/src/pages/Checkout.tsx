import { useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import {
  ArrowRight,
  Banknote,
  CreditCard,
  Bitcoin,
  Building2,
  Loader2,
  Copy,
  CheckCircle2,
  Download,
  ImageIcon,
} from "lucide-react";
import {
  WIRE_INSTRUCTIONS,
  CRYPTO_INSTRUCTIONS,
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

type Method = "card" | "ach" | "wire" | "crypto";

const METHODS: Array<{
  value: Method;
  label: string;
  blurb: string;
  Icon: typeof CreditCard;
  recommendedAtCents: number;
}> = [
  {
    value: "card",
    label: "Card",
    blurb: "Fastest. Settles instantly.",
    Icon: CreditCard,
    recommendedAtCents: 0,
  },
  {
    value: "ach",
    label: "ACH bank transfer",
    blurb: "Recommended for $5,000+. 3-5 business days.",
    Icon: Banknote,
    recommendedAtCents: 500_000,
  },
  {
    value: "wire",
    label: "Wire transfer",
    blurb: "Recommended for $25,000+. Bank instructions on confirmation.",
    Icon: Building2,
    recommendedAtCents: 2_500_000,
  },
  {
    value: "crypto",
    label: "Crypto (USDC)",
    blurb: "Manually escrowed. Address sent by email after confirmation.",
    Icon: Bitcoin,
    recommendedAtCents: 0,
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
  const [method, setMethod] = useState<Method>("card");
  const [copied, setCopied] = useState(false);
  const [manualConfirmed, setManualConfirmed] = useState<
    "wire" | "crypto" | null
  >(null);

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
      api<{ url?: string; wire?: boolean; crypto?: boolean }>("/checkout", {
        body: { commitmentId: commitId, paymentMethod: method },
      }),
    onSuccess: (res) => {
      if (res.url) {
        window.location.href = res.url;
      } else if (res.wire) {
        setManualConfirmed("wire");
      } else if (res.crypto) {
        setManualConfirmed("crypto");
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

  const onCopy = async (v: string) => {
    await navigator.clipboard.writeText(v);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
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
              {manualConfirmed === "wire"
                ? "Wire commitment recorded."
                : "Crypto commitment recorded."}
            </div>
            <p className="mt-2 text-white/60 text-sm">
              {manualConfirmed === "wire"
                ? "Use your Commitment ID as the wire reference. Your dashboard will move to \"Funded\" once we confirm receipt."
                : "Our team will reply to your account email with the escrow address. Your dashboard will move to \"Funded\" once on-chain confirmations are finalized."}
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
                  </div>
                </label>
              );
            })}

            {method === "crypto" && (
              <div
                className="brand-card p-5 mt-4"
                data-testid="crypto-instructions"
              >
                <div className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">
                  Crypto instructions (USDC, manually escrowed)
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {Object.entries({
                    Asset: CRYPTO_INSTRUCTIONS.asset,
                    Network: CRYPTO_INSTRUCTIONS.network,
                    "Escrow address": CRYPTO_INSTRUCTIONS.escrowAddress,
                    Contact: CRYPTO_INSTRUCTIONS.contact,
                  }).map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        {k}
                      </dt>
                      <dd className="text-white/80">{v}</dd>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                      Memo / reference (use this exact value)
                    </dt>
                    <dd className="mt-1 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-[#00F5D4]">
                      {c.id}
                      <button
                        onClick={() => onCopy(c.id)}
                        className="ml-2 px-2 py-0.5 text-xs rounded border border-white/10 hover:bg-white/[0.04]"
                      >
                        {copied ? "Copied" : <Copy className="w-3 h-3" />}
                      </button>
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-[11px] text-white/40">
                  Stripe Pay-with-Crypto is not available everywhere, so we
                  handle crypto via a manual escrow flow. After you confirm,
                  we will email the escrow address from {CRYPTO_INSTRUCTIONS.contact}.
                </p>
              </div>
            )}

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
                    <div key={k}>
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                        {k}
                      </dt>
                      <dd className="font-mono text-white/80">{v}</dd>
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">
                      Reference (use this exact value)
                    </dt>
                    <dd className="mt-1 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-[#00F5D4]">
                      {c.id}
                      <button
                        onClick={() => onCopy(c.id)}
                        className="ml-2 px-2 py-0.5 text-xs rounded border border-white/10 hover:bg-white/[0.04]"
                      >
                        {copied ? "Copied" : <Copy className="w-3 h-3" />}
                      </button>
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={wireInstructionsPdfUrl(c.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-full border border-[#00F5D4]/40 bg-[#00F5D4]/10 text-[#00F5D4] text-sm hover:bg-[#00F5D4]/20"
                    data-testid="link-wire-instructions-pdf"
                  >
                    <Download className="w-3.5 h-3.5" /> Download wire instructions (PDF)
                  </a>
                  <a
                    href={wireInstructionsImageUrl(c.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 h-9 rounded-full border border-white/15 bg-white/[0.02] text-white/80 text-sm hover:bg-white/[0.06]"
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
                  Confirm wire commitment <ArrowRight className="ml-2 w-4 h-4" />
                </>
              ) : method === "crypto" ? (
                <>
                  Confirm crypto commitment <ArrowRight className="ml-2 w-4 h-4" />
                </>
              ) : (
                <>
                  Pay {fmt(c.amountCents)} via {METHODS.find((m) => m.value === method)?.label}
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
