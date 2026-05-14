import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  QrCode as QrIcon,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import PortalNav from "@/components/PortalNav";
import PageHeader from "@/components/PageHeader";
import { BrandCard, StatTile, SectionLabel } from "@/components/brand";
import GenesisDisclaimer from "@/components/GenesisDisclaimer";
import { api } from "@/lib/api";
import { useInvestSeo } from "@/lib/useInvestSeo";

interface Referrer {
  id: string;
  referralCode: string;
  status: string;
  tier: string;
  multiplierBp: number;
  compensationType: string;
  compensationSplit: Record<string, number>;
  displayName: string | null;
}
interface Lead {
  id: string;
  name: string;
  email: string;
  interestType: string;
  status: string;
  submissionChannel: string;
  createdAt: string;
}
interface Ledger {
  id: string;
  actionKey: string;
  bonusLabel: string | null;
  pointsPending: number;
  pointsApproved: number;
  tokenEquivalent: number;
  status: string;
  createdAt: string;
  leadId?: string | null;
}
interface MeResp {
  privateMode: boolean;
  publicReferralMode: boolean;
  tokenPoolTotal: number;
  pointToTokenRatio: number;
  referrer: Referrer | null;
  stats: {
    totalLeads: number;
    verifiedLeads: number;
    pendingPoints: number;
    approvedPoints: number;
    tokenEquivalent: number;
  };
  leads: Lead[];
  ledger: Ledger[];
}

function buildShareUrl(code: string): string {
  // /r/:code lives in the invest portal artifact, so the share URL must
  // always point at invest.aicreates.ai in production. In dev we use the
  // current origin so the link works against the local proxy.
  if (typeof window === "undefined") return `https://invest.aicreates.ai/r/${code}`;
  const host = window.location.hostname;
  const isProdLike =
    host === "invest.aicreates.ai" || host === "www.aicreates.ai" || host === "aicreates.ai";
  const origin = isProdLike ? "https://invest.aicreates.ai" : window.location.origin;
  return `${origin}/r/${code}`;
}

