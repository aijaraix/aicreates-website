import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eveRouter from "./eve";
import meRouter from "./me";
import tiersRouter from "./tiers";
import checkoutRouter from "./checkout";
import adminRouter from "./admin";
import saftRouter from "./saft";
import dataCenterRouter from "./dataCenter";
import wireInstructionsRouter from "./wireInstructions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eveRouter);
router.use(meRouter);
router.use(tiersRouter);
router.use(checkoutRouter);
router.use(adminRouter);
router.use(saftRouter);
router.use(dataCenterRouter);
router.use(wireInstructionsRouter);

export default router;
