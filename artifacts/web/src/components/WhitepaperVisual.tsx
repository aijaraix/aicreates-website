import { useId } from "react";

type Props = {
  className?: string;
  testId?: string;
};

export default function WhitepaperVisual({
  className = "",
  testId,
}: Props) {
  const C = "#00F5D4";
  const uid = useId().replace(/:/g, "");
  const idPanel = `wpvPanel-${uid}`;
  const idGrid = `wpvGrid-${uid}`;
  const idGlow = `wpvGlow-${uid}`;
  const idDrop = `wpvDrop-${uid}`;
  const idScan = `wpvScan-${uid}`;
  const idAccent = `wpvAccent-${uid}`;

  const sections = [
    { label: "Architecture", w: 78 },
    { label: "Hybrid Compute Fabric", w: 92 },
    { label: "Quality Engine", w: 64 },
    { label: "Tokenomics", w: 84 },
    { label: "Roadmap", w: 56 },
  ];

  return (
    <div
      className={`relative aspect-[4/5] w-full ${className}`}
      data-testid={testId}
    >
      <svg
        viewBox="0 0 320 400"
        className="relative w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        aria-label="AIcreatesAI pitch deck preview"
        role="img"
      >
        <defs>
          <linearGradient id={idPanel} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#161616" />
            <stop offset="50%" stopColor="#0C0C0C" />
            <stop offset="100%" stopColor="#040404" />
          </linearGradient>
          <linearGradient id={idAccent} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9CFFE9" />
            <stop offset="50%" stopColor="#00F5D4" />
            <stop offset="100%" stopColor="#0BAA90" />
          </linearGradient>
          <radialGradient id={idGlow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#00F5D4" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00F5D4" stopOpacity="0" />
          </radialGradient>
          <pattern id={idGrid} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M 14 0 L 0 0 0 14" fill="none" stroke={C} strokeOpacity="0.08" strokeWidth="0.5" />
          </pattern>
          <pattern id={idScan} x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="3" y2="0" stroke="#FFFFFF" strokeOpacity="0.04" />
          </pattern>
          <filter id={idDrop} x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000000" floodOpacity="0.55" />
          </filter>
        </defs>

        <ellipse cx="160" cy="220" rx="150" ry="120" fill={`url(#${idGlow})`} />

        <g filter={`url(#${idDrop})`}>
          <g transform="translate(48 30) rotate(-8 130 170)">
            <rect x="0" y="0" width="220" height="290" rx="8" fill={`url(#${idPanel})`} stroke="#1F1F1F" strokeWidth="1" opacity="0.55" />
            <rect x="0" y="0" width="3" height="290" fill={C} opacity="0.4" />
          </g>

          <g transform="translate(36 22) rotate(-3 140 175)">
            <rect x="0" y="0" width="232" height="306" rx="10" fill={`url(#${idPanel})`} stroke="#262626" strokeWidth="1" opacity="0.8" />
            <rect x="0" y="0" width="3" height="306" fill={C} opacity="0.6" />
          </g>

          <g transform="translate(28 14)">
            <rect x="0" y="0" width="252" height="332" rx="12" fill={`url(#${idPanel})`} stroke="#2E2E2E" strokeWidth="1" />
            <rect x="0" y="0" width="252" height="332" rx="12" fill={`url(#${idGrid})`} />
            <rect x="0" y="0" width="252" height="332" rx="12" fill={`url(#${idScan})`} />

            <rect x="0" y="0" width="4" height="332" fill={C} />
            <rect x="4" y="0" width="1" height="332" fill="#FFFFFF" opacity="0.18" />

            <text x="22" y="36" fontFamily="'JetBrains Mono', ui-monospace, monospace" fontSize="9" letterSpacing="3" fill="#A1A1AA">
              AICREATESAI / PITCH DECK
            </text>
            <text x="230" y="36" textAnchor="end" fontFamily="'JetBrains Mono', ui-monospace, monospace" fontSize="9" letterSpacing="2.5" fill={C} opacity="0.85">
              v01
            </text>

            <text x="22" y="78" fontFamily="'Space Grotesk', Inter, system-ui, sans-serif" fontSize="22" fontWeight="700" fill="#F5F5F5" style={{ letterSpacing: "0.4px" }}>
              The Agentic
            </text>
            <text x="22" y="104" fontFamily="'Space Grotesk', Inter, system-ui, sans-serif" fontSize="22" fontWeight="700" fill={`url(#${idAccent})`} style={{ letterSpacing: "0.4px" }}>
              Intelligence Layer
            </text>

            <line x1="22" y1="120" x2="230" y2="120" stroke={C} strokeOpacity="0.4" strokeWidth="0.8" />

            <text x="22" y="140" fontFamily="'JetBrains Mono', ui-monospace, monospace" fontSize="8" letterSpacing="2" fill="#71717A">
              CONTENTS
            </text>

            {sections.map((s, i) => {
              const y = 156 + i * 26;
              return (
                <g key={s.label}>
                  <text x="22" y={y} fontFamily="'JetBrains Mono', ui-monospace, monospace" fontSize="8" fill={C} opacity="0.85">
                    {String(i + 1).padStart(2, "0")}
                  </text>
                  <text x="44" y={y} fontFamily="Inter, system-ui, sans-serif" fontSize="12" fill="#E4E4E7">
                    {s.label}
                  </text>
                  <line x1="44" y1={y + 6} x2={44 + s.w} y2={y + 6} stroke="#FFFFFF" strokeOpacity="0.08" strokeWidth="1" />
                  <line x1="44" y1={y + 6} x2={44 + s.w * 0.55} y2={y + 6} stroke={C} strokeOpacity="0.55" strokeWidth="1.2" />
                </g>
              );
            })}

            <g transform="translate(22 304)">
              <text fontFamily="'JetBrains Mono', ui-monospace, monospace" fontSize="8" letterSpacing="2" fill="#71717A">
                STATUS
              </text>
              <rect x="58" y="-8" width="100" height="10" rx="3" fill="#0F0F0F" stroke="#262626" />
              <rect x="58" y="-8" width="74" height="10" rx="3" fill={C} opacity="0.85" />
              <text x="166" y="0" fontFamily="'JetBrains Mono', ui-monospace, monospace" fontSize="8" fill={C} opacity="0.85">
                74% LIVE
              </text>
            </g>

            {[[6, 6], [246, 6], [6, 326], [246, 326]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2" fill={C} opacity="0.7" />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
