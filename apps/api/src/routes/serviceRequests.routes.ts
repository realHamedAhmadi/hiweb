import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import {
  createServiceRequestController,
  listServiceRequestsController,
  getServiceRequestController,
  getServiceRequestHistoryController,
  updateServiceRequestStatusController,
} from "../controllers/serviceRequests.controller";
import { createQuotationController, listQuotationsController } from "../controllers/quotations.controller";

export const serviceRequestsRouter = Router();

// Per backend-architecture.md's permissions table: submit/view own is
// any authenticated user; view-all and status changes are admin-only.
serviceRequestsRouter.post("/", authenticate, createServiceRequestController);
serviceRequestsRouter.get("/", authenticate, listServiceRequestsController);
serviceRequestsRouter.get("/:id", authenticate, getServiceRequestController);
serviceRequestsRouter.get("/:id/history", authenticate, getServiceRequestHistoryController);
serviceRequestsRouter.patch(
  "/:id/status",
  authenticate,
  requireRole("ADMIN"),
  updateServiceRequestStatusController
);

// Quotations are nested under a request, per backend-architecture.md's
// proposed endpoint shape.
serviceRequestsRouter.post(
  "/:id/quotations",
  authenticate,
  requireRole("ADMIN"),
  createQuotationController
);
serviceRequestsRouter.get("/:id/quotations", authenticate, listQuotationsController);
