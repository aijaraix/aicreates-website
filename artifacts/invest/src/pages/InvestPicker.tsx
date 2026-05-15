import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowRight, Loader2, Sparkles, Wand2, AlertTriangle } from "lucide-react";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import VestingPreview from "@/components/VestingPreview";
import { useInvestSeo } from "@/lib/useInvestSeo";

interface RoundAvailability {
  slug: string;
  label: string;
  pricePerTokenMillicents: number;
  capacity: number;
  reserved: number;
  available: number;
  open: boolean;
  status: "upcoming" | "open" | "closed";
}

interface MeResponse {
  user: { role: string };
}

interface CommitResp {
  commitment: { id: string };
}

interface CapacityViolation {
  roundSlug: string;
  requested: number;
  available: number;
}

const DEFAULT_MIN_USD = 250;
const MAX_USD = 10_000_000;

interface InvestLimits {
  minCents: number;
  maxCents: number;
  fundedCount: number;
  testMode: boolean;
  testPurchasesRemaining: number;
}

function fmtUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function priceLabel(millicents: number) {
  return `$${(millicents / 1000).toFixed(3)}`;
}

function tokensFromUsdCents(usdCents: number, millicents: number): number {
  if (millicents <= 0 || usdCents <= 0) return 0;
  // Round UP so a user entering exactly the $1k minimum lands at >= $1k
  // after token quantization, instead of $999.99 which silently fails
  // the MIN_USD check and disables Continue.
  return Math.ceil((usdCents * 10) / millicents);
}

function usdCentsFromTokens(tokens: number, millicents: number): number {
  return Math.round((tokens * millicents) / 10);
}

function bonusForUsd(usd: number): number {
  if (usd >= 25_000) return 0.2;
  if (usd >= 5_000) return 0.1;
  return 0;
}

interface CartLine {
  roundSlug: string;
  tokens: number;
  usdCents: number;
}

