import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

/**
 * Express app assembly. CORS restricted to APP_URL (security-architecture.md
 * Section 2 — only Hiweb's own frontend origin, not "*") with
 * `credentials: true` since the refresh token travels as a cookie.
 */
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.APP_URL,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);

  // General rate limit on all routes (security-architecture.md Section 2).
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Stricter limit specifically on the login endpoint
  // (authentication-architecture.md Section 3 — "Rate limiting the
  // login endpoint").
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/auth/pi-login", loginLimiter);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