function qrUrlFor(text: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&bgcolor=0A0A0A&color=00F5D4&data=${encodeURIComponent(text)}`;
}

export default function GenesisDashboard() {
  useInvestSeo({
    title: "Genesis Dashboard",
    description: "Your Genesis referral dashboard.",
    path: "/genesis/dashboard",
  });
  const me = useQuery({
    queryKey: ["genesis", "me"],
    queryFn: () => api<MeResp>("/genesis/me"),
  });
  const qc = useQueryClient();

  if (me.isLoading) {
    return (
      <div className="min-h-screen text-white">
        <PortalNav />
        <div className="mx-auto max-w-6xl px-6 py-20 text-white/50">Loading...</div>
      </div>
    );
  }

  const data = me.data;
  if (!data) {
    return (
      <div className="min-h-screen text-white">
        <PortalNav />
        <div className="mx-auto max-w-6xl px-6 py-20 text-white/50">Failed to load.</div>
      </div>
    );
  }

  if (!data.referrer || data.referrer.status !== "approved") {
    return (
      <div className="min-h-screen text-white">
        <PortalNav />
        <main className="mx-auto max-w-3xl px-6 pt-12 pb-20">
          <PageHeader
            eyebrow="Genesis Referral"
            title="You don't have an active referral link yet."
            subtitle="Genesis is invite-only. If you haven't been onboarded, request access and our team will review."
            back={{ href: "/dashboard", label: "Back to dashboard" }}
          />
          <BrandCard hairline className="mt-8 p-6 text-sm text-white/70">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#00F5D4]" />
              <span className="font-medium text-white">
                {data.referrer ? `Status: ${data.referrer.status}` : "No referrer profile"}
              </span>
            </div>
            <p>
              {data.referrer
                ? "Your application is pending review. We'll be in touch by email."
                : "Reach out to the team to request a Genesis referral code."}
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href="/genesis/request-access"
                className="glass-btn rounded-full h-9 px-4 text-sm inline-flex items-center"
              >
                Request access
              </Link>
              <Link
                href="/genesis"
                className="glass-btn rounded-full h-9 px-4 text-sm inline-flex items-center"
              >
                Learn more
              </Link>
            </div>
          </BrandCard>
        </main>
      </div>
    );
  }

  const r = data.referrer;
  const shareUrl = buildShareUrl(r.referralCode);

  return (
    <div className="min-h-screen text-white">
      <PortalNav />
      <main className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <PageHeader
          eyebrow="Genesis Referral"
          title={
            <>
              Welcome,{" "}
              <span className="text-gradient-teal">
                {r.displayName ?? "Genesis Member"}
              </span>
            </>
          }
          subtitle="Track your introductions, points, and projected $AICA token equivalents."
          back={{ href: "/dashboard", label: "Investor dashboard" }}
        />

        <section className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatTile
            label="Total Leads"
            value={data.stats.totalLeads.toLocaleString()}
            hint="All time"
          />
          <StatTile
            label="Verified Leads"
            value={data.stats.verifiedLeads.toLocaleString()}
            hint="Verified+"
          />
          <StatTile
            label="Pending Points"
            value={data.stats.pendingPoints.toLocaleString()}
            hint="Awaiting review"
          />
          <StatTile
            label="Approved Points"
            value={data.stats.approvedPoints.toLocaleString()}
            hint="Locked in"
          />
          <StatTile
            label="$AICA Equivalent"
            value={data.stats.tokenEquivalent.toLocaleString()}
            hint={`${data.pointToTokenRatio}:1 ratio`}
            accent
          />
          <StatTile
            label="Vesting Status"
            value="TGE pending"
            hint="6-mo cliff, 24-mo linear"
          />
        </section>

        <section className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BrandCard hairline className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <SectionLabel>Your link</SectionLabel>
                <div className="mt-2 font-mono text-sm break-all" data-testid="text-referral-url">
                  {shareUrl}
                </div>
              </div>
              <CopyButton value={shareUrl} />
            </div>
            <div className="mt-2 text-xs text-white/55">
              Tier:{" "}
              <span className="text-[#00F5D4]">
                {r.tier.replaceAll("_", " ")}
              </span>{" "}
              · Multiplier: {(r.multiplierBp / 100).toFixed(2)}x · Compensation:{" "}
              {r.compensationType}
            </div>
          </BrandCard>
          <BrandCard hairline className="p-6 flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-3">
              <QrIcon className="w-4 h-4 text-[#00F5D4]" />
              <SectionLabel>QR</SectionLabel>
            </div>
            <img
              src={qrUrlFor(shareUrl)}
              alt="Referral QR"
              className="rounded-lg border border-white/10"
              width={180}
              height={180}
              data-testid="img-referral-qr"
            />
            <a
              href={qrUrlFor(shareUrl)}
              download="genesis-qr.png"
              className="mt-3 text-xs text-[#00F5D4] hover:underline inline-flex items-center gap-1"
            >
              Download <ExternalLink className="w-3 h-3" />
            </a>
          </BrandCard>
        </section>

        <CompensationEditor
          referrer={r}
          onSaved={() => qc.invalidateQueries({ queryKey: ["genesis", "me"] })}
        />

        <ManualIntroForm
          onCreated={() => qc.invalidateQueries({ queryKey: ["genesis", "me"] })}
        />

        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Recent introductions</SectionLabel>
            <span className="text-xs text-white/45">{data.leads.length} total</span>
          </div>
          <BrandCard hairline className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-white/45 bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Interest</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Pending pts</th>
                  <th className="px-4 py-3 text-right">Approved pts</th>
                  <th className="px-4 py-3 text-right">$AICA est.</th>
                  <th className="px-4 py-3 text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-white/40">
                      No introductions yet. Share your link or submit one manually.
                    </td>
                  </tr>
                ) : (
                  data.leads.map((l) => {
                    const entries = data.ledger.filter((e) => e.leadId === l.id);
                    const pending = entries.reduce((s, e) => s + e.pointsPending, 0);
                    const approved = entries.reduce((s, e) => s + e.pointsApproved, 0);
                    const tokens = entries.reduce(
                      (s, e) => s + Number(e.tokenEquivalent),
                      0,
                    );
                    return (
                      <tr key={l.id} data-testid={`row-lead-${l.id}`}>
                        <td className="px-4 py-3">{l.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white/65">
                          {l.email}
                        </td>
                        <td className="px-4 py-3 text-white/70">{l.interestType}</td>
                        <td className="px-4 py-3">
                          <StatusPill v={l.status} />
                        </td>
                        <td className="px-4 py-3 text-right text-white/65">
                          {pending.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {approved.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-[#00F5D4]">
                          {tokens.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-white/50">
                          {new Date(l.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </BrandCard>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>Points ledger</SectionLabel>
            <span className="text-xs text-white/45">{data.ledger.length} entries</span>
          </div>
          <BrandCard hairline className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-white/45 bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-right">Pending</th>
                  <th className="px-4 py-3 text-right">Approved</th>
                  <th className="px-4 py-3 text-right">$AICA est.</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.ledger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white/40">
                      No ledger activity yet.
                    </td>
                  </tr>
                ) : (
                  data.ledger.map((e) => (
                    <tr key={e.id}>
                      <td className="px-4 py-3">
                        {e.bonusLabel ?? e.actionKey.replaceAll("_", " ")}
                      </td>
                      <td className="px-4 py-3 text-right text-white/65">
                        {e.pointsPending.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {e.pointsApproved.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-[#00F5D4]">
                        {Number(e.tokenEquivalent).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill v={e.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-white/50">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </BrandCard>
        </section>

        <GenesisDisclaimer className="mt-10" />
      </main>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          toast.success("Link copied");
          setTimeout(() => setDone(false), 1500);
        } catch {
          toast.error("Could not copy");
        }
      }}
      className="glass-btn inline-flex items-center gap-1.5 rounded-full h-9 px-4 text-xs"
      data-testid="button-copy-link"
    >
      {done ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00F5D4]" /> : <Copy className="w-3.5 h-3.5" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

type CompType = "token" | "credit" | "cash" | "hybrid";

function CompensationEditor({
  referrer,
  onSaved,
}: {
  referrer: Referrer;
  onSaved: () => void;
}) {
  const [type, setType] = useState<CompType>(
    (referrer.compensationType as CompType) ?? "token",
  );
  const [displayName, setDisplayName] = useState(referrer.displayName ?? "");
  const initialSplit = referrer.compensationSplit ?? {};
  const [token, setToken] = useState<number>(Number(initialSplit.token ?? 100));
  const [credit, setCredit] = useState<number>(Number(initialSplit.credit ?? 0));
  const [cash, setCash] = useState<number>(Number(initialSplit.cash ?? 0));
  const total = token + credit + cash;
  const splitInvalid = type === "hybrid" && total !== 100;
  const save = useMutation({
    mutationFn: () => {
      const body: Record<string, unknown> = {
        compensationType: type,
        displayName: displayName.trim() || null,
      };
      if (type === "hybrid") body.compensationSplit = { token, credit, cash };
      return api<{ referrer: Referrer }>("/genesis/me", {
        method: "PUT",
        body,
      });
    },
    onSuccess: () => {
      toast.success("Preferences saved");
      onSaved();
    },
    onError: () => toast.error("Could not save"),
  });
  return (
    <BrandCard hairline className="mt-10 p-6">
      <SectionLabel>Compensation preference</SectionLabel>
      <p className="text-xs text-white/55 mt-1">
        Choose how your approved points convert at TGE. Hybrid splits must sum to 100.
      </p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs text-white/45 uppercase tracking-wider mb-1 block">
            Display name
          </span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-md px-3 py-2 text-sm text-white"
            data-testid="input-display-name"
          />
        </label>
        <label className="block">
          <span className="text-xs text-white/45 uppercase tracking-wider mb-1 block">
            Type
          </span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CompType)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-md px-3 py-2 text-sm text-white"
            data-testid="select-comp-type"
          >
            <option value="token">$AICA tokens (default)</option>
            <option value="credit">Platform credit</option>
            <option value="cash">Cash</option>
            <option value="hybrid">Hybrid split</option>
          </select>
        </label>
      </div>
      {type === "hybrid" && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <PercentField label="Token %" value={token} onChange={setToken} testId="input-split-token" />
          <PercentField label="Credit %" value={credit} onChange={setCredit} testId="input-split-credit" />
          <PercentField label="Cash %" value={cash} onChange={setCash} testId="input-split-cash" />
          <div className="col-span-3 text-xs">
            Total:{" "}
            <span className={splitInvalid ? "text-red-400" : "text-[#00F5D4]"}>
              {total}%
            </span>
            {splitInvalid && <span className="ml-2 text-red-400">must equal 100</span>}
          </div>
        </div>
      )}
      <div className="mt-4">
        <button
          className="teal-btn rounded-full h-9 px-5 text-xs font-medium disabled:opacity-50"
          onClick={() => save.mutate()}
          disabled={save.isPending || splitInvalid}
          data-testid="button-save-comp"
        >
          {save.isPending ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </BrandCard>
  );
}

function PercentField({
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
        max={100}
        value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
        className="w-full bg-white/[0.03] border border-white/10 rounded-md px-3 py-2 text-sm text-white"
        data-testid={testId}
      />
    </label>
  );
}

function ManualIntroForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    country: "",
    interestType: "customer",
    referrerNotes: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("/genesis/leads/manual", { body: form });
      toast.success("Introduction submitted for review");
      setForm({
        name: "",
        email: "",
        company: "",
        country: "",
        interestType: "customer",
        referrerNotes: "",
      });
      setOpen(false);
      onCreated();
    } catch {
      toast.error("Could not submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Manual introduction</SectionLabel>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="glass-btn inline-flex items-center gap-1.5 rounded-full h-9 px-4 text-xs"
          data-testid="button-toggle-manual-intro"
        >
          <Plus className="w-3.5 h-3.5" /> {open ? "Hide" : "New intro"}
        </button>
      </div>
      {open && (
        <BrandCard hairline className="p-6">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="form-manual-intro">
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testId="manual-name" required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} testId="manual-email" required />
            <Field label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} testId="manual-company" />
            <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} testId="manual-country" />
            <div className="md:col-span-2">
              <label className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-medium">
                Interest
              </label>
              <select
                value={form.interestType}
                onChange={(e) => setForm({ ...form, interestType: e.target.value })}
                className="mt-2 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#00F5D4]/50"
                data-testid="manual-interest"
              >
                <option value="customer" className="bg-[#0A0A0A]">Customer</option>
                <option value="enterprise" className="bg-[#0A0A0A]">Enterprise customer</option>
                <option value="developer" className="bg-[#0A0A0A]">Developer</option>
                <option value="agency" className="bg-[#0A0A0A]">Agency</option>
                <option value="partner" className="bg-[#0A0A0A]">Partner</option>
                <option value="investor" className="bg-[#0A0A0A]">Investor (compliance review)</option>
                <option value="other" className="bg-[#0A0A0A]">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-medium">
                Notes for the team
              </label>
              <textarea
                value={form.referrerNotes}
                onChange={(e) => setForm({ ...form, referrerNotes: e.target.value })}
                rows={3}
                maxLength={2000}
                className="mt-2 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#00F5D4]/50"
                data-testid="manual-notes"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="teal-btn rounded-full h-10 px-6 text-sm font-medium disabled:opacity-60 inline-flex items-center gap-2"
                data-testid="button-submit-manual"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Submit
              </button>
            </div>
          </form>
        </BrandCard>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  testId,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  testId?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.14em] text-white/55 font-medium">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm outline-none focus:border-[#00F5D4]/50"
        data-testid={testId}
      />
    </div>
  );
}

function StatusPill({ v }: { v: string }) {
  const tone = useMemo(() => pillTone(v), [v]);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${tone}`}
    >
      {v.replaceAll("_", " ")}
    </span>
  );
}
function pillTone(v: string): string {
  if (["approved", "verified", "qualified", "converted", "investor_funded"].includes(v))
    return "bg-[#00F5D4]/15 text-[#00F5D4]";
  if (["rejected", "compliance_hold", "investor_rejected", "not_qualified", "duplicate"].includes(v))
    return "bg-red-500/15 text-red-400";
  return "bg-white/8 text-white/65";
}
