import type { Request, Response } from "express";
import type { Prisma } from "@hiweb/database";
import { prisma } from "../lib/prisma";
import { updateSettingSchema } from "../validation/schemas";

/** All routes here require admin role (enforced at the route level). */

export async function listSettingsController(_req: Request, res: Response) {
  const settings = await prisma.settingEntry.findMany({ orderBy: { key: "asc" } });
  return res.json(settings);
}

export async function updateSettingController(req: Request, res: Response) {
  const parsed = updateSettingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  // `value` is validated as z.unknown() (settings have no fixed shape
  // per database-design.md 1.8), so it's cast to Prisma's own
  // InputJsonValue type here rather than `object` — a setting value
  // could legitimately be a string, number, or boolean, none of which
  // would satisfy `object`.
  const value = parsed.data.value as Prisma.InputJsonValue;
  const key = req.params.key;
  const setting = await prisma.settingEntry.upsert({
    where: { key },
    create: { key, value, updatedByUserId: req.user!.sub },
    update: { value, updatedByUserId: req.user!.sub },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: req.user!.sub,
      action: "setting.updated",
      targetType: "SettingEntry",
      targetId: setting.id,
      metadata: { key },
    },
  });

  return res.json(setting);
}
