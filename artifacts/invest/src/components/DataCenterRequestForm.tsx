import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function DataCenterRequestForm() {
  const [state, setState] = useState({
    name: "",
    email: "",
    company: "",
    capacity: "",
    useCase: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "err">(
    "idle",
  );
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErr(null);
    try {
      await api<{ ok: boolean }>("/data-center-access", { body: state });
      setStatus("ok");
    } catch (e2) {
      setStatus("err");
      setErr((e2 as Error).message);
    }
  };

  if (status === "ok") {
    return (
      <div
        className="text-center py-8"
        data-testid="data-center-form-success"
      >
        <CheckCircle2 className="w-10 h-10 text-[#00F5D4] mx-auto mb-3" />
        <div className="text-lg font-medium">Request received.</div>
        <p className="text-white/60 mt-2 text-sm">
          We'll be in touch within two business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" data-testid="form-data-center">
      <Field
        label="Name"
        value={state.name}
        onChange={(v) => setState({ ...state, name: v })}
        required
        testId="input-dc-name"
      />
      <Field
        label="Work email"
        type="email"
        value={state.email}
        onChange={(v) => setState({ ...state, email: v })}
        required
        testId="input-dc-email"
      />
      <Field
        label="Company"
        value={state.company}
        onChange={(v) => setState({ ...state, company: v })}
        testId="input-dc-company"
      />
      <Field
        label="Requested capacity"
        placeholder="e.g. 8x H100 / 200kW / 1U colocation"
        value={state.capacity}
        onChange={(v) => setState({ ...state, capacity: v })}
        testId="input-dc-capacity"
      />
      <div>
        <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
          Use case
        </label>
        <textarea
          value={state.useCase}
          onChange={(e) => setState({ ...state, useCase: e.target.value })}
          required
          rows={3}
          className="w-full mt-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-[#00F5D4]/40"
          data-testid="input-dc-usecase"
        />
      </div>
      {err && <div className="text-sm text-red-400">{err}</div>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full inline-flex items-center justify-center h-11 rounded-full bg-[#00F5D4] text-black font-medium hover:bg-[#00F5D4]/90 transition disabled:opacity-50"
        data-testid="button-dc-submit"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…
          </>
        ) : (
          "Request access"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  testId?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.14em] text-white/50">
        {label}
        {required && <span className="text-[#00F5D4]"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm outline-none focus:border-[#00F5D4]/40"
        data-testid={testId}
      />
    </div>
  );
}
