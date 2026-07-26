import { prisma } from "../lib/prisma";
import type { RequestStatus } from "@hiweb/database";

/**
 * ServiceRequest business logic. Implements the ServiceRequest
 * lifecycle from request-workflow.md, with the Decided MVP rule from
 * that document's Section 4: every status transition here is
 * triggered by an admin (enforced by the route/controller requiring
 * the admin role, not by this service itself) — there is no
 * user-triggered transition path in this code.
 *
 * IMPORTANT: this service does NOT enforce request-workflow.md's
 * proposed transition table (e.g. it will not stop an admin from
 * moving a CANCELLED request back to IN_PROGRESS). That table is
 * still explicitly a "first draft, meant to be argued with, not
 * implemented as-is" per that document's own closing section — adding
 * enforcement now would mean silently deciding an open question. Any
 * `toStatus` value is currently accepted.
 */

export async function createServiceRequest(params: {
  userId: string;
  serviceCategoryId?: string;
  projectDetails: string;
}) {
  return prisma.$transaction(async (tx) => {
    const serviceRequest = await tx.serviceRequest.create({
      data: {
        userId: params.userId,
        serviceCategoryId: params.serviceCategoryId,
        projectDetails: params.projectDetails,
        status: "SUBMITTED",
      },
    });

    // Initial timeline entry — fromStatus null (database-design.md 1.6:
    // "Null for the very first entry").
    await tx.serviceRequestStatusHistory.create({
      data: {
        serviceRequestId: serviceRequest.id,
        fromStatus: null,
        toStatus: "SUBMITTED",
        changedByUserId: params.userId,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: params.userId,
        action: "service_request.created",
        targetType: "ServiceRequest",
        targetId: serviceRequest.id,
      },
    });

    return serviceRequest;
  });
}

export async function listServiceRequestsForUser(userId: string) {
  return prisma.serviceRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listAllServiceRequests() {
  return prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getServiceRequestById(id: string) {
  return prisma.serviceRequest.findUnique({ where: { id } });
}

export async function getServiceRequestHistory(serviceRequestId: string) {
  return prisma.serviceRequestStatusHistory.findMany({
    where: { serviceRequestId },
    orderBy: { changedAt: "asc" },
  });
}

/**
 * Admin-only status change. See file header — no transition validation
 * is performed here beyond the toStatus value itself being one of the
 * fixed 8 enum values (already guaranteed by the zod schema before this
 * function is ever called).
 */
export async function changeServiceRequestStatus(params: {
  serviceRequestId: string;
  toStatus: RequestStatus;
  changedByUserId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.serviceRequest.findUnique({
      where: { id: params.serviceRequestId },
    });
    if (!existing) {
      throw new Error("SERVICE_REQUEST_NOT_FOUND");
    }

    const updated = await tx.serviceRequest.update({
      where: { id: params.serviceRequestId },
      data: { status: params.toStatus },
    });

    await tx.serviceRequestStatusHistory.create({
      data: {
        serviceRequestId: params.serviceRequestId,
        fromStatus: existing.status,
        toStatus: params.toStatus,
        changedByUserId: params.changedByUserId,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: params.changedByUserId,
        action: "service_request.status_changed",
        targetType: "ServiceRequest",
        targetId: params.serviceRequestId,
        metadata: { from: existing.status, to: params.toStatus },
      },
    });

    return updated;
  });
}
