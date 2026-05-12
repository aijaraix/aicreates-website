import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { tokensForAmount } from "@/lib/vesting";
import { ROUNDS } from "@/data/rounds";

interface ActiveRoundResp {
  round: { slug: string; pricePerTokenMillicents: number; label: string };
}
import RoundContext from "@/components/RoundContext";
import VestingPreview from "@/components/VestingPreview";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";

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
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });
  const activeRound = useQuery({
    queryKey: ["rounds", "active"],
    queryFn: () => api<ActiveRoundResp>("/rounds/active"),
  });
  const round = activeRound.data?.round.slug ?? ROUNDS[0]!.slug;
  const pricePerTokenMillicents =
    activeRound.data?.round.pricePerTokenMillicents ?? 15;
  const priceLabel = `$${(pricePerTokenMillicents / 1000).toFixed(3)}`;
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

      <PageHeader
        eyebrow="Reserve allocation"
        title={<>Pick a tier.</>}
        subtitle="Choose a published tier or enter a custom amount. We'll route you straight to the SAFT after you reserve."
        back={{ href: "/dashboard", label: "Back to dashboard" }}
      />

      <main className="mx-auto max-w-6xl px-6 py-10 md:py-12 space-y-10">
        <RoundContext />

        <div
          className="rounded-2xl border border-[#00F5D4]/40 bg-gradient-to-br from-[#00F5D4]/[0.12] via-[#00F5D4]/[0.04] to-transparent p-5 md:p-6 flex flex-wrap items-center justify-between gap-4"
          data-testid="banner-bonus-promo"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-[#00F5D4] mt-0.5 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#00F5D4]">
                Strategic Seed bonus
              </div>
              <div
                className="mt-1 text-base md:text-lg font-semibold text-white"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                +10% allocation at $5,000 - +20% allocation at $25,000
              </div>
              <div className="mt-1 text-xs text-white/55">
                Bonuses apply automatically when you commit at or above the
                threshold. Above $25,000 we negotiate terms directly.
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40">
              Round price
            </div>
            <div
              className="text-2xl font-semibold text-white"
              style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
            >
              {priceLabel} <span className="text-sm text-white/50">/ AICA</span>
            </div>
          </div>
        </div>

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
              className="brand-cta"
              data-testid="link-go-gateway"
            >
              Start gateway <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6 items-start">
          <div>
            {isLoading ? (
              <div className="text-white/50">Loading tiers...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tiers.map((t) => (
                  <div
                    key={t.slug}
                    className="brand-card brand-hairline-teal p-6 flex flex-col hover:border-[#00F5D4]/40 transition"
                    data-testid={`card-tier-${t.slug}`}
                  >
                    <h3 className="font-display text-lg font-semibold tracking-tight">
                      {t.displayName}
                    </h3>
                    <div className="mt-2 font-display text-3xl font-semibold tracking-tight text-gradient-teal">
                      {fmt(t.amountCents)}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">
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
                      className="brand-cta mt-5"
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
                  className="brand-card-teal brand-hairline-teal p-6 flex flex-col"
                  data-testid="card-tier-custom"
                >
                  <h3 className="font-display text-lg font-semibold tracking-tight">
                    Custom amount
                  </h3>
                  <div className="mt-2 font-display text-3xl font-semibold tracking-tight text-gradient-teal">
                    {fmt(customAmount * 100)}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">
                    ~{tokensForAmount(customAmount, pricePerTokenMillicents).toLocaleString()} AICA
                  </div>
                  <div className="mt-3">
                    <label className="text-[11px] uppercase tracking-[0.14em] text-white/55">
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
                      className="brand-input mt-1"
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
                    className="brand-cta mt-5"
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
            <VestingPreview totalTokens={tokensForAmount(customAmount, pricePerTokenMillicents)} />
            <div className="brand-card p-5 text-xs text-white/50 leading-relaxed">
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2">
                Token math
              </div>
              <ul className="space-y-1">
                <li>1 AICA = {priceLabel} USD (Strategic Seed Round price).</li>
                <li>+10% allocation bonus at $5,000.</li>
                <li>+20% allocation bonus at $25,000.</li>
                <li>25% unlocks at TGE, 6-month cliff, then 24-month linear.</li>
                <li>
                  Total private sale: 1.25B AICA across 5 rounds at $0.015 -
                  $0.070 per AICA.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
