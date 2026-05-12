/**
 * Seed AIcreatesAI Founders Commitment tiers in Stripe.
 * Idempotent: looks up products by metadata.tier_slug and re-uses them.
 *
 * Run with: pnpm --filter @workspace/scripts run seed-tiers
 */
import Stripe from "stripe";

interface Tier {
  slug: "founders" | "architect" | "catalyst";
  displayName: string;
  description: string;
  amountUsd: number;
  tokenAllocation: number;
  order: string;
}

const TIERS: Tier[] = [
  {
    slug: "founders",
    displayName: "Founders Circle",
    description:
      "Earliest backers of the Agentic Intelligence Layer. Founders Commitment - not a security; refundable until terms are finalized.",
    amountUsd: 1000,
    tokenAllocation: 66_666,
    order: "1",
  },
  {
    slug: "architect",
    displayName: "Architect Circle",
    description:
      "Backers shaping Eve OS and the Hybrid Compute Fabric. 10% allocation bonus. Founders Commitment - not a security; refundable until terms are finalized.",
    amountUsd: 5000,
    tokenAllocation: 366_666,
    order: "2",
  },
  {
    slug: "catalyst",
    displayName: "Catalyst Circle",
    description:
      "Strategic backers of the GPU cluster + flagship rollout. 20% allocation bonus. Founders Commitment - not a security; refundable until terms are finalized.",
    amountUsd: 25000,
    tokenAllocation: 2_000_000,
    order: "3",
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
  // Same priority as the api-server: in production prefer the
  // operator-supplied STRIPE_SECRET_KEY env var; otherwise fall back to
  // the Replit connector.
  if (
    process.env.REPLIT_DEPLOYMENT === "1" &&
    process.env.STRIPE_SECRET_KEY
  ) {
    return { secretKey: process.env.STRIPE_SECRET_KEY };
  }
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";
  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", "stripe");
  url.searchParams.set("environment", targetEnvironment);
  const resp = await fetch(url.toString(), {
    headers: { Accept: "application/json", "X-Replit-Token": xReplitToken },
  });
  const data = (await resp.json()) as {
    items?: Array<{ settings?: { secret?: string; secret_key?: string } }>;
  };
  const settings = data.items?.[0]?.settings;
  const secretKey = settings?.secret ?? settings?.secret_key;
  if (!secretKey) {
    throw new Error("Stripe not connected — secret key missing.");
  }
  return { secretKey };
}

async function main(): Promise<void> {
  const { secretKey } = await getStripeCredentials();
  const stripe = new Stripe(secretKey);

  for (const tier of TIERS) {
    const search = await stripe.products.search({
      query: `active:'true' AND metadata['tier_slug']:'${tier.slug}'`,
    });
    let product = search.data[0];
    const metadata: Record<string, string> = {
      tier_slug: tier.slug,
      display_name: tier.displayName,
      token_allocation: String(tier.tokenAllocation),
      order: tier.order,
    };
    if (!product) {
      product = await stripe.products.create({
        name: tier.displayName,
        description: tier.description,
        metadata,
      });
      console.log(`Created product: ${product.name} (${product.id})`);
    } else {
      product = await stripe.products.update(product.id, {
        name: tier.displayName,
        description: tier.description,
        metadata,
      });
      console.log(`Updated product: ${product.name} (${product.id})`);
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100,
    });
    const priceCents = tier.amountUsd * 100;
    const hasPrice = prices.data.some(
      (p) =>
        p.unit_amount === priceCents && p.currency === "usd" && !p.recurring,
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
