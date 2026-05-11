import { Router, type IRouter } from "express";
import { TIERS } from "../lib/tiers";

const router: IRouter = Router();

router.get("/tiers", (_req, res) => {
  res.json({
    tiers: TIERS.map((t) => ({
      slug: t.slug,
      displayName: t.displayName,
      amountCents: t.amountCents,
      currency: "usd",
      tokenAllocation: t.tokenAllocation,
      description: t.description,
    })),
  });
});

export default router;