export default function InvestPicker() {
  useInvestSeo({
    title: "Reserve Allocation",
    description:
      "Pick your AICA tier or enter a custom amount. Bonus tokens at $5k and $25k.",
    path: "/invest",
  });
  const [, setLocation] = useLocation();
  const [byRoundLine, setByRoundLine] = useState<Record<string, CartLine>>({});
  const [violations, setViolations] = useState<CapacityViolation[]>([]);
  const [confirmRevised, setConfirmRevised] = useState(false);

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });

  const availability = useQuery({
    queryKey: ["rounds", "availability"],
    queryFn: () =>
      api<{ rounds: RoundAvailability[] }>("/rounds/availability"),
    refetchInterval: 30_000,
  });

  const limitsQ = useQuery({
    queryKey: ["invest", "limits"],
    queryFn: () => api<InvestLimits>("/invest/limits"),
  });
  const minCents = limitsQ.data?.minCents ?? DEFAULT_MIN_USD * 100;
  const testMode = limitsQ.data?.testMode ?? false;
  const testPurchasesRemaining = limitsQ.data?.testPurchasesRemaining ?? 0;

  const rounds = availability.data?.rounds ?? [];
  const isAdmin = me.data?.user.role === "admin";

  const byRound = useMemo(() => {
    const m = new Map<string, RoundAvailability>();
    for (const r of rounds) m.set(r.slug, r);
    return m;
  }, [rounds]);

  // Initialize one fixed row per round (zeroed) once availability loads.
  useEffect(() => {
    if (rounds.length === 0) return;
    setByRoundLine((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const r of rounds) {
        if (!next[r.slug]) {
          next[r.slug] = { roundSlug: r.slug, tokens: 0, usdCents: 0 };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [rounds]);

  // Honor `?round=<slug>` from the dashboard Commit buttons by pre-filling
  // that round at the minimum allowed amount. One-shot per slug.
  const [prefillSlug, setPrefillSlug] = useState<string | null>(null);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const slug = sp.get("round");
    if (slug) setPrefillSlug(slug);
  }, []);
  useEffect(() => {
    if (!prefillSlug || rounds.length === 0) return;
    const round = rounds.find((r) => r.slug === prefillSlug);
    if (!round || !round.open) {
      setPrefillSlug(null);
      return;
    }
    setByRoundLine((prev) => {
      const existing = prev[round.slug];
      if (existing && existing.usdCents > 0) return prev;
      const tokens = tokensFromUsdCents(minCents, round.pricePerTokenMillicents);
      const usdCents = usdCentsFromTokens(tokens, round.pricePerTokenMillicents);
      return {
        ...prev,
        [round.slug]: { roundSlug: round.slug, tokens, usdCents },
      };
    });
    setPrefillSlug(null);
  }, [prefillSlug, rounds]);

  const cart: CartLine[] = rounds
    .map((r) => byRoundLine[r.slug])
    .filter((l): l is CartLine => Boolean(l));

  const totalCents = cart.reduce((s, l) => s + l.usdCents, 0);
  const totalTokens = cart.reduce((s, l) => s + l.tokens, 0);
  const totalUsd = totalCents / 100;
  const bonusRate = bonusForUsd(totalUsd);
  const bonusTokens = Math.floor(totalTokens * bonusRate);

  function patchLine(slug: string, patch: Partial<CartLine>) {
    setByRoundLine((m) => ({
      ...m,
      [slug]: { ...(m[slug] ?? { roundSlug: slug, tokens: 0, usdCents: 0 }), ...patch },
    }));
    setViolations([]);
    setConfirmRevised(false);
  }

  function setUsdForLine(slug: string, usdDollars: number, round: RoundAvailability) {
    const usdCents = Math.max(0, Math.floor(usdDollars * 100));
    const tokens = tokensFromUsdCents(usdCents, round.pricePerTokenMillicents);
    const finalCents = usdCentsFromTokens(tokens, round.pricePerTokenMillicents);
    patchLine(slug, { tokens, usdCents: finalCents });
  }

  function setTokensForLine(slug: string, tokens: number, round: RoundAvailability) {
    const t = Math.max(0, Math.floor(tokens));
    patchLine(slug, {
      tokens: t,
      usdCents: usdCentsFromTokens(t, round.pricePerTokenMillicents),
    });
  }

  function useMaxForLine(slug: string, round: RoundAvailability) {
    setTokensForLine(slug, round.available, round);
  }

  const create = useMutation({
    mutationFn: () => {
      const allocations = cart
        .filter((l) => l.tokens > 0 && l.usdCents > 0)
        .map((l) => ({
          roundSlug: l.roundSlug,
          tokens: l.tokens,
          usdCents: l.usdCents,
        }));
      return api<CommitResp>("/commitments", { body: { allocations } });
    },
    onSuccess: (resp) => {
      setLocation(`/saft/${resp.commitment.id}`);
    },
    onError: async (err) => {
      const msg = (err as Error).message;
      const match = msg.match(/\{.*\}/s);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]) as {
            code?: string;
            violations?: CapacityViolation[];
          };
          if (parsed.code === "capacity_exceeded" && parsed.violations) {
            setByRoundLine((m) => {
              const next = { ...m };
              for (const v of parsed.violations!) {
                const round = byRound.get(v.roundSlug);
                if (!round) continue;
                next[v.roundSlug] = {
                  roundSlug: v.roundSlug,
                  tokens: v.available,
                  usdCents: usdCentsFromTokens(
                    v.available,
                    round.pricePerTokenMillicents,
                  ),
                };
              }
              return next;
            });
            setViolations(parsed.violations);
            setConfirmRevised(true);
            availability.refetch();
            return;
          }
          if (parsed.code === "profile_required") {
            setLocation(`/profile?next=${encodeURIComponent("/invest")}`);
            return;
          }
        } catch {
          // ignore parse failures
        }
      }
      alert(`Could not create commitment: ${msg}`);
    },
  });

  const overflowSlugs = cart
    .filter((l) => {
      const r = byRound.get(l.roundSlug);
      return r ? l.tokens > r.available : false;
    })
    .map((l) => l.roundSlug);

  const totalsValid = totalCents >= minCents && totalCents <= MAX_USD * 100;
  const canSubmit =
    totalsValid &&
    cart.some((l) => l.tokens > 0) &&
    overflowSlugs.length === 0 &&
    !create.isPending &&
    (violations.length === 0 || confirmRevised);

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />
      <PageHeader
        eyebrow="Reserve allocation"
        title={<>Build your allocation.</>}
        subtitle="Commit across one or more rounds. We auto-route each line at the round's price, then walk you through a single SAFT covering the entire commitment."
        back={{ href: "/dashboard", label: "Back to dashboard" }}
      />

      <main className="mx-auto max-w-5xl px-6 py-8 md:py-12 space-y-8 pb-40">
        <div
          className="rounded-2xl border border-[#00F5D4]/30 bg-[#00F5D4]/5 p-5 flex flex-wrap items-start gap-3"
          data-testid="banner-bonus-promo"
        >
          <Sparkles className="w-5 h-5 text-[#00F5D4] mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0 text-sm">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#00F5D4]">
              Cart bonuses
            </div>
            <div className="mt-1 text-white/85">
              +10% allocation on totals at <strong>$5,000</strong> · +20%
              allocation on totals at <strong>$25,000</strong>. Bonus is added
              on top of the per-round token math.
            </div>
          </div>
        </div>

        <section className="brand-card p-0 overflow-hidden">
          <header className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="text-xs uppercase tracking-[0.18em] text-white/50">
              Allocation cart
            </div>
            <div className="text-[11px] text-white/45 mt-0.5">
              One row per round. Enter tokens or USD on each row you want to
              participate in. Rows turn red if you exceed the live remaining
              capacity.
            </div>
          </header>

          {availability.isLoading ? (
            <div className="p-6 text-white/50 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#00F5D4]" />
              Loading round availability…
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {rounds.map((round) => {
                const line =
                  byRoundLine[round.slug] ?? {
                    roundSlug: round.slug,
                    tokens: 0,
                    usdCents: 0,
                  };
                const violation = violations.find(
                  (v) => v.roundSlug === round.slug,
                );
                const overflow = line.tokens > round.available;
                const soldOut = round.available <= 0;
                const isClosed = round.status === "closed";
                const isUpcoming = round.status === "upcoming";
                const inputsDisabled = soldOut || isClosed || isUpcoming;
                const stateLabel = isClosed
                  ? "Closed"
                  : isUpcoming
                    ? "Coming soon"
                    : soldOut
                      ? "Sold out"
                      : null;
                return (
                  <div
                    key={round.slug}
                    className={`grid grid-cols-1 md:grid-cols-[1.6fr,1.2fr,1.2fr] gap-3 p-5 ${
                      overflow ? "bg-red-500/[0.04]" : ""
                    }`}
                    data-testid={`cart-row-${round.slug}`}
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <div className="text-sm font-semibold text-white">
                          {round.label}
                        </div>
                        <div className="text-[11px] text-white/55">
                          {priceLabel(round.pricePerTokenMillicents)} / AICA
                        </div>
                        {!round.open && (
                          <span
                            className="text-[10px] text-white/40 uppercase tracking-wider"
                            data-testid={`round-state-label-${round.slug}`}
                          >
                            {isClosed
                              ? "Closed"
                              : isUpcoming
                                ? "Coming soon"
                                : "preview"}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-white/45">
                        <span
                          className={overflow ? "text-red-300" : ""}
                          data-testid={`available-${round.slug}`}
                        >
                          {round.available.toLocaleString()} AICA available
                        </span>{" "}
                        of {round.capacity.toLocaleString()}
                      </div>
                      {stateLabel && (
                        <div
                          className={`mt-1 text-[11px] ${
                            isClosed
                              ? "text-white/45"
                              : isUpcoming
                                ? "text-white/45"
                                : "text-amber-300"
                          }`}
                          data-testid={`round-state-${round.slug}`}
                        >
                          {stateLabel}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                        USD
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={MAX_USD}
                        step={500}
                        disabled={inputsDisabled}
                        value={Math.round(line.usdCents / 100) || ""}
                        onChange={(e) =>
                          setUsdForLine(
                            round.slug,
                            Number(e.target.value) || 0,
                            round,
                          )
                        }
                        className={`brand-input mt-1 ${
                          overflow ? "!border-red-400/60" : ""
                        }`}
                        data-testid={`input-usd-${round.slug}`}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                        Tokens
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        disabled={inputsDisabled}
                        value={line.tokens || ""}
                        onChange={(e) =>
                          setTokensForLine(
                            round.slug,
                            Math.max(0, Math.floor(Number(e.target.value) || 0)),
                            round,
                          )
                        }
                        className={`brand-input mt-1 ${
                          overflow ? "!border-red-400/60" : ""
                        }`}
                        data-testid={`input-tokens-${round.slug}`}
                      />
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                        <button
                          type="button"
                          onClick={() => useMaxForLine(round.slug, round)}
                          disabled={inputsDisabled}
                          className="text-[#00F5D4] hover:underline inline-flex items-center gap-1 disabled:opacity-40"
                          data-testid={`button-use-max-${round.slug}`}
                        >
                          <Wand2 className="w-3 h-3" /> use max (
                          {round.available.toLocaleString()})
                        </button>
                        {overflow && (
                          <span
                            className="text-red-300 inline-flex items-center gap-1"
                            data-testid={`overflow-${round.slug}`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            only {round.available.toLocaleString()} available
                          </span>
                        )}
                        {violation && !overflow && (
                          <span
                            className="text-amber-300"
                            data-testid={`violation-${round.slug}`}
                          >
                            revised to {violation.available.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="brand-card p-5 text-xs text-white/55 leading-relaxed">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 mb-2">
              Token math
            </div>
            <ul className="space-y-1">
              <li>Pricing is auto-applied per round; you can mix rounds.</li>
              <li>+10% allocation on totals ≥ $5,000.</li>
              <li>+20% allocation on totals ≥ $25,000.</li>
              <li>Vesting laddered by round: Strategic Seed 10% TGE / 3mo cliff / 12mo linear, ladders down to Community / Launchpad 30% TGE / 0mo cliff / 3mo linear.</li>
              <li>Total private sale: 2.25B AICA across 5 rounds (22.50% of fixed 10B supply).</li>
            </ul>
          </div>
          <VestingPreview totalTokens={totalTokens + bonusTokens} />
        </div>

        {/* Sticky totals */}
        <div className="fixed bottom-0 inset-x-0 bg-[#0A0A0A]/90 backdrop-blur border-t border-white/10 z-30">
          <div className="mx-auto max-w-5xl px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Total commitment
                </div>
                <div
                  className="text-2xl font-semibold text-[#00F5D4]"
                  style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                  data-testid="cart-total-usd"
                >
                  {fmtUsd(totalCents)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                  Tokens
                </div>
                <div
                  className="text-lg font-semibold text-white"
                  data-testid="cart-total-tokens"
                >
                  {(totalTokens + bonusTokens).toLocaleString()}{" "}
                  <span className="text-white/40 text-sm">AICA</span>
                  {bonusTokens > 0 && (
                    <span
                      className="ml-2 text-xs text-[#00F5D4] font-normal"
                      data-testid="cart-bonus"
                    >
                      +{bonusTokens.toLocaleString()} bonus (
                      {Math.round(bonusRate * 100)}%)
                    </span>
                  )}
                </div>
              </div>
              {!totalsValid && (
                <div className="text-xs text-amber-300">
                  Total must be between {fmtUsd(minCents)} and{" "}
                  {fmtUsd(MAX_USD * 100)}.
                </div>
              )}
              {testMode && (
                <div
                  className="text-xs text-[#00F5D4]"
                  data-testid="test-mode-banner"
                >
                  Test mode active: any amount allowed for the next{" "}
                  {testPurchasesRemaining} funded purchase
                  {testPurchasesRemaining === 1 ? "" : "s"}, then a $250
                  minimum applies.
                </div>
              )}
              {overflowSlugs.length > 0 && (
                <div
                  className="text-xs text-red-300"
                  data-testid="cart-overflow-banner"
                >
                  One or more rows exceed available capacity.
                </div>
              )}
              {confirmRevised && violations.length > 0 && (
                <div
                  className="text-xs text-amber-300"
                  data-testid="cart-revised-banner"
                >
                  Cart auto-revised against current availability. Click
                  Continue again to confirm.
                </div>
              )}
            </div>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => create.mutate()}
              className="brand-cta"
              data-testid="button-cart-continue"
            >
              {create.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Reserving…
                </>
              ) : (
                <>
                  Continue to SAFT <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
