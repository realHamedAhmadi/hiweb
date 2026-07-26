import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { getMeController, updateMeController } from "../controllers/users.controller";

export const usersRouter = Router();

usersRouter.get("/me", authenticate, getMeController);
usersRouter.patch("/me", authenticate, updateMeController);
