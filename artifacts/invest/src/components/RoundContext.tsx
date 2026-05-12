import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Round {
  slug: string;
  label: string;
  pricePerTokenCents: number;
  tokensForSale: number;
  targetRaiseCents: number;
  hardCapCents: number;
  deadline: string;
  open: boolean;
}
interface RoundResp {
  round: Round;
  raised: {
    fundedCents: number;
    inFlightCents: number;
    allocatedTokens: number;
    fundedCount: number;
    fundedInvestors: number;
    inFlightCount: number;
  };
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function daysUntil(iso: string): number {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return 0;
  return Math.max(0, Math.ceil((ms - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function RoundContext() {
  const { data, isLoading } = useQuery({
    queryKey: ["rounds", "active"],
    queryFn: () => api<RoundResp>("/rounds/active"),
  });
  if (isLoading || !data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-white/40 text-sm">
        Loading round...
      </div>
    );
  }
  const { round, raised } = data;
  const targetCents = round.targetRaiseCents;
  const fundedPct = Math.min(100, (raised.fundedCents / targetCents) * 100);
  const inFlightPct = Math.min(
    100,
    ((raised.fundedCents + raised.inFlightCents) / targetCents) * 100,
  );
  const days = daysUntil(round.deadline);
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
      data-testid="round-context"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#00F5D4]">
            Active round
          </div>
          <h2
            className="mt-1 text-2xl md:text-3xl font-semibold"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            {round.label}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
            Closes in
          </div>
          <div
            className="text-xl font-semibold"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            {days} days
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Stat label="Price" value={`$${(round.pricePerTokenCents / 100).toFixed(2)} / AICA`} />
        <Stat
          label="Target"
          value={fmt(round.targetRaiseCents)}
        />
        <Stat label="Hard cap" value={fmt(round.hardCapCents)} />
        <Stat
          label="For sale"
          value={`${(round.tokensForSale / 1_000_000).toFixed(0)}M AICA`}
        />
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between text-xs text-white/60 mb-2">
          <span>
            <span className="text-[#00F5D4] font-semibold">
              {fmt(raised.fundedCents)}
            </span>{" "}
            funded
            {raised.inFlightCents > 0 && (
              <span className="text-white/40">
                {" "}
                + {fmt(raised.inFlightCents)} in-flight
              </span>
            )}
          </span>
          <span className="text-white/40">{fmt(targetCents)} target</span>
        </div>
        <div
          className="h-2 w-full rounded-full bg-white/5 overflow-hidden relative"
          data-testid="raised-bar"
        >
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/20"
            style={{ width: `${inFlightPct}%` }}
          />
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#00F5D4]"
            style={{ width: `${fundedPct}%` }}
          />
        </div>
        <div className="mt-2 text-[11px] text-white/40">
          {raised.fundedInvestors} funded investors -{" "}
          {raised.allocatedTokens.toLocaleString()} AICA allocated
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
