import { Router, type IRouter } from "express";
import healthRouter from "./health";
import eveRouter from "./eve";
import meRouter from "./me";
import tiersRouter from "./tiers";
import checkoutRouter from "./checkout";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eveRouter);
router.use(meRouter);
router.use(tiersRouter);
router.use(checkoutRouter);
router.use(adminRouter);

export default router;
