import { ROUNDS, ROUND_TOTALS } from "@/data/rounds";

export default function RoundsTable() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Private SAFT round schedule
          </div>
          <div
            className="mt-1 text-lg font-semibold"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            {ROUND_TOTALS.tokens} ({ROUND_TOTALS.supplyPct} of supply) -{" "}
            {ROUND_TOTALS.totalRaise} raise
          </div>
        </div>
        <div
          className="inline-flex items-center gap-2 rounded-full border border-[#00F5D4]/40 bg-[#00F5D4]/10 px-3.5 py-1.5 text-xs font-medium text-[#00F5D4]"
          data-testid="badge-strategic-seed-bonuses"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] shadow-[0_0_8px_rgba(0,245,212,0.8)]" />
          Strategic Seed - bonuses apply at $5k (+10%) and $25k (+20%)
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" data-testid="table-rounds">
          <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Round</th>
              <th className="text-left px-6 py-3 font-medium">Price</th>
              <th className="text-left px-6 py-3 font-medium">Tokens</th>
              <th className="text-left px-6 py-3 font-medium">Raise</th>
              <th className="text-left px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROUNDS.map((r) => (
              <tr
                key={r.slug}
                className="border-t border-white/5"
                data-testid={`row-round-${r.slug}`}
              >
                <td
                  className="px-6 py-3 font-medium"
                  style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                >
                  {r.name}
                </td>
                <td className="px-6 py-3 text-white/80">{r.pricePerToken}</td>
                <td className="px-6 py-3 text-white/60">{r.tokens}</td>
                <td className="px-6 py-3 text-white/80">{r.totalRaise}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs ${
                      r.open
                        ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {r.open ? "Open" : "Upcoming"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
