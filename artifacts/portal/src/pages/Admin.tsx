import { Link, Redirect } from "wouter";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft, Download, ExternalLink, RefreshCw } from "lucide-react";

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
  tierSlug: string;
  displayName: string;
  tokenAllocation: number;
  receiptUrl: string | null;
  billingCountry: string | null;
  createdAt: string;
  completedAt: string | null;
  refundedAt: string | null;
  stripePaymentIntentId: string | null;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string;
}

interface MeResponse {
  user: { role: string };
}

interface Stats {
  succeeded_count?: string | number;
  pending_count?: string | number;
  refunded_count?: string | number;
  total_succeeded_cents?: string | number;
  total_tokens_allocated?: string | number;
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Succeeded", value: "succeeded" },
  { label: "Pending", value: "pending" },
  { label: "Refunded", value: "refunded" },
  { label: "Failed", value: "failed" },
];

function fmtMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function fmtDate(v: string | null) {
  if (!v) return "—";
  const ms = Date.parse(v);
  if (Number.isNaN(ms)) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Admin() {
  const [statusFilter, setStatusFilter] = useState("");
  const qc = useQueryClient();
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });
  const users = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api<{ users: AppUser[] }>("/admin/users"),
    enabled: me.data?.user.role === "admin",
  });
  const commitments = useQuery({
    queryKey: ["admin", "commitments", statusFilter],
    queryFn: () =>
      api<{ commitments: AdminCommitment[] }>(
        statusFilter
          ? `/admin/commitments?status=${statusFilter}`
          : "/admin/commitments",
      ),
    enabled: me.data?.user.role === "admin",
  });
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => api<{ stats: Stats }>("/admin/stats"),
    enabled: me.data?.user.role === "admin",
  });

  const refund = useMutation({
    mutationFn: (id: string) =>
      api<{ ok: boolean }>(`/admin/commitments/${id}/refund`, {
        method: "POST",
        body: {},
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => alert(`Refund failed: ${(err as Error).message}`),
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

  const downloadCsv = () => {
    const url = `/api/admin/commitments?format=csv${
      statusFilter ? `&status=${statusFilter}` : ""
    }`;
    window.location.href = url;
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-white/5">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>
        <span className="text-xs uppercase tracking-[0.2em] text-[#00F5D4]">
          Admin
        </span>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <h1
          className="text-3xl sm:text-4xl font-semibold tracking-tight mb-8"
          style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
        >
          Admin overview
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Total raised
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#00F5D4]">
              {fmtMoney(totalCents, "usd")}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Tokens allocated
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {totalTokens.toLocaleString()}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Investors
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {users.data?.users.length ?? 0}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Succeeded / Pending / Refunded
            </div>
            <div className="mt-3 text-2xl font-semibold">
              {s.succeeded_count ?? 0} / {s.pending_count ?? 0} /{" "}
              {s.refunded_count ?? 0}
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] mb-10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="font-medium">Commitments</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 rounded-full border border-white/10 p-1 text-xs">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={`px-3 py-1 rounded-full ${
                      statusFilter === f.value
                        ? "bg-[#00F5D4] text-black"
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Date</th>
                    <th className="text-left px-6 py-3 font-medium">Investor</th>
                    <th className="text-left px-6 py-3 font-medium">Tier</th>
                    <th className="text-left px-6 py-3 font-medium">Amount</th>
                    <th className="text-left px-6 py-3 font-medium">Allocation</th>
                    <th className="text-left px-6 py-3 font-medium">Country</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-left px-6 py-3 font-medium">Customer</th>
                    <th className="text-left px-6 py-3 font-medium">Payment</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commitments.data.commitments.map((c) => (
                    <tr key={c.id} className="border-t border-white/5">
                      <td className="px-6 py-3 text-white/70">
                        {fmtDate(c.completedAt ?? c.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-medium">{c.fullName ?? "—"}</div>
                        <div className="text-xs text-white/50">{c.email}</div>
                      </td>
                      <td className="px-6 py-3">{c.displayName}</td>
                      <td className="px-6 py-3 font-medium">
                        {fmtMoney(c.amountCents, c.currency)}
                      </td>
                      <td className="px-6 py-3">
                        {c.tokenAllocation.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        {c.billingCountry ?? "—"}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={
                            c.status === "succeeded"
                              ? "px-2 py-0.5 rounded-full text-xs bg-[#00F5D4]/15 text-[#00F5D4]"
                              : c.status === "refunded"
                                ? "px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/60"
                                : c.status === "pending"
                                  ? "px-2 py-0.5 rounded-full text-xs bg-amber-400/15 text-amber-300"
                                  : "px-2 py-0.5 rounded-full text-xs bg-red-500/15 text-red-300"
                          }
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-white/50">
                        {c.stripeCustomerId ? (
                          <a
                            href={`https://dashboard.stripe.com/customers/${c.stripeCustomerId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-white"
                          >
                            {c.stripeCustomerId.slice(0, 14)}…
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-white/50">
                        {c.stripePaymentIntentId ? (
                          <a
                            href={`https://dashboard.stripe.com/payments/${c.stripePaymentIntentId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-white"
                          >
                            {c.stripePaymentIntentId.slice(0, 14)}…
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {c.status === "succeeded" && c.stripePaymentIntentId && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Refund ${fmtMoney(c.amountCents, c.currency)} to ${c.email}?`,
                                )
                              ) {
                                refund.mutate(c.id);
                              }
                            }}
                            disabled={refund.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-red-400/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                            data-testid={`button-refund-${c.id}`}
                          >
                            <RefreshCw className="w-3 h-3" /> Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
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
                  <tr key={u.id} className="border-t border-white/5">
                    <td className="px-6 py-3">{u.email}</td>
                    <td className="px-6 py-3">{u.fullName ?? "—"}</td>
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
