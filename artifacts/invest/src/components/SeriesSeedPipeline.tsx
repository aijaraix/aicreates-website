import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const stages = [
  "discovery",
  "research",
  "qualification",
  "outreach",
  "meeting",
  "diligence",
  "term_sheet",
  "negotiation",
  "commitment",
  "documentation",
  "closing",
  "ongoing_ir",
] as const;
const label = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase());
interface Case {
  id: string;
  prospect_name: string;
  investor_user_id: string | null;
  stage: (typeof stages)[number];
  revision: number;
  updated_at: string;
}
interface Event {
  id: string;
  actor_user_id: string;
  to_stage: string;
  reason: string;
  evidence_reference: string | null;
  created_at: string;
}
const field =
  "mt-2 w-full rounded-lg border border-white/20 bg-[#161616] px-3 py-2 text-base text-white focus:outline-none focus:ring-2 focus:ring-teal-300";
const button =
  "rounded-lg bg-teal-300 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50";

export default function SeriesSeedPipeline() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const cases = useQuery({
    queryKey: ["admin", "series-seed", query],
    queryFn: () =>
      api<{ cases: Case[] }>(
        `/admin/series-seed/cases?q=${encodeURIComponent(query)}`,
      ),
    retry: false,
  });
  const create = useMutation({
    mutationFn: () =>
      api<Case>("/admin/series-seed/cases", {
        body: { prospectName: name.trim() },
      }),
    onSuccess: async (record) => {
      setName("");
      setSelectedId(record.id);
      setQuery("");
      setSearch("");
      await qc.invalidateQueries({ queryKey: ["admin", "series-seed"] });
    },
  });
  const selected = cases.data?.cases.find((x) => x.id === selectedId);
  if (cases.isPending) return <p role="status">Loading Series Seed cases…</p>;
  if (cases.isError)
    return (
      <div role="alert" className="brand-card p-6">
        <h2 className="text-xl font-semibold">Series Seed is unavailable.</h2>
        <p className="mt-2 text-white/70">
          We could not load the workflow. Contact your administrator if this
          continues.
        </p>
        <button className={`${button} mt-4`} onClick={() => cases.refetch()}>
          Try again
        </button>
      </div>
    );

  return (
    <section aria-labelledby="seed-title" className="space-y-7">
      <div>
        <h2 id="seed-title" className="text-2xl font-semibold">
          Series Seed pipeline
        </h2>
        <p className="mt-2 max-w-3xl text-base text-white/70">
          Track investor conversations and reviewed decisions. Recording a stage
          does not send a message, execute a document or accept an investment.
        </p>
      </div>
      <form
        className="brand-card p-5 flex flex-wrap items-end gap-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (!create.isPending) create.mutate();
        }}
      >
        <label className="grow text-sm" htmlFor="seed-prospect">
          Prospect or organization
          <input
            id="seed-prospect"
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={1}
            maxLength={200}
          />
        </label>
        <button className={button} disabled={create.isPending || !name.trim()}>
          {create.isPending ? "Creating…" : "Create case"}
        </button>
        {create.isError && (
          <p role="alert" className="w-full text-red-300">
            The case could not be created. Refresh to check whether it was
            recorded before trying again.
          </p>
        )}
      </form>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(search.trim());
          setSelectedId(null);
        }}
      >
        <label className="grow text-sm" htmlFor="seed-search">
          Find a case
          <input
            id="seed-search"
            className={field}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxLength={200}
          />
        </label>
        <button className={button}>Search</button>
      </form>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white/70">
            Recent cases · up to 200 results
          </h3>
          {cases.data?.cases.length === 0 && (
            <p className="brand-card p-6 text-white/70">No cases found.</p>
          )}
          <ul className="space-y-3">
            {cases.data?.cases.map((record) => (
              <li key={record.id}>
                <button
                  className={`w-full rounded-xl border p-4 text-left ${selectedId === record.id ? "border-teal-300 bg-teal-300/10" : "border-white/15 bg-white/[0.02]"}`}
                  onClick={() => setSelectedId(record.id)}
                  aria-pressed={selectedId === record.id}
                >
                  <span className="block text-base font-semibold break-words">
                    {record.prospect_name}
                  </span>
                  <span className="mt-1 block text-sm text-white/65">
                    {label(record.stage)} ·{" "}
                    {new Date(record.updated_at).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {selected ? (
          <CaseEditor
            key={`${selected.id}:${selected.revision}`}
            record={selected}
          />
        ) : (
          <p className="brand-card p-6 text-white/65">
            Select a case to review its next step and history.
          </p>
        )}
      </div>
    </section>
  );
}

function CaseEditor({ record }: { record: Case }) {
  const qc = useQueryClient();
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [requestId] = useState(() => crypto.randomUUID());
  const [investorId, setInvestorId] = useState("");
  const [linkReason, setLinkReason] = useState("");
  const next = stages[stages.indexOf(record.stage) + 1];
  const needsEvidence =
    next && stages.indexOf(next) >= stages.indexOf("term_sheet");
  const events = useQuery({
    queryKey: ["admin", "series-seed-history", record.id, record.revision],
    queryFn: () =>
      api<{ events: Event[] }>(`/admin/series-seed/cases/${record.id}/events`),
    retry: false,
  });
  const investors = useQuery({
    queryKey: ["admin", "series-seed-investors"],
    queryFn: () =>
      api<{
        investors: { id: string; email: string; fullName: string | null }[];
      }>("/admin/investors?role=investor"),
    enabled: !record.investor_user_id,
    retry: false,
  });
  const refresh = async () => {
    await qc.invalidateQueries({ queryKey: ["admin", "series-seed"] });
  };
  const advance = useMutation({
    mutationFn: () =>
      api(`/admin/series-seed/cases/${record.id}/decisions`, {
        body: {
          stage: next,
          expectedRevision: record.revision,
          reason: reason.trim(),
          evidenceReference: evidence.trim() || null,
          idempotencyKey: requestId,
        },
      }),
    onSuccess: refresh,
  });
  const link = useMutation({
    mutationFn: () =>
      api(`/admin/series-seed/cases/${record.id}/investor`, {
        body: {
          investorUserId: investorId,
          expectedRevision: record.revision,
          reason: linkReason.trim(),
        },
      }),
    onSuccess: refresh,
  });
  const pending = advance.isPending || link.isPending;
  return (
    <article className="brand-card p-5 sm:p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold break-words">
          {record.prospect_name}
        </h3>
        <p className="mt-1 text-sm text-teal-200">{label(record.stage)}</p>
      </div>
      {next ? (
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!pending) advance.mutate();
          }}
        >
          <h4 className="font-semibold">Next: {label(next)}</h4>
          <label className="block text-sm" htmlFor="seed-reason">
            Decision and rationale
            <textarea
              id="seed-reason"
              className={`${field} min-h-28`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={10}
              maxLength={4000}
            />
          </label>
          <label className="block text-sm" htmlFor="seed-evidence">
            Reviewed decision reference{" "}
            {needsEvidence ? "(required)" : "(optional)"}
            <input
              id="seed-evidence"
              className={field}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              required={!!needsEvidence}
              maxLength={500}
            />
          </label>
          <p className="text-sm text-white/65">
            Reference the reviewed record; keep confidential document text in
            its approved source.
          </p>
          <button
            className={button}
            disabled={
              pending ||
              reason.trim().length < 10 ||
              (!!needsEvidence && !evidence.trim())
            }
          >
            {advance.isPending ? "Recording…" : `Record ${label(next)}`}
          </button>
          {advance.isError && (
            <p role="alert" className="text-sm text-red-300">
              The decision could not be confirmed. Refresh the case before
              changing or retrying it.
            </p>
          )}
        </form>
      ) : (
        <p className="text-white/70">
          This case has reached ongoing investor relations.
        </p>
      )}
      {!record.investor_user_id ? (
        <form
          className="border-t border-white/10 pt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!pending) link.mutate();
          }}
        >
          <h4 className="font-semibold">Link an existing investor</h4>
          <p className="text-sm text-white/65">
            The selected account can view this case's stage. Confirm the
            identity before linking.
          </p>
          <label className="block text-sm" htmlFor="seed-investor">
            Investor account
            <select
              id="seed-investor"
              className={field}
              value={investorId}
              onChange={(e) => setInvestorId(e.target.value)}
              required
            >
              <option value="">Select an investor</option>
              {investors.data?.investors.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.fullName || x.email} · {x.email}
                </option>
              ))}
            </select>
          </label>
          {investors.isError && (
            <p role="alert" className="text-sm text-red-300">
              Investor accounts could not be loaded.
            </p>
          )}
          <label className="block text-sm" htmlFor="seed-link-reason">
            Identity verification note
            <input
              id="seed-link-reason"
              className={field}
              value={linkReason}
              onChange={(e) => setLinkReason(e.target.value)}
              required
              minLength={10}
              maxLength={4000}
            />
          </label>
          <button
            className={button}
            disabled={pending || !investorId || linkReason.trim().length < 10}
          >
            Confirm investor link
          </button>
          {link.isError && (
            <p role="alert" className="text-sm text-red-300">
              The link could not be confirmed. Refresh and verify the current
              account association.
            </p>
          )}
        </form>
      ) : (
        <p className="text-sm text-white/65">
          Linked to an investor account. Existing links cannot be reassigned
          here.
        </p>
      )}
      <section className="border-t border-white/10 pt-5">
        <h4 className="font-semibold">Decision history</h4>
        {events.isPending && <p role="status">Loading history…</p>}
        {events.isError && (
          <p role="alert" className="text-sm text-red-300">
            History could not be loaded.
          </p>
        )}
        <ol className="mt-4 space-y-4">
          {events.data?.events.map((event) => (
            <li key={event.id} className="border-l border-teal-300/40 pl-4">
              <p className="text-sm font-semibold">{label(event.to_stage)}</p>
              <p className="mt-1 text-sm text-white/75 whitespace-pre-wrap break-words">
                {event.reason}
              </p>
              {event.evidence_reference && (
                <p className="mt-1 text-sm text-white/60 break-words">
                  Reference: {event.evidence_reference}
                </p>
              )}
              <p className="mt-1 text-xs text-white/55">
                {new Date(event.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      </section>
      <button
        type="button"
        className="text-sm text-teal-200 underline underline-offset-4"
        onClick={refresh}
        disabled={pending}
      >
        Refresh case
      </button>
    </article>
  );
}
