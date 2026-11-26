import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import replitAuthRouter from "./replitAuth";
import usersRouter from "./users";
import servicesRouter from "./services";
import workersRouter from "./workers";
import bookingsRouter from "./bookings";
import subscriptionsRouter from "./subscriptions";
import dashboardRouter from "./dashboard";
import workerApplicationsRouter from "./workerApplications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(replitAuthRouter);
router.use(usersRouter);
router.use(servicesRouter);
router.use(workersRouter);
router.use(bookingsRouter);
router.use(subscriptionsRouter);
router.use(dashboardRouter);
router.use(workerApplicationsRouter);

export default router;
