import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt";
import type { UserRole } from "@hiweb/database";

/**
 * Role-level authorization (security-architecture.md Section 3,
 * "Role-level (coarse)"). Object-level checks (does this user own
 * this specific ServiceRequest?) are NOT done here — they happen in
 * each controller, since they need to know which record is being
 * accessed.
 */

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    // Fail closed: no token, no access — never assume a default identity.
    return res.status(401).json({ error: { message: "Authentication required" } });
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    // Fail closed on any verification error (expired, malformed,
    // wrong secret) — never partially trust a token that didn't
    // fully verify.
    return res.status(401).json({ error: { message: "Invalid or expired token" } });
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      // Should never happen if `authenticate` ran first — fail closed
      // anyway rather than assume.
      return res.status(401).json({ error: { message: "Authentication required" } });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: { message: "Insufficient permissions" } });
    }
    next();
  };
}

/**
 * Optional authentication — attaches req.user if a valid token is
 * present, but does not reject the request if one isn't. Used for
 * endpoints that are public but behave differently for an
 * authenticated admin (e.g. seeing draft content).
 */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Invalid token on an optional-auth route — proceed as
      // unauthenticated rather than rejecting outright.
    }
  }
  next();
}
