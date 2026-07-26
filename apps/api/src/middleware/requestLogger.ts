import type { Request, Response, NextFunction } from "express";

/**
 * Minimal request logger — placeholder until Section 14 (Logging &
 * Monitoring) is designed. Logs to stdout only; no log aggregation,
 * no structured format, no correlation IDs.
 */
export function requestLogger(req: Request, _res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
}
