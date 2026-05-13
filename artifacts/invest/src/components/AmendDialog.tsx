import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ROUNDS } from "@/data/rounds";

const AMENDABLE_STATES = new Set([
  "pending_saft",
  "pending_resign",
  "pending_payment",
  "awaiting_wire",
  "failed",
  "pending",
]);

const MIN_CENTS = 100_000;
const MAX_CENTS = 1_000_000_000;

export function isAmendable(state: string | null | undefined): boolean {
  return AMENDABLE_STATES.has(String(state ?? ""));
}

export interface AmendDialogProps {
  open: boolean;
  onClose: () => void;
  commitment: {
    id: string;
    amountCents: number;
    roundSlug: string;
    displayName?: string | null;
    email?: string | null;
  };
  /**
   * "investor" calls POST /commitments/:id/amend (no reason required).
   * "admin" calls POST /admin/commitments/:id/amend (reason required).
   */
  mode: "investor" | "admin";
  invalidateKey?: readonly unknown[];
}

export function AmendDialog({
  open,
  onClose,
  commitment,
  mode,
  invalidateKey,
}: AmendDialogProps) {
  const qc = useQueryClient();
  const [amountUsd, setAmountUsd] = useState(
    String(Math.round(commitment.amountCents / 100)),
  );
  const [roundSlug, setRoundSlug] = useState(commitment.roundSlug);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const cents = Math.round(Number(amountUsd) * 100);
      if (!Number.isFinite(cents) || cents < MIN_CENTS || cents > MAX_CENTS) {
        throw new Error(
          `Amount must be between $${(MIN_CENTS / 100).toLocaleString()} and $${(MAX_CENTS / 100).toLocaleString()}.`,
        );
      }
      if (mode === "admin" && !reason.trim()) {
        throw new Error("Reason is required for admin amendments.");
      }
      const path =
        mode === "admin"
          ? `/admin/commitments/${commitment.id}/amend`
          : `/commitments/${commitment.id}/amend`;
      return api<{ commitment: unknown }>(path, {
        body: { amountCents: cents, roundSlug, reason: reason.trim() || null },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
      if (invalidateKey) qc.invalidateQueries({ queryKey: invalidateKey });
      onClose();
    },
    onError: (e) => setError((e as Error).message),
  });

  if (!open) return null;

  const newCents = Math.round(Number(amountUsd) * 100) || 0;
  const round = ROUNDS.find((r) => r.slug === roundSlug);
  // Only currently-open rounds are valid amend targets. Always include
  // the commitment's current round so an investor can keep their round
  // even if it has just closed (the server will still reject closed
  // rounds, this just keeps the picker honest).
  const selectableRounds = ROUNDS.filter(
    (r) => r.open || r.slug === commitment.roundSlug,
  );
  const newTokens = round
    ? Math.floor((newCents * 1000) / round.pricePerTokenMillicents / 10)
    : 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      data-testid="amend-dialog"
      onClick={onClose}
    >
      <div
        className="brand-card max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-display text-xl">Change amount or round</h3>
          <p className="text-xs text-white/55 mt-1">
            Updating this commitment will supersede the existing SAFT.{" "}
            {mode === "admin"
              ? "The investor will receive an email asking them to re-sign."
              : "You will be asked to re-sign before checkout."}
          </p>
        </div>

        <label className="block text-sm">
          <span className="text-white/70">Round</span>
          <select
            className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm"
            value={roundSlug}
            onChange={(e) => setRoundSlug(e.target.value)}
            data-testid="amend-round-select"
          >
            {selectableRounds.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name} - {r.pricePerToken}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-white/70">Amount (USD)</span>
          <input
            type="number"
            min={MIN_CENTS / 100}
            max={MAX_CENTS / 100}
            step={1}
            value={amountUsd}
            onChange={(e) => setAmountUsd(e.target.value)}
            className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm font-mono"
            data-testid="amend-amount-input"
          />
          <div className="mt-1 text-[11px] text-white/40">
            New allocation: {newTokens.toLocaleString()} AICA
          </div>
        </label>

        {mode === "admin" && (
          <label className="block text-sm">
            <span className="text-white/70">
              Reason <span className="text-red-300">*</span>
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm"
              placeholder="e.g. Investor requested upsize"
              data-testid="amend-reason-input"
            />
          </label>
        )}

        {error && (
          <div
            className="text-sm text-red-300 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2"
            data-testid="amend-error"
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-full border border-white/10 hover:bg-white/[0.04] text-sm"
            data-testid="amend-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              mutation.mutate();
            }}
            disabled={mutation.isPending}
            className="px-4 h-9 rounded-full teal-btn text-sm disabled:opacity-50"
            data-testid="amend-submit"
          >
            {mutation.isPending ? "Saving..." : "Save & request re-sign"}
          </button>
        </div>
      </div>
    </div>
  );
}
