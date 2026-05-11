/**
 * Seed AIcreatesAI Founders Commitment tiers in Stripe.
 *
 * Idempotent: looks up products by name and skips creation if they exist.
 * Run with: pnpm --filter @workspace/scripts exec tsx src/seed-tiers.ts
 */
import Stripe from "stripe";

interface Tier {
  name: string;
  description: string;
  amountUsd: number;
  metadata: Record<string, string>;
}

const TIERS: Tier[] = [
  {
    name: "Founders Circle",
    description:
      "Earliest backers of the Agentic Intelligence Layer. Founders Commitment - not a security; refundable until terms are finalized.",
    amountUsd: 1000,
    metadata: { tier: "founders", order: "1" },
  },
  {
    name: "Architect Circle",
    description:
      "Backers shaping Eve OS and the Hybrid Compute Fabric. Founders Commitment - not a security; refundable until terms are finalized.",
    amountUsd: 5000,
    metadata: { tier: "architect", order: "2" },
  },
  {
    name: "Catalyst Circle",
    description:
      "Strategic backers of the GPU cluster + flagship rollout. Founders Commitment - not a security; refundable until terms are finalized.",
    amountUsd: 25000,
    metadata: { tier: "catalyst", order: "3" },
  },
];

async function getStripeCredentials(): Promise<{ secretKey: string }> {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? "depl " + process.env.WEB_REPL_RENEWAL
      : null;
  if (!hostname || !xReplitToken) {
    throw new Error(
      "Missing Replit env vars. Connect Stripe via the Integrations tab.",
    );
  }
  const resp = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=stripe`,
    {
      headers: { Accept: "application/json", X_REPLIT_TOKEN: xReplitToken },
    },
  );
  const data = (await resp.json()) as {
    items?: Array<{ settings?: { secret_key?: string } }>;
  };
  const secretKey = data.items?.[0]?.settings?.secret_key;
  if (!secretKey) {
    throw new Error("Stripe not connected — secret_key missing.");
  }
  return { secretKey };
}

async function main(): Promise<void> {
  const { secretKey } = await getStripeCredentials();
  const stripe = new Stripe(secretKey);

  for (const tier of TIERS) {
    const existing = await stripe.products.search({
      query: `name:'${tier.name}' AND active:'true'`,
    });
    let product = existing.data[0];
    if (!product) {
      product = await stripe.products.create({
        name: tier.name,
        description: tier.description,
        metadata: tier.metadata,
      });
      console.log(`Created product: ${product.name} (${product.id})`);
    } else {
      console.log(`Product exists: ${product.name} (${product.id})`);
    }

    const prices = await stripe.prices.list({ product: product.id, active: true });
    const priceCents = tier.amountUsd * 100;
    const hasPrice = prices.data.some(
      (p) => p.unit_amount === priceCents && p.currency === "usd" && !p.recurring,
    );
    if (!hasPrice) {
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: priceCents,
        currency: "usd",
      });
      console.log(`  Created one-time price: $${tier.amountUsd} (${price.id})`);
    } else {
      console.log(`  One-time price already exists: $${tier.amountUsd}`);
    }
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
