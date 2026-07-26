import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { updateOwnUserSchema } from "../validation/schemas";

export async function getMeController(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user) {
    return res.status(404).json({ error: { message: "User not found" } });
  }
  return res.json({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
  });
}

export async function updateMeController(req: Request, res: Response) {
  const parsed = updateOwnUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  const updated = await prisma.user.update({
    where: { id: req.user!.sub },
    data: parsed.data,
  });

  return res.json({
    id: updated.id,
    displayName: updated.displayName,
    email: updated.email,
    role: updated.role,
  });
}
