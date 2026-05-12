import { ROUNDS, ROUND_TOTALS, TIER_ROWS } from "@/data/rounds";

export default function RoundsTable() {
  return (
    <div className="space-y-6">
      {/* SAFT round schedule */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
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

      {/* Tiers within the active round */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5">
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Allocation tiers (Strategic Seed - now open)
          </div>
          <div
            className="mt-1 text-lg font-semibold"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            $0.015 per AICA - bonuses apply at $5k / $25k
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Tier</th>
                <th className="text-left px-6 py-3 font-medium">Minimum</th>
                <th className="text-left px-6 py-3 font-medium">Allocation</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {TIER_ROWS.map((t) => (
                <tr key={t.name} className="border-t border-white/5">
                  <td
                    className="px-6 py-3 font-medium"
                    style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
                  >
                    {t.name}
                  </td>
                  <td className="px-6 py-3 text-white/80">{t.minimum}</td>
                  <td className="px-6 py-3 text-white/60">{t.bonus}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs ${
                        t.tag === "Open"
                          ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {t.tag}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
