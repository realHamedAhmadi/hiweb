import type { Request, Response } from "express";
import { approvePiPayment, completePiPayment } from "../lib/piPlatformClient";
import { approvePaymentSchema, completePaymentSchema } from "../validation/paymentSchemas";
import { prisma } from "../lib/prisma";

/**
 * Minimal Pi Payment approve/complete endpoints — built specifically
 * to satisfy the Pi Developer Portal's onboarding checklist step
 * ("Process a Transaction on the App"), which requires one real
 * User-to-App payment to confirm the app's Pi integration works.
 *
 * NOTE ON SCOPE: this is intentionally minimal — no dedicated
 * `Payment` entity has been added to the database schema (that's real
 * Phase 2 Pi Payments work, per the approved MVP scope in Section 1,
 * Item 6, which explicitly defers Pi Payments to Phase 2). This is
 * just enough to complete one real test transaction and satisfy the
 * developer checklist requirement now, not a full payments system.
 * An AuditLog entry is written for each step so there's at least a
 * record of what happened.
 *
 * Both endpoints require authentication (any logged-in user, not
 * admin-only) — a user approving/completing their own payment is a
 * normal user action, not a privileged one.
 */

export async function approvePaymentController(req: Request, res: Response) {
  const parsed = approvePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body" } });
  }

  try {
    await approvePiPayment(parsed.data.paymentId);

    await prisma.auditLog.create({
      data: {
        actorUserId: req.user!.sub,
        action: "pi_payment.approved",
        targetType: "PiPayment",
        targetId: parsed.data.paymentId,
      },
    });

    return res.status(200).json({ status: "approved" });
  } catch (err) {
    return res.status(502).json({
      error: { message: err instanceof Error ? err.message : "Failed to approve payment" },
    });
  }
}

export async function completePaymentController(req: Request, res: Response) {
  const parsed = completePaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body" } });
  }

  try {
    await completePiPayment(parsed.data.paymentId, parsed.data.txid);

    await prisma.auditLog.create({
      data: {
        actorUserId: req.user!.sub,
        action: "pi_payment.completed",
        targetType: "PiPayment",
        targetId: parsed.data.paymentId,
        metadata: { txid: parsed.data.txid },
      },
    });

    return res.status(200).json({ status: "completed" });
  } catch (err) {
    return res.status(502).json({
      error: { message: err instanceof Error ? err.message : "Failed to complete payment" },
    });
  }
}
