import { Link, Redirect } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import RoundContext from "@/components/RoundContext";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  stripeCustomerId: string | null;
  createdAt: string;
}

interface AdminCommitment {
  id: string;
  userId: string | null;
  email: string | null;
  fullName: string | null;
  amountCents: number;
  currency: string;
  status: string;
  state: string;
  tierSlug: string;
  roundSlug: string;
  displayName: string;
  tokenAllocation: number;
  paymentMethod: string | null;
  saftSignedAt: string | null;
  saftSignerName: string | null;
  fundedAt: string | null;
  receiptUrl: string | null;
  billingCountry: string | null;
  createdAt: string;
  completedAt: string | null;
  refundedAt: string | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string | null;
  kycStatus?: string | null;
  accreditationStatus?: string | null;
  walletAddress?: string | null;
}

interface MeResponse {
  user: { role: string };
}

interface Stats {
  succeeded_count?: string | number;
  pending_count?: string | number;
  awaiting_wire_count?: string | number;
  awaiting_crypto_count?: string | number;
  refunded_count?: string | number;
  total_succeeded_cents?: string | number;
  total_tokens_allocated?: string | number;
}

interface RoundResp {
  round: {
    slug: string;
    label: string;
    targetRaiseCents: number;
    hardCapCents: number;
  };
  raised: {
    fundedCents: number;
    inFlightCents: number;
    fundedCount: number;
    fundedInvestors: number;
    totalCommitments: number;
  };
}

