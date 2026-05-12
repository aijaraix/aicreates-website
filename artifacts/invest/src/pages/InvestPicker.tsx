import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowRight, Loader2, Sparkles, Trash2, Wand2 } from "lucide-react";
import { ROUNDS } from "@/data/rounds";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import VestingPreview from "@/components/VestingPreview";

interface RoundAvailability {
  slug: string;
  label: string;
  pricePerTokenMillicents: number;
  capacity: number;
  reserved: number;
  available: number;
  open: boolean;
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

const MIN_USD = 1_000;
const MAX_USD = 10_000_000;

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
  if (millicents <= 0) return 0;
  return Math.floor((usdCents * 10) / millicents);
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
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartLine[]>([]);
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

  const rounds = availability.data?.rounds ?? [];
  const isAdmin = me.data?.user.role === "admin";

  const byRound = useMemo(() => {
    const m = new Map<string, RoundAvailability>();
    for (const r of rounds) m.set(r.slug, r);
    return m;
  }, [rounds]);

  // Seed empty cart with the first OPEN round selected (UX nicety).
  useEffect(() => {
    if (cart.length > 0 || rounds.length === 0) return;
    const first = rounds.find((r) => r.open) ?? rounds[0]!;
    setCart([
      {
        roundSlug: first.slug,
        tokens: 0,
        usdCents: 0,
      },
    ]);
  }, [rounds, cart.length]);

  const totalCents = cart.reduce((s, l) => s + l.usdCents, 0);
  const totalTokens = cart.reduce((s, l) => s + l.tokens, 0);
  const totalUsd = totalCents / 100;
  const bonusRate = bonusForUsd(totalUsd);
  const bonusTokens = Math.floor(totalTokens * bonusRate);

