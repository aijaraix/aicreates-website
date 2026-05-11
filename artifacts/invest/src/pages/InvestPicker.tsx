import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { tokensForAmount } from "@/lib/vesting";
import { ROUNDS } from "@/data/rounds";

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
      alert(`Could not start commitment: ${(err as Error).message}`);
    },
  });

  const tiers = data?.tiers ?? [];

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-white/5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <span className="text-xs uppercase tracking-[0.2em] text-white/40">
          {ROUNDS.find((r) => r.slug === round)?.name}
        </span>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4]" />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
              Founders Commitment
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            Choose your <span className="text-[#00F5D4]">commitment</span>.
          </h1>
          <p className="mt-4 text-white/60">
            Pick a tier or enter a custom amount. We'll route you to the SAFT
            after you reserve.
          </p>
        </div>

        {isLoading ? (
          <div className="text-white/50">Loading tiers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiers.map((t) => (
              <div
                key={t.slug}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col hover:border-[#00F5D4]/30 transition"
                data-testid={`card-tier-${t.slug}`}
              >
                <h3
                  className="text-xl font-semibold"
                  style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                >
                  {t.displayName}
                </h3>
                <div className="mt-3 text-3xl font-semibold text-[#00F5D4]">
                  {fmt(t.amountCents)}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                  {t.tokenAllocation.toLocaleString()} AICA
                </div>
                {t.description && (
                  <p className="mt-4 text-sm text-white/60 flex-1">
                    {t.description}
                  </p>
                )}
                <button
                  disabled={create.isPending}
                  onClick={() =>
                    create.mutate({ tierSlug: t.slug, key: t.slug })
                  }
                  className="mt-6 inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition disabled:opacity-50"
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

            {/* Custom amount card */}
            <div
              className="rounded-2xl border border-[#00F5D4]/30 bg-gradient-to-br from-[#00F5D4]/5 to-transparent p-7 flex flex-col"
              data-testid="card-tier-custom"
            >
              <h3
                className="text-xl font-semibold"
                style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
              >
                Custom amount
              </h3>
              <div className="mt-3 text-3xl font-semibold text-[#00F5D4]">
                {fmt(customAmount * 100)}
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                ~{tokensForAmount(customAmount).toLocaleString()} AICA
              </div>
              <div className="mt-4">
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
                  customAmount < 1000 ||
                  customAmount > 10_000_000
                }
                onClick={() =>
                  create.mutate({
                    customAmountCents: customAmount * 100,
                    key: "custom",
                  })
                }
                className="mt-6 inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition disabled:opacity-50"
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
      </main>
    </div>
  );
}
