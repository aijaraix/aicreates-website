import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  Download,
  FileText,
  Loader2,
  Wallet,
} from "lucide-react";
import ReleaseBar from "@/components/ReleaseBar";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import StatusTimeline from "@/components/StatusTimeline";
import { useInvestSeo } from "@/lib/useInvestSeo";
import { StatTile } from "@/components/brand";
import { buildIcs } from "@/lib/vesting";
import { ROUNDS, formatVesting } from "@/data/rounds";
import { AmendDialog, isAmendable } from "@/components/AmendDialog";

interface VestingPoint {
  date: string;
  tokens: number;
  cumulative: number;
  label: string;
}

interface Allocation {
  createdAt?: string | null;
  id: string;
  roundSlug: string;
  tierSlug: string;
  displayName: string;
  amountCents: number;
  currency: string;
  tokenAllocation: number;
  pricePerTokenMillicents: number | null;
  state: string;
  paymentMethod: string | null;
  saftSignedAt: string | null;
  saftStatus: string | null;
  saftSignerName: string | null;
  saftCountersignedAt: string | null;
  saftCountersignerName: string | null;
  lastFailureReason: string | null;
  lastFailureCode: string | null;
  lastFailureDeclineCode: string | null;
  lastFailureAt: string | null;
  kycStatus: string | null;
  accreditationStatus: string | null;
  walletAddress: string | null;
  walletChain: string | null;
  fundedAt: string | null;
  isFunded: boolean;
  lastAmend: {
    actorKind: "investor" | "admin";
    actorEmail: string;
    reason: string | null;
    createdAt: string;
    previousAmountCents: number | null;
    previousRoundSlug: string | null;
    previousRoundLabel: string | null;
    newAmountCents: number | null;
    newRoundSlug: string | null;
    newRoundLabel: string | null;
  } | null;
  vesting: {
    tgeDate: string;
    cliffDate: string;
    schedule: VestingPoint[];
  } | null;
  lines?: Array<{
    roundSlug: string;
    roundLabel: string;
    tokens: number;
    usdCents: number;
    pricePerTokenMillicents: number;
  }>;
}

interface MeAllocations {
  user: { id: string; email: string; role: string };
  allocations: Allocation[];
}

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Format a per-token price in USD millicents as e.g. "$0.010". */
function fmtPricePerToken(millicents: number | null | undefined): string {
  if (millicents == null || !Number.isFinite(millicents)) return "-";
  // 1 millicent = $0.001, so USD per token = millicents / 1000
  return `$${(millicents / 1000).toFixed(3)}`;
}

function fmtDate(v: string | null) {
  if (!v) return "-";
  const ms = Date.parse(v);
  if (Number.isNaN(ms)) return "-";
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function useCountdown(targetIso: string | null): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
  if (!targetIso) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const diff = Date.parse(targetIso) - Date.now();
  const isPast = diff <= 0;
  const abs = Math.max(0, diff);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);
  const seconds = Math.floor((abs % 60_000) / 1000);
  return { days, hours, minutes, seconds, isPast };
}

