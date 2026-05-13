import Stripe from "stripe";
import { db, commitmentsTable, appUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getStripeSync, getUncachableStripeClient } from "./stripeClient";
import { logger } from "./logger";
import {
  emailPaymentReceived,
  emailRefundIssued,
  emailDisputeAdmin,
} from "./email";
import { adminEmails } from "./auth";

function dashboardOrigin(): string {
  return (
    process.env["PUBLIC_PORTAL_ORIGIN"] ??
    "https://invest.aicreates.ai"
  );
}

async function lookupUserEmail(
  userId: string | null,
): Promise<{ email: string; fullName: string | null } | null> {
  if (!userId) return null;
  const rows = await db
    .select({ email: appUsersTable.email, fullName: appUsersTable.fullName })
    .from(appUsersTable)
    .where(eq(appUsersTable.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

export class WebhookHandlers {
  /**
   * Verify the signature, mirror the event into stripe.* via
   * stripe-replit-sync, AND upsert our first-party commitments table from
   * payment_intent / charge events.
   */
  static async processWebhook(
    payload: Buffer,
    signature: string,
  ): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        "STRIPE WEBHOOK ERROR: Payload must be a Buffer. Received type: " +
          typeof payload +
          ". FIX: ensure the webhook route is registered BEFORE app.use(express.json()).",
      );
    }

    const stripe = await getUncachableStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
    let event: Stripe.Event | null = null;
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      } catch (err) {
        logger.warn({ err }, "Stripe signature verification failed at app layer");
      }
    }

    // Always pass through to the sync library so stripe.* mirror stays current.
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // If we couldn't independently verify (e.g. STRIPE_WEBHOOK_SECRET not in
    // env), fall back to parsing the JSON body now that sync verified it.
    if (!event) {
      try {
        event = JSON.parse(payload.toString("utf-8")) as Stripe.Event;
      } catch (err) {
        logger.error({ err }, "Could not parse webhook payload");
        return;
      }
    }

    try {
      await this.handleAppLogic(event);
    } catch (err) {
      logger.error({ err, type: event.type }, "Webhook app-logic failed");
    }
  }

  /**
   * True upsert helper: locate an existing commitment by checkout session
   * id OR payment intent id, update it, or insert a new row from event
   * metadata when no local record exists yet (e.g. legacy webhooks
   * arriving for sessions created outside this server).
   */
  private static async upsertCommitment(args: {
    sessionId?: string | null;
    paymentIntentId?: string | null;
    customerId?: string | null;
    amountCents?: number | null;
    currency?: string | null;
    status: "pending" | "succeeded" | "failed" | "refunded";
    billingCountry?: string | null;
    receiptUrl?: string | null;
    completedAt?: Date | null;
    refundedAt?: Date | null;
    metadata?: Stripe.Metadata | null;
    failure?: {
      reason: string | null;
      code: string | null;
      declineCode: string | null;
      at: Date;
    } | null;
  }): Promise<void> {
    const md = args.metadata ?? {};
    const tierSlug = (md["tier_slug"] as string | undefined) ?? null;
    const displayName = (md["display_name"] as string | undefined) ?? null;
    const tokenAllocation = md["token_allocation"]
      ? parseInt(md["token_allocation"] as string, 10) || 0
      : 0;
    const userId = (md["user_id"] as string | undefined) ?? null;

    // Try locate existing row.
    let existing = args.sessionId
      ? (
          await db
            .select()
            .from(commitmentsTable)
            .where(eq(commitmentsTable.stripeCheckoutSessionId, args.sessionId))
            .limit(1)
        )[0]
      : undefined;
    if (!existing && args.paymentIntentId) {
      existing = (
        await db
          .select()
          .from(commitmentsTable)
          .where(
            eq(commitmentsTable.stripePaymentIntentId, args.paymentIntentId),
          )
          .limit(1)
      )[0];
    }
    // Fallback: payment_intent.payment_failed often arrives before we've
    // persisted the PI on the commitment row, but checkout always writes
    // metadata.commitment_id when it creates the session, so this resolves
    // first-time declines reliably.
    const metadataCommitmentId =
      typeof md["commitment_id"] === "string"
        ? (md["commitment_id"] as string)
        : null;
    if (!existing && metadataCommitmentId) {
      existing = (
        await db
          .select()
          .from(commitmentsTable)
          .where(eq(commitmentsTable.id, metadataCommitmentId))
          .limit(1)
      )[0];
    }

    if (existing) {
      const stateMap: Record<string, string> = {
        succeeded: "funded",
        failed: "failed",
        refunded: "refunded",
        pending: existing.state ?? "pending_payment",
      };
      const patch: Record<string, unknown> = {
        status: args.status,
        state: stateMap[args.status] ?? args.status,
        updatedAt: new Date(),
      };
      if (args.paymentIntentId && !existing.stripePaymentIntentId) {
        patch["stripePaymentIntentId"] = args.paymentIntentId;
      }
      if (args.billingCountry) patch["billingCountry"] = args.billingCountry;
      if (args.receiptUrl) patch["receiptUrl"] = args.receiptUrl;
      if (args.completedAt) patch["completedAt"] = args.completedAt;
      if (args.refundedAt) patch["refundedAt"] = args.refundedAt;
      if (args.status === "succeeded" && !existing.fundedAt) {
        patch["fundedAt"] = args.completedAt ?? new Date();
      }
      if (args.failure) {
        patch["lastFailureReason"] = args.failure.reason;
        patch["lastFailureCode"] = args.failure.code;
        patch["lastFailureDeclineCode"] = args.failure.declineCode;
        patch["lastFailureAt"] = args.failure.at;
      }
      // Clear stale failure metadata on a successful payment so the
      // dashboard never shows "Payment failed" on a funded commitment.
      if (args.status === "succeeded") {
        patch["lastFailureReason"] = null;
        patch["lastFailureCode"] = null;
        patch["lastFailureDeclineCode"] = null;
        patch["lastFailureAt"] = null;
      }
      await db
        .update(commitmentsTable)
        .set(patch)
        .where(eq(commitmentsTable.id, existing.id));
      return;
    }

    // No existing row — INSERT (true upsert path). Requires enough metadata
    // to anchor the commitment to a user + tier; otherwise log and skip.
    if (!args.sessionId || !userId || !tierSlug || !displayName) {
      logger.warn(
        {
          sessionId: args.sessionId,
          paymentIntentId: args.paymentIntentId,
          hasMetadata: Boolean(userId && tierSlug && displayName),
        },
        "Webhook upsert skipped: missing local row and insufficient metadata to backfill",
      );
      return;
    }
    await db
      .insert(commitmentsTable)
      .values({
        userId,
        stripeCheckoutSessionId: args.sessionId,
        stripePaymentIntentId: args.paymentIntentId ?? null,
        stripeCustomerId: args.customerId ?? null,
        amountCents: args.amountCents ?? 0,
        currency: args.currency ?? "usd",
        status: args.status,
        tierSlug,
        displayName,
        tokenAllocation,
        billingCountry: args.billingCountry ?? null,
        receiptUrl: args.receiptUrl ?? null,
        completedAt: args.completedAt ?? null,
        refundedAt: args.refundedAt ?? null,
      })
      .onConflictDoNothing();
  }

  /**
   * Look up the local commitment status by Stripe payment intent id.
   * Returns null if no row exists yet (first time we see this PI).
   * Used to gate webhook-triggered emails on actual state transitions
   * so Stripe redeliveries don't generate duplicate emails.
   */
  private static async priorStatusByPi(piId: string): Promise<string | null> {
    try {
      const rows = await db
        .select({ status: commitmentsTable.status })
        .from(commitmentsTable)
        .where(eq(commitmentsTable.stripePaymentIntentId, piId))
        .limit(1);
      return rows[0]?.status ?? null;
    } catch (err) {
      logger.warn({ err, piId }, "priorStatusByPi lookup failed");
      return null;
    }
  }

  private static async handleAppLogic(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const piId =
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null;
        const status: "succeeded" | "pending" =
          session.payment_status === "paid" ? "succeeded" : "pending";
        await this.upsertCommitment({
          sessionId: session.id,
          paymentIntentId: piId,
          customerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null,
          amountCents: session.amount_total ?? null,
          currency: session.currency ?? null,
          status,
          billingCountry: session.customer_details?.address?.country ?? null,
          completedAt: status === "succeeded" ? new Date() : null,
          metadata: session.metadata ?? null,
        });
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const charge =
          (pi as unknown as { charges?: { data?: Stripe.Charge[] } }).charges
            ?.data?.[0] ?? null;
        const amountCents = pi.amount_received ?? pi.amount ?? null;
        // Snapshot prior state so we only send the receipt on the
        // 0->1 transition. Stripe redelivers events; without this gate
        // each retry would send another email.
        const priorStatus = await this.priorStatusByPi(pi.id);
        await this.upsertCommitment({
          paymentIntentId: pi.id,
          customerId:
            typeof pi.customer === "string"
              ? pi.customer
              : pi.customer?.id ?? null,
          amountCents,
          currency: pi.currency ?? null,
          status: "succeeded",
          receiptUrl: charge?.receipt_url ?? null,
          completedAt: new Date(),
          metadata: pi.metadata ?? null,
        });
        if (priorStatus !== "succeeded") {
          try {
            const localRow = (
              await db
                .select()
                .from(commitmentsTable)
                .where(eq(commitmentsTable.stripePaymentIntentId, pi.id))
                .limit(1)
            )[0];
            if (localRow && amountCents) {
              const userInfo = await lookupUserEmail(localRow.userId);
              if (userInfo) {
                void emailPaymentReceived({
                  to: userInfo.email,
                  investorName: userInfo.fullName ?? userInfo.email,
                  commitmentId: localRow.id,
                  amountCents,
                  tokens: localRow.tokenAllocation,
                  receiptUrl: charge?.receipt_url ?? null,
                  dashboardUrl: `${dashboardOrigin()}/invest/dashboard?paid=${localRow.id}`,
                });
              }
            }
          } catch (err) {
            logger.warn({ err }, "payment receipt email failed to enqueue");
          }
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const lpe = pi.last_payment_error ?? null;
        await this.upsertCommitment({
          paymentIntentId: pi.id,
          status: "failed",
          metadata: pi.metadata ?? null,
          failure: {
            reason: lpe?.message ?? lpe?.type ?? null,
            code: lpe?.code ?? null,
            declineCode: lpe?.decline_code ?? null,
            at: new Date(),
          },
        });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id ?? null;
        if (!piId) break;
        const priorStatus = await this.priorStatusByPi(piId);
        await this.upsertCommitment({
          paymentIntentId: piId,
          status: "refunded",
          refundedAt: new Date(),
          receiptUrl: charge.receipt_url ?? null,
          metadata: charge.metadata ?? null,
        });
        if (priorStatus === "refunded") break;
        try {
          const localRow = (
            await db
              .select()
              .from(commitmentsTable)
              .where(eq(commitmentsTable.stripePaymentIntentId, piId))
              .limit(1)
          )[0];
          if (localRow) {
            const userInfo = await lookupUserEmail(localRow.userId);
            if (userInfo) {
              void emailRefundIssued({
                to: userInfo.email,
                investorName: userInfo.fullName ?? userInfo.email,
                commitmentId: localRow.id,
                amountCents:
                  charge.amount_refunded ?? charge.amount ?? localRow.amountCents,
                reason: (charge.refunds?.data?.[0]?.reason ?? null) as
                  | string
                  | null,
              });
            }
          }
        } catch (err) {
          logger.warn({ err }, "refund email failed to enqueue");
        }
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const piId =
          typeof dispute.payment_intent === "string"
            ? dispute.payment_intent
            : dispute.payment_intent?.id ?? null;

        // Snapshot prior state for idempotency. Stripe can redeliver
        // dispute.created on retries; we only want to alert admins once.
        const priorStatus = piId ? await this.priorStatusByPi(piId) : null;

        // Lookup is best-effort: if it throws, we still want to fire the
        // admin alert so urgent disputes never go unnoticed.
        let localRow: { id: string; userId: string | null } | null = null;
        try {
          if (piId) {
            const rows = await db
              .select({
                id: commitmentsTable.id,
                userId: commitmentsTable.userId,
              })
              .from(commitmentsTable)
              .where(eq(commitmentsTable.stripePaymentIntentId, piId))
              .limit(1);
            localRow = rows[0] ?? null;
          }
        } catch (err) {
          logger.warn({ err }, "dispute: commitment lookup failed");
        }

        // Mark our copy so admins see the state immediately. Failures
        // here must NOT prevent the admin alert from going out.
        if (localRow) {
          try {
            await db
              .update(commitmentsTable)
              .set({ status: "disputed", state: "disputed", updatedAt: new Date() })
              .where(eq(commitmentsTable.id, localRow.id));
          } catch (err) {
            logger.error(
              { err, commitmentId: localRow.id },
              "dispute: failed to mark commitment disputed",
            );
          }
        }

        if (priorStatus === "disputed") break;

        try {
          const investorEmail =
            (localRow ? (await lookupUserEmail(localRow.userId))?.email : null) ??
            "(unknown)";
          const admins = adminEmails();
          if (admins.length > 0) {
            void emailDisputeAdmin({
              to: admins,
              commitmentId: localRow?.id ?? "(no local row)",
              investorEmail,
              amountCents: dispute.amount ?? 0,
              disputeId: dispute.id,
              reason: dispute.reason ?? "unknown",
              dueByIso: dispute.evidence_details?.due_by
                ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
                : null,
              dashboardUrl: `${dashboardOrigin()}/invest/admin`,
            });
          }
        } catch (err) {
          logger.warn({ err }, "dispute admin email failed to enqueue");
        }
        break;
      }
      default:
        break;
    }
  }
}
