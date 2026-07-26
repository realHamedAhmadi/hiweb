import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { listSettingsController, updateSettingController } from "../controllers/settings.controller";

export const settingsRouter = Router();

settingsRouter.get("/", authenticate, requireRole("ADMIN"), listSettingsController);
settingsRouter.patch("/:key", authenticate, requireRole("ADMIN"), updateSettingController);