  function updateLine(idx: number, patch: Partial<CartLine>) {
    setCart((c) => c.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
    setViolations([]);
    setConfirmRevised(false);
  }

  function setUsdForLine(idx: number, usdDollars: number, round: RoundAvailability) {
    const usdCents = Math.max(0, Math.floor(usdDollars * 100));
    let tokens = tokensFromUsdCents(usdCents, round.pricePerTokenMillicents);
    if (tokens > round.available) {
      tokens = round.available;
    }
    const finalCents = usdCentsFromTokens(tokens, round.pricePerTokenMillicents);
    updateLine(idx, { tokens, usdCents: finalCents });
  }

  function setTokensForLine(idx: number, tokens: number, round: RoundAvailability) {
    const clamped = Math.max(0, Math.min(tokens, round.available));
    updateLine(idx, {
      tokens: clamped,
      usdCents: usdCentsFromTokens(clamped, round.pricePerTokenMillicents),
    });
  }

  function useMaxForLine(idx: number, round: RoundAvailability) {
    setTokensForLine(idx, round.available, round);
  }

  function addLine() {
    const used = new Set(cart.map((l) => l.roundSlug));
    const next = rounds.find((r) => !used.has(r.slug)) ?? rounds[0];
    if (!next) return;
    setCart((c) => [...c, { roundSlug: next.slug, tokens: 0, usdCents: 0 }]);
  }

  function removeLine(idx: number) {
    setCart((c) => c.filter((_, i) => i !== idx));
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
      // attempt to parse 409 capacity errors
      const match = msg.match(/\{.*\}/s);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]) as {
            code?: string;
            violations?: CapacityViolation[];
          };
          if (parsed.code === "capacity_exceeded" && parsed.violations) {
            // Auto-revise to the available cap on each violating row.
            setCart((c) =>
              c.map((l) => {
                const v = parsed.violations!.find(
                  (x) => x.roundSlug === l.roundSlug,
                );
                if (!v) return l;
                const round = byRound.get(l.roundSlug);
                if (!round) return l;
                return {
                  ...l,
                  tokens: v.available,
                  usdCents: usdCentsFromTokens(
                    v.available,
                    round.pricePerTokenMillicents,
                  ),
                };
              }),
            );
            setViolations(parsed.violations);
            setConfirmRevised(true);
            availability.refetch();
            return;
          }
          if (parsed.code === "profile_required") {
            setLocation(
              `/profile?next=${encodeURIComponent("/invest")}`,
            );
            return;
          }
        } catch {
          // ignore parse failures
        }
      }
      alert(`Could not create commitment: ${msg}`);
    },
  });

  const totalsValid = totalCents >= MIN_USD * 100 && totalCents <= MAX_USD * 100;
  const canSubmit =
    totalsValid &&
    cart.some((l) => l.tokens > 0) &&
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
          <header className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="text-xs uppercase tracking-[0.18em] text-white/50">
              Allocation cart
            </div>
            <button
              type="button"
              onClick={addLine}
              disabled={cart.length >= rounds.length}
              className="text-xs text-[#00F5D4] hover:underline disabled:opacity-40"
              data-testid="button-add-round"
            >
              + Add round
            </button>
          </header>

          {availability.isLoading ? (
            <div className="p-6 text-white/50 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#00F5D4]" />
              Loading round availability…
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {cart.map((line, idx) => {
                const round =
                  byRound.get(line.roundSlug) ?? rounds[0];
                if (!round) return null;
                const violation = violations.find(
                  (v) => v.roundSlug === round.slug,
                );
                const overflow = line.tokens > round.available;
                return (
                  <div
                    key={`${round.slug}-${idx}`}
                    className="grid grid-cols-1 md:grid-cols-[2fr,1.2fr,1.2fr,auto] gap-3 p-5"
                    data-testid={`cart-row-${idx}`}
                  >
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                        Round
                      </label>
                      <select
                        className="brand-input mt-1"
                        value={round.slug}
                        onChange={(e) => {
                          const next = byRound.get(e.target.value);
                          if (!next) return;
                          updateLine(idx, {
                            roundSlug: next.slug,
                            tokens: 0,
                            usdCents: 0,
                          });
                        }}
                        data-testid={`select-round-${idx}`}
                      >
                        {rounds.map((r) => {
                          const used = cart.some(
                            (l, i) => i !== idx && l.roundSlug === r.slug,
                          );
                          return (
                            <option key={r.slug} value={r.slug} disabled={used}>
                              {r.label} · {priceLabel(r.pricePerTokenMillicents)}
                              {!r.open ? " (preview)" : ""}
                            </option>
                          );
                        })}
                      </select>
                      <div className="mt-1.5 text-[11px] text-white/45">
                        {round.available.toLocaleString()} AICA available of{" "}
                        {round.capacity.toLocaleString()}
                      </div>
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
                        value={Math.round(line.usdCents / 100)}
                        onChange={(e) =>
                          setUsdForLine(
                            idx,
                            Number(e.target.value) || 0,
                            round,
                          )
                        }
                        className={`brand-input mt-1 ${
                          overflow ? "!border-red-400/60" : ""
                        }`}
                        data-testid={`input-usd-${idx}`}
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
                        value={line.tokens}
                        onChange={(e) =>
                          setTokensForLine(
                            idx,
                            Math.max(0, Math.floor(Number(e.target.value) || 0)),
                            round,
                          )
                        }
                        className={`brand-input mt-1 ${
                          overflow ? "!border-red-400/60" : ""
                        }`}
                        data-testid={`input-tokens-${idx}`}
                      />
                      <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => useMaxForLine(idx, round)}
                          className="text-[#00F5D4] hover:underline inline-flex items-center gap-1"
                          data-testid={`button-use-max-${idx}`}
                        >
                          <Wand2 className="w-3 h-3" /> use max
                        </button>
                        {overflow && (
                          <span className="text-red-300">
                            exceeds available
                          </span>
                        )}
                        {violation && (
                          <span
                            className="text-amber-300"
                            data-testid={`violation-${round.slug}`}
                          >
                            revised to {violation.available.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end">
                      {cart.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="h-10 px-3 rounded-xl border border-white/10 text-white/55 hover:text-red-300 hover:border-red-400/40"
                          data-testid={`button-remove-${idx}`}
                          title="Remove row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
              <li>25% unlocks at TGE, 6-month cliff, then 24-month linear.</li>
              <li>Total private sale: 1.25B AICA across 5 rounds.</li>
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
                  Total must be between {fmtUsd(MIN_USD * 100)} and{" "}
                  {fmtUsd(MAX_USD * 100)}.
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
