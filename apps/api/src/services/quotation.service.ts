import { prisma } from "../lib/prisma";

/**
 * Quotation business logic. Implements the "current quotation" rule
 * decided in database-design.md 1.4 (Quotation.isCurrent) and the
 * revision behavior described in request-workflow.md Section 3
 * ("status stays quotation_sent" for a revision).
 */

export async function createQuotation(params: {
  serviceRequestId: string;
  preparedByUserId: string;
  amount: number;
  currency: string;
  scopeDescription: string;
  validUntil?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const serviceRequest = await tx.serviceRequest.findUnique({
      where: { id: params.serviceRequestId },
    });
    if (!serviceRequest) {
      throw new Error("SERVICE_REQUEST_NOT_FOUND");
    }

    // Exactly one current quotation per request (database-design.md
    // 1.4) — flip any existing current quotation to false before
    // creating the new one.
    await tx.quotation.updateMany({
      where: { serviceRequestId: params.serviceRequestId, isCurrent: true },
      data: { isCurrent: false },
    });

    const quotation = await tx.quotation.create({
      data: {
        serviceRequestId: params.serviceRequestId,
        preparedByUserId: params.preparedByUserId,
        amount: params.amount,
        currency: params.currency,
        scopeDescription: params.scopeDescription,
        validUntil: params.validUntil ? new Date(params.validUntil) : undefined,
        isCurrent: true,
      },
    });

    // request-workflow.md Section 2, step 3 / Section 3: first
    // quotation moves the request to QUOTATION_SENT; a revision
    // (request already in QUOTATION_SENT) stays there — either way,
    // the target state after this function is QUOTATION_SENT, so this
    // is written as an idempotent "ensure" rather than two branches.
    const fromStatus = serviceRequest.status;
    if (fromStatus !== "QUOTATION_SENT") {
      await tx.serviceRequest.update({
        where: { id: params.serviceRequestId },
        data: { status: "QUOTATION_SENT" },
      });

      await tx.serviceRequestStatusHistory.create({
        data: {
          serviceRequestId: params.serviceRequestId,
          fromStatus,
          toStatus: "QUOTATION_SENT",
          changedByUserId: params.preparedByUserId,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: params.preparedByUserId,
        action: "quotation.created",
        targetType: "Quotation",
        targetId: quotation.id,
        metadata: { serviceRequestId: params.serviceRequestId },
      },
    });

    return quotation;
  });
}

export async function listQuotationsForRequest(serviceRequestId: string) {
  return prisma.quotation.findMany({
    where: { serviceRequestId },
    orderBy: { createdAt: "desc" },
  });
}
