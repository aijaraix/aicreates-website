import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowRight, Calendar, Check, Download, FileText, Loader2, Wallet } from "lucide-react";
import VestingCalendar from "@/components/VestingCalendar";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import StatusTimeline from "@/components/StatusTimeline";
import { StatTile } from "@/components/brand";
import { buildIcs } from "@/lib/vesting";
import { ROUNDS, formatVesting } from "@/data/rounds";

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
  const [, setLocation] = useLocation();
  const [paidToast, setPaidToast] = useState<string | null>(null);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const paid = sp.get("paid");
    if (paid) {
      setPaidToast(
        paid === "1"
          ? "Payment received. Your commitment will appear as funded shortly."
          : `Payment received for commitment ${paid.slice(0, 8)}.`,
      );
      sp.delete("paid");
      const q = sp.toString();
      setLocation(`/dashboard${q ? `?${q}` : ""}`, { replace: true });
      const t = setTimeout(() => setPaidToast(null), 6000);
      return () => clearTimeout(t);
    }
    return undefined;
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
      />

      <main className="mx-auto max-w-5xl px-6 py-10 md:py-12">
        {paidToast && (
          <div
            className="mb-6 rounded-2xl border border-[#00F5D4]/40 bg-[#00F5D4]/10 p-4 text-sm text-[#00F5D4]"
            data-testid="toast-paid"
          >
            {paidToast}
          </div>
        )}
        <DistributionWalletCard
          initialAddress={meQuery.data?.user.solanaWalletAddress ?? null}
        />

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
                    className="text-sm inline-flex items-center px-4 h-9 rounded-full teal-btn"
                  >
                    Sign SAFT <ArrowRight className="ml-2 w-4 h-4" />
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
