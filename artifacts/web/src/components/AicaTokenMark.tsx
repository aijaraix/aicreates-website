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
  const idDrop = `aicaDrop-${uid}`;
  const idGlyphGloss = `aicaGlyphGloss-${uid}`;

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
            <stop offset="0%" stopColor="#3F3F3F" />
            <stop offset="35%" stopColor="#1F1F1F" />
            <stop offset="65%" stopColor="#0E0E0E" />
            <stop offset="100%" stopColor="#040404" />
          </linearGradient>
          <linearGradient id={idRimInner} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050505" />
            <stop offset="50%" stopColor="#0F0F0F" />
            <stop offset="100%" stopColor="#1F1F1F" />
          </linearGradient>
          <radialGradient id={idFace} cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#1A1A1A" />
            <stop offset="60%" stopColor="#0B0B0B" />
            <stop offset="100%" stopColor="#040404" />
          </radialGradient>
          <radialGradient id={idGloss} cx="50%" cy="-5%" r="75%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={idGlyphGloss} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9CFFE9" />
            <stop offset="50%" stopColor="#00F5D4" />
            <stop offset="100%" stopColor="#0BAA90" />
          </linearGradient>
          <filter id={idDrop} x="-20%" y="-10%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="6"
              floodColor="#000000"
              floodOpacity="0.6"
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
          strokeOpacity="0.5"
          strokeWidth="0.6"
        />
        <path
          d="M 14 106 A 88 88 0 0 0 186 106"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.7"
          strokeWidth="1.4"
        />
        <path
          d="M 22 96 A 78 78 0 0 1 178 96"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.18"
          strokeWidth="1.4"
        />

        <circle cx="100" cy="100" r="80" fill={`url(#${idRimInner})`} />
        <circle
          cx="100"
          cy="100"
          r="74"
          fill={`url(#${idFace})`}
        />
        <circle
          cx="100"
          cy="100"
          r="73.6"
          fill="none"
          stroke="#000000"
          strokeOpacity="0.85"
          strokeWidth="1"
        />

        <text
          x="100"
          y="116"
          textAnchor="middle"
          fontFamily="'Space Grotesk', Inter, system-ui, sans-serif"
          fontSize="40"
          fontWeight="700"
          fill="#000000"
          fillOpacity="0.55"
          style={{ letterSpacing: "2px" }}
          transform="translate(1.6, 2)"
        >
          AICA
        </text>
        <text
          x="100"
          y="116"
          textAnchor="middle"
          fontFamily="'Space Grotesk', Inter, system-ui, sans-serif"
          fontSize="40"
          fontWeight="700"
          fill={`url(#${idGlyphGloss})`}
          style={{ letterSpacing: "2px" }}
        >
          AICA
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
