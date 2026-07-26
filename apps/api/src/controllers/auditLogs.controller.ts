import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

/**
 * Admin-only, read-only (security-architecture.md Section 6 — "should
 * even an admin be able to delete audit entries? Proposed: no" — no
 * write/delete route exists here at all, on purpose).
 *
 * Simple offset pagination — not the final pagination approach
 * (backend-architecture.md Section 1 lists that as still open), just
 * enough to avoid returning an unbounded result set.
 */
export async function listAuditLogsController(req: Request, res: Response) {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const offset = Number(req.query.offset) || 0;

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  return res.json(logs);
}
