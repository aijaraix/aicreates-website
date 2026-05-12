import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowRight, Calendar, Download, FileText } from "lucide-react";
import VestingCalendar from "@/components/VestingCalendar";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import StatusTimeline from "@/components/StatusTimeline";
import { StatTile } from "@/components/brand";
import { buildIcs } from "@/lib/vesting";

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
  state: string;
  paymentMethod: string | null;
  saftSignedAt: string | null;
  saftStatus: string | null;
  saftSignerName: string | null;
  kycStatus: string | null;
  accreditationStatus: string | null;
  walletAddress: string | null;
  walletChain: string | null;
  fundedAt: string | null;
  isFunded: boolean;
  vesting: {
    tgeDate: string;
    cliffDate: string;
    schedule: VestingPoint[];
  } | null;
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
  const { user } = useUser();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => api<{ user: { role: string } }>("/me"),
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

  const pendingActions = allocations.filter(
    (a) =>
      a.state === "pending_saft" ||
      a.state === "pending_payment" ||
      a.state === "awaiting_wire",
  );

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
        actions={
          <Link
            href="/invest"
            className="brand-cta"
            data-testid="link-make-commitment-header"
          >
            New commitment <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        }
      />

      <main className="mx-auto max-w-5xl px-6 py-10 md:py-12">
        {pendingActions.length > 0 && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5 mb-8 space-y-2">
            <div className="text-xs uppercase tracking-[0.18em] text-amber-300">
              Pending actions
            </div>
            {pendingActions.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3"
                data-testid={`pending-${a.state}-${a.id}`}
              >
                <div className="text-sm">
                  <span className="font-medium">{a.displayName}</span>
                  <span className="text-white/50 ml-2">
                    {fmt(a.amountCents)}
                  </span>
                </div>
                {a.state === "pending_saft" ? (
                  <Link
                    href={`/saft/${a.id}`}
                    className="text-sm inline-flex items-center px-4 h-9 rounded-full bg-[#00F5D4] text-black font-medium"
                  >
                    Sign SAFT <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                ) : a.state === "pending_payment" ? (
                  <Link
                    href={`/checkout/${a.id}`}
                    className="text-sm inline-flex items-center px-4 h-9 rounded-full bg-[#00F5D4] text-black font-medium shadow-[0_0_20px_-6px_rgba(0,245,212,0.6)]"
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
            hint={
              nextUnlock
                ? new Date(nextUnlock.date).toLocaleDateString()
                : undefined
            }
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Commitments
          </h2>
          <Link
            href="/invest"
            className="brand-cta"
            data-testid="link-make-commitment"
          >
            New commitment <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-white/50">
            Loading…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-red-300">
            Failed to load.
          </div>
        ) : allocations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-white/50">
            No commitments yet. Reserve your first allocation to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {allocations.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
                data-testid={`row-commitment-${a.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-white/40">
                      {a.roundSlug}
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
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {a.saftSignedAt ? (
                      <a
                        href={`/api/saft/${a.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/[0.04]"
                        data-testid={`link-saft-${a.id}`}
                      >
                        <FileText className="w-3.5 h-3.5" /> SAFT PDF
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
                      <>
                        <button
                          onClick={() => downloadIcs(a)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/[0.04]"
                          data-testid={`button-ics-${a.id}`}
                        >
                          <Download className="w-3.5 h-3.5" /> .ics
                        </button>
                        {googleCalendarUrls(a).length > 0 && (
                          <button
                            onClick={() => openAllGoogleCalendarEvents(a)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/[0.04]"
                            data-testid={`button-gcal-${a.id}`}
                            title="Opens one Google Calendar tab per unlock event"
                          >
                            <Calendar className="w-3.5 h-3.5" /> Google Cal
                            ({googleCalendarUrls(a).length})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

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
                      tgeDate: a.vesting?.tgeDate ?? null,
                      cliffDate: a.vesting?.cliffDate ?? null,
                      hasUnlocked:
                        a.isFunded &&
                        Boolean(
                          a.vesting?.schedule.some(
                            (p) => Date.parse(p.date) <= Date.now(),
                          ),
                        ),
                    }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <Mini label="SAFT" value={a.saftSignedAt ? `Signed ${fmtDate(a.saftSignedAt)}` : "Not signed"} />
                  <Mini label="Funded" value={fmtDate(a.fundedAt)} />
                  <Mini
                    label="TGE"
                    value={a.vesting ? fmtDate(a.vesting.tgeDate) : "-"}
                  />
                  <Mini
                    label="Cliff ends"
                    value={a.vesting ? fmtDate(a.vesting.cliffDate) : "-"}
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
                    <div className="text-xs uppercase tracking-[0.18em] text-white/40 mb-3">
                      Vesting calendar
                    </div>
                    <VestingCalendar
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
