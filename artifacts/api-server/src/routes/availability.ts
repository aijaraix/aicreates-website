import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";
import { getAvailability } from "../lib/availability";

const router: IRouter = Router();

router.get("/rounds/availability", requireAuth, async (_req, res) => {
  const rounds = await getAvailability();
  res.json({ rounds });
});

export default router;
