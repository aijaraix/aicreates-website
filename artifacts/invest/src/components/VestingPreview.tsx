import { useMemo } from "react";
import { computeVesting } from "@/lib/vesting";

export default function VestingPreview({
  totalTokens,
  fundedAt,
  compact,
}: {
  totalTokens: number;
  fundedAt?: Date | null;
  compact?: boolean;
}) {
  const vesting = useMemo(
    () => computeVesting(totalTokens, fundedAt ?? null),
    [totalTokens, fundedAt],
  );
  const max = vesting.schedule[vesting.schedule.length - 1]?.cumulative ?? 1;
  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/30 ${
        compact ? "p-4" : "p-5"
      }`}
      data-testid="vesting-preview"
    >
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">
          Vesting preview
        </div>
        <div className="text-[10px] text-white/40">
          {totalTokens.toLocaleString()} AICA
        </div>
      </div>
      <div className="flex items-end gap-[2px] h-20">
        {vesting.schedule.map((p, i) => {
          const h = (p.cumulative / max) * 100;
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm ${
                i === 0 ? "bg-[#00F5D4]" : "bg-[#00F5D4]/40"
              }`}
              style={{ height: `${Math.max(2, h)}%` }}
              title={`Unlock ${i + 1} of ${vesting.schedule.length} - ${p.cumulative.toLocaleString()} AICA cumulative (date set after community round)`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-white/40 mt-2">
        <span>TGE</span>
        <span>+6mo cliff</span>
        <span>+30mo</span>
      </div>
    </div>
  );
}
