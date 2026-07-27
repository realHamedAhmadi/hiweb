/**
 * Pi Network Platform API client — REAL implementation.
 *
 * Based on Pi Network's official Platform API docs
 * (pi-apps/pi-platform-docs, pi-apps/pi-sdk-integration-guide):
 * - Verifying a user's access token: GET /v2/me with
 *   `Authorization: Bearer <user's access token>` — returns
 *   { uid, username } or 401 if invalid.
 * - Server-authenticated calls (payment approve/complete) use
 *   `Authorization: Key <PI_API_KEY>` instead.
 *
 * ⚠️ CASING NOTE, flagged honestly: different official Pi sources
 * show this server-auth header as both `Key ${API_KEY}` and
 * `key ${API_KEY}` (lowercase). This implementation uses `Key`
 * (capitalized), matching the more recent, dedicated
 * pi-sdk-integration-guide source. If server-authenticated calls
 * (see piPlatformClient.ts) ever fail with a 401 that user-token calls
 * don't, try the lowercase variant first — this is the one detail in
 * this integration that could not be independently re-verified beyond
 * conflicting documentation.
 *
 * STILL UNVERIFIED: this has never actually been run against Pi's
 * real API — this environment has no network access. Written to match
 * documented behavior exactly, but treat the first real Testnet call
 * as the actual validation step.
 */

const PI_PLATFORM_API_URL =
  process.env.PI_PLATFORM_API_URL || "https://api.minepi.com";

export interface PiVerifiedIdentity {
  piUid: string;
  displayName: string;
}

export class PiVerificationError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "PiVerificationError";
    this.status = status;
  }
}

/**
 * Verifies a user's Pi access token by calling Pi's /v2/me endpoint
 * server-side (authentication-architecture.md Section 1, Step 5 —
 * "never trust the frontend's claim alone"). Returns the verified
 * uid/username, or throws if the token is invalid/expired (Pi returns
 * a 401 in that case).
 */
export async function verifyPiAccessToken(
  piAccessToken: string
): Promise<PiVerifiedIdentity> {
  const response = await fetch(`${PI_PLATFORM_API_URL}/v2/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${piAccessToken}`,
    },
  });

  if (!response.ok) {
    // Fail closed (security-architecture.md Section 1) — any
    // non-2xx response (401 for an invalid/expired token, or
    // anything else) is treated as verification failure, never
    // partially trusted.
    throw new PiVerificationError(
      `Pi token verification failed (${response.status})`,
      response.status
    );
  }

  const data = (await response.json()) as { uid: string; username: string };

  return {
    piUid: data.uid,
    displayName: data.username,
  };
}
