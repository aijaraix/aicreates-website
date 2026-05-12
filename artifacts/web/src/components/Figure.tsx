import { ReactNode } from "react";
import architectureImg from "@/assets/about-architecture.png";
import technologyImg from "@/assets/technology.png";
import servicesImg from "@/assets/services.png";
import AicaTokenMark from "@/components/AicaTokenMark";

type FigureProps = {
  number: string;
  caption: string;
  children: ReactNode;
};

export default function Figure({ number, caption, children }: FigureProps) {
  return (
    <figure className="my-8 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] overflow-hidden">
      <div className="aspect-[16/8] w-full bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
        <div className="w-full h-full">{children}</div>
      </div>
      <figcaption className="px-6 py-4 border-t border-white/10 flex items-baseline gap-3">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#00F5D4]">{number}</span>
        <span className="text-sm text-white/55">{caption}</span>
      </figcaption>
    </figure>
  );
}

// Image-backed figure helpers (reuse whitepaper / brand imagery from attached_assets / src/assets).
function ImageFigure({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover object-center select-none"
      loading="lazy"
      draggable={false}
    />
  );
}

export function ArchitectureImage() {
  return <ImageFigure src={architectureImg} alt="Architecture of the Agentic Intelligence Layer" />;
}
export function TechnologyImage() {
  return <ImageFigure src={technologyImg} alt="The primitives that compose the layer" />;
}
export function ServicesImage() {
  return <ImageFigure src={servicesImg} alt="Coordinated services running on the layer" />;
}
export function AicaImage() {
  return (
    <div className="w-full h-full flex items-center justify-center py-6">
      <AicaTokenMark className="max-h-full max-w-[60%]" />
    </div>
  );
}
export function AicaShieldImage() {
  const C = "#00F5D4";
  return (
    <div className="w-full h-full flex items-center justify-center py-6 relative">
      <div className="relative w-[60%] max-w-[60%] aspect-square">
        <AicaTokenMark className="absolute inset-0" />
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M100 12 L172 38 L172 110 Q172 158 100 188 Q28 158 28 110 L28 38 Z"
            fill="none"
            stroke={C}
            strokeOpacity="0.55"
            strokeWidth="1.2"
            strokeDasharray="3 4"
          />
        </svg>
      </div>
    </div>
  );
}

// FIGURE 1 - Agentic Intelligence Layer architecture
export function PlatformArchitectureFigure() {
  const C = "#00F5D4";
  return (
    <svg viewBox="0 0 800 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="layerGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#00F5D4" stopOpacity="0.04"/>
        </linearGradient>
      </defs>
      {[
        { y: 30, label: "Eve - Operating Surface", w: 720 },
        { y: 90, label: "Unified Agent Layer", w: 720 },
        { y: 150, label: "Jarvis - Execution & Tooling", w: 720 },
        { y: 210, label: "Adam - Foundational Intelligence", w: 720 },
      ].map((row) => (
        <g key={row.y}>
          <rect x="40" y={row.y} width={row.w} height="44" rx="10" fill="url(#layerGrad)" stroke={C} strokeOpacity="0.35"/>
          <text x="60" y={row.y + 28} fontFamily="Inter, system-ui" fontSize="14" fill="#F5F5F5">{row.label}</text>
        </g>
      ))}
      <g>
        <rect x="40" y="270" width="350" height="36" rx="10" fill="none" stroke={C} strokeOpacity="0.35" strokeDasharray="4 4"/>
        <text x="60" y="293" fontFamily="Inter" fontSize="12" fill="#A1A1AA">Quality Engine - closed-loop review</text>
        <rect x="410" y="270" width="350" height="36" rx="10" fill="none" stroke={C} strokeOpacity="0.35" strokeDasharray="4 4"/>
        <text x="430" y="293" fontFamily="Inter" fontSize="12" fill="#A1A1AA">Credit Ledger - programmable spend</text>
      </g>
    </svg>
  );
}

// FIGURE 3 - Primitives map
export function PrimitivesFigure() {
  const C = "#00F5D4";
  const items = [
    { x: 60, y: 60, t: "Hybrid Compute" },
    { x: 240, y: 60, t: "Persistent Memory" },
    { x: 420, y: 60, t: "Self-Healing Workflows" },
    { x: 600, y: 60, t: "Agentic Wallet" },
  ];
  return (
    <svg viewBox="0 0 800 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <circle cx="400" cy="200" r="60" fill="none" stroke={C} strokeOpacity="0.6"/>
      <text x="400" y="205" textAnchor="middle" fontFamily="Inter" fontSize="13" fill="#F5F5F5">Intelligence Layer</text>
      {items.map((it, i) => {
        const cx = it.x + 70;
        const cy = it.y + 30;
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2="400" y2="200" stroke={C} strokeOpacity="0.25" strokeDasharray="3 3"/>
            <rect x={it.x} y={it.y} width="140" height="60" rx="10" fill="#0A0A0A" stroke={C} strokeOpacity="0.4"/>
            <text x={cx} y={cy + 5} textAnchor="middle" fontFamily="Inter" fontSize="12" fill="#F5F5F5">{it.t}</text>
          </g>
        );
      })}
    </svg>
  );
}

