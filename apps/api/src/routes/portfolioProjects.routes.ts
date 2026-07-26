import { Router } from "express";
import { authenticate, requireRole, optionalAuthenticate } from "../middleware/auth";
import {
  listPortfolioProjectsController,
  getPortfolioProjectBySlugController,
  createPortfolioProjectController,
  updatePortfolioProjectController,
} from "../controllers/portfolioProjects.controller";

export const portfolioProjectsRouter = Router();

portfolioProjectsRouter.get("/", optionalAuthenticate, listPortfolioProjectsController);
portfolioProjectsRouter.get("/:slug", optionalAuthenticate, getPortfolioProjectBySlugController);
portfolioProjectsRouter.post("/", authenticate, requireRole("ADMIN"), createPortfolioProjectController);
portfolioProjectsRouter.patch("/:id", authenticate, requireRole("ADMIN"), updatePortfolioProjectController);