function TgeBanner({
  fundedCount,
}: {
  allocation: Allocation;
  fundedCount: number;
}) {
  return (
    <div
      className="mb-8 rounded-2xl border border-[#00F5D4]/40 bg-[#00F5D4]/[0.06] p-5"
      data-testid="banner-tge"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[#00F5D4]">
            Funded — waiting for TGE
          </div>
          <div className="mt-1 font-display text-lg">
            {fundedCount} commitment{fundedCount === 1 ? "" : "s"} locked.
            First unlock at TGE.
          </div>
          <div className="mt-1 text-xs text-white/55">
            TGE date is set after the community round closes. Once announced,
            we'll publish it here with countdown and calendar exports.
          </div>
        </div>
        <div
          className="text-center"
          data-testid="tge-tbd"
        >
          <div className="font-display text-2xl text-[#00F5D4] tracking-tight">
            TBD
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-white/40 mt-1">
            announced soon
          </div>
        </div>
      </div>
    </div>
  );
}

function CountUnit({ n, label }: { n: number; label: string }) {
  return (
    <div className="min-w-[44px]">
      <div className="font-display text-2xl tabular-nums text-[#00F5D4]">
        {String(n).padStart(2, "0")}
      </div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
        {label}
      </div>
    </div>
  );
}

function NextActionCard({ a }: { a: Allocation }) {
  const failed = a.state === "failed";
  const [amendOpen, setAmendOpen] = useState(false);
  const labelByState: Record<string, string> = {
    pending_saft: "Sign your SAFT",
    pending_resign: "Re-sign your updated SAFT",
    pending_payment: "Complete payment",
    awaiting_wire: "Waiting for your wire to land",
    failed: "Payment failed - try again",
  };
  const headline = failed
    ? labelByState["failed"]
    : (labelByState[a.state] ?? "Next step");
  const amendable = isAmendable(a.state);
  return (
    <div
      className={
        "rounded-xl border p-3 " +
        (failed
          ? "border-red-400/40 bg-red-500/[0.06]"
          : "border-white/10 bg-black/20")
      }
      data-testid={`next-action-${a.state}-${a.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={
              "text-xs uppercase tracking-[0.16em] " +
              (failed ? "text-red-300" : "text-amber-300")
            }
          >
            {headline}
          </div>
          <div className="mt-1 text-sm">
            <span className="font-medium">{a.displayName}</span>
            <span className="text-white/50 ml-2">{fmt(a.amountCents)}</span>
          </div>
          {failed && a.lastFailureReason && (
            <div className="mt-1 text-xs text-red-200/80 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                {a.lastFailureReason}
                {a.lastFailureDeclineCode && (
                  <span className="text-white/40">
                    {" "}
                    (code: {a.lastFailureDeclineCode})
                  </span>
                )}
              </span>
            </div>
          )}
          {a.state === "awaiting_wire" && !failed && (
            <div className="mt-1 text-xs text-white/55">
              We'll mark this funded as soon as your wire is reconciled.
            </div>
          )}
          {a.state === "pending_resign" && a.lastAmend && (
            <div
              className="mt-2 text-xs rounded-lg border border-amber-300/30 bg-amber-300/[0.05] px-3 py-2 space-y-1"
              data-testid={`amend-transparency-${a.id}`}
            >
              <div className="text-amber-200/85 uppercase tracking-[0.14em] text-[10px]">
                {a.lastAmend.actorKind === "admin"
                  ? `Updated by admin (${a.lastAmend.actorEmail})`
                  : "You updated this commitment"}
              </div>
              <div className="text-white/70">
                {a.lastAmend.previousAmountCents != null && (
                  <>
                    {fmt(a.lastAmend.previousAmountCents)}
                    {a.lastAmend.previousRoundLabel && (
                      <span className="text-white/40">
                        {" "}({a.lastAmend.previousRoundLabel})
                      </span>
                    )}{" "}
                    →{" "}
                  </>
                )}
                <span className="text-[#00F5D4]">
                  {a.lastAmend.newAmountCents != null
                    ? fmt(a.lastAmend.newAmountCents)
                    : fmt(a.amountCents)}
                </span>
                {a.lastAmend.newRoundLabel && (
                  <span className="text-white/40">
                    {" "}({a.lastAmend.newRoundLabel})
                  </span>
                )}
              </div>
              {a.lastAmend.reason && (
                <div className="text-white/55">
                  Reason: {a.lastAmend.reason}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {amendable && (
            <button
              type="button"
              onClick={() => setAmendOpen(true)}
              className="text-xs px-3 h-9 rounded-full border border-white/10 hover:bg-white/[0.04]"
              data-testid={`button-amend-${a.id}`}
            >
              Change amount or round
            </button>
          )}
          {a.state === "pending_saft" || a.state === "pending_resign" ? (
            <Link
              href={`/saft/${a.id}`}
              className="text-sm inline-flex items-center px-4 h-9 rounded-full teal-btn"
            >
              {a.state === "pending_resign" ? "Re-sign SAFT" : "Sign SAFT"}{" "}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          ) : failed ? (
            <Link
              href={`/checkout/${a.id}?failed=1`}
              className="text-sm inline-flex items-center px-4 h-9 rounded-full teal-btn"
            >
              Retry payment <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          ) : a.state === "pending_payment" ? (
            <Link
              href={`/checkout/${a.id}`}
              className="text-sm inline-flex items-center px-4 h-9 rounded-full teal-btn"
            >
              Complete payment <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/checkout/${a.id}`}
              className="text-sm text-amber-200/80 underline"
            >
              View wire instructions
            </Link>
          )}
        </div>
      </div>
      <AmendDialog
        open={amendOpen}
        onClose={() => setAmendOpen(false)}
        commitment={{
          id: a.id,
          amountCents: a.amountCents,
          roundSlug: a.roundSlug,
          displayName: a.displayName,
        }}
        mode="investor"
        invalidateKey={["me", "allocations"]}
      />
    </div>
  );
}

