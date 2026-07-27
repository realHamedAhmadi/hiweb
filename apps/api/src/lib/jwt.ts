import jwt from "jsonwebtoken";
import type { UserRole } from "@hiweb/database";

/**
 * JWT access token helpers — implements the "Decided" session mechanism
 * from authentication-architecture.md Section 2 (JWT access token,
 * short-lived, + refresh token in an httpOnly cookie — refresh token
 * handling itself lives in auth.service.ts, not here).
 */

export interface AccessTokenPayload {
  sub: string; // User.id
  role: UserRole;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN ?? "30m";

export function signAccessToken(payload: AccessTokenPayload): string {
  if (!ACCESS_SECRET) {
    // Fail closed (security-architecture.md Section 1) — never sign a
    // token with a missing/empty secret.
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }
  // Throws on invalid/expired token — caller (auth middleware) is
  // responsible for turning that into a 401, not swallowing it.
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload;
}
