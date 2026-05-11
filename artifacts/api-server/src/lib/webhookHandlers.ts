import Stripe from "stripe";
import { db, commitmentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getStripeSync, getUncachableStripeClient } from "./stripeClient";
import { logger } from "./logger";

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
        await this.upsertCommitment({
          paymentIntentId: pi.id,
          customerId:
            typeof pi.customer === "string"
              ? pi.customer
              : pi.customer?.id ?? null,
          amountCents: pi.amount_received ?? pi.amount ?? null,
          currency: pi.currency ?? null,
          status: "succeeded",
          receiptUrl: charge?.receipt_url ?? null,
          completedAt: new Date(),
          metadata: pi.metadata ?? null,
        });
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await this.upsertCommitment({
          paymentIntentId: pi.id,
          status: "failed",
          metadata: pi.metadata ?? null,
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
        await this.upsertCommitment({
          paymentIntentId: piId,
          status: "refunded",
          refundedAt: new Date(),
          receiptUrl: charge.receipt_url ?? null,
          metadata: charge.metadata ?? null,
        });
        break;
      }
      default:
        break;
    }
  }
}
