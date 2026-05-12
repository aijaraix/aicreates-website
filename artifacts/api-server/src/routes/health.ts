import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";
import { isStripeConfigured } from "../lib/stripeClient";
import { isEmailConfigured } from "../lib/email";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * Liveness check: process is up. Always 200 unless the event loop is wedged.
 */
router.get("/healthz", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Deep readiness preflight. Used by deploy smoke tests and post-merge
 * verification to catch misconfiguration BEFORE traffic flows. Each check
 * is best-effort and reported individually so a single failing dependency
 * does not mask others. Returns 200 only when every CRITICAL check passes
 * (DB and Clerk config); auxiliary providers (Stripe, Resend) are reported
 * but do not fail readiness, so the portal can still render in degraded
 * mode (e.g. wire-only checkout) without payments wired.
 */
router.get("/healthz/ready", async (_req, res) => {
  const checks: Record<
    string,
    { ok: boolean; critical: boolean; detail?: string }
  > = {};

  // DB ping. Critical: nothing works without it.
  try {
    await db.execute(sql`select 1`);
    checks["database"] = { ok: true, critical: true };
  } catch (err) {
    checks["database"] = {
      ok: false,
      critical: true,
      detail: (err as Error).message,
    };
  }

  // Clerk reachability. Critical: auth is required for the portal.
  // First verify both env vars exist; then probe Clerk's API with a
  // 3s-budgeted authenticated request so a stale or revoked secret
  // surfaces as a hard 503 instead of a soft 200.
  const secretKey = process.env["CLERK_SECRET_KEY"];
  const publishableKey = process.env["VITE_CLERK_PUBLISHABLE_KEY"];
  if (!secretKey || !publishableKey) {
    checks["clerk"] = {
      ok: false,
      critical: true,
      detail: "CLERK_SECRET_KEY and/or VITE_CLERK_PUBLISHABLE_KEY missing",
    };
  } else {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 3_000);
      // limit=1 keeps the response tiny. Any 2xx/4xx response from Clerk
      // (even an empty 200) proves the API is reachable AND the secret
      // is well-formed. 401/403 means the secret is invalid -> not ok.
      const resp = await fetch(
        "https://api.clerk.com/v1/users?limit=1",
        {
          headers: { Authorization: `Bearer ${secretKey}` },
          signal: ctrl.signal,
        },
      );
      clearTimeout(t);
      const ok = resp.status >= 200 && resp.status < 400;
      checks["clerk"] = {
        ok,
        critical: true,
        ...(ok ? {} : { detail: `clerk responded ${resp.status}` }),
      };
    } catch (err) {
      checks["clerk"] = {
        ok: false,
        critical: true,
        detail: `clerk unreachable: ${(err as Error).message}`,
      };
    }
  }

  // Stripe credentials. Non-critical: portal renders without it; only
  // card/ACH/crypto checkout breaks. Wire flow keeps working.
  try {
    const stripeOk = await isStripeConfigured();
    checks["stripe"] = {
      ok: stripeOk,
      critical: false,
      ...(stripeOk ? {} : { detail: "no API key resolved" }),
    };
  } catch (err) {
    checks["stripe"] = {
      ok: false,
      critical: false,
      detail: (err as Error).message,
    };
  }

  // Resend (transactional email). Non-critical: sends silently no-op
  // when not configured, the rest of the API keeps working.
  try {
    const emailOk = await isEmailConfigured();
    checks["email"] = {
      ok: emailOk,
      critical: false,
      ...(emailOk ? {} : { detail: "no Resend key resolved" }),
    };
  } catch (err) {
    checks["email"] = {
      ok: false,
      critical: false,
      detail: (err as Error).message,
    };
  }

  const criticalFailed = Object.values(checks).some(
    (c) => c.critical && !c.ok,
  );
  if (criticalFailed) {
    logger.warn({ checks }, "/healthz/ready: critical check failed");
  }
  res.status(criticalFailed ? 503 : 200).json({
    status: criticalFailed ? "degraded" : "ok",
    timestamp: new Date().toISOString(),
    checks,
  });
});

export default router;
