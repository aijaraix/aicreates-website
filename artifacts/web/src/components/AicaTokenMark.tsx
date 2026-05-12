import { useId } from "react";

type Props = {
  className?: string;
  testId?: string;
};

export default function AicaTokenMark({ className = "", testId }: Props) {
  const C = "#00F5D4";
  const uid = useId().replace(/:/g, "");
  const idRimBevel = `aicaRimBevel-${uid}`;
  const idRimInner = `aicaRimInner-${uid}`;
  const idFace = `aicaFace-${uid}`;
  const idGloss = `aicaGloss-${uid}`;
  const idGrid = `aicaGrid-${uid}`;
  const idMask = `aicaCoreMask-${uid}`;
  const idGlyphGloss = `aicaGlyphGloss-${uid}`;
  const idDrop = `aicaDrop-${uid}`;
  return (
    <div
      className={`relative aspect-square w-full ${className}`}
      data-testid={testId}
    >
      <svg
        viewBox="0 0 200 200"
        className="relative w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        aria-label="$AICA token"
        role="img"
      >
        <defs>
          <linearGradient id={idRimBevel} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3A3A3A" />
            <stop offset="35%" stopColor="#1F1F1F" />
            <stop offset="65%" stopColor="#0E0E0E" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>
          <linearGradient id={idRimInner} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070707" />
            <stop offset="50%" stopColor="#141414" />
            <stop offset="100%" stopColor="#262626" />
          </linearGradient>
          <radialGradient id={idFace} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#1A1F1F" />
            <stop offset="55%" stopColor="#0C0C0C" />
            <stop offset="100%" stopColor="#050505" />
          </radialGradient>
          <radialGradient id={idGloss} cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
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
              strokeOpacity="0.06"
              strokeWidth="0.5"
            />
          </pattern>
          <mask id={idMask}>
            <circle cx="100" cy="100" r="70" fill="white" />
          </mask>
          <linearGradient id={idGlyphGloss} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9CFFE9" />
            <stop offset="50%" stopColor="#00F5D4" />
            <stop offset="100%" stopColor="#0BAA90" />
          </linearGradient>
          <filter
            id={idDrop}
            x="-20%"
            y="-10%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="6"
              floodColor="#000000"
              floodOpacity="0.55"
            />
          </filter>
        </defs>

        <g filter={`url(#${idDrop})`}>
          <circle cx="100" cy="100" r="94" fill={`url(#${idRimBevel})`} />
        </g>
        <circle
          cx="100"
          cy="100"
          r="93.4"
          fill="none"
          stroke="#5A5A5A"
          strokeOpacity="0.55"
          strokeWidth="0.6"
        />
        <path
          d="M 12 105 A 88 88 0 0 0 188 105"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.7"
          strokeWidth="1.2"
        />
        <path
          d="M 22 96 A 78 78 0 0 1 178 96"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.18"
          strokeWidth="1.4"
        />

        <circle cx="100" cy="100" r="78" fill={`url(#${idRimInner})`} />
        <circle
          cx="100"
          cy="100"
          r="76"
          fill="none"
          stroke={C}
          strokeOpacity="0.65"
          strokeWidth="0.8"
        />
        <circle
          cx="100"
          cy="100"
          r="73.5"
          fill="none"
          stroke={C}
          strokeOpacity="0.18"
          strokeWidth="0.5"
        />

        <circle cx="100" cy="100" r="70" fill={`url(#${idFace})`} />
        <g mask={`url(#${idMask})`}>
          <rect
            x="30"
            y="30"
            width="140"
            height="140"
            fill={`url(#${idGrid})`}
          />
        </g>
        <circle
          cx="100"
          cy="100"
          r="69.5"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.85"
          strokeWidth="1.4"
        />
        <ellipse
          cx="100"
          cy="78"
          rx="58"
          ry="22"
          fill="#FFFFFF"
          fillOpacity="0.05"
        />

        {[0, 90, 180, 270].map((deg) => (
          <g
            key={deg}
            transform={`rotate(${deg} 100 100)`}
            stroke={C}
            strokeOpacity="0.85"
            strokeWidth="1.2"
          >
            <line x1="100" y1="32" x2="100" y2="40" />
          </g>
        ))}
        {[30, 60, 120, 150, 210, 240, 300, 330].map((deg) => (
          <g
            key={deg}
            transform={`rotate(${deg} 100 100)`}
            stroke={C}
            strokeOpacity="0.4"
            strokeWidth="0.7"
          >
            <line x1="100" y1="34" x2="100" y2="39" />
          </g>
        ))}

        <text
          x="100"
          y="108"
          textAnchor="middle"
          fontFamily="'Space Grotesk', Inter, system-ui, sans-serif"
          fontSize="30"
          fontWeight="700"
          fill="#000000"
          fillOpacity="0.6"
          style={{ letterSpacing: "1px" }}
          transform="translate(1.2, 1.6)"
        >
          $AICA
        </text>
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fontFamily="'Space Grotesk', Inter, system-ui, sans-serif"
          fontSize="30"
          fontWeight="700"
          fill={`url(#${idGlyphGloss})`}
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

        <circle
          cx="100"
          cy="100"
          r="94"
          fill={`url(#${idGloss})`}
          pointerEvents="none"
        />
      </svg>
    </div>
  );
}
