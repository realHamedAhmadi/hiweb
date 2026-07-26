import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  createServiceCategorySchema,
  updateServiceCategorySchema,
} from "../validation/schemas";

/**
 * Public read: PUBLISHED only, unless the requester is an
 * authenticated admin (optionalAuthenticate on this route), in which
 * case all publish statuses are returned — supports an Admin Dashboard
 * list view without needing a second endpoint.
 *
 * NOTE: there is no DELETE endpoint here by design. Content entities
 * are archived (publishStatus: ARCHIVED via PATCH), not hard-deleted —
 * consistent with database-design.md treating publishStatus as
 * replacing a simple active/inactive boolean specifically to support
 * retaining archived records rather than destroying them.
 */
export async function listServiceCategoriesController(req: Request, res: Response) {
  const isAdmin = req.user?.role === "ADMIN";
  const categories = await prisma.serviceCategory.findMany({
    where: isAdmin ? {} : { publishStatus: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });
  return res.json(categories);
}

/**
 * Added to support individual Service Pages (Section 1, Item 6 —
 * listed as a separate MVP item from the overview page). Public read
 * of PUBLISHED only, unless the requester is an authenticated admin
 * (same visibility rule as the list endpoint above).
 */
export async function getServiceCategoryBySlugController(req: Request, res: Response) {
  const isAdmin = req.user?.role === "ADMIN";
  const category = await prisma.serviceCategory.findUnique({
    where: { slug: req.params.slug },
  });
  if (!category) {
    return res.status(404).json({ error: { message: "Not found" } });
  }
  if (!isAdmin && category.publishStatus !== "PUBLISHED") {
    // Same 404 (not 403) as elsewhere — don't reveal a draft/archived
    // record exists to a non-admin requester.
    return res.status(404).json({ error: { message: "Not found" } });
  }
  return res.json(category);
}

export async function createServiceCategoryController(req: Request, res: Response) {
  const parsed = createServiceCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  const category = await prisma.serviceCategory.create({
    data: { ...parsed.data, managedByUserId: req.user!.sub },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: req.user!.sub,
      action: "service_category.created",
      targetType: "ServiceCategory",
      targetId: category.id,
    },
  });

  return res.status(201).json(category);
}

export async function updateServiceCategoryController(req: Request, res: Response) {
  const parsed = updateServiceCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  const existing = await prisma.serviceCategory.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ error: { message: "Not found" } });
  }

  const updated = await prisma.serviceCategory.update({
    where: { id: req.params.id },
    data: { ...parsed.data, managedByUserId: req.user!.sub },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: req.user!.sub,
      action: "service_category.updated",
      targetType: "ServiceCategory",
      targetId: updated.id,
      metadata: { changedFields: Object.keys(parsed.data) },
    },
  });

  return res.json(updated);
}