function downloadIcs(a: Allocation) {
  if (!a.vesting) return;
  const ics = buildIcs(a.vesting.schedule, `commitment-${a.id.slice(0, 8)}`);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aica-vesting-${a.id.slice(0, 8)}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}

function googleCalendarUrls(a: Allocation): Array<{ label: string; url: string }> {
  if (!a.vesting) return [];
  return a.vesting.schedule.map((point, i) => {
    const start = point.date.replace(/[-:]/g, "").replace(/\.\d+/, "");
    const endIso = new Date(
      new Date(point.date).getTime() + 60 * 60 * 1000,
    ).toISOString();
    const end = endIso.replace(/[-:]/g, "").replace(/\.\d+/, "");
    const text = `AICA unlock #${i + 1} - ${point.tokens.toLocaleString()} tokens`;
    return {
      label: `${new Date(point.date).toLocaleDateString()} - ${point.tokens.toLocaleString()} AICA`,
      url: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&dates=${start}/${end}&details=Commitment+${a.id}`,
    };
  });
}

function openAllGoogleCalendarEvents(a: Allocation) {
  const items = googleCalendarUrls(a);
  if (items.length === 0) return;
  if (
    items.length > 1 &&
    !confirm(
      `This will open ${items.length} new tabs - one per unlock. Continue?`,
    )
  ) {
    return;
  }
  for (const item of items) {
    window.open(item.url, "_blank", "noopener,noreferrer");
  }
}

export default function Dashboard() {
  useInvestSeo({
    title: "Dashboard",
    description:
      "Your AICA commitments, vesting schedule, SAFTs, and exportable calendar.",
    path: "/dashboard",
  });
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const [paidModal, setPaidModal] = useState<string | null>(null);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const paid = sp.get("paid");
    if (paid) {
      setPaidModal(paid);
      sp.delete("paid");
      const q = sp.toString();
      setLocation(`/dashboard${q ? `?${q}` : ""}`, { replace: true });
    }
  }, [setLocation]);
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () =>
      api<{
        user: {
          role: string;
          solanaWalletAddress?: string | null;
        };
      }>("/me"),
  });
  const isAdmin = meQuery.data?.user.role === "admin";
  const { data, isLoading, error } = useQuery({
    queryKey: ["me", "allocations"],
    queryFn: () => api<MeAllocations>("/me/allocations"),
  });

  const allocations = data?.allocations ?? [];
  const funded = allocations.filter((a) => a.isFunded);
  const totalCents = funded.reduce((s, a) => s + a.amountCents, 0);
  const totalTokens = funded.reduce((s, a) => s + a.tokenAllocation, 0);
  const nextUnlock = funded
    .flatMap((a) => a.vesting?.schedule ?? [])
    .filter((p) => Date.parse(p.date) > Date.now())
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))[0];

  // State-driven only. We never key off lastFailureAt because failure
  // fields aren't always cleared on later success (some Stripe paths only
  // emit checkout.session.completed) — so a funded row could otherwise
  // re-appear as "Payment failed". `failed` is the explicit failed state.
  const pendingActions = allocations.filter(
    (a) =>
      a.state === "pending_saft" ||
      a.state === "pending_resign" ||
      a.state === "pending_payment" ||
      a.state === "awaiting_wire" ||
      a.state === "failed",
  );

  // Earliest TGE among funded commitments — drives the "Funded — waiting for
  // TGE" banner with countdown + calendar exports.
  const earliestTge = funded
    .map((a) => a.vesting?.tgeDate)
    .filter((d): d is string => !!d)
    .sort()[0] ?? null;
  const tgeBannerAllocation =
    funded.find((a) => a.vesting?.tgeDate === earliestTge) ?? null;

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />

      <PageHeader
        eyebrow="Investor dashboard"
        title={
          <>
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}.
          </>
        }
        subtitle="Track every AICA Founders commitment - SAFT status, funding, vesting, and unlocks - in one place."
      />

      {paidModal && (
        <PaymentThankYouModal
          commitmentId={paidModal}
          allocation={allocations.find((a) => a.id === paidModal) ?? null}
          onClose={() => setPaidModal(null)}
        />
      )}

      <main className="mx-auto max-w-5xl px-6 py-10 md:py-12">
        <DistributionWalletCard
          initialAddress={meQuery.data?.user.solanaWalletAddress ?? null}
        />

        {tgeBannerAllocation && tgeBannerAllocation.vesting && (
          <TgeBanner
            allocation={tgeBannerAllocation}
            fundedCount={funded.length}
          />
        )}

        {pendingActions.length > 0 && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5 mb-8 space-y-3">
            <div className="text-xs uppercase tracking-[0.18em] text-amber-300">
              Next action
            </div>
            {pendingActions.map((a) => (
              <NextActionCard key={a.id} a={a} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatTile label="Total committed" value={fmt(totalCents)} accent />
          <StatTile
            label="Token allocation"
            value={totalTokens.toLocaleString()}
          />
          <StatTile
            label="Funded commitments"
            value={String(funded.length)}
          />
          <StatTile
            label="Next unlock"
            value={
              nextUnlock ? `${nextUnlock.tokens.toLocaleString()} AICA` : "-"
            }
            hint={nextUnlock ? "TBD - set after community round" : undefined}
          />
        </div>

        <CurrentRoundStrip />

        <TokenRoundsSection />

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            My Commitments
          </h2>
        </div>

        {isLoading ? (
          <div className="brand-card p-8 text-white/50">Loading…</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-red-300">
            Failed to load.
          </div>
        ) : allocations.length === 0 ? (
          <div className="brand-card p-8 text-white/50">
            No commitments yet. Reserve your first allocation to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {allocations.map((a) => (
              <div
                key={a.id}
                className="brand-card p-6"
                data-testid={`row-commitment-${a.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-white/40 flex items-center gap-2">
                      <span>{a.roundSlug}</span>
                      {a.state === "awaiting_wire" && (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] bg-amber-400/15 text-amber-300 border border-amber-400/40 normal-case tracking-normal"
                          data-testid={`pill-awaiting-wire-${a.id}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                          Pending - waiting admin confirmation
                        </span>
                      )}
                    </div>
                    <div className="font-display text-xl font-semibold tracking-tight mt-1">
                      {a.displayName}
                    </div>
                    <div className="mt-1 text-sm text-white/60 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#00F5D4]">
                        {fmt(a.amountCents)}
                      </span>
                      <span>•</span>
                      <span>{a.tokenAllocation.toLocaleString()} AICA</span>
                      {a.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="uppercase tracking-wider text-[10px]">
                            {a.paymentMethod}
                          </span>
                        </>
                      )}
                      {a.pricePerTokenMillicents != null && (
                        <>
                          <span>•</span>
                          <span
                            className="text-white/70"
                            data-testid={`price-paid-${a.id}`}
                          >
                            Price paid{" "}
                            <span className="text-[#00F5D4] font-medium">
                              {fmtPricePerToken(a.pricePerTokenMillicents)}
                            </span>{" "}
                            / AICA
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {a.saftSignedAt ? (
                      <a
                        href={`/api/saft/${a.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                          a.saftCountersignedAt
                            ? "border-[#00F5D4]/50 bg-[#00F5D4]/10 text-[#00F5D4] hover:bg-[#00F5D4]/15"
                            : "border-white/10 hover:bg-white/[0.04]"
                        }`}
                        data-testid={`link-saft-${a.id}`}
                        title={
                          a.saftCountersignedAt
                            ? `Countersigned ${fmtDate(a.saftCountersignedAt)}${a.saftCountersignerName ? ` by ${a.saftCountersignerName}` : ""}`
                            : "Signed SAFT (awaiting company countersignature)"
                        }
                      >
                        <FileText className="w-3.5 h-3.5" />{" "}
                        {a.saftCountersignedAt
                          ? "Fully-executed SAFT"
                          : "Signed SAFT"}
                      </a>
                    ) : (
                      <Link
                        href={`/saft/${a.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300/40 text-amber-300 hover:bg-amber-300/10"
                      >
                        Sign SAFT
                      </Link>
                    )}
                    {a.isFunded && a.vesting && (
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-white/55"
                        data-testid={`pill-tge-tbd-${a.id}`}
                        title="Calendar exports unlock once TGE is announced after the community round"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Calendar - after TGE
                      </span>
                    )}
                  </div>
                </div>

                {a.lines && a.lines.length > 1 && (
                  <div
                    className="mt-4 rounded-xl border border-white/10 bg-black/30 overflow-hidden"
                    data-testid={`lines-${a.id}`}
                  >
                    <div className="px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-white/40 bg-white/[0.02]">
                      Per-round breakdown ({a.lines.length} rounds)
                    </div>
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-white/5">
                        {a.lines.map((l) => (
                          <tr key={l.roundSlug}>
                            <td className="px-3 py-1.5">{l.roundLabel}</td>
                            <td className="px-3 py-1.5 text-right tabular-nums text-white/60">
                              {fmtPricePerToken(l.pricePerTokenMillicents)}{" "}
                              <span className="text-white/40">/ AICA</span>
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums">
                              {l.tokens.toLocaleString()} AICA
                            </td>
                            <td className="px-3 py-1.5 text-right tabular-nums text-[#00F5D4]">
                              {fmt(l.usdCents)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-5">
                  <StatusTimeline
                    state={{
                      state: a.state,
                      createdAt: a.createdAt ?? null,
                      saftSignedAt: a.saftSignedAt,
                      paymentInitiatedAt:
                        a.state === "pending_payment" ||
                        a.state === "awaiting_wire" ||
                        a.state === "awaiting_crypto" ||
                        a.fundedAt
                          ? a.saftSignedAt
                          : null,
                      fundedAt: a.fundedAt,
                      lockedAt: a.fundedAt,
                      tgeDate: null,
                      cliffDate: null,
                      hasUnlocked: false,
                    }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <Mini label="SAFT" value={a.saftSignedAt ? `Signed ${fmtDate(a.saftSignedAt)}` : "Not signed"} />
                  <Mini label="Funded" value={fmtDate(a.fundedAt)} />
                  <Mini
                    label="TGE"
                    value="TBD - after community round"
                  />
                  <Mini
                    label="Cliff ends"
                    value="TBD - after TGE"
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <Mini
                    label="KYC"
                    value={
                      a.kycStatus && a.kycStatus !== "none"
                        ? a.kycStatus
                        : "Not started"
                    }
                  />
                  <Mini
                    label="Accreditation"
                    value={a.accreditationStatus ?? "-"}
                  />
                  <div
                    className="rounded-xl border border-white/10 bg-black/30 p-3"
                    data-testid={`wallet-${a.id}`}
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">
                      Wallet
                      {a.walletChain && (
                        <span className="ml-1 text-white/30">
                          ({a.walletChain})
                        </span>
                      )}
                    </div>
                    {a.walletAddress ? (
                      <div
                        className="mt-1 text-[11px] font-mono break-all text-white/80"
                        title={a.walletAddress}
                      >
                        {a.walletAddress}
                      </div>
                    ) : (
                      <Link
                        href={`/saft/${a.id}`}
                        className="mt-1 inline-block text-[11px] text-[#00F5D4] hover:underline"
                      >
                        Map wallet →
                      </Link>
                    )}
                  </div>
                </div>

                {a.isFunded && a.vesting && (
                  <div className="mt-6">
                    <ReleaseBar
                      schedule={a.vesting.schedule}
                      total={a.tokenAllocation}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Compact strip rendered just above the full Token Rounds table. Shows the
 * currently open round's price, the next round's step-up price, and a
 * stubbed "Live price" tile. The live tile is intentionally a placeholder
 * until a real venue / price feed exists - the structure is kept so a
 * price source can be wired in without re-styling.
 */
function CurrentRoundStrip() {
  const openIdx = ROUNDS.findIndex((r) => r.open);
  const open = openIdx >= 0 ? ROUNDS[openIdx] : null;
  const next = openIdx >= 0 ? ROUNDS[openIdx + 1] : null;
  if (!open) return null;
  return (
    <section
      className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      data-testid="current-round-strip"
    >
      <div className="brand-card p-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-[#00F5D4]">
          Current round
        </div>
        <div className="mt-1.5 font-display text-lg font-semibold tracking-tight">
          {open.name}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums text-[#00F5D4]">
            {open.pricePerToken.replace(" per AICA", "")}
          </span>
          <span className="text-xs text-white/45">per AICA</span>
        </div>
      </div>
      <div className="brand-card p-5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
          Next round
        </div>
        {next ? (
          <>
            <div className="mt-1.5 font-display text-lg font-semibold tracking-tight text-white/90">
              {next.name}
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums text-white/85">
                {next.pricePerToken.replace(" per AICA", "")}
              </span>
              <span className="text-xs text-white/45">per AICA</span>
            </div>
            <div className="mt-1 text-[11px] text-white/45">
              Step-up from {open.pricePerToken.replace(" per AICA", "")}
            </div>
          </>
        ) : (
          <div className="mt-1.5 text-sm text-white/55">
            All rounds opened
          </div>
        )}
      </div>
      <div className="brand-card p-5" data-testid="live-price-tile">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/45">
          Live price
        </div>
        <div className="mt-1.5 font-display text-lg font-semibold tracking-tight text-white/70">
          Pre-TGE
        </div>
        <div className="mt-2 text-sm text-white/55">Not yet trading</div>
        <div className="mt-1 text-[11px] text-white/40">
          A live market price will appear here after token generation.
        </div>
      </div>
    </section>
  );
}

function TokenRoundsSection() {
  const current = ROUNDS.find((r) => r.open);
  const [view, setView] = useState<"terms" | "vesting">("terms");
  return (
    <section className="mb-10" data-testid="section-token-rounds">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[#00F5D4]">
            Token rounds
          </div>
          <h2 className="font-display text-xl font-semibold tracking-tight mt-1">
            AICA SAFT schedule
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {current && (
            <div className="text-xs text-white/55 hidden md:block">
              Current round:{" "}
              <span className="text-white/85 font-medium">{current.name}</span>{" "}
              · <span className="text-[#00F5D4]">{current.pricePerToken}</span>
            </div>
          )}
          <div
            className="inline-flex items-center p-1 rounded-full border border-white/10 bg-white/[0.02]"
            role="tablist"
            aria-label="Schedule view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "terms"}
              onClick={() => setView("terms")}
              className={`px-3 h-7 rounded-full text-[11px] uppercase tracking-[0.14em] transition ${
                view === "terms"
                  ? "bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40"
                  : "text-white/55 hover:text-white/80"
              }`}
              data-testid="toggle-terms"
            >
              Round terms
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "vesting"}
              onClick={() => setView("vesting")}
              className={`px-3 h-7 rounded-full text-[11px] uppercase tracking-[0.14em] transition ${
                view === "vesting"
                  ? "bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40"
                  : "text-white/55 hover:text-white/80"
              }`}
              data-testid="toggle-vesting"
            >
              Vesting
            </button>
          </div>
        </div>
      </div>

      <div className="brand-card overflow-hidden">
        <div className="overflow-x-auto">
          {view === "terms" ? (
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.16em] text-white/45">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Round</th>
                  <th className="text-right px-4 py-3 font-medium">Price</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">
                    Tokens
                  </th>
                  <th className="text-right px-4 py-3 font-medium hidden md:table-cell">
                    Raise
                  </th>
                  <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">
                    FDV
                  </th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ROUNDS.map((r) => (
                  <tr
                    key={r.slug}
                    className={r.open ? "bg-[#00F5D4]/[0.04]" : ""}
                    data-testid={`round-row-${r.slug}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-white/90">{r.name}</div>
                      <div className="text-[11px] text-white/45 mt-0.5">
                        {r.supplyPct} of supply
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-[#00F5D4] font-medium">
                      {r.pricePerToken.replace(" per AICA", "")}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-white/75 hidden sm:table-cell">
                      {r.tokens}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-white/75 hidden md:table-cell">
                      {r.totalRaise}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-white/55 hidden lg:table-cell">
                      {r.fdv}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {r.open ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
                          Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] text-white/45 border border-white/10">
                          Upcoming
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {r.open ? (
                        <Link
                          href={`/invest?round=${r.slug}`}
                          className="inline-flex items-center justify-center h-8 px-4 rounded-full teal-btn text-xs"
                          data-testid={`button-commit-${r.slug}`}
                        >
                          Commit
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center h-8 px-4 rounded-full glass-btn text-xs opacity-40 cursor-not-allowed"
                          data-testid={`button-commit-${r.slug}`}
                        >
                          Coming soon
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.16em] text-white/45">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Round</th>
                  <th className="text-right px-4 py-3 font-medium">TGE unlock</th>
                  <th className="text-right px-4 py-3 font-medium">Cliff</th>
                  <th className="text-right px-4 py-3 font-medium">Linear vest</th>
                  <th className="text-right px-4 py-3 font-medium hidden md:table-cell">
                    Total duration
                  </th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ROUNDS.map((r) => {
                  const v = formatVesting(r.vesting);
                  const total = r.vesting.cliffMonths + r.vesting.vestingMonths;
                  return (
                    <tr
                      key={r.slug}
                      className={r.open ? "bg-[#00F5D4]/[0.04]" : ""}
                      data-testid={`vest-row-${r.slug}`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-white/90">{r.name}</div>
                        <div className="text-[11px] text-white/45 mt-0.5">
                          {r.pricePerToken.replace(" per AICA", "")} · {r.tokens}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-[#00F5D4] font-medium">
                        {v.tge}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-white/75">
                        {v.cliff}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-white/75">
                        {v.linear}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-white/55 hidden md:table-cell">
                        {total} months
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {r.open ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5D4] animate-pulse" />
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] text-white/45 border border-white/10">
                            Upcoming
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {view === "vesting" && (
          <div className="px-4 py-3 text-[11px] text-white/45 border-t border-white/5">
            Vesting begins at TGE. After the round's cliff, the linear portion
            unlocks in equal monthly installments. Final terms subject to
            counsel review and may be adjusted in the SAFT.
          </div>
        )}
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

const SOLANA_ADDR_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function DistributionWalletCard({
  initialAddress,
}: {
  initialAddress: string | null;
}) {
  const qc = useQueryClient();
  const [value, setValue] = useState(initialAddress ?? "");
  const [savedFlash, setSavedFlash] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  useEffect(() => {
    setValue(initialAddress ?? "");
  }, [initialAddress]);

  const mut = useMutation({
    mutationFn: (addr: string) =>
      api<{ user: { solanaWalletAddress: string | null } }>("/me/wallet", {
        method: "PUT",
        body: { solanaWalletAddress: addr },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setSavedFlash(true);
      setLocalErr(null);
      setTimeout(() => setSavedFlash(false), 2200);
    },
    onError: (e) => setLocalErr((e as Error).message),
  });

  const trimmed = value.trim();
  const isValid = trimmed.length === 0 || SOLANA_ADDR_RE.test(trimmed);
  const dirty = trimmed !== (initialAddress ?? "");
  const isUpdate = Boolean(initialAddress) && dirty;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setLocalErr(
        "Invalid Solana address. Expected a base58 string of 32-44 characters.",
      );
      return;
    }
    setLocalErr(null);
    mut.mutate(trimmed);
  }

  return (
    <section
      className="brand-card p-5 md:p-6 mb-8"
      data-testid="card-distribution-wallet"
    >
      <div className="flex items-start gap-3">
        <div className="hidden sm:flex w-10 h-10 rounded-xl border border-[#00F5D4]/30 bg-[#00F5D4]/10 items-center justify-center text-[#00F5D4] shrink-0">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-[0.18em] text-white/40">
            Distribution wallet
          </div>
          <div className="mt-1 font-display text-lg font-semibold tracking-tight">
            Solana address for token unlocks
          </div>
          <p className="mt-1 text-sm text-white/55">
            Where AICA tokens will be sent at TGE and on every monthly vesting
            unlock. You can update this any time before TGE.
          </p>
          <form
            onSubmit={onSubmit}
            className="mt-4 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setLocalErr(null);
              }}
              className={`flex-1 min-w-0 rounded-xl bg-black/40 border px-3 py-2.5 text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:ring-1 ${
                isValid
                  ? "border-white/15 focus:border-[#00F5D4]/60 focus:ring-[#00F5D4]/40"
                  : "border-red-400/50 focus:border-red-400 focus:ring-red-400/40"
              }`}
              data-testid="input-solana-wallet"
            />
            <button
              type="submit"
              disabled={mut.isPending || !dirty || !isValid}
              className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-full teal-btn text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              data-testid="button-save-wallet"
            >
              {mut.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving
                </>
              ) : savedFlash ? (
                <>
                  <Check className="w-4 h-4" /> Saved
                </>
              ) : (
                <>{isUpdate ? "Update" : "Save"}</>
              )}
            </button>
          </form>
          {localErr ? (
            <div
              className="mt-2 text-xs text-red-300"
              data-testid="text-wallet-error"
            >
              {localErr}
            </div>
          ) : initialAddress && !dirty ? (
            <div className="mt-2 text-xs text-white/45">
              Saved. Update any time before TGE.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PaymentThankYouModal({
  commitmentId,
  allocation,
  onClose,
}: {
  commitmentId: string;
  allocation: Allocation | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Thank you - your payment is in.",
      body: allocation
        ? `We've received your ${fmt(allocation.amountCents)} commitment for ${allocation.tokenAllocation.toLocaleString()} AICA. A confirmation email is on its way.`
        : "We've received your payment. A confirmation email is on its way.",
    },
    {
      title: "Where to find your documents.",
      body: 'Your signed SAFT lives on this dashboard. Look for the teal "Signed SAFT" badge on your commitment - click it to view or download. Once we countersign, the same link upgrades to "Fully-executed SAFT" with both signatures.',
    },
    {
      title: "What happens next.",
      body: "Your commitment will move to 'Funded' within a few minutes (cards are instant; ACH and wires take 1-3 business days). After funding, you'll see your vesting schedule shape right here. The actual TGE date is set after the community round closes, and we'll publish the countdown and calendar exports on this dashboard the moment it's announced.",
    },
    {
      title: "Add your distribution wallet.",
      body: "Before TGE, drop your Solana wallet address into the card at the top of this page so we know where to send your tokens. You can update it any time.",
    },
  ];
  const last = step === steps.length - 1;
  const cur = steps[step]!;
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      data-testid="modal-payment-thankyou"
    >
      <div className="w-full max-w-lg rounded-3xl border border-[#00F5D4]/40 bg-[#0A0A0A] p-7 shadow-[0_0_60px_rgba(0,245,212,0.25)]">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#00F5D4]/80">
          <span className="inline-block w-2 h-2 rounded-full bg-[#00F5D4] shadow-[0_0_10px_#00F5D4]" />
          Payment received
          <span className="ml-auto text-white/40 normal-case tracking-normal">
            {step + 1} / {steps.length}
          </span>
        </div>
        <h2 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-white">
          {cur.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{cur.body}</p>
        <div className="mt-5 flex items-center gap-1.5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i <= step ? "bg-[#00F5D4]" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/45 hover:text-white/70"
            data-testid="button-thankyou-skip"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 rounded-full border border-white/15 text-xs text-white/70 hover:bg-white/[0.04]"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? onClose() : setStep(step + 1))}
              className="px-4 py-1.5 rounded-full teal-btn text-xs font-medium"
              data-testid={last ? "button-thankyou-done" : "button-thankyou-next"}
            >
              {last ? "Got it" : "Next"}
            </button>
          </div>
        </div>
        {commitmentId && (
          <div className="mt-4 text-[10px] text-white/30 font-mono">
            Commitment {commitmentId.slice(0, 8)}
          </div>
        )}
      </div>
    </div>
  );
}
