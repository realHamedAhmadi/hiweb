import { Router } from "express";
import { authenticate, requireRole, optionalAuthenticate } from "../middleware/auth";
import {
  listServiceCategoriesController,
  getServiceCategoryBySlugController,
  createServiceCategoryController,
  updateServiceCategoryController,
} from "../controllers/serviceCategories.controller";

export const serviceCategoriesRouter = Router();

serviceCategoriesRouter.get("/", optionalAuthenticate, listServiceCategoriesController);
serviceCategoriesRouter.get("/:slug", optionalAuthenticate, getServiceCategoryBySlugController);
serviceCategoriesRouter.post("/", authenticate, requireRole("ADMIN"), createServiceCategoryController);
serviceCategoriesRouter.patch("/:id", authenticate, requireRole("ADMIN"), updateServiceCategoryController);
