import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import servicesRouter from "./services";
import workersRouter from "./workers";
import bookingsRouter from "./bookings";
import subscriptionsRouter from "./subscriptions";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(servicesRouter);
router.use(workersRouter);
router.use(bookingsRouter);
router.use(subscriptionsRouter);
router.use(dashboardRouter);

export default router;
