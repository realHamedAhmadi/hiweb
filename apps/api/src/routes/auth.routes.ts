import { Router } from "express";
import { piLoginController, refreshController, logoutController } from "../controllers/auth.controller";
import { devLoginController } from "../controllers/devAuth.controller";

export const authRouter = Router();

authRouter.post("/pi-login", piLoginController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);

// ⚠️ DEV-ONLY — see src/lib/devAuth.ts. Double-guarded inside the
// controller itself (returns 404 when disabled), not just by omitting
// it from documentation.
authRouter.post("/dev-login", devLoginController);
