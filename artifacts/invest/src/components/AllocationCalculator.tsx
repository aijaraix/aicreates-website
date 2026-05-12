import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tokensForAmount, computeVesting } from "@/lib/vesting";
import { api } from "@/lib/api";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export default function AllocationCalculator() {
  const [amount, setAmount] = useState(5000);
  const round = useQuery({
    queryKey: ["rounds", "active"],
    queryFn: () =>
      api<{ round: { pricePerTokenMillicents: number; label: string } }>(
        "/rounds/active",
      ),
  });
  const price = round.data?.round.pricePerTokenMillicents ?? 15;
  const tokens = useMemo(
    () => tokensForAmount(amount, price),
    [amount, price],
  );
  const vesting = useMemo(() => computeVesting(tokens), [tokens]);
  const tge = vesting.schedule[0]!;
  const monthly = vesting.schedule[1]!;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
      <div className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">
        Calculate your allocation
      </div>
      <h3
        className="text-2xl md:text-3xl font-semibold tracking-tight"
        style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
      >
        What does <span className="text-[#00F5D4]">your commitment</span> look
        like?
      </h3>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr,1fr] gap-6 items-start">
        <div>
          <label className="text-xs uppercase tracking-[0.14em] text-white/50">
            Commitment amount (USD)
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 focus-within:border-[#00F5D4]/40 transition px-4 py-3">
            <span className="text-white/40">$</span>
            <input
              type="number"
              min={1000}
              max={10_000_000}
              step={1000}
              value={amount}
              onChange={(e) =>
                setAmount(
                  Math.min(10_000_000, Math.max(0, Number(e.target.value) || 0)),
                )
              }
              className="flex-1 bg-transparent outline-none text-lg"
              data-testid="input-allocation-amount"
            />
            <span className="text-xs text-white/40">USD</span>
          </div>
          <input
            type="range"
            min={1000}
            max={500000}
            step={1000}
            value={Math.min(amount, 500000)}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full mt-4 accent-[#00F5D4]"
          />
          <div className="flex justify-between text-[11px] uppercase tracking-[0.14em] text-white/40 mt-1">
            <span>$1k</span>
            <span>$25k</span>
            <span>$500k</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Token allocation" value={`${fmt(tokens)} AICA`} accent />
          <Stat
            label="At TGE (25%)"
            value={`${fmt(tge.tokens)} AICA`}
          />
          <Stat
            label="Monthly after cliff"
            value={`${fmt(monthly.tokens)} AICA`}
          />
          <Stat
            label="Total after 30 mo"
            value={`${fmt(tokens)} AICA`}
          />
        </div>
      </div>
      <p className="mt-5 text-xs text-white/40">
        Computed at the active round price (
        {`$${(price / 1000).toFixed(3)}`} per AICA). Vesting: 25% at TGE,
        6-month cliff, then linear over 24 months. Final terms are pending
        counsel review.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="text-[11px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
      <div
        className={`mt-2 text-lg font-semibold ${accent ? "text-[#00F5D4]" : ""}`}
        style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
      >
        {value}
      </div>
    </div>
  );
}
