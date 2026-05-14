import { Redirect } from "wouter";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PortalNav from "@/components/PortalNav";
import { AmendDialog, isAmendable } from "@/components/AmendDialog";
import PageHeader from "@/components/PageHeader";
import { useInvestSeo } from "@/lib/useInvestSeo";
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
interface SaftSubmission {
  id: string;
  commitmentId: string;
  status: string;
  payload: Record<string, unknown> | null;
  signatureName: string | null;
  signedAt: string | null;
  signerIp: string | null;
  signerUserAgent: string | null;
  version: number | null;
}
interface InvestorDetail {
  user: InvestorRow;
  profile: Record<string, unknown> | null;
  commitments: CommitmentRow[];
  saftSubmissions: SaftSubmission[];
  notes: Note[];
  audit: AuditEntry[];
  applications: Array<{
    id: string;
    status: string;
    intendedAmountCents: number | null;
    createdAt: string;
  }>;
  stripeMode: "test" | "live" | "unknown";
}

function stripeDashboardUrl(
  mode: "test" | "live" | "unknown",
  kind: "customers" | "payments" | "checkout/sessions",
  id: string,
): string {
  const prefix = mode === "live" ? "" : "test/";
  return `https://dashboard.stripe.com/${prefix}${kind}/${id}`;
}