interface Application {
  id: string;
  userId: string;
  email: string | null;
  fullName: string | null;
  status: string;
  accreditation: string | null;
  country: string | null;
  intendedAmountCents: number | null;
  persona: string | null;
  thesisFit: string | null;
  referralSource: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

interface AuditEntry {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

interface Note {
  id: string;
  authorEmail: string;
  body: string;
  createdAt: string;
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending SAFT", value: "pending_saft" },
  { label: "Pending payment", value: "pending_payment" },
  { label: "Awaiting wire", value: "awaiting_wire" },
  { label: "Awaiting crypto", value: "awaiting_crypto" },
  { label: "Funded", value: "succeeded" },
  { label: "Refunded", value: "refunded" },
];

const KYC_OPTIONS = ["none", "declared", "pending", "verified", "rejected"];
const APP_STATUSES = ["submitted", "approved", "needs_review", "rejected"];

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

function fmtDateTime(v: string | null) {
  if (!v) return "-";
  const ms = Date.parse(v);
  if (Number.isNaN(ms)) return "-";
  return new Date(ms).toLocaleString();
}

export default function Admin() {
  const [statusFilter, setStatusFilter] = useState("");
  const [notesUserId, setNotesUserId] = useState<string | null>(null);
  const qc = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });
  const isAdmin = me.data?.user.role === "admin";
  const users = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api<{ users: AppUser[] }>("/admin/users"),
    enabled: isAdmin,
  });
  const commitments = useQuery({
    queryKey: ["admin", "commitments", statusFilter],
    queryFn: () =>
      api<{ commitments: AdminCommitment[] }>(
        statusFilter
          ? `/admin/commitments?status=${statusFilter}`
          : "/admin/commitments",
      ),
    enabled: isAdmin,
  });
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api<{ stats: Stats }>("/admin/stats"),
    enabled: isAdmin,
  });
  const apps = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: () => api<{ applications: Application[] }>("/admin/applications"),
    enabled: isAdmin,
  });
  const audit = useQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: () => api<{ entries: AuditEntry[] }>("/admin/audit-log"),
    enabled: isAdmin,
  });
  const round = useQuery({
    queryKey: ["rounds", "active"],
    queryFn: () => api<RoundResp>("/rounds/active"),
    enabled: isAdmin,
  });

  const refund = useMutation({
    mutationFn: (id: string) =>
      api<{ ok: boolean }>(`/admin/commitments/${id}/refund`, { body: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (err) => alert(`Refund failed: ${(err as Error).message}`),
  });
  const confirmWire = useMutation({
    mutationFn: (id: string) =>
      api<{ ok: boolean }>(`/admin/commitments/${id}/confirm-wire`, { body: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (err) => alert(`Confirm wire failed: ${(err as Error).message}`),
  });
  const confirmCrypto = useMutation({
    mutationFn: (id: string) =>
      api<{ ok: boolean }>(`/admin/commitments/${id}/confirm-crypto`, { body: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (err) => alert(`Confirm crypto failed: ${(err as Error).message}`),
  });
  const updateKyc = useMutation({
    mutationFn: ({
      id,
      kycStatus,
    }: {
      id: string;
      kycStatus: string;
    }) =>
      api<{ commitment: AdminCommitment }>(
        `/admin/commitments/${id}/kyc`,
        { method: "PATCH", body: { kycStatus } },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (err) => alert(`KYC update failed: ${(err as Error).message}`),
  });
  const reviewApp = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api<{ application: Application }>(`/admin/applications/${id}/review`, {
        body: { status },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (err) => alert(`Review failed: ${(err as Error).message}`),
  });

  if (me.isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] text-white/60 flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (me.data && me.data.user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const s = stats.data?.stats ?? {};
  const totalCents = Number(s.total_succeeded_cents ?? 0);
  const totalTokens = Number(s.total_tokens_allocated ?? 0);
  const r = round.data;
  const remainingCents = r
    ? Math.max(0, r.round.targetRaiseCents - r.raised.fundedCents)
    : 0;
  const investorCount = r?.raised.fundedInvestors ?? 0;
  const avgCheckCents =
    investorCount > 0 ? Math.round(r!.raised.fundedCents / investorCount) : 0;
  const totalApps = apps.data?.applications.length ?? 0;
  const conversionPct =
    totalApps > 0
      ? Math.round((investorCount / totalApps) * 1000) / 10
      : 0;

  const downloadCsv = () => {
    const url = `/api/admin/commitments?format=csv${
      statusFilter ? `&status=${statusFilter}` : ""
    }`;
    window.location.href = url;
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />

      <PageHeader
        eyebrow="Operator console"
        title={<>Admin overview.</>}
        subtitle="Round telemetry, applications, commitments, audit log, and per-investor notes."
      />

      <main className="mx-auto max-w-7xl px-6 py-10 md:py-12 space-y-10">
        <RoundContext />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="admin-kpis">
          <Card label="Total raised" value={fmt(totalCents)} accent />
          <Card label="Remaining to target" value={fmt(remainingCents)} />
          <Card label="Funded investors" value={String(investorCount)} />
          <Card
            label="Avg check"
            value={avgCheckCents > 0 ? fmt(avgCheckCents) : "-"}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card label="Tokens allocated" value={totalTokens.toLocaleString()} />
          <Card label="Total accounts" value={String(users.data?.users.length ?? 0)} />
          <Card
            label="Application → funded"
            value={totalApps > 0 ? `${conversionPct}%` : "-"}
            small
          />
          <Card
            label="Funded / Pending / Wire / Crypto / Refunded"
            value={`${s.succeeded_count ?? 0} / ${s.pending_count ?? 0} / ${s.awaiting_wire_count ?? 0} / ${s.awaiting_crypto_count ?? 0} / ${s.refunded_count ?? 0}`}
            small
          />
        </div>

        {/* Applications */}
        <section
          className="brand-card overflow-hidden"
          data-testid="section-applications"
        >
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-medium">
              Allocation Gateway applications
              <span className="ml-2 text-xs text-white/40">
                ({apps.data?.applications.length ?? 0})
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Investor</th>
                  <th className="text-left px-4 py-3 font-medium">Geo</th>
                  <th className="text-left px-4 py-3 font-medium">Persona</th>
                  <th className="text-left px-4 py-3 font-medium">Accred</th>
                  <th className="text-left px-4 py-3 font-medium">Intended</th>
                  <th className="text-left px-4 py-3 font-medium">Thesis</th>
                  <th className="text-right px-4 py-3 font-medium">Review</th>
                </tr>
              </thead>
              <tbody>
                {(apps.data?.applications ?? []).map((a) => (
                  <tr
                    key={a.id}
                    className="brand-table-row border-t border-white/5"
                    data-testid={`row-application-${a.id}`}
                  >
                    <td className="px-4 py-3 text-white/70">
                      {fmtDate(a.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.fullName ?? "-"}</div>
                      <div className="text-xs text-white/50">{a.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider text-white/60">
                      {a.country ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider text-white/60">
                      {a.persona ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60">
                      {a.accreditation ?? "-"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {a.intendedAmountCents
                        ? fmt(a.intendedAmountCents)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/60 max-w-[280px]">
                      <div className="line-clamp-2">{a.thesisFit ?? "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <select
                        value={a.status}
                        onChange={(e) =>
                          reviewApp.mutate({
                            id: a.id,
                            status: e.target.value,
                          })
                        }
                        disabled={reviewApp.isPending}
                        className="bg-black/40 border border-white/10 rounded-full px-2 py-1 text-xs"
                        data-testid={`select-app-status-${a.id}`}
                      >
                        {APP_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      {a.reviewedBy && (
                        <div className="text-[10px] text-white/40 mt-1">
                          by {a.reviewedBy}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {(apps.data?.applications ?? []).length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-white/40"
                    >
                      No applications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Commitments */}
        <section className="brand-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-medium">Commitments</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 rounded-full border border-white/10 p-1 text-xs">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3 py-1 rounded-full transition ${
                      statusFilter === f.value
                        ? "bg-[#00F5D4] text-black shadow-[0_0_16px_-4px_rgba(0,245,212,0.6)]"
                        : "text-white/60 hover:text-white"
                    }`}
                    data-testid={`button-filter-${f.value || "all"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                onClick={downloadCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-white/10 hover:bg-white/[0.04]"
                data-testid="button-export-csv"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
          {commitments.isLoading ? (
            <div className="px-6 py-8 text-white/50">Loading...</div>
          ) : !commitments.data?.commitments.length ? (
            <div className="px-6 py-8 text-white/50">
              No commitments {statusFilter ? `with status ${statusFilter}` : "yet"}.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-xl border border-white/5">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-white/50 sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md">
                  <tr className="border-b border-white/10">
                    <th className="text-left px-3 py-3 font-medium">Date</th>
                    <th className="text-left px-3 py-3 font-medium">Investor</th>
                    <th className="text-left px-3 py-3 font-medium">Tier</th>
                    <th className="text-left px-3 py-3 font-medium">Amount</th>
                    <th className="text-left px-3 py-3 font-medium">State</th>
                    <th className="text-left px-3 py-3 font-medium">KYC</th>
                    <th className="text-left px-3 py-3 font-medium">Accred</th>
                    <th className="text-left px-3 py-3 font-medium">Wallet</th>
                    <th className="text-left px-3 py-3 font-medium">SAFT</th>
                    <th className="text-right px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commitments.data.commitments.map((c) => (
                    <tr key={c.id} className="brand-table-row border-t border-white/5">
                      <td className="px-3 py-3 text-white/70 text-xs">
                        {fmtDate(c.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{c.fullName ?? "-"}</div>
                        <div className="text-xs text-white/50">{c.email}</div>
                        {c.userId && (
                          <button
                            onClick={() =>
                              setNotesUserId(
                                notesUserId === c.userId ? null : c.userId,
                              )
                            }
                            className="text-[10px] text-[#00F5D4]/70 hover:text-[#00F5D4] mt-1"
                            data-testid={`button-toggle-notes-${c.id}`}
                          >
                            {notesUserId === c.userId
                              ? "Hide notes"
                              : "Notes →"}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs">{c.displayName}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">
                          {c.roundSlug}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium">
                        {fmt(c.amountCents)}
                        <div className="text-[10px] text-white/40">
                          {c.tokenAllocation.toLocaleString()} AICA
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            c.state === "funded" || c.status === "succeeded"
                              ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                              : c.state === "awaiting_wire" ||
                                  c.state === "awaiting_crypto"
                                ? "bg-blue-400/15 text-blue-300"
                                : c.state === "refunded"
                                  ? "bg-white/10 text-white/60"
                                  : c.state === "failed"
                                    ? "bg-red-500/15 text-red-300"
                                    : "bg-amber-400/15 text-amber-300"
                          }`}
                        >
                          {c.state.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={c.kycStatus ?? "none"}
                          onChange={(e) =>
                            updateKyc.mutate({
                              id: c.id,
                              kycStatus: e.target.value,
                            })
                          }
                          disabled={updateKyc.isPending}
                          className="bg-black/40 border border-white/10 rounded-full px-2 py-1 text-[10px]"
                          data-testid={`select-kyc-${c.id}`}
                        >
                          {KYC_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3 text-[10px] text-white/60">
                        {c.accreditationStatus ?? "-"}
                      </td>
                      <td
                        className="px-3 py-3 text-[10px] text-white/60 max-w-[120px] truncate font-mono"
                        title={c.walletAddress ?? undefined}
                      >
                        {c.walletAddress ?? "-"}
                      </td>
                      <td className="px-3 py-3">
                        {c.saftSignedAt ? (
                          <a
                            href={`/api/saft/${c.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00F5D4] text-[11px] hover:underline"
                          >
                            {c.saftSignerName ?? "View"}
                          </a>
                        ) : (
                          <span className="text-white/30 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        {c.state === "awaiting_wire" && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Mark wire received for ${fmt(c.amountCents)} from ${c.email}?`,
                                )
                              ) {
                                confirmWire.mutate(c.id);
                              }
                            }}
                            disabled={confirmWire.isPending}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-full border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4]/10 disabled:opacity-50"
                            data-testid={`button-confirm-wire-${c.id}`}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Wire
                          </button>
                        )}
                        {c.state === "awaiting_crypto" && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Mark crypto received for ${fmt(c.amountCents)} from ${c.email}?`,
                                )
                              ) {
                                confirmCrypto.mutate(c.id);
                              }
                            }}
                            disabled={confirmCrypto.isPending}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-full border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4]/10 disabled:opacity-50"
                            data-testid={`button-confirm-crypto-${c.id}`}
                          >
                            <CheckCircle2 className="w-3 h-3" /> Crypto
                          </button>
                        )}
                        {(c.state === "funded" || c.status === "succeeded") &&
                          c.stripePaymentIntentId && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Refund ${fmt(c.amountCents)} to ${c.email}?`,
                                  )
                                ) {
                                  refund.mutate(c.id);
                                }
                              }}
                              disabled={refund.isPending}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-full border border-red-400/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50 ml-1"
                              data-testid={`button-refund-${c.id}`}
                            >
                              <RefreshCw className="w-3 h-3" /> Refund
                            </button>
                          )}
                        {c.stripePaymentIntentId && (
                          <a
                            href={`https://dashboard.stripe.com/payments/${c.stripePaymentIntentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1 inline-flex items-center text-white/40 hover:text-white"
                            title="Stripe payment"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {notesUserId && (
          <NotesPanel
            userId={notesUserId}
            onClose={() => setNotesUserId(null)}
          />
        )}

        {/* Audit log */}
        <section
          className="brand-card overflow-hidden"
          data-testid="section-audit-log"
        >
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-medium">Audit log</h2>
          </div>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/40 sticky top-0 bg-[#0A0A0A]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">When</th>
                  <th className="text-left px-4 py-3 font-medium">Actor</th>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="text-left px-4 py-3 font-medium">Target</th>
                  <th className="text-left px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {(audit.data?.entries ?? []).map((e) => (
                  <tr key={e.id} className="brand-table-row border-t border-white/5">
                    <td className="px-4 py-2 text-xs text-white/60 whitespace-nowrap">
                      {fmtDateTime(e.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-xs">{e.actorEmail}</td>
                    <td className="px-4 py-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-[#00F5D4]/10 text-[#00F5D4]">
                        {e.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[11px] font-mono text-white/60">
                      {e.targetType}/{e.targetId?.slice(0, 8) ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-[11px] text-white/50 font-mono">
                      {Object.keys(e.details ?? {}).length
                        ? JSON.stringify(e.details).slice(0, 120)
                        : "-"}
                    </td>
                  </tr>
                ))}
                {(audit.data?.entries ?? []).length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-white/40"
                    >
                      No audit entries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Investors */}
        <section className="brand-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-medium">Investors</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Email</th>
                  <th className="text-left px-6 py-3 font-medium">Name</th>
                  <th className="text-left px-6 py-3 font-medium">Role</th>
                  <th className="text-left px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {(users.data?.users ?? []).map((u) => (
                  <tr key={u.id} className="brand-table-row border-t border-white/5">
                    <td className="px-6 py-3">{u.email}</td>
                    <td className="px-6 py-3">{u.fullName ?? "-"}</td>
                    <td className="px-6 py-3 text-xs uppercase tracking-[0.14em] text-white/60">
                      {u.role}
                    </td>
                    <td className="px-6 py-3 text-white/60">
                      {fmtDate(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function NotesPanel({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const notes = useQuery({
    queryKey: ["admin", "notes", userId],
    queryFn: () => api<{ notes: Note[] }>(`/admin/notes/${userId}`),
  });
  const create = useMutation({
    mutationFn: () =>
      api<{ note: Note }>(`/admin/notes`, {
        body: { targetUserId: userId, body },
      }),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["admin", "notes", userId] });
      qc.invalidateQueries({ queryKey: ["admin", "audit-log"] });
    },
    onError: (err) => alert(`Note failed: ${(err as Error).message}`),
  });
  return (
    <section
      className="rounded-2xl border border-[#00F5D4]/30 bg-[#00F5D4]/5 p-6"
      data-testid={`notes-panel-${userId}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">
          Notes for{" "}
          <span className="font-mono text-xs text-white/60">
            {userId.slice(0, 12)}...
          </span>
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-white/60 hover:text-white"
        >
          Close
        </button>
      </div>
      <div className="space-y-3 mb-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={4000}
          placeholder="Add a note (visible to all admins)..."
          className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-[#00F5D4]/55 focus:shadow-[0_0_0_3px_rgba(0,245,212,0.12)] transition"
          data-testid="textarea-new-note"
        />
        <button
          onClick={() => create.mutate()}
          disabled={!body.trim() || create.isPending}
          className="brand-cta !h-9 text-sm"
          data-testid="button-add-note"
        >
          {create.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            "Add note"
          )}
        </button>
      </div>
      <div className="space-y-2">
        {(notes.data?.notes ?? []).map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-white/10 bg-black/30 p-3"
            data-testid={`note-${n.id}`}
          >
            <div className="text-xs text-white/40 flex justify-between">
              <span>{n.authorEmail}</span>
              <span>{fmtDateTime(n.createdAt)}</span>
            </div>
            <div className="mt-1 text-sm whitespace-pre-wrap">{n.body}</div>
          </div>
        ))}
        {(notes.data?.notes ?? []).length === 0 && (
          <div className="text-xs text-white/40">No notes yet.</div>
        )}
      </div>
    </section>
  );
}

function Card({
  label,
  value,
  accent,
  small,
}: {
  label: string;
  value: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="brand-card brand-hairline-teal p-5 md:p-6">
      <div className="text-[11px] uppercase tracking-[0.16em] text-white/50 font-medium">
        {label}
      </div>
      <div
        className={`mt-2 font-display tracking-tight font-semibold ${
          small ? "text-lg md:text-xl" : "text-2xl md:text-3xl"
        } ${accent ? "text-gradient-teal" : "text-white"}`}
      >
        {value}
      </div>
    </div>
  );
}