// FIGURE 4 - Operating loop
export function OperatingLoopFigure() {
  const C = "#00F5D4";
  const steps = ["Intent", "Plan", "Execute", "Review", "Improve"];
  return (
    <svg viewBox="0 0 800 220" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {steps.map((s, i) => {
        const x = 40 + i * 150;
        return (
          <g key={s}>
            <rect x={x} y="80" width="120" height="60" rx="30" fill="#0A0A0A" stroke={C} strokeOpacity="0.5"/>
            <text x={x + 60} y="115" textAnchor="middle" fontFamily="Inter" fontSize="13" fill="#F5F5F5">{s}</text>
            {i < steps.length - 1 && (
              <path d={`M ${x + 124} 110 L ${x + 146} 110`} stroke={C} strokeWidth="1.5" markerEnd="url(#arr)"/>
            )}
          </g>
        );
      })}
      <path d="M 720 140 Q 720 200 400 200 Q 80 200 80 140" fill="none" stroke={C} strokeOpacity="0.45" strokeDasharray="4 4" markerEnd="url(#arr)"/>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill={C}/>
        </marker>
      </defs>
    </svg>
  );
}

// FIGURE 5 - Workspace Areas constellation
export function WorkspaceAreasFigure() {
  const C = "#00F5D4";
  const areas = [
    "AI Command Center",
    "Apps",
    "Wallet & Credits",
    "Memory & Files",
    "Activity Feed",
    "Business Data",
  ];
  return (
    <svg viewBox="0 0 800 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <circle cx="400" cy="160" r="55" fill="#0A0A0A" stroke={C} strokeOpacity="0.7"/>
      <text x="400" y="158" textAnchor="middle" fontFamily="Inter" fontSize="12" fill="#F5F5F5">Eve OS</text>
      <text x="400" y="176" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#A1A1AA">Company in a Box</text>
      {areas.map((a, i) => {
        const angle = (i / areas.length) * Math.PI * 2 - Math.PI / 2;
        const cx = 400 + Math.cos(angle) * 230;
        const cy = 160 + Math.sin(angle) * 110;
        return (
          <g key={a}>
            <line x1="400" y1="160" x2={cx} y2={cy} stroke={C} strokeOpacity="0.25" strokeDasharray="3 3"/>
            <rect x={cx - 80} y={cy - 18} width="160" height="36" rx="8" fill="#0A0A0A" stroke={C} strokeOpacity="0.4"/>
            <text x={cx} y={cy + 5} textAnchor="middle" fontFamily="Inter" fontSize="12" fill="#F5F5F5">{a}</text>
          </g>
        );
      })}
    </svg>
  );
}

// FIGURE 6 - $AICA utility map
export function TokenUtilityFigure() {
  const C = "#00F5D4";
  const utilities = [
    { t: "Subscription Discounts", x: 60, y: 50 },
    { t: "Compute Network", x: 60, y: 130 },
    { t: "Contributor Rewards", x: 60, y: 210 },
    { t: "Governance Signals", x: 540, y: 50 },
    { t: "Credit Top-ups", x: 540, y: 130 },
    { t: "Marketplace Settlement", x: 540, y: 210 },
  ];
  return (
    <svg viewBox="0 0 800 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <circle cx="400" cy="160" r="58" fill="#0A0A0A" stroke={C} strokeOpacity="0.8"/>
      <text x="400" y="156" textAnchor="middle" fontFamily="Inter" fontSize="18" fontWeight="600" fill="#00F5D4">$AICA</text>
      <text x="400" y="178" textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#A1A1AA">Native asset</text>
      {utilities.map((u) => {
        const cx = u.x + 100;
        const cy = u.y + 22;
        return (
          <g key={u.t}>
            <line x1="400" y1="160" x2={cx} y2={cy} stroke={C} strokeOpacity="0.25" strokeDasharray="3 3"/>
            <rect x={u.x} y={u.y} width="200" height="44" rx="8" fill="#0A0A0A" stroke={C} strokeOpacity="0.4"/>
            <text x={cx} y={cy + 5} textAnchor="middle" fontFamily="Inter" fontSize="12" fill="#F5F5F5">{u.t}</text>
          </g>
        );
      })}
    </svg>
  );
}

// FIGURE 7 - Credits & token movement loop
export function TokenFlowFigure() {
  const C = "#00F5D4";
  const nodes = [
    { id: "user", x: 60, y: 130, t: "Operator" },
    { id: "credits", x: 280, y: 60, t: "Credits" },
    { id: "ledger", x: 500, y: 60, t: "Credit Ledger" },
    { id: "agents", x: 500, y: 200, t: "Agents act" },
    { id: "rewards", x: 280, y: 200, t: "Rewards in $AICA" },
  ];
  const links = [
    ["user", "credits", "buy / top-up"],
    ["credits", "ledger", "scope + cap"],
    ["ledger", "agents", "spend on actions"],
    ["agents", "rewards", "value created"],
    ["rewards", "user", "compound"],
  ];
  const find = (id: string) => nodes.find((n) => n.id === id)!;
  return (
    <svg viewBox="0 0 760 320" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <marker id="arr2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill={C}/>
        </marker>
      </defs>
      {links.map(([from, to, label], i) => {
        const a = find(from);
        const b = find(to);
        const ax = a.x + 70;
        const ay = a.y + 24;
        const bx = b.x + 70;
        const by = b.y + 24;
        const mx = (ax + bx) / 2;
        const my = (ay + by) / 2 - 8;
        return (
          <g key={i}>
            <path d={`M ${ax} ${ay} L ${bx} ${by}`} stroke={C} strokeOpacity="0.45" strokeWidth="1.4" markerEnd="url(#arr2)"/>
            <text x={mx} y={my} textAnchor="middle" fontFamily="Inter" fontSize="10" fill="#A1A1AA">{label}</text>
          </g>
        );
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width="140" height="48" rx="10" fill="#0A0A0A" stroke={C} strokeOpacity="0.6"/>
          <text x={n.x + 70} y={n.y + 30} textAnchor="middle" fontFamily="Inter" fontSize="13" fill="#F5F5F5">{n.t}</text>
        </g>
      ))}
    </svg>
  );
}
