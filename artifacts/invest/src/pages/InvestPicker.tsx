import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { tokensForAmount } from "@/lib/vesting";
import { ROUNDS } from "@/data/rounds";
import RoundContext from "@/components/RoundContext";
import VestingPreview from "@/components/VestingPreview";
import PortalNav from "@/components/PortalNav";

interface Tier {
  slug: string;
  displayName: string;
  description: string;
  amountCents: number;
  currency: string;
  tokenAllocation: number;
}

interface Commitment {
  id: string;
}

interface MeResponse {
  user: { role: string };
}

interface Application {
  id: string;
  status: string;
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function InvestPicker() {
  const [, setLocation] = useLocation();
  const [pending, setPending] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(50_000);
  const [round] = useState(ROUNDS[0]!.slug);
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });
  const gateway = useQuery({
    queryKey: ["me", "gateway"],
    queryFn: () => api<{ application: Application | null }>("/me/gateway"),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["tiers"],
    queryFn: () => api<{ tiers: Tier[] }>("/tiers"),
  });

  const create = useMutation({
    mutationFn: async (args: {
      tierSlug?: string;
      customAmountCents?: number;
      key: string;
    }) => {
      setPending(args.key);
      const res = await api<{ commitment: Commitment }>("/commitments", {
        body: {
          tierSlug: args.tierSlug,
          customAmountCents: args.customAmountCents,
          roundSlug: round,
        },
      });
      return res.commitment;
    },
    onSuccess: (commit) => {
      setLocation(`/saft/${commit.id}`);
    },
    onError: (err) => {
      setPending(null);
      const msg = (err as Error).message;
      if (msg.includes("gateway_required") || msg.includes("Gateway")) {
        setLocation("/gateway");
        return;
      }
      alert(`Could not start commitment: ${msg}`);
    },
  });

  const tiers = data?.tiers ?? [];
  const isAdmin = me.data?.user.role === "admin";
  const needsGateway = gateway.data && gateway.data.application === null;

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />

      <main className="mx-auto max-w-6xl px-6 py-10 md:py-14 space-y-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <RoundContext />

        {needsGateway && (
          <div
            className="rounded-2xl border border-[#00F5D4]/30 bg-[#00F5D4]/5 p-5 flex flex-wrap items-center justify-between gap-4"
            data-testid="block-gateway-required"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#00F5D4] mt-0.5" />
              <div>
                <div className="font-medium">
                  Complete the AI Allocation Gateway
                </div>
                <div className="text-sm text-white/60">
                  A short intake helps us route and prioritize your
                  commitment. Takes about 2 minutes.
                </div>
              </div>
            </div>
            <Link
              href="/gateway"
              className="inline-flex items-center px-4 h-10 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90"
              data-testid="link-go-gateway"
            >
              Start gateway <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 items-start">
          <div>
            <div className="mb-6">
              <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                Choose your commitment
              </div>
              <h1
                className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                Pick a <span className="text-[#00F5D4]">tier</span>.
              </h1>
              <p className="mt-3 text-white/60 max-w-xl">
                Pick a tier or enter a custom amount. We'll route you to
                the SAFT after you reserve.
              </p>
            </div>

            {isLoading ? (
              <div className="text-white/50">Loading tiers...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tiers.map((t) => (
                  <div
                    key={t.slug}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col hover:border-[#00F5D4]/30 transition"
                    data-testid={`card-tier-${t.slug}`}
                  >
                    <h3
                      className="text-lg font-semibold"
                      style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                    >
                      {t.displayName}
                    </h3>
                    <div className="mt-2 text-2xl font-semibold text-[#00F5D4]">
                      {fmt(t.amountCents)}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                      {t.tokenAllocation.toLocaleString()} AICA
                    </div>
                    {t.description && (
                      <p className="mt-3 text-sm text-white/60 flex-1">
                        {t.description}
                      </p>
                    )}
                    <button
                      disabled={create.isPending || Boolean(needsGateway)}
                      onClick={() =>
                        create.mutate({ tierSlug: t.slug, key: t.slug })
                      }
                      className="mt-5 inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition disabled:opacity-50"
                      data-testid={`button-commit-${t.slug}`}
                    >
                      {pending === t.slug ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Reserving…
                        </>
                      ) : (
                        "Reserve"
                      )}
                    </button>
                  </div>
                ))}
                <div
                  className="rounded-2xl border border-[#00F5D4]/30 bg-gradient-to-br from-[#00F5D4]/5 to-transparent p-6 flex flex-col"
                  data-testid="card-tier-custom"
                >
                  <h3
                    className="text-lg font-semibold"
                    style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                  >
                    Custom amount
                  </h3>
                  <div className="mt-2 text-2xl font-semibold text-[#00F5D4]">
                    {fmt(customAmount * 100)}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                    ~{tokensForAmount(customAmount).toLocaleString()} AICA
                  </div>
                  <div className="mt-3">
                    <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                      Amount (USD)
                    </label>
                    <input
                      type="number"
                      min={1000}
                      max={10_000_000}
                      step={1000}
                      value={customAmount}
                      onChange={(e) =>
                        setCustomAmount(
                          Math.max(0, Math.floor(Number(e.target.value) || 0)),
                        )
                      }
                      className="w-full mt-1 h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none focus:border-[#00F5D4]/40"
                      data-testid="input-custom-amount"
                    />
                    <p className="mt-2 text-[11px] text-white/40">
                      Min $1,000 - Max $10,000,000
                    </p>
                  </div>
                  <button
                    disabled={
                      create.isPending ||
                      Boolean(needsGateway) ||
                      customAmount < 1000 ||
                      customAmount > 10_000_000
                    }
                    onClick={() =>
                      create.mutate({
                        customAmountCents: customAmount * 100,
                        key: "custom",
                      })
                    }
                    className="mt-5 inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition disabled:opacity-50"
                    data-testid="button-commit-custom"
                  >
                    {pending === "custom" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Reserving…
                      </>
                    ) : (
                      "Reserve custom amount"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <VestingPreview totalTokens={tokensForAmount(customAmount)} />
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-xs text-white/50 leading-relaxed">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2">
                Token math
              </div>
              <ul className="space-y-1">
                <li>1 AICA = $1.00 USD base price.</li>
                <li>+10% allocation bonus at $5,000.</li>
                <li>+20% allocation bonus at $25,000.</li>
                <li>25% unlocks at TGE, 6-month cliff, then 24-month linear.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