function StripeIdLink({
  mode,
  kind,
  id,
  testId,
}: {
  mode: "test" | "live" | "unknown";
  kind: "customers" | "payments" | "checkout/sessions";
  id: string;
  testId?: string;
}) {
  return (
    <a
      href={stripeDashboardUrl(mode, kind, id)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[11px] text-[#00F5D4] hover:underline"
      data-testid={testId}
    >
      <ExternalLink className="w-3 h-3" /> Stripe
    </a>
  );
}

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Pending SAFT", value: "pending_saft" },
  { label: "Pending re-sign", value: "pending_resign" },
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
  useInvestSeo({
    title: "Admin",
    description:
      "Operator console for AICA commitments, wire confirmations, refunds, and CSV export.",
    path: "/admin",
  });
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
            <TabsTrigger value="rounds" data-testid="tab-rounds">
              Rounds
            </TabsTrigger>
            <TabsTrigger value="audit" data-testid="tab-audit">
              Audit
            </TabsTrigger>
            <TabsTrigger value="genesis" data-testid="tab-genesis">
              Genesis
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
          <TabsContent value="rounds">
            <RoundsTab />
          </TabsContent>
          <TabsContent value="audit">
            <AuditTab />
          </TabsContent>
          <TabsContent value="genesis">
            <GenesisAdminTab />
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

            <ValidationSummary detail={detail.data} />

            <section>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                Commitments ({detail.data.commitments.length})
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/30">
                  Stripe {detail.data.stripeMode}
                </span>
              </h3>
              <div className="space-y-2">
                {detail.data.commitments.map((c) => {
                  const saftHistory = detail.data.saftSubmissions.filter(
                    (s) => s.commitmentId === c.id,
                  );
                  return (
                    <CommitmentRowDrawer
                      key={c.id}
                      c={c}
                      saftHistory={saftHistory}
                      stripeMode={detail.data.stripeMode}
                    />
                  );
                })}
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

function ValidationSummary({ detail }: { detail: InvestorDetail }) {
  const profile = (detail.profile ?? {}) as Record<string, unknown>;
  const legalFirst = String(profile["legalFirstName"] ?? "").trim();
  const legalLast = String(profile["legalLastName"] ?? "").trim();
  const signatoryName = String(profile["signatoryName"] ?? "").trim();
  const profileLegalName =
    profile["kind"] === "business"
      ? signatoryName
      : `${legalFirst} ${legalLast}`.trim();
  const clerkName = (detail.user.fullName ?? "").trim();

  const hasProfile = detail.profile != null;
  const nameMatches =
    !!profileLegalName &&
    !!clerkName &&
    profileLegalName.toLowerCase() === clerkName.toLowerCase();
  const wallet = String(profile["walletAddress"] ?? "").trim();
  const hasWallet = wallet.length > 0;

  const fundedOrInFlight = detail.commitments.filter((c) =>
    ["funded", "awaiting_wire", "awaiting_crypto", "pending_payment"].includes(
      c.state,
    ),
  );
  const kycOk = fundedOrInFlight.every(
    (c) => c.kycStatus && c.kycStatus !== "none",
  );
  const accreditationOk = fundedOrInFlight.every(
    (c) => !!c.accreditationStatus,
  );

  const items: Array<{ label: string; ok: boolean; hint?: string }> = [
    { label: "Profile saved", ok: hasProfile },
    {
      label: "Legal name matches Clerk",
      ok: nameMatches,
      hint: hasProfile
        ? `${profileLegalName || "(blank)"} vs ${clerkName || "(blank)"}`
        : "Profile not saved",
    },
    {
      label: "Wallet declared",
      ok: hasWallet,
      hint: hasWallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : undefined,
    },
    {
      label: "KYC declared on all funded/in-flight",
      ok: fundedOrInFlight.length === 0 || kycOk,
    },
    {
      label: "Accreditation on all funded/in-flight",
      ok: fundedOrInFlight.length === 0 || accreditationOk,
    },
  ];

  return (
    <section data-testid="validation-summary">
      <h3 className="text-sm font-medium mb-2">Validation summary</h3>
      <div className="rounded-xl border border-white/10 bg-black/30 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-start gap-2 text-xs"
            data-testid={`validation-${it.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
          >
            <span
              className={
                "mt-0.5 inline-block w-2 h-2 rounded-full shrink-0 " +
                (it.ok ? "bg-[#00F5D4]" : "bg-amber-300")
              }
            />
            <div className="min-w-0">
              <div className={it.ok ? "text-white/80" : "text-amber-200"}>
                {it.label}
              </div>
              {it.hint && (
                <div className="text-[10px] text-white/40 truncate">
                  {it.hint}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CommitmentRowDrawer({
  c,
  saftHistory,
  stripeMode,
}: {
  c: CommitmentRow;
  saftHistory: SaftSubmission[];
  stripeMode: "test" | "live" | "unknown";
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div
      className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm"
      data-testid={`drawer-commitment-${c.id}`}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium">{c.displayName}</div>
        <div className="font-medium">{fmt(c.amountCents)}</div>
      </div>
      <div className="text-xs text-white/50">
        {c.roundSlug} · {c.state} · {c.tokenAllocation.toLocaleString()} AICA ·{" "}
        {fmtDate(c.createdAt)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/55">
        {c.stripeCustomerId && (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-white/35">cus</span>
            <span className="font-mono text-white/70">
              {c.stripeCustomerId.slice(0, 14)}…
            </span>
            <StripeIdLink
              mode={stripeMode}
              kind="customers"
              id={c.stripeCustomerId}
              testId={`stripe-customer-${c.id}`}
            />
          </span>
        )}
        {c.stripePaymentIntentId && (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-white/35">pi</span>
            <span className="font-mono text-white/70">
              {c.stripePaymentIntentId.slice(0, 14)}…
            </span>
            <StripeIdLink
              mode={stripeMode}
              kind="payments"
              id={c.stripePaymentIntentId}
              testId={`stripe-pi-${c.id}`}
            />
          </span>
        )}
        {c.stripeCheckoutSessionId && (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-white/35">cs</span>
            <span className="font-mono text-white/70">
              {c.stripeCheckoutSessionId.slice(0, 14)}…
            </span>
            <StripeIdLink
              mode={stripeMode}
              kind="checkout/sessions"
              id={c.stripeCheckoutSessionId}
              testId={`stripe-cs-${c.id}`}
            />
          </span>
        )}
      </div>
      {saftHistory.length > 0 && (
        <div className="mt-2 border-t border-white/5 pt-2 space-y-1">
          <div className="text-[10px] uppercase tracking-[0.14em] text-white/35">
            SAFT submissions ({saftHistory.length})
          </div>
          {saftHistory.map((s, idx) => {
            const isOpen = openId === s.id;
            const isActive = s.status !== "superseded";
            return (
              <div key={s.id} className="text-[11px]">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : s.id)}
                  className="text-[#00F5D4]/85 hover:text-[#00F5D4] text-left"
                  data-testid={`button-toggle-saft-${c.id}-${idx}`}
                >
                  v{s.version} ·{" "}
                  <span
                    className={
                      isActive ? "text-[#00F5D4]" : "text-amber-300/85"
                    }
                  >
                    {s.status}
                  </span>{" "}
                  · {s.signatureName ?? "(unsigned)"}{" "}
                  {s.signedAt ? `· ${fmtDateTime(s.signedAt)}` : ""}
                </button>{" "}
                <a
                  href={`/api/admin/commitments/${c.id}/saft-pdf?submissionId=${s.id}`}
                  target="_blank"
                  rel="noopener"
                  className="text-white/55 hover:text-white underline-offset-2 hover:underline"
                  data-testid={`link-saft-pdf-${c.id}-${idx}`}
                >
                  PDF
                </a>
                {isOpen && (
                  <pre
                    className="mt-1 text-[10px] text-white/70 bg-black/40 border border-white/10 rounded-lg p-2 overflow-x-auto max-h-72"
                    data-testid={`saft-payload-${c.id}-${idx}`}
                  >
                    {JSON.stringify(
                      {
                        status: s.status,
                        version: s.version,
                        signerIp: s.signerIp,
                        signerUserAgent: s.signerUserAgent,
                        payload: s.payload,
                      },
                      null,
                      2,
                    )}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
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
  const [amending, setAmending] = useState<CommitmentRow | null>(null);
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
                          href={`/api/admin/commitments/${c.id}/saft-pdf`}
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
                        {isAmendable(c.state || c.status) && (
                          <button
                            onClick={() => setAmending(c)}
                            className="px-2 py-1 text-[10px] rounded-full border border-amber-300/40 text-amber-200 hover:bg-amber-300/10"
                            data-testid={`button-amend-${c.id}`}
                            title="Amend & request re-sign"
                          >
                            Amend
                          </button>
                        )}
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
      {amending && (
        <AmendDialog
          open={true}
          onClose={() => setAmending(null)}
          commitment={{
            id: amending.id,
            amountCents: amending.amountCents,
            roundSlug: amending.roundSlug,
            displayName: amending.displayName,
            email: amending.email,
          }}
          mode="admin"
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

/* ---------------------- Rounds tab ------------------------------- */

interface AdminRoundView {
  slug: string;
  label: string;
  status: "upcoming" | "open" | "closed";
  softClosePct: number;
  openedAt: string | null;
  closedAt: string | null;
  capacity: number;
  reserved: number;
  available: number;
  pricePerTokenMillicents: number;
  hardCapCents: number;
  fundedCents: number;
  inFlightCents: number;
  fundedCount: number;
  soldPct: number;
  deadline: string;
}

function statusPillClass(s: AdminRoundView["status"]): string {
  if (s === "open")
    return "bg-[#00F5D4]/10 text-[#00F5D4] border border-[#00F5D4]/30";
  if (s === "closed")
    return "bg-white/[0.04] text-white/40 border border-white/10";
  return "bg-amber-300/10 text-amber-300 border border-amber-300/30";
}

function deadlineCountdown(iso: string): string {
  const ms = Date.parse(iso) - Date.now();
  if (Number.isNaN(ms)) return "-";
  if (ms <= 0) return "deadline passed";
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  if (days >= 2) return `${days} days`;
  return `${days}d ${hours}h`;
}

function RoundsTab() {
  const qc = useQueryClient();
  const rounds = useQuery({
    queryKey: ["admin", "rounds"],
    queryFn: () => api<{ rounds: AdminRoundView[] }>("/admin/rounds"),
    refetchInterval: 30_000,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "rounds"] });
  };

  const action = useMutation({
    mutationFn: async (args: {
      slug: string;
      verb: "open" | "close" | "reopen";
    }) =>
      api(`/admin/rounds/${args.slug}/${args.verb}`, {
        method: "POST",
      }),
    onSuccess: refresh,
  });

  const evaluateAll = useMutation({
    mutationFn: () => api(`/admin/rounds/evaluate`, { method: "POST" }),
    onSuccess: refresh,
  });

  const setSoftClose = useMutation({
    mutationFn: async (args: { slug: string; softClosePct: number }) =>
      api(`/admin/rounds/${args.slug}`, {
        method: "PATCH",
        body: { softClosePct: args.softClosePct },
      }),
    onSuccess: refresh,
  });

  return (
    <div className="space-y-6" data-testid="rounds-tab">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/55">
          Auto-close fires when sold% exceeds the soft-close threshold or
          the deadline lapses. Manual overrides are logged in the audit trail
          and emailed to operators.
        </p>
        <button
          type="button"
          onClick={() => evaluateAll.mutate()}
          disabled={evaluateAll.isPending}
          className="brand-button-secondary"
          data-testid="button-evaluate-rounds"
        >
          {evaluateAll.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Re-evaluate now
        </button>
      </div>

      {rounds.isLoading && (
        <div className="brand-card p-6 text-white/50 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#00F5D4]" /> Loading
          rounds...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(rounds.data?.rounds ?? []).map((r) => (
          <RoundCard
            key={r.slug}
            round={r}
            onAction={(verb) => action.mutate({ slug: r.slug, verb })}
            onSoftClose={(pct) =>
              setSoftClose.mutate({ slug: r.slug, softClosePct: pct })
            }
            pending={
              action.isPending &&
              action.variables?.slug === r.slug
            }
            savingSoftClose={
              setSoftClose.isPending &&
              setSoftClose.variables?.slug === r.slug
            }
          />
        ))}
      </div>
    </div>
  );
}

function RoundCard(props: {
  round: AdminRoundView;
  onAction: (verb: "open" | "close" | "reopen") => void;
  onSoftClose: (pct: number) => void;
  pending: boolean;
  savingSoftClose: boolean;
}) {
  const { round: r } = props;
  const [pct, setPct] = useState<number>(r.softClosePct);
  useEffect(() => {
    setPct(r.softClosePct);
  }, [r.softClosePct]);
  const dirty = pct !== r.softClosePct;

  return (
    <section
      className="brand-card p-5 space-y-4"
      data-testid={`round-card-${r.slug}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{r.label}</div>
          <div className="text-[11px] text-white/45 font-mono">{r.slug}</div>
        </div>
        <span
          className={`text-[10px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full ${statusPillClass(r.status)}`}
          data-testid={`round-status-${r.slug}`}
        >
          {r.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <Stat
          label="Raised"
          value={fmt(r.fundedCents)}
          sub={`of ${fmt(r.hardCapCents)}`}
        />
        <Stat
          label="In flight"
          value={fmt(r.inFlightCents)}
          sub={`${r.fundedCount} funded`}
        />
        <Stat
          label="Tokens sold"
          value={`${r.soldPct.toFixed(1)}%`}
          sub={`${(r.capacity - r.available).toLocaleString()} / ${r.capacity.toLocaleString()}`}
        />
        <Stat
          label="Deadline"
          value={deadlineCountdown(r.deadline)}
          sub={fmtDate(r.deadline)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.16em] text-white/40">
          Soft-close threshold
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={pct}
            onChange={(e) =>
              setPct(
                Math.max(0, Math.min(100, Number(e.target.value) || 0)),
              )
            }
            className="brand-input !h-9 !text-sm w-24"
            data-testid={`input-soft-close-${r.slug}`}
          />
          <span className="text-xs text-white/55">% sold</span>
          <button
            type="button"
            onClick={() => props.onSoftClose(pct)}
            disabled={!dirty || props.savingSoftClose}
            className="brand-button-secondary !h-9"
            data-testid={`button-save-soft-close-${r.slug}`}
          >
            {props.savingSoftClose ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : null}
            Save
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {r.status !== "open" && (
          <button
            type="button"
            onClick={() =>
              props.onAction(r.status === "closed" ? "reopen" : "open")
            }
            disabled={props.pending}
            className="brand-button-primary !h-9"
            data-testid={`button-${r.status === "closed" ? "reopen" : "open"}-${r.slug}`}
          >
            {r.status === "closed" ? "Reopen" : "Open"}
          </button>
        )}
        {r.status === "open" && (
          <button
            type="button"
            onClick={() => props.onAction("close")}
            disabled={props.pending}
            className="brand-button-secondary !h-9"
            data-testid={`button-close-${r.slug}`}
          >
            Close
          </button>
        )}
      </div>

      <div className="text-[11px] text-white/40 space-y-0.5">
        {r.openedAt && <div>Opened {fmtDateTime(r.openedAt)}</div>}
        {r.closedAt && <div>Closed {fmtDateTime(r.closedAt)}</div>}
      </div>
    </section>
  );
}

function Stat(props: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-white/40">
        {props.label}
      </div>
      <div className="text-sm text-white">{props.value}</div>
      {props.sub && <div className="text-[10px] text-white/45">{props.sub}</div>}
    </div>
  );
}

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

/* ============================================================ *
 * Genesis admin tab
 * ============================================================ */

interface GenesisOverview {
  referrers: { total?: number; approved?: number; pending?: number };
  leads: { total?: number; investor_leads?: number; customer_leads?: number; qualified_count?: number };
  points: { pending_points?: number; approved_points?: number; token_reserved?: number };
  fraud: { open_flags?: number };
  pool: { total: number; reserved: number; remaining: number };
  flags: { privateMode: boolean; publicReferralMode: boolean };
}
interface GenesisReferrer {
  id: string;
  referralCode: string;
  tier: string;
  status: string;
  multiplierBp: number;
  compensationType: string;
  email: string | null;
  fullName: string | null;
  displayName: string | null;
  adminNotes: string | null;
  createdAt: string;
}
interface GenesisLead {
  id: string;
  referrerId: string | null;
  name: string;
  email: string;
  interestType: string;
  status: string;
  submissionChannel: string;
  notes: string | null;
  adminNotes: string | null;
  estimatedInvestmentRange: string | null;
  referralCode: string | null;
  referrerEmail: string | null;
  createdAt: string;
}
interface GenesisLedgerRow {
  id: string;
  referrerId: string | null;
  leadId: string | null;
  actionKey: string;
  bonusLabel: string | null;
  pointsPending: number;
  pointsApproved: number;
  tokenEquivalent: number;
  status: string;
  approverEmail: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  notes: string | null;
  createdAt: string;
  referralCode: string | null;
  referrerEmail: string | null;
}
interface GenesisRule {
  id: string;
  actionKey: string;
  label: string;
  points: number;
  awardMode: string;
  enabled: boolean;
  notes: string | null;
}

function GenesisAdminTab() {
  const [sub, setSub] = useState<"overview" | "referrers" | "leads" | "ledger" | "rules" | "settings">("overview");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-white/8 pb-3">
        {(["overview", "referrers", "leads", "ledger", "rules", "settings"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSub(k)}
            className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wider transition ${
              sub === k
                ? "bg-[#00F5D4]/15 text-[#00F5D4] border border-[#00F5D4]/30"
                : "bg-white/[0.04] text-white/65 border border-white/10 hover:bg-white/[0.08]"
            }`}
            data-testid={`genesis-subtab-${k}`}
          >
            {k}
          </button>
        ))}
      </div>
      {sub === "overview" && <GenesisOverviewSub />}
      {sub === "referrers" && <GenesisReferrersSub />}
      {sub === "leads" && <GenesisLeadsSub />}
      {sub === "ledger" && <GenesisLedgerSub />}
      {sub === "rules" && <GenesisRulesSub />}
      {sub === "settings" && <GenesisSettingsSub />}
    </div>
  );
}

function GenesisOverviewSub() {
  const q = useQuery({ queryKey: ["admin", "genesis", "overview"], queryFn: () => api<GenesisOverview>("/admin/genesis/overview") });
  if (!q.data) return <SkeletonBlock />;
  const d = q.data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Referrers" value={String(Number(d.referrers.total ?? 0))} sub={`${Number(d.referrers.approved ?? 0)} approved`} />
        <Stat label="Leads" value={String(Number(d.leads.total ?? 0))} sub={`${Number(d.leads.qualified_count ?? 0)} qualified`} />
        <Stat label="Investor leads" value={String(Number(d.leads.investor_leads ?? 0))} sub="Compliance review" />
        <Stat label="Open fraud flags" value={String(Number(d.fraud.open_flags ?? 0))} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Stat label="Pending points" value={Number(d.points.pending_points ?? 0).toLocaleString()} />
        <Stat label="Approved points" value={Number(d.points.approved_points ?? 0).toLocaleString()} />
        <Stat label="$AICA reserved" value={Number(d.points.token_reserved ?? 0).toLocaleString()} sub={`of ${d.pool.total.toLocaleString()} pool`} />
      </div>
      <div className="brand-card p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/50 font-medium">Token pool</div>
        <div className="mt-3 text-sm">
          <div className="flex items-center justify-between text-white/70">
            <span>Reserved</span>
            <span>{d.pool.reserved.toLocaleString()} / {d.pool.total.toLocaleString()}</span>
          </div>
          <div className="mt-2 h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-[#00F5D4]" style={{ width: `${Math.min(100, (d.pool.reserved / Math.max(1, d.pool.total)) * 100).toFixed(2)}%` }} />
          </div>
          <div className="mt-2 text-xs text-white/45">Remaining: {d.pool.remaining.toLocaleString()} $AICA</div>
        </div>
      </div>
      <div className="brand-card p-5">
        <div className="text-[11px] uppercase tracking-[0.16em] text-white/50 font-medium">Mode flags</div>
        <div className="mt-3 text-sm grid grid-cols-2 gap-3">
          <div>GENESIS_PRIVATE_MODE: <span className={d.flags.privateMode ? "text-[#00F5D4]" : "text-red-400"}>{String(d.flags.privateMode)}</span></div>
          <div>PUBLIC_REFERRAL_MODE: <span className={d.flags.publicReferralMode ? "text-[#00F5D4]" : "text-white/55"}>{String(d.flags.publicReferralMode)}</span></div>
        </div>
      </div>
    </div>
  );
}

function GenesisReferrersSub() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "genesis", "referrers"],
    queryFn: () => api<{ referrers: GenesisReferrer[] }>("/admin/genesis/referrers"),
  });
  const [showCreate, setShowCreate] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({ email: "", fullName: "", tier: "family_friends", status: "approved" });
  const create = useMutation({
    mutationFn: () => api("/admin/genesis/referrers", { body: createForm }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "genesis"] });
      setShowCreate(false);
      setCreateForm({ email: "", fullName: "", tier: "family_friends", status: "approved" });
    },
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      api(`/admin/genesis/referrers/${id}`, { method: "PATCH", body: patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "genesis"] }),
  });
  if (!q.data) return <SkeletonBlock />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/60">{q.data.referrers.length} referrers</span>
        <div className="flex gap-2">
          <a
            href="/api/admin/genesis/referrers?format=csv"
            className="glass-btn rounded-full h-9 px-4 text-xs inline-flex items-center gap-1"
            data-testid="link-export-referrers"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </a>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="teal-btn rounded-full h-9 px-4 text-xs"
            data-testid="button-new-referrer"
          >
            + Add referrer
          </button>
        </div>
      </div>
      {showCreate && (
        <div className="brand-card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} data-testid="input-new-referrer-email" />
          <input className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="full name" value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} />
          <select className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm" value={createForm.tier} onChange={(e) => setCreateForm({ ...createForm, tier: e.target.value })}>
            {["family_friends", "trusted_introducer", "genesis_partner", "strategic", "creator", "developer", "agency", "investor_introduction"].map((t) => (
              <option key={t} value={t} className="bg-[#0A0A0A]">{t}</option>
            ))}
          </select>
          <button
            onClick={() => create.mutate()}
            disabled={create.isPending || !createForm.email}
            className="teal-btn rounded-lg px-3 py-2 text-sm disabled:opacity-50"
            data-testid="button-create-referrer"
          >
            {create.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      )}
      <div className="brand-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-white/45 bg-white/[0.02]">
            <tr>
              <th className="px-3 py-2 text-left">Code</th>
              <th className="px-3 py-2 text-left">Email / Name</th>
              <th className="px-3 py-2 text-left">Tier</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Mult</th>
              <th className="px-3 py-2 text-left">Comp</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {q.data.referrers.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-white/40">No referrers yet.</td></tr>
            ) : q.data.referrers.flatMap((r) => [
              <tr key={r.id} data-testid={`row-genesis-referrer-${r.id}`}>
                <td className="px-3 py-2 font-mono text-xs text-[#00F5D4]">
                  <button
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                    className="hover:underline"
                    data-testid={`button-open-referrer-${r.id}`}
                  >
                    {r.referralCode}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="font-mono text-xs text-white/85">{r.email ?? "-"}</div>
                  <div className="text-xs text-white/45">{r.fullName ?? r.displayName ?? "-"}</div>
                </td>
                <td className="px-3 py-2 text-xs text-white/70">{r.tier}</td>
                <td className="px-3 py-2"><StatePill state={r.status} /></td>
                <td className="px-3 py-2 text-right text-xs">{(r.multiplierBp / 100).toFixed(2)}x</td>
                <td className="px-3 py-2 text-xs text-white/65">{r.compensationType}</td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex gap-1">
                    {r.status !== "approved" && (
                      <button onClick={() => update.mutate({ id: r.id, patch: { status: "approved" } })} className="px-2 py-1 rounded-md bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] uppercase tracking-wider">Approve</button>
                    )}
                    {r.status !== "rejected" && (
                      <button onClick={() => update.mutate({ id: r.id, patch: { status: "rejected" } })} className="px-2 py-1 rounded-md bg-red-500/15 text-red-400 text-[10px] uppercase tracking-wider">Reject</button>
                    )}
                    {r.status === "approved" && (
                      <button onClick={() => update.mutate({ id: r.id, patch: { status: "disabled" } })} className="px-2 py-1 rounded-md bg-white/8 text-white/65 text-[10px] uppercase tracking-wider">Disable</button>
                    )}
                  </div>
                </td>
              </tr>,
              openId === r.id ? (
                <tr key={`${r.id}-drawer`} className="bg-white/[0.02]">
                  <td colSpan={7} className="px-3 py-4">
                    <ReferrerDrawer
                      referrer={r}
                      onUpdate={(patch) => update.mutate({ id: r.id, patch })}
                    />
                  </td>
                </tr>
              ) : null,
            ])}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReferrerDrawer({
  referrer,
  onUpdate,
}: {
  referrer: GenesisReferrer;
  onUpdate: (patch: Record<string, unknown>) => void;
}) {
  const [tier, setTier] = useState(referrer.tier);
  const [multiplier, setMultiplier] = useState(referrer.multiplierBp / 100);
  const [notes, setNotes] = useState(referrer.adminNotes ?? "");
  const leads = useQuery({
    queryKey: ["admin", "genesis", "leads", "referrer", referrer.id],
    queryFn: () =>
      api<{ leads: GenesisLead[] }>(`/admin/genesis/leads`).then((r) => ({
        leads: r.leads.filter((l) => l.referrerId === referrer.id),
      })),
  });
  const ledger = useQuery({
    queryKey: ["admin", "genesis", "ledger", "referrer", referrer.id],
    queryFn: () =>
      api<{ ledger: GenesisLedgerRow[] }>(`/admin/genesis/ledger`).then((r) => ({
        ledger: r.ledger.filter((e) => e.referrerId === referrer.id),
      })),
  });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div className="text-[11px] uppercase tracking-wider text-white/45">
          Profile
        </div>
        <div className="text-xs text-white/70 space-y-1">
          <div>UUID: <span className="font-mono text-white/85">{referrer.id}</span></div>
          <div>Status: {referrer.status}</div>
          <div>Compensation: {referrer.compensationType}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[11px] uppercase tracking-wider text-white/45 block">
            Tier
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1.5 text-xs"
              data-testid={`select-tier-${referrer.id}`}
            >
              {[
                "family_friends",
                "trusted_introducer",
                "genesis_partner",
                "strategic",
                "creator",
                "developer",
                "agency",
                "investor_introduction",
              ].map((t) => (
                <option key={t} value={t} className="bg-[#0A0A0A]">{t}</option>
              ))}
            </select>
          </label>
          <label className="text-[11px] uppercase tracking-wider text-white/45 block">
            Multiplier (x)
            <input
              type="number"
              min={0}
              max={10}
              step={0.01}
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value) || 0)}
              className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1.5 text-xs"
              data-testid={`input-multiplier-${referrer.id}`}
            />
          </label>
        </div>
        <label className="text-[11px] uppercase tracking-wider text-white/45 block">
          Admin notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1.5 text-xs"
            data-testid={`input-notes-${referrer.id}`}
          />
        </label>
        <button
          onClick={() =>
            onUpdate({
              tier,
              multiplierBp: Math.round(multiplier * 100),
              adminNotes: notes || null,
            })
          }
          className="teal-btn rounded-full h-8 px-4 text-xs"
          data-testid={`button-save-referrer-${referrer.id}`}
        >
          Save profile
        </button>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/45 mb-2">
          Leads ({leads.data?.leads.length ?? 0})
        </div>
        <div className="max-h-48 overflow-auto text-xs space-y-1">
          {leads.data?.leads.length === 0 ? (
            <div className="text-white/40">None.</div>
          ) : (
            leads.data?.leads.map((l) => (
              <div key={l.id} className="flex justify-between gap-2">
                <span className="truncate">{l.name} · {l.email}</span>
                <span className="text-white/45">{l.status}</span>
              </div>
            ))
          )}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-white/45 mb-2 mt-4">
          Ledger ({ledger.data?.ledger.length ?? 0})
        </div>
        <div className="max-h-48 overflow-auto text-xs space-y-1">
          {ledger.data?.ledger.length === 0 ? (
            <div className="text-white/40">None.</div>
          ) : (
            ledger.data?.ledger.map((e) => (
              <div key={e.id} className="flex justify-between gap-2">
                <span className="truncate">{e.bonusLabel ?? e.actionKey}</span>
                <span className="text-white/45">
                  {e.pointsApproved.toLocaleString()} pts · {e.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function GenesisLeadsSub() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const params = new URLSearchParams();
  if (statusFilter) params.set("status", statusFilter);
  if (interestFilter) params.set("interest", interestFilter);
  const qs = params.toString() ? `?${params.toString()}` : "";
  const q = useQuery({
    queryKey: ["admin", "genesis", "leads", qs],
    queryFn: () => api<{ leads: GenesisLead[] }>(`/admin/genesis/leads${qs}`),
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      api(`/admin/genesis/leads/${id}`, { method: "PATCH", body: patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "genesis"] }),
  });
  if (!q.data) return <SkeletonBlock />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs">
          <option value="" className="bg-[#0A0A0A]">All statuses</option>
          {["new", "under_review", "contacted", "verified", "qualified", "converted", "not_qualified", "rejected", "duplicate", "compliance_hold", "investor_review", "investor_kyc", "investor_meeting", "investor_funded", "investor_rejected"].map((s) => (
            <option key={s} value={s} className="bg-[#0A0A0A]">{s}</option>
          ))}
        </select>
        <select value={interestFilter} onChange={(e) => setInterestFilter(e.target.value)} className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs">
          <option value="" className="bg-[#0A0A0A]">All interests</option>
          {["customer", "enterprise", "developer", "agency", "investor", "partner", "other"].map((i) => (
            <option key={i} value={i} className="bg-[#0A0A0A]">{i}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-white/55">{q.data.leads.length} leads</span>
        <a
          href={`/api/admin/genesis/leads${qs ? qs + "&" : "?"}format=csv`}
          className="glass-btn rounded-full h-8 px-3 text-xs inline-flex items-center gap-1"
          data-testid="link-export-leads"
        >
          <Download className="w-3.5 h-3.5" /> CSV
        </a>
      </div>
      <div className="brand-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-white/45 bg-white/[0.02]">
            <tr>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2 text-left">Name / Email</th>
              <th className="px-3 py-2 text-left">Interest</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Referrer</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {q.data.leads.length === 0 ? (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-white/40">No leads.</td></tr>
            ) : q.data.leads.map((l) => (
              <tr key={l.id} data-testid={`row-genesis-lead-${l.id}`}>
                <td className="px-3 py-2 text-xs text-white/55">{new Date(l.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">
                  <div>{l.name}</div>
                  <div className="font-mono text-[11px] text-white/55">{l.email}</div>
                </td>
                <td className="px-3 py-2 text-xs text-white/70">{l.interestType}</td>
                <td className="px-3 py-2">
                  <select
                    value={l.status}
                    onChange={(e) => update.mutate({ id: l.id, patch: { status: e.target.value } })}
                    className="bg-white/[0.04] border border-white/10 rounded-md px-2 py-1 text-[11px]"
                  >
                    {["new", "under_review", "contacted", "verified", "qualified", "converted", "not_qualified", "rejected", "duplicate", "compliance_hold", "investor_review", "investor_kyc", "investor_meeting", "investor_funded", "investor_rejected"].map((s) => (
                      <option key={s} value={s} className="bg-[#0A0A0A]">{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <div className="font-mono text-xs text-[#00F5D4]">{l.referralCode ?? "-"}</div>
                  <div className="text-[10px] text-white/45">{l.referrerEmail ?? ""}</div>
                </td>
                <td className="px-3 py-2 text-right text-xs text-white/55">{l.submissionChannel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const NAMED_BONUSES = [
  "Strategic Introduction Bonus",
  "Investor Introduction Bonus",
  "Enterprise Customer Bonus",
  "Advisor/Partner Bonus",
  "Special Founder Approved Bonus",
] as const;

function GenesisLedgerSub() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [showBonus, setShowBonus] = useState(false);
  const [bonus, setBonus] = useState({
    referrerId: "",
    bonusLabel: NAMED_BONUSES[0] as (typeof NAMED_BONUSES)[number],
    pointsApproved: 0,
    notes: "",
  });
  const qs = statusFilter ? `?status=${statusFilter}` : "";
  const q = useQuery({
    queryKey: ["admin", "genesis", "ledger", qs],
    queryFn: () => api<{ ledger: GenesisLedgerRow[] }>(`/admin/genesis/ledger${qs}`),
  });
  const act = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api(`/admin/genesis/ledger/${id}`, { method: "PATCH", body }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "genesis"] }),
  });
  const award = useMutation({
    mutationFn: () =>
      api("/admin/genesis/ledger/bonus", { method: "POST", body: bonus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "genesis"] });
      setShowBonus(false);
      setBonus({
        referrerId: "",
        bonusLabel: NAMED_BONUSES[0],
        pointsApproved: 0,
        notes: "",
      });
    },
  });
  if (!q.data) return <SkeletonBlock />;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs">
          <option value="" className="bg-[#0A0A0A]">All</option>
          {["pending", "approved", "rejected", "compliance_hold", "vesting", "vested"].map((s) => (
            <option key={s} value={s} className="bg-[#0A0A0A]">{s}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-white/55">{q.data.ledger.length} entries</span>
        <button
          onClick={() => setShowBonus((v) => !v)}
          className="teal-btn rounded-full h-8 px-3 text-xs"
          data-testid="button-award-bonus"
        >
          + Named bonus
        </button>
        <a href={`/api/admin/genesis/ledger${qs ? qs + "&" : "?"}format=csv`} className="glass-btn rounded-full h-8 px-3 text-xs inline-flex items-center gap-1" data-testid="link-export-ledger">
          <Download className="w-3.5 h-3.5" /> CSV
        </a>
      </div>
      {showBonus && (
        <div className="brand-card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm md:col-span-1"
            placeholder="referrer UUID"
            value={bonus.referrerId}
            onChange={(e) => setBonus({ ...bonus, referrerId: e.target.value })}
            data-testid="input-bonus-referrer-id"
          />
          <select
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm"
            value={bonus.bonusLabel}
            onChange={(e) =>
              setBonus({ ...bonus, bonusLabel: e.target.value as (typeof NAMED_BONUSES)[number] })
            }
          >
            {NAMED_BONUSES.map((b) => (
              <option key={b} value={b} className="bg-[#0A0A0A]">{b}</option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm"
            placeholder="points approved"
            value={bonus.pointsApproved}
            onChange={(e) => setBonus({ ...bonus, pointsApproved: Number(e.target.value) || 0 })}
            data-testid="input-bonus-points"
          />
          <button
            onClick={() => award.mutate()}
            disabled={award.isPending || !bonus.referrerId || bonus.pointsApproved <= 0}
            className="teal-btn rounded-lg px-3 py-2 text-sm disabled:opacity-50"
            data-testid="button-award-confirm"
          >
            {award.isPending ? "Awarding..." : "Award"}
          </button>
          <textarea
            className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm md:col-span-4"
            placeholder="Notes (optional)"
            value={bonus.notes}
            onChange={(e) => setBonus({ ...bonus, notes: e.target.value })}
            rows={2}
          />
        </div>
      )}
      <div className="brand-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-white/45 bg-white/[0.02]">
            <tr>
              <th className="px-3 py-2 text-left">When</th>
              <th className="px-3 py-2 text-left">Referrer</th>
              <th className="px-3 py-2 text-left">Action</th>
              <th className="px-3 py-2 text-right">Pending</th>
              <th className="px-3 py-2 text-right">Approved</th>
              <th className="px-3 py-2 text-right">$AICA</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {q.data.ledger.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-white/40">No ledger entries.</td></tr>
            ) : q.data.ledger.map((l) => (
              <tr key={l.id} data-testid={`row-genesis-ledger-${l.id}`}>
                <td className="px-3 py-2 text-xs text-white/55">{new Date(l.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2 font-mono text-xs text-[#00F5D4]">{l.referralCode ?? "-"}</td>
                <td className="px-3 py-2 text-xs">{l.bonusLabel ?? l.actionKey}</td>
                <td className="px-3 py-2 text-right">{l.pointsPending.toLocaleString()}</td>
                <td className="px-3 py-2 text-right">{l.pointsApproved.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-[#00F5D4]">{Number(l.tokenEquivalent).toLocaleString()}</td>
                <td className="px-3 py-2"><StatePill state={l.status} /></td>
                <td className="px-3 py-2 text-right">
                  <div className="inline-flex gap-1">
                    {l.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            const raw = prompt(
                              "Approve with how many points?",
                              String(l.pointsPending),
                            );
                            if (raw === null) return;
                            const points = Number(raw);
                            if (!Number.isFinite(points) || points < 0) return;
                            act.mutate({
                              id: l.id,
                              body: { action: "approve", pointsApproved: points },
                            });
                          }}
                          className="px-2 py-1 rounded-md bg-[#00F5D4]/15 text-[#00F5D4] text-[10px] uppercase tracking-wider"
                          data-testid={`button-approve-${l.id}`}
                        >
                          Approve / Adjust
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Rejection reason?") ?? "";
                            act.mutate({ id: l.id, body: { action: "reject", rejectedReason: reason } });
                          }}
                          className="px-2 py-1 rounded-md bg-red-500/15 text-red-400 text-[10px] uppercase tracking-wider"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {l.status === "approved" && (
                      <button
                        onClick={() => {
                          const raw = prompt(
                            "Manually adjust approved points to:",
                            String(l.pointsApproved),
                          );
                          if (raw === null) return;
                          const points = Number(raw);
                          if (!Number.isFinite(points) || points < 0) return;
                          act.mutate({
                            id: l.id,
                            body: { action: "approve", pointsApproved: points },
                          });
                        }}
                        className="px-2 py-1 rounded-md bg-white/8 text-white/65 text-[10px] uppercase tracking-wider"
                        data-testid={`button-adjust-${l.id}`}
                      >
                        Adjust
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GenesisRulesSub() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "genesis", "rules"],
    queryFn: () => api<{ rules: GenesisRule[] }>("/admin/genesis/rules"),
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      api(`/admin/genesis/rules/${id}`, { method: "PATCH", body: patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "genesis", "rules"] }),
  });
  if (!q.data) return <SkeletonBlock />;
  return (
    <div className="brand-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="text-[11px] uppercase tracking-wider text-white/45 bg-white/[0.02]">
          <tr>
            <th className="px-3 py-2 text-left">Action</th>
            <th className="px-3 py-2 text-left">Label</th>
            <th className="px-3 py-2 text-right">Points</th>
            <th className="px-3 py-2 text-left">Mode</th>
            <th className="px-3 py-2 text-left">Enabled</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {q.data.rules.map((r) => (
            <tr key={r.id} data-testid={`row-genesis-rule-${r.actionKey}`}>
              <td className="px-3 py-2 font-mono text-xs">{r.actionKey}</td>
              <td className="px-3 py-2 text-xs text-white/70">{r.label}</td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  defaultValue={r.points}
                  onBlur={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isNaN(v) && v !== r.points) update.mutate({ id: r.id, patch: { points: v } });
                  }}
                  className="w-24 bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-right"
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={r.awardMode}
                  onChange={(e) => update.mutate({ id: r.id, patch: { awardMode: e.target.value } })}
                  className="bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-xs"
                >
                  <option value="auto" className="bg-[#0A0A0A]">auto</option>
                  <option value="manual_review" className="bg-[#0A0A0A]">manual_review</option>
                </select>
              </td>
              <td className="px-3 py-2">
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={(e) => update.mutate({ id: r.id, patch: { enabled: e.target.checked } })}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface GenesisSettings {
  privateMode: boolean;
  privateModeLocked: boolean;
  publicReferralMode: boolean;
  perReferrerPointCap: number;
  perCampaignPointCap: number;
  tokenPoolTotal: number;
  pointToTokenRatio: number;
  note: string;
}

function GenesisSettingsSub() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "genesis", "settings"],
    queryFn: () => api<GenesisSettings>("/admin/genesis/settings"),
  });
  const [form, setForm] = useState<Partial<GenesisSettings>>({});
  useEffect(() => {
    if (q.data) {
      setForm({
        publicReferralMode: q.data.publicReferralMode,
        perReferrerPointCap: q.data.perReferrerPointCap,
        perCampaignPointCap: q.data.perCampaignPointCap,
        tokenPoolTotal: q.data.tokenPoolTotal,
        pointToTokenRatio: q.data.pointToTokenRatio,
      });
    }
  }, [q.data]);
  const save = useMutation({
    mutationFn: (body: Partial<GenesisSettings>) =>
      api<{ settings: GenesisSettings }>("/admin/genesis/settings", {
        method: "PUT",
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "genesis", "settings"] });
    },
  });
  if (!q.data) return <SkeletonBlock />;
  const lockedPublic = q.data.privateMode;
  return (
    <div className="brand-card p-6 text-sm space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-white/45 uppercase tracking-wider mb-1">Private mode</div>
          <div className="flex items-center gap-2">
            <span className="text-[#00F5D4] font-mono">{String(q.data.privateMode)}</span>
            <span className="text-[10px] uppercase tracking-wider text-white/35">env-locked</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-white/45 uppercase tracking-wider mb-1 block">
            Public referral mode
          </label>
          <label className={`flex items-center gap-2 ${lockedPublic ? "opacity-50" : ""}`}>
            <input
              type="checkbox"
              checked={!!form.publicReferralMode}
              disabled={lockedPublic}
              onChange={(e) => setForm({ ...form, publicReferralMode: e.target.checked })}
              data-testid="checkbox-public-referral-mode"
            />
            <span>Allow public sign-ups (forced off while private mode is on)</span>
          </label>
        </div>
        <NumberField
          label="Per-referrer point cap (0 = none)"
          value={form.perReferrerPointCap ?? 0}
          onChange={(v) => setForm({ ...form, perReferrerPointCap: v })}
          testId="input-per-referrer-cap"
        />
        <NumberField
          label="Per-campaign point cap (0 = none)"
          value={form.perCampaignPointCap ?? 0}
          onChange={(v) => setForm({ ...form, perCampaignPointCap: v })}
          testId="input-per-campaign-cap"
        />
        <NumberField
          label="Token pool total ($AICA)"
          value={form.tokenPoolTotal ?? 0}
          onChange={(v) => setForm({ ...form, tokenPoolTotal: v })}
          testId="input-token-pool-total"
        />
        <NumberField
          label="Point → $AICA ratio"
          value={form.pointToTokenRatio ?? 1}
          onChange={(v) => setForm({ ...form, pointToTokenRatio: v })}
          testId="input-point-ratio"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          className="teal-btn rounded-full h-9 px-5 text-xs font-medium disabled:opacity-50"
          onClick={() => save.mutate(form)}
          disabled={save.isPending}
          data-testid="button-save-settings"
        >
          {save.isPending ? "Saving…" : "Save settings"}
        </button>
        {save.isSuccess && <span className="text-xs text-[#00F5D4]">Saved.</span>}
        {save.isError && <span className="text-xs text-red-400">Save failed.</span>}
      </div>
      <p className="text-xs text-white/55 leading-relaxed">{q.data.note}</p>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  testId?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-white/45 uppercase tracking-wider mb-1 block">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full bg-white/[0.03] border border-white/10 rounded-md px-3 py-2 text-sm text-white"
        data-testid={testId}
      />
    </label>
  );
}
