import type { Request, Response, NextFunction } from "express";

/**
 * Standardized error responses that don't leak internals
 * (security-architecture.md Section 2). Stack traces, database error
 * details, and internal file paths never reach the client — logged
 * server-side only.
 *
 * NOTE: no structured logging pipeline exists yet (Section 14,
 * Logging & Monitoring, is undesigned) — this currently just uses
 * console.error, which is a real gap for production use, not a
 * finished solution.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  console.error(err);

  const isDev = process.env.NODE_ENV !== "production";
  const message =
    err instanceof Error ? err.message : "Unexpected error";

  res.status(500).json({
    error: {
      message: "Something went wrong",
      // Only exposed outside production — never leak details to real users.
      ...(isDev ? { detail: message } : {}),
    },
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { message: "Not found" } });
}
