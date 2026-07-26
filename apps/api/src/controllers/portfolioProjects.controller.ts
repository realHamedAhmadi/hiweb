import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  createPortfolioProjectSchema,
  updatePortfolioProjectSchema,
} from "../validation/schemas";

/** Same public/admin-aware read pattern as serviceCategories.controller.ts. */
export async function listPortfolioProjectsController(req: Request, res: Response) {
  const isAdmin = req.user?.role === "ADMIN";
  const projects = await prisma.portfolioProject.findMany({
    where: isAdmin ? {} : { publishStatus: "PUBLISHED" },
    orderBy: { sortOrder: "asc" },
  });
  return res.json(projects);
}

/** Same pattern as serviceCategories.controller.ts's get-by-slug addition. */
export async function getPortfolioProjectBySlugController(req: Request, res: Response) {
  const isAdmin = req.user?.role === "ADMIN";
  const project = await prisma.portfolioProject.findUnique({
    where: { slug: req.params.slug },
  });
  if (!project) {
    return res.status(404).json({ error: { message: "Not found" } });
  }
  if (!isAdmin && project.publishStatus !== "PUBLISHED") {
    return res.status(404).json({ error: { message: "Not found" } });
  }
  return res.json(project);
}

export async function createPortfolioProjectController(req: Request, res: Response) {
  const parsed = createPortfolioProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  const project = await prisma.portfolioProject.create({
    data: { ...parsed.data, managedByUserId: req.user!.sub },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: req.user!.sub,
      action: "portfolio_project.created",
      targetType: "PortfolioProject",
      targetId: project.id,
    },
  });

  return res.status(201).json(project);
}

export async function updatePortfolioProjectController(req: Request, res: Response) {
  const parsed = updatePortfolioProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  const existing = await prisma.portfolioProject.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    return res.status(404).json({ error: { message: "Not found" } });
  }

  const updated = await prisma.portfolioProject.update({
    where: { id: req.params.id },
    data: { ...parsed.data, managedByUserId: req.user!.sub },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: req.user!.sub,
      action: "portfolio_project.updated",
      targetType: "PortfolioProject",
      targetId: updated.id,
      metadata: { changedFields: Object.keys(parsed.data) },
    },
  });

  return res.json(updated);
}
