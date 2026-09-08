import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { pool } from "@workspace/db";
import { requireAuth, requireAdmin } from "../lib/auth";
import {
  SEED_STAGES,
  SeedWorkflowError,
  SeriesSeedWorkflow,
} from "../lib/seriesSeed";

const router: IRouter = Router();
const workflow = new SeriesSeedWorkflow(pool);
const uuid = z.string().uuid();
const createInput = z
  .object({
    prospectName: z.string().trim().min(1).max(200),
    investorUserId: z.string().min(1).max(200).nullable().default(null),
  })
  .strict();
const decisionInput = z
  .object({
    stage: z.enum(SEED_STAGES),
    expectedRevision: z.number().int().nonnegative(),
    reason: z.string().trim().min(10).max(4000),
    evidenceReference: z
      .string()
      .trim()
      .min(1)
      .max(500)
      .nullable()
      .default(null),
    idempotencyKey: uuid,
  })
  .strict();

function handle(work: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    if (process.env.SERIES_SEED_WORKFLOW !== "true") {
      res.status(503).json({ error: "Series Seed workflow is unavailable" });
      return;
    }
    try {
      await work(req, res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request" });
        return;
      }
      if (error instanceof SeedWorkflowError) {
        res.status(error.status).json({ error: error.message });
        return;
      }
      req.log?.error({ err: error }, "Series Seed workflow failed");
      res.status(500).json({ error: "Unable to record the decision" });
    }
  };
}
router.get(
  "/admin/series-seed/cases",
  requireAuth,
  requireAdmin,
  handle(async (_req, res) => {
    res.json({ cases: await workflow.listInternal() });
  }),
);
router.post(
  "/admin/series-seed/cases",
  requireAuth,
  requireAdmin,
  handle(async (req, res) => {
    const input = createInput.parse(req.body);
    res
      .status(201)
      .json(
        await workflow.create(
          req.appUser!.id,
          input.prospectName,
          input.investorUserId,
        ),
      );
  }),
);
router.post(
  "/admin/series-seed/cases/:id/decisions",
  requireAuth,
  requireAdmin,
  handle(async (req, res) => {
    res.json(
      await workflow.advance(
        req.appUser!.id,
        uuid.parse(req.params.id),
        decisionInput.parse(req.body),
      ),
    );
  }),
);
router.post(
  "/admin/series-seed/cases/:id/investor",
  requireAuth,
  requireAdmin,
  handle(async (req, res) => {
    const input = z
      .object({
        investorUserId: z.string().min(1).max(200),
        expectedRevision: z.number().int().nonnegative(),
        reason: z.string().trim().min(10).max(4000),
      })
      .strict()
      .parse(req.body);
    res.json(
      await workflow.linkInvestor(
        req.appUser!.id,
        uuid.parse(req.params.id),
        input.investorUserId,
        input.expectedRevision,
        input.reason,
      ),
    );
  }),
);
router.get(
  "/series-seed/cases/:id",
  requireAuth,
  handle(async (req, res) => {
    const record = await workflow.readForInvestor(
      uuid.parse(req.params.id),
      req.appUser!.id,
    );
    if (!record) {
      res.status(404).json({ error: "Case not found" });
      return;
    }
    res.json(record);
  }),
);
export default router;
