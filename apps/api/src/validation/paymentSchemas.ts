import { z } from "zod";

export const approvePaymentSchema = z.object({
  paymentId: z.string().min(1),
});

export const completePaymentSchema = z.object({
  paymentId: z.string().min(1),
  txid: z.string().min(1),
});
