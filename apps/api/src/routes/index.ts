import { Router } from "express";
import { authRouter } from "./auth.routes";
import { usersRouter } from "./users.routes";
import { serviceCategoriesRouter } from "./serviceCategories.routes";
import { serviceRequestsRouter } from "./serviceRequests.routes";
import { portfolioProjectsRouter } from "./portfolioProjects.routes";
import { settingsRouter } from "./settings.routes";
import { auditLogsRouter } from "./auditLogs.routes";
import { paymentsRouter } from "./payments.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/service-categories", serviceCategoriesRouter);
apiRouter.use("/service-requests", serviceRequestsRouter);
apiRouter.use("/portfolio-projects", portfolioProjectsRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/audit-logs", auditLogsRouter);
apiRouter.use("/payments", paymentsRouter);
