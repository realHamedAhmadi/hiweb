import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { approvePaymentController, completePaymentController } from "../controllers/payments.controller";

export const paymentsRouter = Router();

paymentsRouter.post("/approve", authenticate, approvePaymentController);
paymentsRouter.post("/complete", authenticate, completePaymentController);
