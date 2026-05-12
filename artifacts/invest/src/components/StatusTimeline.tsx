import { Check } from "lucide-react";

export type TimelineStep =
  | "committed"
  | "saft"
  | "payment"
  | "funded"
  | "locked"
  | "tge"
  | "vesting"
  | "claimable";

interface StepDef {
  key: TimelineStep;
  label: string;
}

const STEPS: StepDef[] = [
  { key: "committed", label: "Committed" },
  { key: "saft", label: "SAFT signed" },
  { key: "payment", label: "Payment" },
  { key: "funded", label: "Payment received" },
  { key: "locked", label: "Allocation locked" },
  { key: "tge", label: "TGE" },
  { key: "vesting", label: "Vesting" },
  { key: "claimable", label: "Claimable" },
];

export interface TimelineState {
  state: string;
  createdAt?: string | null;
  saftSignedAt: string | null;
  paymentInitiatedAt?: string | null;
  fundedAt: string | null;
  lockedAt?: string | null;
  tgeDate?: string | null;
  cliffDate?: string | null;
  hasUnlocked?: boolean;
}

function fmtDate(iso?: string | null): string | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function indexFor(s: TimelineState): number {
  const now = Date.now();
  let active = 0;
  if (s.saftSignedAt) active = Math.max(active, 1);
  if (
    s.paymentInitiatedAt ||
    s.state === "pending_payment" ||
    s.state === "awaiting_wire" ||
    s.state === "awaiting_crypto"
  )
    active = Math.max(active, 2);
  if (s.fundedAt || s.state === "funded" || s.state === "succeeded")
    active = Math.max(active, 3);
  // Allocation is locked once funds are received and SAFT is signed.
  if ((s.fundedAt || s.state === "funded" || s.state === "succeeded") && s.saftSignedAt)
    active = Math.max(active, 4);
  if (s.tgeDate && Date.parse(s.tgeDate) <= now) active = Math.max(active, 5);
  if (s.cliffDate && Date.parse(s.cliffDate) <= now)
    active = Math.max(active, 6);
  if (s.hasUnlocked) active = Math.max(active, 7);
  return active;
}

function timestampFor(s: TimelineState, key: TimelineStep): string | null {
  switch (key) {
    case "committed":
      return fmtDate(s.createdAt);
    case "saft":
      return fmtDate(s.saftSignedAt);
    case "payment":
      return fmtDate(s.paymentInitiatedAt);
    case "funded":
      return fmtDate(s.fundedAt);
    case "locked":
      return fmtDate(s.lockedAt ?? s.fundedAt);
    case "tge":
      return fmtDate(s.tgeDate);
    case "vesting":
      return fmtDate(s.cliffDate);
    default:
      return null;
  }
}

export default function StatusTimeline({ state }: { state: TimelineState }) {
  const active = indexFor(state);
  return (
    <div
      className="overflow-x-auto"
      data-testid={`timeline-state-${state.state}`}
    >
      <ol className="flex items-start gap-2 min-w-[820px]">
        {STEPS.map((s, i) => {
          const reached = i <= active;
          const isCurrent = i === active && active < STEPS.length - 1;
          const ts = timestampFor(state, s.key);
          return (
            <li key={s.key} className="flex items-start gap-2 flex-1">
              <div className="flex flex-col items-start gap-1 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium ${
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
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.14em] whitespace-nowrap">
                  <span className={reached ? "text-white" : "text-white/40"}>
                    {s.label}
                  </span>
                </div>
                {ts && (
                  <div
                    className="text-[10px] text-white/50 mt-0.5"
                    data-testid={`timeline-step-${s.key}-ts`}
                  >
                    {ts}
                  </div>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mt-3.5 ${
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
