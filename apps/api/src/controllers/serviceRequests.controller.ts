import type { Request, Response } from "express";
import {
  createServiceRequestSchema,
  updateServiceRequestStatusSchema,
} from "../validation/schemas";
import {
  createServiceRequest,
  listServiceRequestsForUser,
  listAllServiceRequests,
  getServiceRequestById,
  getServiceRequestHistory,
  changeServiceRequestStatus,
} from "../services/serviceRequest.service";

export async function createServiceRequestController(req: Request, res: Response) {
  const parsed = createServiceRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  const serviceRequest = await createServiceRequest({
    userId: req.user!.sub,
    ...parsed.data,
  });

  return res.status(201).json(serviceRequest);
}

/**
 * Object-level authorization (security-architecture.md Section 3):
 * an admin sees every request; a regular user sees only their own —
 * enforced by which query runs, not by filtering after the fact.
 */
export async function listServiceRequestsController(req: Request, res: Response) {
  const requests =
    req.user!.role === "ADMIN"
      ? await listAllServiceRequests()
      : await listServiceRequestsForUser(req.user!.sub);

  return res.json(requests);
}

async function assertCanAccessServiceRequest(req: Request, res: Response, id: string) {
  const serviceRequest = await getServiceRequestById(id);
  if (!serviceRequest) {
    res.status(404).json({ error: { message: "Not found" } });
    return null;
  }
  // Object-level check: owner or admin only — a user hitting another
  // user's request ID gets the same 404 a nonexistent ID would, so as
  // not to reveal whether a given ID exists at all to someone who
  // doesn't own it.
  if (req.user!.role !== "ADMIN" && serviceRequest.userId !== req.user!.sub) {
    res.status(404).json({ error: { message: "Not found" } });
    return null;
  }
  return serviceRequest;
}

export async function getServiceRequestController(req: Request, res: Response) {
  const serviceRequest = await assertCanAccessServiceRequest(req, res, req.params.id);
  if (!serviceRequest) return;
  return res.json(serviceRequest);
}

export async function getServiceRequestHistoryController(req: Request, res: Response) {
  const serviceRequest = await assertCanAccessServiceRequest(req, res, req.params.id);
  if (!serviceRequest) return;
  const history = await getServiceRequestHistory(serviceRequest.id);
  return res.json(history);
}

/**
 * Admin-only route (enforced by requireRole("ADMIN") on this route,
 * not here) — implements the Decided MVP rule from
 * request-workflow.md Section 4: every transition is admin-triggered.
 */
export async function updateServiceRequestStatusController(req: Request, res: Response) {
  const parsed = updateServiceRequestStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  try {
    const updated = await changeServiceRequestStatus({
      serviceRequestId: req.params.id,
      toStatus: parsed.data.toStatus,
      changedByUserId: req.user!.sub,
    });
    return res.json(updated);
  } catch (err) {
    if (err instanceof Error && err.message === "SERVICE_REQUEST_NOT_FOUND") {
      return res.status(404).json({ error: { message: "Not found" } });
    }
    throw err;
  }
}
