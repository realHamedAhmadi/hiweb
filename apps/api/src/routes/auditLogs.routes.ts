import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { listAuditLogsController } from "../controllers/auditLogs.controller";

export const auditLogsRouter = Router();

auditLogsRouter.get("/", authenticate, requireRole("ADMIN"), listAuditLogsController);
