import { runMigrations } from "stripe-replit-sync";
import app from "./app";
import { logger } from "./lib/logger";
import { getStripeSync, isStripeConfigured } from "./lib/stripeClient";

async function initStripe(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set; skipping Stripe initialization.");
    return;
  }

  const configured = await isStripeConfigured();
  if (!configured) {
    logger.warn(
      "Stripe integration not connected. Skipping Stripe init. " +
        "Connect via the Replit Integrations tab to enable payments.",
    );
    return;
  }

  try {
    logger.info("Initializing Stripe schema...");
    await runMigrations({ databaseUrl });
    logger.info("Stripe schema ready");

    const stripeSync = await getStripeSync();
    const replitDomain = process.env.REPLIT_DOMAINS?.split(",")[0];
    if (replitDomain) {
      const webhookUrl = `https://${replitDomain}/api/stripe/webhook`;
      logger.info({ webhookUrl }, "Setting up managed Stripe webhook");
      await stripeSync.findOrCreateManagedWebhook(webhookUrl);
    }

    logger.info("Backfilling Stripe data...");
    stripeSync
      .syncBackfill()
      .then(() => logger.info("Stripe data synced"))
      .catch((err) => logger.error({ err }, "Stripe syncBackfill failed"));
  } catch (err) {
    logger.error({ err }, "initStripe failed; continuing without Stripe");
  }
}

const rawPort = process.env["PORT"];
if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

await initStripe();

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});
