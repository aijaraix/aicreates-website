import { useId } from "react";

type Props = {
  className?: string;
  testId?: string;
};

export default function WhitepaperBook({ className = "", testId }: Props) {
  const C = "#00F5D4";
  const uid = useId().replace(/:/g, "");
  const idCover = `wpCover-${uid}`;
  const idSpine = `wpSpine-${uid}`;
  const idPages = `wpPages-${uid}`;
  const idShadow = `wpShadow-${uid}`;
  const idGloss = `wpGloss-${uid}`;
  const idTitleGloss = `wpTitleGloss-${uid}`;

  return (
    <div
      className={`relative aspect-[5/6] w-full ${className}`}
      data-testid={testId}
    >
      <svg
        viewBox="0 0 320 384"
        className="relative w-full h-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        aria-label="AIcreatesAI Whitepaper"
        role="img"
      >
        <defs>
          <linearGradient id={idCover} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1A1A1A" />
            <stop offset="55%" stopColor="#0E0E0E" />
            <stop offset="100%" stopColor="#050505" />
          </linearGradient>
          <linearGradient id={idSpine} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#020202" />
            <stop offset="60%" stopColor="#0A0A0A" />
            <stop offset="100%" stopColor="#1A1A1A" />
          </linearGradient>
          <linearGradient id={idPages} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E8E8E8" />
            <stop offset="35%" stopColor="#BFBFBF" />
            <stop offset="70%" stopColor="#8A8A8A" />
            <stop offset="100%" stopColor="#3F3F3F" />
          </linearGradient>
          <radialGradient id={idShadow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={idGloss} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={idTitleGloss} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9CFFE9" />
            <stop offset="50%" stopColor="#00F5D4" />
            <stop offset="100%" stopColor="#0BAA90" />
          </linearGradient>
        </defs>

        {/* Cast shadow under the book */}
        <ellipse
          cx="170"
          cy="368"
          rx="135"
          ry="10"
          fill={`url(#${idShadow})`}
        />

        {/* Tilted book group - subtle perspective via skewY */}
        <g transform="translate(28 18) skewY(-2)">
          {/* Page edges (right side stack) */}
          <rect
            x="246"
            y="6"
            width="14"
            height="332"
            fill={`url(#${idPages})`}
          />
          {/* Thin page lines */}
          {Array.from({ length: 18 }).map((_, i) => (
            <line
              key={i}
              x1="246"
              y1={14 + i * 18}
              x2="260"
              y2={14 + i * 18}
              stroke="#000000"
              strokeOpacity="0.18"
              strokeWidth="0.6"
            />
          ))}

          {/* Bottom page edge (under cover) */}
          <rect
            x="6"
            y="334"
            width="244"
            height="6"
            fill={`url(#${idPages})`}
          />
          {Array.from({ length: 16 }).map((_, i) => (
            <line
              key={i}
              x1={14 + i * 14}
              y1="334"
              x2={14 + i * 14}
              y2="340"
              stroke="#000000"
              strokeOpacity="0.16"
              strokeWidth="0.6"
            />
          ))}

          {/* Spine (left side) */}
          <rect
            x="0"
            y="0"
            width="14"
            height="332"
            fill={`url(#${idSpine})`}
          />
          {/* Spine teal accent */}
          <rect x="0" y="0" width="3" height="332" fill={C} opacity="0.85" />
          <rect
            x="3"
            y="0"
            width="1"
            height="332"
            fill="#FFFFFF"
            opacity="0.18"
          />

          {/* Front cover */}
          <rect
            x="14"
            y="0"
            width="232"
            height="332"
            fill={`url(#${idCover})`}
            stroke="#2A2A2A"
            strokeWidth="0.6"
          />

          {/* Cover top teal accent line */}
          <rect x="14" y="0" width="232" height="3" fill={C} opacity="0.9" />
          {/* Cover bottom hairline */}
          <rect
            x="14"
            y="328"
            width="232"
            height="2"
            fill={C}
            opacity="0.35"
          />

          {/* Decorative top label */}
          <text
            x="34"
            y="36"
            fontFamily="'JetBrains Mono', ui-monospace, monospace"
            fontSize="9"
            letterSpacing="3"
            fill="#A1A1AA"
          >
            AICREATESAI / 2026
          </text>
          {/* Tiny token glyph in corner */}
          <g transform="translate(214 22)">
            <circle
              cx="0"
              cy="0"
              r="8"
              fill="#0A0A0A"
              stroke={C}
              strokeOpacity="0.7"
              strokeWidth="0.8"
            />
            <text
              x="0"
              y="2.6"
              textAnchor="middle"
              fontFamily="'Space Grotesk', Inter, sans-serif"
              fontSize="6.5"
              fontWeight="700"
              fill={C}
            >
              $
            </text>
          </g>

          {/* Title block */}
          <text
            x="34"
            y="148"
            fontFamily="'Space Grotesk', Inter, system-ui, sans-serif"
            fontSize="28"
            fontWeight="700"
            fill="#F5F5F5"
            style={{ letterSpacing: "0.5px" }}
          >
            AIcreates
          </text>
          <text
            x="34"
            y="180"
            fontFamily="'Space Grotesk', Inter, system-ui, sans-serif"
            fontSize="28"
            fontWeight="700"
            fill={`url(#${idTitleGloss})`}
            style={{ letterSpacing: "0.5px" }}
          >
            AI
          </text>

          {/* Divider */}
          <line
            x1="34"
            y1="200"
            x2="226"
            y2="200"
            stroke={C}
            strokeOpacity="0.45"
            strokeWidth="0.8"
          />

          {/* Subtitle */}
          <text
            x="34"
            y="222"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="11"
            fill="#D4D4D8"
            style={{ letterSpacing: "0.4px" }}
          >
            The Agentic Intelligence Layer
          </text>
          <text
            x="34"
            y="240"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="11"
            fill="#A1A1AA"
            style={{ letterSpacing: "0.4px" }}
          >
            Whitepaper - Edition 01
          </text>

          {/* Footer mark on cover */}
          <text
            x="34"
            y="312"
            fontFamily="'JetBrains Mono', ui-monospace, monospace"
            fontSize="8"
            letterSpacing="2.5"
            fill="#71717A"
          >
            VOL.01 / CONFIDENTIAL
          </text>
          <text
            x="226"
            y="312"
            textAnchor="end"
            fontFamily="'JetBrains Mono', ui-monospace, monospace"
            fontSize="8"
            letterSpacing="2.5"
            fill={C}
            opacity="0.85"
          >
            $AICA
          </text>

          {/* Subtle cover gloss */}
          <rect
            x="14"
            y="0"
            width="232"
            height="332"
            fill={`url(#${idGloss})`}
            pointerEvents="none"
          />
        </g>
      </svg>
    </div>
  );
}
