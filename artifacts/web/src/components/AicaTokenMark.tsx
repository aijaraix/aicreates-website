import { useId } from "react";

type Props = {
  className?: string;
  testId?: string;
};

export default function AicaTokenMark({ className = "", testId }: Props) {
  const C = "#00F5D4";
  const uid = useId().replace(/:/g, "");
  const idCore = `aicaCore-${uid}`;
  const idRing = `aicaRing-${uid}`;
  const idGrid = `aicaGrid-${uid}`;
  const idMask = `aicaCoreMask-${uid}`;
  return (
    <div
      className={`relative aspect-square w-full ${className}`}
      data-testid={testId}
    >
      <div
        className="absolute inset-[8%] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0,245,212,0.22), rgba(0,245,212,0.06) 45%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <svg
        viewBox="0 0 200 200"
        className="relative w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        aria-label="$AICA token"
        role="img"
      >
        <defs>
          <radialGradient id={idCore} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0E1A1A" stopOpacity="1" />
            <stop offset="60%" stopColor="#0A0A0A" stopOpacity="1" />
            <stop offset="100%" stopColor="#0A0A0A" stopOpacity="1" />
          </radialGradient>
          <linearGradient id={idRing} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C} stopOpacity="0.9" />
            <stop offset="50%" stopColor={C} stopOpacity="0.25" />
            <stop offset="100%" stopColor={C} stopOpacity="0.9" />
          </linearGradient>
          <pattern
            id={idGrid}
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke={C}
              strokeOpacity="0.08"
              strokeWidth="0.5"
            />
          </pattern>
          <mask id={idMask}>
            <circle cx="100" cy="100" r="74" fill="white" />
          </mask>
        </defs>

        {/* outermost ring */}
        <circle
          cx="100"
          cy="100"
          r="92"
          fill="none"
          stroke={`url(#${idRing})`}
          strokeWidth="0.6"
          strokeOpacity="0.55"
        />
        {/* dashed orbit */}
        <circle
          cx="100"
          cy="100"
          r="86"
          fill="none"
          stroke={C}
          strokeOpacity="0.35"
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
        {/* inner ring */}
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke={C}
          strokeOpacity="0.5"
          strokeWidth="0.8"
        />

        {/* core medallion */}
        <circle cx="100" cy="100" r="74" fill={`url(#${idCore})`} />
        <g mask={`url(#${idMask})`}>
          <rect x="26" y="26" width="148" height="148" fill={`url(#${idGrid})`} />
        </g>
        <circle
          cx="100"
          cy="100"
          r="74"
          fill="none"
          stroke={C}
          strokeOpacity="0.7"
          strokeWidth="1"
        />

        {/* tick marks at cardinal points */}
        {[0, 90, 180, 270].map((deg) => (
          <g
            key={deg}
            transform={`rotate(${deg} 100 100)`}
            stroke={C}
            strokeOpacity="0.85"
            strokeWidth="1.2"
          >
            <line x1="100" y1="6" x2="100" y2="14" />
          </g>
        ))}
        {/* small ticks every 30deg */}
        {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
          <g
            key={deg}
            transform={`rotate(${deg} 100 100)`}
            stroke={C}
            strokeOpacity="0.4"
            strokeWidth="0.7"
          >
            <line x1="100" y1="8" x2="100" y2="13" />
          </g>
        ))}

        {/* wordmark */}
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fontFamily="'Space Grotesk', Inter, system-ui, sans-serif"
          fontSize="28"
          fontWeight="600"
          fill={C}
          style={{ letterSpacing: "1px" }}
        >
          $AICA
        </text>
        <text
          x="100"
          y="128"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', ui-monospace, monospace"
          fontSize="7"
          fill="#A1A1AA"
          style={{ letterSpacing: "3px" }}
        >
          NATIVE ASSET
        </text>
      </svg>
    </div>
  );
}
