import type { Request, Response } from "express";
import { createQuotationSchema } from "../validation/schemas";
import { createQuotation, listQuotationsForRequest } from "../services/quotation.service";
import { getServiceRequestById } from "../services/serviceRequest.service";

/** Admin-only route (enforced by requireRole on this route). */
export async function createQuotationController(req: Request, res: Response) {
  const parsed = createQuotationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  try {
    const quotation = await createQuotation({
      serviceRequestId: req.params.id,
      preparedByUserId: req.user!.sub,
      ...parsed.data,
    });
    return res.status(201).json(quotation);
  } catch (err) {
    if (err instanceof Error && err.message === "SERVICE_REQUEST_NOT_FOUND") {
      return res.status(404).json({ error: { message: "Not found" } });
    }
    throw err;
  }
}

/** Object-level check: owner or admin only (mirrors serviceRequests.controller.ts). */
export async function listQuotationsController(req: Request, res: Response) {
  const serviceRequest = await getServiceRequestById(req.params.id);
  if (!serviceRequest) {
    return res.status(404).json({ error: { message: "Not found" } });
  }
  if (req.user!.role !== "ADMIN" && serviceRequest.userId !== req.user!.sub) {
    return res.status(404).json({ error: { message: "Not found" } });
  }
  const quotations = await listQuotationsForRequest(serviceRequest.id);
  return res.json(quotations);
}
