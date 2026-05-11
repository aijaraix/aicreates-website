import { Link } from "wouter";
import { useUser, useClerk } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowRight, ExternalLink, LogOut } from "lucide-react";

interface Commitment {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  tierSlug: string;
  displayName: string;
  tokenAllocation: number;
  receiptUrl: string | null;
  createdAt: string;
  completedAt: string | null;
  refundedAt: string | null;
  stripePaymentIntentId: string | null;
}

interface MeResponse {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    stripeCustomerId: string | null;
  };
  commitments: Commitment[];
}

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    succeeded: "bg-[#00F5D4]/15 text-[#00F5D4]",
    pending: "bg-amber-400/15 text-amber-300",
    failed: "bg-red-500/15 text-red-300",
    refunded: "bg-white/10 text-white/60 line-through",
  };
  const cls = map[status] ?? "bg-white/10 text-white/70";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs ${cls}`}
      data-testid={`badge-status-${status}`}
    >
      {status}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/me"),
  });

  const isAdmin = data?.user.role === "admin";
  const succeeded = data?.commitments.filter((c) => c.status === "succeeded") ?? [];
  const totalCents = succeeded.reduce((s, c) => s + c.amountCents, 0);
  const totalTokens = succeeded.reduce((s, c) => s + c.tokenAllocation, 0);

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white">
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-white/5">
        <Link
          href="/dashboard"
          className="font-semibold tracking-tight"
          style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
        >
          AI<span className="text-[#00F5D4]">creates</span>AI
          <span className="ml-2 text-xs text-white/40 uppercase tracking-[0.2em]">
            Portal
          </span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {isAdmin && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-full border border-[#00F5D4]/40 text-[#00F5D4] hover:bg-[#00F5D4]/10"
              data-testid="link-admin"
            >
              Admin
            </Link>
          )}
          <span className="text-white/60 hidden sm:block">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
          <button
            onClick={() => signOut({ redirectUrl: window.location.origin })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/[0.04]"
            data-testid="button-signout"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 md:py-16">
        <div className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-semibold tracking-tight"
            style={{ fontFamily: "Space Grotesk, system-ui, sans-serif" }}
          >
            Welcome{user?.firstName ? `, ${user.firstName}` : ""}.
          </h1>
          <p className="text-white/60 mt-2">
            Your Founders Commitment dashboard for the AICreatesAi raise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Total committed
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#00F5D4]">
              {fmtMoney(totalCents, succeeded[0]?.currency ?? "usd")}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Token allocation
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {totalTokens.toLocaleString()}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Successful commitments
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {succeeded.length}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Action
            </div>
            <Link
              href="/invest"
              className="mt-3 inline-flex items-center justify-center h-11 px-5 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition"
              data-testid="link-make-commitment"
            >
              New commitment <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="text-lg font-medium">Commitment history</h2>
          </div>
          {isLoading ? (
            <div className="px-6 py-10 text-white/50">Loading...</div>
          ) : error ? (
            <div className="px-6 py-10 text-red-400">
              Failed to load commitments.
            </div>
          ) : !data?.commitments.length ? (
            <div className="px-6 py-10 text-white/50">
              No commitments yet. Reserve your allocation to begin.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Date</th>
                    <th className="text-left px-6 py-3 font-medium">Tier</th>
                    <th className="text-left px-6 py-3 font-medium">Amount</th>
                    <th className="text-left px-6 py-3 font-medium">Allocation</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-left px-6 py-3 font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.commitments.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-white/5"
                      data-testid={`row-commitment-${c.id}`}
                    >
                      <td className="px-6 py-3 text-white/70">
                        {fmtDate(c.completedAt ?? c.createdAt)}
                      </td>
                      <td className="px-6 py-3">{c.displayName}</td>
                      <td className="px-6 py-3 font-medium">
                        {fmtMoney(c.amountCents, c.currency)}
                      </td>
                      <td className="px-6 py-3">
                        {c.tokenAllocation.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-3">
                        {c.receiptUrl ? (
                          <a
                            href={c.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#00F5D4] hover:underline"
                            data-testid={`link-receipt-${c.id}`}
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
