import { TIER_ROWS, ROUNDS } from "@/data/rounds";

export default function RoundsTable() {
  const round = ROUNDS[0]!;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Active round
          </div>
          <div
            className="mt-1 text-lg font-semibold"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            {round.name}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70">
            {round.pricePerToken}
          </span>
          <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70">
            {round.totalRaise}
          </span>
          <span className="px-3 py-1 rounded-full bg-[#00F5D4]/10 border border-[#00F5D4]/30 text-[#00F5D4]">
            {round.cap}
          </span>
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
  );
}
