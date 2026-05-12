import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eveRouter from "./eve";
import meRouter from "./me";
import tiersRouter from "./tiers";
import checkoutRouter from "./checkout";
import adminRouter from "./admin";
import adminExtrasRouter from "./adminExtras";
import saftRouter from "./saft";
import dataCenterRouter from "./dataCenter";
import wireInstructionsRouter from "./wireInstructions";
import roundsRouter from "./rounds";
import gatewayRouter from "./gateway";
import profileRouter from "./profile";
import availabilityRouter from "./availability";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eveRouter);
router.use(meRouter);
router.use(tiersRouter);
router.use(checkoutRouter);
router.use(adminRouter);
router.use(adminExtrasRouter);
router.use(saftRouter);
router.use(dataCenterRouter);
router.use(wireInstructionsRouter);
router.use(roundsRouter);
router.use(gatewayRouter);
router.use(profileRouter);
router.use(availabilityRouter);

export default router;
