import { useState } from "react";

interface Point {
  date: string;
  tokens: number;
  cumulative: number;
  label: string;
}

export default function VestingCalendar({
  schedule,
  total,
}: {
  schedule: Point[];
  total: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = schedule[schedule.length - 1]?.cumulative || total || 1;
  const point = hover != null ? schedule[hover] : null;
  return (
    <div>
      <div className="relative h-24 rounded-xl border border-white/10 bg-black/40 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-[#00F5D4]/10 transition-all"
          style={{
            width: `${
              point
                ? (point.cumulative / max) * 100
                : (schedule[0]?.cumulative ?? 0 / max) * 100
            }%`,
          }}
        />
        <div className="absolute inset-0 flex">
          {schedule.map((p, i) => (
            <button
              type="button"
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="flex-1 group relative border-r border-white/[0.04] last:border-r-0 hover:bg-white/[0.04]"
              data-testid={`vesting-point-${i}`}
              aria-label={`${p.label} - unlock ${i + 1} of ${schedule.length} (date set after the community round)`}
            >
              <span
                className={`absolute left-1/2 -translate-x-1/2 bottom-2 w-1.5 rounded-full ${
                  i === 0
                    ? "h-6 bg-[#00F5D4]"
                    : "h-3 bg-white/30 group-hover:bg-[#00F5D4]/70"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[11px] uppercase tracking-[0.14em] text-white/40 mt-2">
        <span>TGE</span>
        <span>Final unlock</span>
      </div>
      <div className="mt-1 text-[10px] text-white/35">
        Calendar dates set after the community round closes.
      </div>
      <div className="mt-3 text-sm text-white/70 min-h-[2.5rem]">
        {point ? (
          <div data-testid="vesting-tooltip">
            <span className="text-[#00F5D4] font-medium">
              {point.tokens.toLocaleString()} AICA
            </span>
            <span className="text-white/40 mx-2">•</span>
            <span>cumulative {point.cumulative.toLocaleString()}</span>
            <span className="text-white/40 mx-2">•</span>
            <span className="text-white/50">{point.label}</span>
          </div>
        ) : (
          <span className="text-white/40">
            Hover or focus a point to see unlock detail.
          </span>
        )}
      </div>
    </div>
  );
}
