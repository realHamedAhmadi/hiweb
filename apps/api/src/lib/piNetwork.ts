/**
 * Pi Network Platform API verification — STUB, NOT IMPLEMENTED.
 *
 * This is the single most important gap in the entire backend: the
 * function below is what authentication-architecture.md Section 1,
 * Step 5 calls "backend calls Pi's Platform API to verify the token
 * is genuine and current" — and it does not actually do that yet.
 *
 * Why it's stubbed rather than implemented:
 * - Doing this for real requires a genuine Pi Developer account, a
 *   registered Pi app, and real credentials (PI_API_KEY / PI_APP_ID)
 *   — none of which exist in this development environment, and none
 *   of which I have access to.
 * - This environment has no network access, so even with credentials,
 *   no outbound call to Pi's Platform API could be tested here.
 * - Sandbox vs. mainnet (Section 18) is also still undecided in the
 *   architecture docs — a real implementation needs that decision
 *   first, since the endpoint called likely differs between them.
 *
 * DO NOT deploy this to production as-is. `verifyPiAccessToken` below
 * currently throws, specifically so that calling it fails loudly
 * instead of silently trusting an unverified token (fail closed, per
 * security-architecture.md Section 1) — but the safe failure mode is
 * "auth doesn't work at all," not "auth is properly implemented."
 *
 * To make this real, replace the body of `verifyPiAccessToken` with an
 * actual HTTP call to Pi's Platform API (per Pi Network's own
 * developer documentation — not something I have direct access to
 * verify against), using PI_API_KEY / PI_APP_ID / PI_PLATFORM_API_URL
 * from the environment (already listed in .env.example).
 */

export interface PiVerifiedIdentity {
  piUid: string;
  displayName: string;
  email?: string;
}

export class PiVerificationNotImplementedError extends Error {
  constructor() {
    super(
      "Pi Network token verification is not implemented. See src/lib/piNetwork.ts."
    );
    this.name = "PiVerificationNotImplementedError";
  }
}

export async function verifyPiAccessToken(
  _piAccessToken: string
): Promise<PiVerifiedIdentity> {
  // Intentionally always throws — see file header comment above.
  throw new PiVerificationNotImplementedError();
}
