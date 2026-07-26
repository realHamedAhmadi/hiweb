import { createHash, randomBytes } from "node:crypto";

/**
 * Refresh tokens are stored hashed (never in plaintext) per
 * RefreshToken.tokenHash in the Prisma schema — so a database read
 * alone can't be used to impersonate a session. SHA-256 (not bcrypt)
 * is deliberate here: this hashes a high-entropy random token, not a
 * low-entropy user password, so a slow/salted password-hashing
 * algorithm isn't needed — a fast, deterministic hash is exactly what
 * a token-lookup-by-hash needs.
 */

export function generateRefreshTokenValue(): string {
  return randomBytes(48).toString("hex");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
