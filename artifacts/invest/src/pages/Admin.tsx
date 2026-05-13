import { Redirect } from "wouter";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import {
  CheckCircle2,
  Download,
  ExternalLink,
  Loader2,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

/* ---------------------- types ------------------------------------ */

interface MeResponse {
  user: { role: string; email: string };
}
interface OverviewResp {
  stats: Record<string, string | number>;
  byRound: Array<{
    roundSlug: string;
    label: string;
    commitmentCount: number;
    fundedCount: number;
    fundedCents: number;
    allocatedTokens: number;
  }>;
  rounds: Array<{ slug: string; label: string }>;
  recentActivity: AuditEntry[];
  totals: { users: number; applications: number };
}
interface InvestorRow {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  loginCount: number;
  stripeCustomerId: string | null;
  commitmentCount: number;
  fundedCount: number;
  fundedCents: number;
  pendingCents: number;
  totalTokens: number;
  hasProfile: boolean;
  country: string | null;
}
interface CommitmentRow {
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
interface InvestorDetail {
  user: InvestorRow;
  profile: Record<string, unknown> | null;
  commitments: CommitmentRow[];
  notes: Note[];
  audit: AuditEntry[];
  applications: Array<{
    id: string;
    status: string;
    intendedAmountCents: number | null;
    createdAt: string;
  }>;
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

/* ---------------------- helpers ---------------------------------- */

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

function downloadFile(url: string) {
  // anchor + click avoids navigating away from the SPA
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener noreferrer";
  a.click();
}

/* ===================================================================
 * Page
 * =================================================================== */

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });
  const isAdmin = me.data?.user.role === "admin";

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

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <PortalNav showAdmin={isAdmin} />
      <PageHeader
        eyebrow="Operator console"
        title={<>Admin console.</>}
        subtitle="Round telemetry, investor records, commitment ops, and a full audit trail."
      />
      <main className="mx-auto max-w-7xl px-6 py-10 md:py-12">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList
            className="mb-8 bg-white/[0.03] border border-white/10"
            data-testid="admin-tabs"
          >
            <TabsTrigger value="overview" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="investors" data-testid="tab-investors">
              Investors
            </TabsTrigger>
            <TabsTrigger value="commitments" data-testid="tab-commitments">
              Commitments
            </TabsTrigger>
            <TabsTrigger value="audit" data-testid="tab-audit">
              Audit
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          <TabsContent value="investors">
            <InvestorsTab />
          </TabsContent>
          <TabsContent value="commitments">
            <CommitmentsTab />
          </TabsContent>
          <TabsContent value="audit">
            <AuditTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ===================================================================
 * Overview tab
 * =================================================================== */

interface AdminsResp {
  emails: string[];
  users: Array<{
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    lastLoginAt: string | null;
    loginCount: number;
    createdAt: string;
  }>;
}

function OverviewTab() {
  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => api<OverviewResp>("/admin/overview"),
  });
  const admins = useQuery({
    queryKey: ["admin", "admins"],
    queryFn: () => api<AdminsResp>("/admin/admins"),
  });
  if (overview.isLoading) return <SkeletonBlock />;
  if (!overview.data) return <div className="text-white/50">No data.</div>;

  const s = overview.data.stats;
  const fundedCents = Number(s["funded_cents"] ?? 0);
  const inFlightCents = Number(s["in_flight_cents"] ?? 0);
  const fundedInvestors = Number(s["funded_investors"] ?? 0);
  const allocatedTokens = Number(s["allocated_tokens"] ?? 0);
  const fundedCount = Number(s["funded_count"] ?? 0);
  const pendingCount = Number(s["pending_count"] ?? 0);
  const wireCount = Number(s["awaiting_wire_count"] ?? 0);
  const cryptoCount = Number(s["awaiting_crypto_count"] ?? 0);
  const refundedCount = Number(s["refunded_count"] ?? 0);
  const avgCheck =
    fundedInvestors > 0 ? Math.round(fundedCents / fundedInvestors) : 0;

  return (
    <div className="space-y-8" data-testid="overview-tab">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Total raised" value={fmt(fundedCents)} accent />
        <Card label="In flight" value={fmt(inFlightCents)} />
        <Card label="Funded investors" value={String(fundedInvestors)} />
        <Card label="Avg check" value={avgCheck > 0 ? fmt(avgCheck) : "-"} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card label="Tokens allocated" value={allocatedTokens.toLocaleString()} />
        <Card label="Total accounts" value={String(overview.data.totals.users)} />
        <Card
          label="Applications"
          value={String(overview.data.totals.applications)}
        />
        <Card
          label="Funded / Pending / Wire / Crypto / Refunded"
          value={`${fundedCount} / ${pendingCount} / ${wireCount} / ${cryptoCount} / ${refundedCount}`}
          small
        />
      </div>

      <section className="brand-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="font-medium">Per-round breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Round</th>
                <th className="text-right px-4 py-3 font-medium">Commitments</th>
                <th className="text-right px-4 py-3 font-medium">Funded</th>
                <th className="text-right px-4 py-3 font-medium">Raised</th>
                <th className="text-right px-4 py-3 font-medium">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {overview.data.byRound.map((r) => (
                <tr
                  key={r.roundSlug}
                  className="brand-table-row border-t border-white/5"
                  data-testid={`row-round-${r.roundSlug}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.label}</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider">
                      {r.roundSlug}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">{r.commitmentCount}</td>
                  <td className="px-4 py-3 text-right">{r.fundedCount}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {fmt(r.fundedCents)}
                  </td>
                  <td className="px-4 py-3 text-right text-white/70">
                    {r.allocatedTokens.toLocaleString()}
                  </td>
                </tr>
              ))}
              {overview.data.byRound.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-white/40"
                  >
                    No commitments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="brand-card overflow-hidden"
        data-testid="admin-emails-panel"
      >
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="font-medium">Operators (ADMIN_EMAILS)</h2>
            <p className="text-xs text-white/45 mt-0.5">
              Source of truth: <code className="text-[#00F5D4]">ADMIN_EMAILS</code> env var. Re-checked on every admin
              request — add or remove an email and access updates on the next call.
            </p>
          </div>
          <span className="text-xs text-white/50">
            {admins.data?.emails.length ?? 0} configured
          </span>
        </div>
        {admins.isLoading ? (
          <div className="px-6 py-4 text-white/50 text-sm">Loading…</div>
        ) : !admins.data || admins.data.emails.length === 0 ? (
          <div className="px-6 py-4 text-white/50 text-sm">
            No <code>ADMIN_EMAILS</code> configured. Set the env var in Replit
            Deployments → Secrets to grant admin access.
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {admins.data.emails.map((email) => {
              const u = admins.data!.users.find(
                (x) => x.email.toLowerCase() === email.toLowerCase(),
              );
              return (
                <li
                  key={email}
                  className="px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm"
                  data-testid={`row-admin-${email}`}
                >
                  <span className="font-mono text-white/85 sm:w-72 truncate">
                    {email}
                  </span>
                  <span className="text-xs text-white/55 sm:w-48 truncate">
                    {u?.fullName ?? "—"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider w-fit ${
                      u
                        ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                        : "bg-white/5 text-white/45"
                    }`}
                  >
                    {u ? "Active" : "Not signed in yet"}
                  </span>
                  <span className="text-xs text-white/45 sm:ml-auto">
                    {u?.lastLoginAt
                      ? `Last seen ${fmtDate(u.lastLoginAt)}`
                      : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="brand-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="font-medium">Recent admin actions</h2>
        </div>
        <ul className="divide-y divide-white/5">
          {overview.data.recentActivity.map((e) => (
            <li
              key={e.id}
              className="px-6 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
            >
              <span className="text-xs text-white/50 sm:w-44 shrink-0">
                {fmtDateTime(e.createdAt)}
              </span>
              <span className="text-xs text-white/70 sm:w-52 truncate">
                {e.actorEmail}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#00F5D4]/10 text-[#00F5D4] text-xs w-fit">
                {e.action}
              </span>
              <span className="text-[11px] text-white/50 font-mono truncate">
                {e.targetType}/{e.targetId?.slice(0, 8) ?? "-"}
              </span>
            </li>
          ))}
          {overview.data.recentActivity.length === 0 && (
            <li className="px-6 py-6 text-center text-white/40 text-sm">
              No activity yet.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

/* ===================================================================
 * Investors tab
 * =================================================================== */

function InvestorsTab() {
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [hasCommitments, setHasCommitments] = useState<"" | "true" | "false">(
    "",
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const qParam = useDebounced(q, 300);

  const investors = useQuery({
    queryKey: ["admin", "investors", qParam, role, hasCommitments],
    queryFn: () => {
      const u = new URLSearchParams();
      if (qParam) u.set("q", qParam);
      if (role) u.set("role", role);
      if (hasCommitments) u.set("hasCommitments", hasCommitments);
      const qs = u.toString();
      return api<{ investors: InvestorRow[] }>(
        `/admin/investors${qs ? `?${qs}` : ""}`,
      );
    },
  });

  const exportUrl = (fmtType: "csv" | "xlsx") => {
    const u = new URLSearchParams();
    u.set("format", fmtType);
    if (qParam) u.set("q", qParam);
    if (role) u.set("role", role);
    if (hasCommitments) u.set("hasCommitments", hasCommitments);
    return `/api/admin/investors?${u.toString()}`;
  };

  return (
    <div className="space-y-6" data-testid="investors-tab">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <SearchBox value={q} onChange={setQ} placeholder="Search email or name" />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={role}
            onChange={setRole}
            options={[
              { value: "", label: "All roles" },
              { value: "investor", label: "Investor" },
              { value: "admin", label: "Admin" },
            ]}
            testId="select-investor-role"
          />
          <Select
            value={hasCommitments}
            onChange={(v) => setHasCommitments(v as "" | "true" | "false")}
            options={[
              { value: "", label: "All accounts" },
              { value: "true", label: "Has commitments" },
              { value: "false", label: "No commitments" },
            ]}
            testId="select-has-commitments"
          />
          <ExportButtons
            csvUrl={exportUrl("csv")}
            xlsxUrl={exportUrl("xlsx")}
            testIdRoot="export-investors"
          />
        </div>
      </div>

      <section className="brand-card overflow-hidden">
        {investors.isLoading ? (
          <div className="px-6 py-8 text-white/50">Loading...</div>
        ) : !investors.data?.investors.length ? (
          <div className="px-6 py-8 text-white/50">No investors match.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Investor</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Country</th>
                  <th className="text-right px-4 py-3 font-medium">
                    Commitments
                  </th>
                  <th className="text-right px-4 py-3 font-medium">Funded</th>
                  <th className="text-right px-4 py-3 font-medium">Pending</th>
                  <th className="text-right px-4 py-3 font-medium">Tokens</th>
                  <th className="text-right px-4 py-3 font-medium">Joined</th>
                  <th className="text-right px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {investors.data.investors.map((i) => (
                  <tr
                    key={i.id}
                    className="brand-table-row border-t border-white/5"
                    data-testid={`row-investor-${i.id}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{i.fullName ?? "-"}</div>
                      <div className="text-xs text-white/50">{i.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          i.role === "admin"
                            ? "bg-[#00F5D4]/15 text-[#00F5D4]"
                            : "bg-white/10 text-white/70"
                        }`}
                      >
                        {i.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs uppercase tracking-wider text-white/60">
                      {i.country ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {i.commitmentCount}{" "}
                      <span className="text-white/40 text-xs">
                        ({i.fundedCount} funded)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {i.fundedCents > 0 ? fmt(i.fundedCents) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-white/70">
                      {i.pendingCents > 0 ? fmt(i.pendingCents) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-white/70">
                      {i.totalTokens > 0
                        ? i.totalTokens.toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-white/60 text-xs">
                      {fmtDate(i.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setOpenId(i.id)}
                        className="text-xs text-[#00F5D4] hover:underline"
                        data-testid={`button-open-investor-${i.id}`}
                      >
                        Open →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {openId && (
        <InvestorDrawer userId={openId} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}

function InvestorDrawer({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const detail = useQuery({
    queryKey: ["admin", "investor", userId],
    queryFn: () => api<InvestorDetail>(`/admin/investors/${userId}`),
  });
  const [noteBody, setNoteBody] = useState("");
  const updateRole = useMutation({
    mutationFn: (role: string) =>
      api(`/admin/investors/${userId}`, { method: "PATCH", body: { role } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "investor", userId] });
      qc.invalidateQueries({ queryKey: ["admin", "investors"] });
    },
    onError: (e) => alert(`Update failed: ${(e as Error).message}`),
  });
  const addNote = useMutation({
    mutationFn: () =>
      api<{ note: Note }>("/admin/notes", {
        body: { targetUserId: userId, body: noteBody },
      }),
    onSuccess: () => {
      setNoteBody("");
      qc.invalidateQueries({ queryKey: ["admin", "investor", userId] });
    },
    onError: (e) => alert(`Note failed: ${(e as Error).message}`),
  });
  const deleteNote = useMutation({
    mutationFn: (id: string) =>
      api(`/admin/notes/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "investor", userId] });
    },
    onError: (e) => alert(`Delete failed: ${(e as Error).message}`),
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
      onClick={onClose}
      data-testid={`investor-drawer-${userId}`}
    >
      <div
        className="w-full max-w-2xl h-full bg-[#0A0A0A] border-l border-white/10 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/95 backdrop-blur-md z-10">
          <h2 className="font-medium">Investor detail</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
            data-testid="button-close-drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {detail.isLoading || !detail.data ? (
          <div className="p-6 text-white/50">Loading...</div>
        ) : (
          <div className="p-6 space-y-6">
            <section>
              <div className="text-xs uppercase tracking-[0.14em] text-white/40">
                Account
              </div>
              <div className="mt-2 font-display text-xl">
                {detail.data.user.fullName ?? "-"}
              </div>
              <div className="text-sm text-white/60">
                {detail.data.user.email}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-white/40">Role:</span>
                <Select
                  value={detail.data.user.role}
                  onChange={(v) => updateRole.mutate(v)}
                  options={[
                    { value: "investor", label: "investor" },
                    { value: "admin", label: "admin" },
                  ]}
                  testId="select-drawer-role"
                />
                <span className="text-white/40 ml-3">Joined:</span>
                <span>{fmtDate(detail.data.user.createdAt)}</span>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium mb-2">Profile</h3>
              {detail.data.profile ? (
                <pre className="text-[11px] text-white/70 bg-black/30 border border-white/10 rounded-xl p-3 overflow-x-auto">
                  {JSON.stringify(detail.data.profile, null, 2)}
                </pre>
              ) : (
                <div className="text-xs text-white/40">
                  No investor profile saved yet.
                </div>
              )}
            </section>

            <section>
              <h3 className="text-sm font-medium mb-2">
                Commitments ({detail.data.commitments.length})
              </h3>
              <div className="space-y-2">
                {detail.data.commitments.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{c.displayName}</div>
                      <div className="font-medium">{fmt(c.amountCents)}</div>
                    </div>
                    <div className="text-xs text-white/50">
                      {c.roundSlug} · {c.state} ·{" "}
                      {c.tokenAllocation.toLocaleString()} AICA ·{" "}
                      {fmtDate(c.createdAt)}
                    </div>
                  </div>
                ))}
                {detail.data.commitments.length === 0 && (
                  <div className="text-xs text-white/40">No commitments.</div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <div className="space-y-2 mb-3">
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  rows={2}
                  maxLength={4000}
                  placeholder="Add a note..."
                  className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-[#00F5D4]/55"
                  data-testid="textarea-drawer-note"
                />
                <button
                  onClick={() => addNote.mutate()}
                  disabled={!noteBody.trim() || addNote.isPending}
                  className="brand-cta !h-9 text-sm"
                  data-testid="button-drawer-add-note"
                >
                  {addNote.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Add note"
                  )}
                </button>
              </div>
              <div className="space-y-2">
                {detail.data.notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-white/10 bg-black/30 p-3"
                    data-testid={`drawer-note-${n.id}`}
                  >
                    <div className="text-xs text-white/40 flex justify-between">
                      <span>{n.authorEmail}</span>
                      <span className="flex items-center gap-2">
                        <span>{fmtDateTime(n.createdAt)}</span>
                        <button
                          onClick={() => {
                            if (confirm("Delete note?")) deleteNote.mutate(n.id);
                          }}
                          className="text-white/40 hover:text-red-300"
                          data-testid={`button-delete-note-${n.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                    <div className="mt-1 text-sm whitespace-pre-wrap">
                      {n.body}
                    </div>
                  </div>
                ))}
                {detail.data.notes.length === 0 && (
                  <div className="text-xs text-white/40">No notes yet.</div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-medium mb-2">Audit (last 100)</h3>
              <ul className="space-y-1 text-xs text-white/60">
                {detail.data.audit.map((e) => (
                  <li key={e.id} className="flex gap-2">
                    <span className="text-white/40 w-36 shrink-0">
                      {fmtDateTime(e.createdAt)}
                    </span>
                    <span className="text-[#00F5D4]">{e.action}</span>
                    <span className="text-white/40">{e.actorEmail}</span>
                  </li>
                ))}
                {detail.data.audit.length === 0 && (
                  <li className="text-white/40">No audit entries.</li>
                )}
              </ul>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================================================================
 * Commitments tab
 * =================================================================== */

function CommitmentsTab() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roundFilter, setRoundFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<CommitmentRow | null>(null);
  const qParam = useDebounced(q, 300);

  const overview = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => api<OverviewResp>("/admin/overview"),
  });

  const commitments = useQuery({
    queryKey: [
      "admin",
      "commitments-search",
      qParam,
      statusFilter,
      roundFilter,
      paymentFilter,
    ],
    queryFn: () => {
      const u = new URLSearchParams();
      if (qParam) u.set("q", qParam);
      if (statusFilter) u.set("status", statusFilter);
      if (roundFilter) u.set("round", roundFilter);
      if (paymentFilter) u.set("paymentMethod", paymentFilter);
      const qs = u.toString();
      return api<{ commitments: CommitmentRow[] }>(
        `/admin/commitments-search${qs ? `?${qs}` : ""}`,
      );
    },
  });

  const refund = useMutation({
    mutationFn: (id: string) =>
      api(`/admin/commitments/${id}/refund`, { body: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (err) => alert(`Refund failed: ${(err as Error).message}`),
  });
  const confirmWire = useMutation({
    mutationFn: (id: string) =>
      api(`/admin/commitments/${id}/confirm-wire`, { body: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (err) => alert(`Confirm wire failed: ${(err as Error).message}`),
  });
  const confirmCrypto = useMutation({
    mutationFn: (id: string) =>
      api(`/admin/commitments/${id}/confirm-crypto`, { body: {} }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (err) => alert(`Confirm crypto failed: ${(err as Error).message}`),
  });
  const bulk = useMutation({
    mutationFn: (action: "confirm-wire" | "confirm-crypto" | "refund") =>
      api<{
        results: Array<{ id: string; ok: boolean; error?: string }>;
        summary: { total: number; ok: number; failed: number };
      }>("/admin/commitments/bulk", {
        body: { action, ids: [...selected] },
      }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["admin"] });
      setSelected(new Set());
      const failed = r.results.filter((x) => !x.ok);
      const msg = `Bulk action complete: ${r.summary.ok} ok / ${r.summary.failed} failed${
        failed.length
          ? "\n\n" +
            failed
              .slice(0, 10)
              .map((f) => `${f.id.slice(0, 8)}: ${f.error}`)
              .join("\n")
          : ""
      }`;
      alert(msg);
    },
    onError: (err) => alert(`Bulk failed: ${(err as Error).message}`),
  });

  const exportUrl = (fmtType: "csv" | "xlsx") => {
    const u = new URLSearchParams();
    u.set("format", fmtType);
    if (qParam) u.set("q", qParam);
    if (statusFilter) u.set("status", statusFilter);
    if (roundFilter) u.set("round", roundFilter);
    if (paymentFilter) u.set("paymentMethod", paymentFilter);
    return `/api/admin/commitments-search?${u.toString()}`;
  };

  const rows = commitments.data?.commitments ?? [];
  const BULK_LIMIT = 200;
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else {
      const slice = rows.slice(0, BULK_LIMIT).map((r) => r.id);
      if (rows.length > BULK_LIMIT) {
        alert(
          `Select-all is capped at ${BULK_LIMIT} commitments per bulk action. Selected the first ${BULK_LIMIT}; refine your filters to act on the rest.`,
        );
      }
      setSelected(new Set(slice));
    }
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div className="space-y-6" data-testid="commitments-tab">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Search by email, name, tier, or commitment id"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTERS.map((f) => ({
              value: f.value,
              label: f.label,
            }))}
            testId="select-status-filter"
          />
          <Select
            value={roundFilter}
            onChange={setRoundFilter}
            options={[
              { value: "", label: "All rounds" },
              ...(overview.data?.rounds ?? []).map((r) => ({
                value: r.slug,
                label: r.label,
              })),
            ]}
            testId="select-round-filter"
          />
          <Select
            value={paymentFilter}
            onChange={setPaymentFilter}
            options={[
              { value: "", label: "All methods" },
              { value: "card", label: "Card" },
              { value: "ach", label: "ACH" },
              { value: "crypto", label: "Crypto" },
              { value: "wire", label: "Wire" },
            ]}
            testId="select-payment-filter"
          />
          <ExportButtons
            csvUrl={exportUrl("csv")}
            xlsxUrl={exportUrl("xlsx")}
            testIdRoot="export-commitments"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div
          className="brand-card brand-hairline-teal px-4 py-3 flex flex-wrap items-center gap-3 text-sm"
          data-testid="bulk-action-bar"
        >
          <span className="text-white/70">
            {selected.size} selected
          </span>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <button
              onClick={() => {
                if (
                  confirm(
                    `Mark wire received for ${selected.size} commitments?`,
                  )
                )
                  bulk.mutate("confirm-wire");
              }}
              disabled={bulk.isPending}
              className="px-3 py-1.5 text-xs rounded-full teal-btn disabled:opacity-50"
              data-testid="button-bulk-confirm-wire"
            >
              Bulk confirm wire
            </button>
            <button
              onClick={() => {
                if (
                  confirm(
                    `Mark crypto received for ${selected.size} commitments?`,
                  )
                )
                  bulk.mutate("confirm-crypto");
              }}
              disabled={bulk.isPending}
              className="px-3 py-1.5 text-xs rounded-full teal-btn disabled:opacity-50"
              data-testid="button-bulk-confirm-crypto"
            >
              Bulk confirm crypto
            </button>
            <button
              onClick={() => {
                if (
                  confirm(`Refund ${selected.size} commitments via Stripe?`)
                )
                  bulk.mutate("refund");
              }}
              disabled={bulk.isPending}
              className="px-3 py-1.5 text-xs rounded-full border border-red-400/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
              data-testid="button-bulk-refund"
            >
              Bulk refund
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 text-xs rounded-full border border-white/10 hover:bg-white/[0.04]"
              data-testid="button-bulk-clear"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <section className="brand-card overflow-hidden">
        {commitments.isLoading ? (
          <div className="px-6 py-8 text-white/50">Loading...</div>
        ) : !rows.length ? (
          <div className="px-6 py-8 text-white/50">No commitments match.</div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-xl border border-white/5">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-[0.14em] text-white/50 sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md">
                <tr className="border-b border-white/10">
                  <th className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      data-testid="checkbox-select-all"
                    />
                  </th>
                  <th className="text-left px-3 py-3 font-medium">Date</th>
                  <th className="text-left px-3 py-3 font-medium">Investor</th>
                  <th className="text-left px-3 py-3 font-medium">Round</th>
                  <th className="text-left px-3 py-3 font-medium">Amount</th>
                  <th className="text-left px-3 py-3 font-medium">State</th>
                  <th className="text-left px-3 py-3 font-medium">Method</th>
                  <th className="text-left px-3 py-3 font-medium">SAFT</th>
                  <th className="text-right px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className="brand-table-row border-t border-white/5"
                    data-testid={`row-commitment-${c.id}`}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(c.id)}
                        onChange={() => toggleOne(c.id)}
                        data-testid={`checkbox-row-${c.id}`}
                      />
                    </td>
                    <td className="px-3 py-3 text-white/70 text-xs">
                      {fmtDate(c.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{c.fullName ?? "-"}</div>
                      <div className="text-xs text-white/50">{c.email}</div>
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
                      <StatePill state={c.state || c.status} />
                    </td>
                    <td className="px-3 py-3 text-[11px] text-white/60 capitalize">
                      {c.paymentMethod ?? "-"}
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
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditing(c)}
                          className="px-2 py-1 text-[10px] rounded-full border border-white/10 hover:bg-white/[0.04]"
                          data-testid={`button-edit-${c.id}`}
                          title="Edit allocation"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {c.state === "awaiting_wire" && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Mark wire received for ${fmt(c.amountCents)} from ${c.email}?`,
                                )
                              )
                                confirmWire.mutate(c.id);
                            }}
                            disabled={confirmWire.isPending}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-full teal-btn disabled:opacity-50"
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
                              )
                                confirmCrypto.mutate(c.id);
                            }}
                            disabled={confirmCrypto.isPending}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-full teal-btn disabled:opacity-50"
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
                                )
                                  refund.mutate(c.id);
                              }}
                              disabled={refund.isPending}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-full border border-red-400/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50"
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
                            className="inline-flex items-center text-white/40 hover:text-white px-1"
                            title="Stripe payment"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {editing && (
        <EditAllocationDialog
          commitment={editing}
          rounds={overview.data?.rounds ?? []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ["admin"] });
          }}
        />
      )}
    </div>
  );
}

function EditAllocationDialog({
  commitment,
  rounds,
  onClose,
  onSaved,
}: {
  commitment: CommitmentRow;
  rounds: Array<{ slug: string; label: string }>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState(String(commitment.amountCents / 100));
  const [tokens, setTokens] = useState(String(commitment.tokenAllocation));
  const [roundSlug, setRoundSlug] = useState(commitment.roundSlug);
  const [tierSlug, setTierSlug] = useState(commitment.tierSlug);
  const [displayName, setDisplayName] = useState(commitment.displayName);
  const [recompute, setRecompute] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      api(`/admin/commitments/${commitment.id}`, {
        method: "PATCH",
        body: {
          amountCents: Math.round(Number(amount) * 100),
          tokenAllocation: recompute ? undefined : Math.round(Number(tokens)),
          roundSlug,
          tierSlug,
          displayName,
          recomputeTokens: recompute,
        },
      }),
    onSuccess: onSaved,
    onError: (e) => alert(`Save failed: ${(e as Error).message}`),
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      data-testid={`edit-allocation-dialog-${commitment.id}`}
    >
      <div
        className="w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Edit allocation</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-xs text-white/50">
          Investor: {commitment.email}
        </div>
        <Field label="Amount (USD)">
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="brand-input"
            data-testid="input-edit-amount"
          />
        </Field>
        <Field label="Round">
          <select
            value={roundSlug}
            onChange={(e) => setRoundSlug(e.target.value)}
            className="brand-input"
            data-testid="select-edit-round"
          >
            {rounds.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
            {!rounds.find((r) => r.slug === commitment.roundSlug) && (
              <option value={commitment.roundSlug}>
                {commitment.roundSlug}
              </option>
            )}
          </select>
        </Field>
        <Field label="Tier slug">
          <input
            type="text"
            value={tierSlug}
            onChange={(e) => setTierSlug(e.target.value)}
            className="brand-input"
            data-testid="input-edit-tier"
          />
        </Field>
        <Field label="Display name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="brand-input"
            data-testid="input-edit-display"
          />
        </Field>
        <Field label="Tokens">
          <input
            type="number"
            min="0"
            value={tokens}
            onChange={(e) => setTokens(e.target.value)}
            disabled={recompute}
            className="brand-input disabled:opacity-50"
            data-testid="input-edit-tokens"
          />
        </Field>
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input
            type="checkbox"
            checked={recompute}
            onChange={(e) => setRecompute(e.target.checked)}
            data-testid="checkbox-recompute"
          />
          Recompute tokens from round price + bonuses
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-full border border-white/10 hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="brand-cta !h-9 text-sm"
            data-testid="button-save-allocation"
          >
            {save.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
 * Audit tab
 * =================================================================== */

function AuditTab() {
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const actorD = useDebounced(actor, 300);
  const actionD = useDebounced(action, 300);

  const audit = useQuery({
    queryKey: ["admin", "audit-search", actorD, actionD, since, until],
    queryFn: () => {
      const u = new URLSearchParams();
      if (actorD) u.set("actor", actorD);
      if (actionD) u.set("action", actionD);
      if (since) u.set("since", new Date(since).toISOString());
      if (until) u.set("until", new Date(until).toISOString());
      const qs = u.toString();
      return api<{ entries: AuditEntry[] }>(
        `/admin/audit-log/search${qs ? `?${qs}` : ""}`,
      );
    },
  });

  const exportUrl = (fmtType: "csv" | "xlsx") => {
    const u = new URLSearchParams();
    u.set("format", fmtType);
    if (actorD) u.set("actor", actorD);
    if (actionD) u.set("action", actionD);
    if (since) u.set("since", new Date(since).toISOString());
    if (until) u.set("until", new Date(until).toISOString());
    return `/api/admin/audit-log/search?${u.toString()}`;
  };

  return (
    <div className="space-y-6" data-testid="audit-tab">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          <input
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Actor email"
            className="brand-input !h-9 !text-sm"
            data-testid="input-audit-actor"
          />
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Action"
            className="brand-input !h-9 !text-sm"
            data-testid="input-audit-action"
          />
          <input
            type="date"
            value={since}
            onChange={(e) => setSince(e.target.value)}
            className="brand-input !h-9 !text-sm"
            data-testid="input-audit-since"
          />
          <input
            type="date"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
            className="brand-input !h-9 !text-sm"
            data-testid="input-audit-until"
          />
        </div>
        <ExportButtons
          csvUrl={exportUrl("csv")}
          xlsxUrl={exportUrl("xlsx")}
          testIdRoot="export-audit"
        />
      </div>
      <section className="brand-card overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
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
                <tr
                  key={e.id}
                  className="brand-table-row border-t border-white/5"
                  data-testid={`row-audit-${e.id}`}
                >
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
                  <td className="px-4 py-2 text-[11px] text-white/50 font-mono max-w-[420px] truncate">
                    {Object.keys(e.details ?? {}).length
                      ? JSON.stringify(e.details)
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
                    No audit entries.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ===================================================================
 * Shared bits
 * =================================================================== */

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

function StatePill({ state }: { state: string }) {
  const cls =
    state === "funded" || state === "succeeded"
      ? "bg-[#00F5D4]/15 text-[#00F5D4]"
      : state === "awaiting_wire" || state === "awaiting_crypto"
        ? "bg-blue-400/15 text-blue-300"
        : state === "refunded"
          ? "bg-white/10 text-white/60"
          : state === "failed"
            ? "bg-red-500/15 text-red-300"
            : "bg-amber-400/15 text-amber-300";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] ${cls}`}>
      {state.replace(/_/g, " ")}
    </span>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full md:max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-3 rounded-full bg-black/40 border border-white/10 text-sm outline-none focus:border-[#00F5D4]/40"
        data-testid="input-global-search"
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  testId,
}: {
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  testId?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-3 rounded-full bg-black/40 border border-white/10 text-xs outline-none focus:border-[#00F5D4]/40"
      data-testid={testId}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ExportButtons({
  csvUrl,
  xlsxUrl,
  testIdRoot,
}: {
  csvUrl: string;
  xlsxUrl: string;
  testIdRoot: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 p-1 text-xs">
      <button
        onClick={() => downloadFile(csvUrl)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-white/[0.04]"
        data-testid={`${testIdRoot}-csv`}
      >
        <Download className="w-3.5 h-3.5" /> CSV
      </button>
      <button
        onClick={() => downloadFile(xlsxUrl)}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-white/[0.04]"
        data-testid={`${testIdRoot}-xlsx`}
      >
        <Download className="w-3.5 h-3.5" /> XLSX
      </button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SkeletonBlock() {
  return (
    <div className="space-y-4">
      <div className="h-24 rounded-2xl bg-white/[0.03] animate-pulse" />
      <div className="h-64 rounded-2xl bg-white/[0.03] animate-pulse" />
    </div>
  );
}

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
