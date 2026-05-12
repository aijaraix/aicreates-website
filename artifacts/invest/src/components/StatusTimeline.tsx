import { Check } from "lucide-react";

export type TimelineStep =
  | "committed"
  | "saft"
  | "payment"
  | "funded"
  | "tge"
  | "vesting"
  | "claimable";

interface StepDef {
  key: TimelineStep;
  label: string;
}

const STEPS: StepDef[] = [
  { key: "committed", label: "Committed" },
  { key: "saft", label: "SAFT" },
  { key: "payment", label: "Payment" },
  { key: "funded", label: "Funded" },
  { key: "tge", label: "TGE" },
  { key: "vesting", label: "Vesting" },
  { key: "claimable", label: "Claimable" },
];

export interface TimelineState {
  state: string;
  saftSignedAt: string | null;
  fundedAt: string | null;
  tgeDate?: string | null;
  cliffDate?: string | null;
  hasUnlocked?: boolean;
}

function indexFor(s: TimelineState): { active: number; current: number } {
  const now = Date.now();
  let active = 0;
  if (s.saftSignedAt) active = Math.max(active, 1);
  if (
    s.state === "pending_payment" ||
    s.state === "awaiting_wire" ||
    s.state === "awaiting_crypto"
  )
    active = Math.max(active, 2);
  if (s.fundedAt || s.state === "funded" || s.state === "succeeded")
    active = Math.max(active, 3);
  if (s.tgeDate && Date.parse(s.tgeDate) <= now) active = Math.max(active, 4);
  if (s.cliffDate && Date.parse(s.cliffDate) <= now)
    active = Math.max(active, 5);
  if (s.hasUnlocked) active = Math.max(active, 6);
  return { active, current: active };
}

export default function StatusTimeline({ state }: { state: TimelineState }) {
  const { active } = indexFor(state);
  return (
    <div
      className="overflow-x-auto"
      data-testid={`timeline-state-${state.state}`}
    >
      <ol className="flex items-center gap-2 min-w-[640px]">
        {STEPS.map((s, i) => {
          const reached = i <= active;
          const isCurrent = i === active && active < STEPS.length - 1;
          return (
            <li key={s.key} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-medium ${
                  reached
                    ? "bg-[#00F5D4] text-black"
                    : "bg-white/10 text-white/40"
                } ${isCurrent ? "ring-2 ring-[#00F5D4]/40" : ""}`}
                data-testid={`timeline-step-${s.key}`}
              >
                {reached && i < active ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <div className="text-[11px] uppercase tracking-[0.14em] whitespace-nowrap">
                <span
                  className={
                    reached ? "text-white" : "text-white/40"
                  }
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px ${
                    i < active ? "bg-[#00F5D4]/60" : "bg-white/10"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
