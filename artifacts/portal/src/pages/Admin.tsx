import { Link, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  stripeCustomerId: string | null;
  createdAt: string;
}

interface AdminCommitment {
  session_id: string;
  amount_total: number | null;
  currency: string | null;
  payment_status: string | null;
  created: number | string | null;
  email: string | null;
  full_name: string | null;
  user_id: string | null;
}

interface MeResponse {
  user: { role: string };
}

function fmtMoney(cents: number | null, currency: string | null) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency ?? "usd").toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function fmtDate(v: number | string | null) {
  if (!v) return "—";
  const ms = typeof v === "number" ? v * 1000 : Date.parse(String(v));
  if (Number.isNaN(ms)) return "—";
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Admin() {
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
    queryKey: ["admin", "commitments"],
    queryFn: () =>
      api<{ commitments: AdminCommitment[] }>("/admin/commitments"),
    enabled: me.data?.user.role === "admin",
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

  const totalCommitted = (commitments.data?.commitments ?? [])
    .filter((c) => c.payment_status === "paid")
    .reduce((s, c) => s + (c.amount_total ?? 0), 0);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">
              Total committed
            </div>
            <div className="mt-3 text-3xl font-semibold text-[#00F5D4]">
              {fmtMoney(totalCommitted, "usd")}
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
              Commitments
            </div>
            <div className="mt-3 text-3xl font-semibold">
              {commitments.data?.commitments.length ?? 0}
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] mb-10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-medium">Commitments</h2>
          </div>
          {commitments.isLoading ? (
            <div className="px-6 py-8 text-white/50">Loading...</div>
          ) : !commitments.data?.commitments.length ? (
            <div className="px-6 py-8 text-white/50">
              No commitments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-[0.14em] text-white/40">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Date</th>
                    <th className="text-left px-6 py-3 font-medium">Investor</th>
                    <th className="text-left px-6 py-3 font-medium">Amount</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {commitments.data.commitments.map((c) => (
                    <tr key={c.session_id} className="border-t border-white/5">
                      <td className="px-6 py-3">{fmtDate(c.created)}</td>
                      <td className="px-6 py-3">
                        <div className="font-medium">
                          {c.full_name ?? "—"}
                        </div>
                        <div className="text-xs text-white/50">{c.email}</div>
                      </td>
                      <td className="px-6 py-3 font-medium">
                        {fmtMoney(c.amount_total, c.currency)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={
                            c.payment_status === "paid"
                              ? "px-2 py-0.5 rounded-full text-xs bg-[#00F5D4]/15 text-[#00F5D4]"
                              : "px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70"
                          }
                        >
                          {c.payment_status ?? "pending"}
                        </span>
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
