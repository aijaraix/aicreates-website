import { Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

interface Tier {
  productId: string;
  name: string;
  description: string | null;
  priceId: string | null;
  amountCents: number | null;
  currency: string | null;
  metadata: Record<string, string> | null;
}

function formatMoney(cents: number | null, currency: string | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function InvestPicker() {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["tiers"],
    queryFn: () => api<{ tiers: Tier[] }>("/tiers"),
  });

  const checkout = useMutation({
    mutationFn: async (priceId: string) => {
      setPendingId(priceId);
      const res = await api<{ url: string }>("/checkout", {
        body: { priceId },
      });
      return res.url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (err) => {
      setPendingId(null);
      alert(`Checkout failed: ${(err as Error).message}`);
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
            Choose your <span className="text-[#00F5D4]">commitment tier</span>.
          </h1>
          <p className="mt-4 text-white/60">
            Reserve your allocation in the AICreatesAi $50M raise. All
            commitments are refundable until definitive documents are signed.
            This is not an offer to sell securities.
          </p>
        </div>

        {isLoading ? (
          <div className="text-white/50">Loading tiers...</div>
        ) : tiers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-white/60">
            <p className="font-medium text-white">Tiers not yet available.</p>
            <p className="mt-2 text-sm">
              The Stripe integration is still being configured. Please check
              back shortly, or contact{" "}
              <a
                href="mailto:sholom@aicreates.ai"
                className="text-[#00F5D4] hover:underline"
              >
                sholom@aicreates.ai
              </a>{" "}
              to commit directly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((t) => (
              <div
                key={t.productId}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col hover:border-[#00F5D4]/30 transition"
                data-testid={`card-tier-${t.priceId ?? t.productId}`}
              >
                <h3
                  className="text-xl font-semibold"
                  style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                >
                  {t.name}
                </h3>
                <div className="mt-3 text-3xl font-semibold text-[#00F5D4]">
                  {formatMoney(t.amountCents, t.currency)}
                </div>
                {t.description && (
                  <p className="mt-3 text-sm text-white/60 flex-1">
                    {t.description}
                  </p>
                )}
                <button
                  disabled={!t.priceId || checkout.isPending}
                  onClick={() => t.priceId && checkout.mutate(t.priceId)}
                  className="mt-6 inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid={`button-commit-${t.priceId ?? t.productId}`}
                >
                  {pendingId === t.priceId && checkout.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting…
                    </>
                  ) : (
                    "Commit this tier"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
