interface Point {
  date: string;
  tokens: number;
  cumulative: number;
  label: string;
}

/**
 * Per-commitment release graph rendered as the same loading-bar /
 * cumulative-bar styling used by VestingPreview elsewhere in the portal.
 * Driven directly from the server-computed schedule on /api/me/allocations
 * rather than recomputing client-side, so per-round vesting parameters
 * stay authoritative on the server.
 */
export default function ReleaseBar({
  schedule,
  total,
}: {
  schedule: Point[];
  total: number;
}) {
  if (!schedule.length) return null;
  const max = schedule[schedule.length - 1]!.cumulative || total || 1;
  const first = schedule[0]!;
  const last = schedule[schedule.length - 1]!;
  // Mid marker = first post-TGE unlock (which equals "cliff ends" for any
  // round with a non-zero cliff, and "first monthly unlock" otherwise).
  // We deliberately call it "First unlock" so the label is correct for
  // both zero-cliff and cliffed schedules without the client needing to
  // know the per-round cliff length.
  const midPoint = schedule.length > 2 ? schedule[1] ?? null : null;
  return (
    <div
      className="rounded-xl border border-white/10 bg-black/30 p-5"
      data-testid="release-bar"
    >
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">
          Distribution release
        </div>
        <div className="text-[10px] text-white/40">
          {total.toLocaleString()} AICA
        </div>
      </div>
      <div
        className="flex items-end gap-[2px] h-20"
        role="img"
        aria-label={`Distribution release schedule for ${total.toLocaleString()} AICA across ${schedule.length} unlock dates`}
      >
        {schedule.map((p, i) => {
          const h = (p.cumulative / max) * 100;
          return (
            <div
              key={i}
              className={`flex-1 rounded-sm ${
                i === 0 ? "bg-[#00F5D4]" : "bg-[#00F5D4]/40"
              }`}
              style={{ height: `${Math.max(2, h)}%` }}
              title={`${new Date(p.date).toLocaleDateString()} - ${p.cumulative.toLocaleString()} AICA cumulative`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-white/40 mt-2">
        <span>TGE {new Date(first.date).toLocaleDateString()}</span>
        {midPoint && (
          <span>
            First unlock {new Date(midPoint.date).toLocaleDateString()}
          </span>
        )}
        <span>Final {new Date(last.date).toLocaleDateString()}</span>
      </div>
      {/* Accessible textual summary for keyboard / screen-reader users.
          Hidden from sighted users but read out as a flat list of unlock
          milestones so the schedule is not bar-only. */}
      <ul className="sr-only" data-testid="release-bar-sr-summary">
        {schedule.map((p, i) => (
          <li key={i}>
            {p.label} on {new Date(p.date).toLocaleDateString()}:{" "}
            {p.tokens.toLocaleString()} AICA unlocked,{" "}
            {p.cumulative.toLocaleString()} cumulative.
          </li>
        ))}
      </ul>
    </div>
  );
}
