/**
 * ⚠️ DEVELOPMENT-ONLY TEST BYPASS — NEVER FOR PRODUCTION ⚠️
 *
 * Exists solely so the admin dashboard and Contact form can be tested
 * end-to-end on a local machine without a real Pi Developer account —
 * completely bypassing Pi Network verification (unlike the real login
 * flow, which fails until that's implemented for real).
 *
 * DOUBLE-GUARDED, on purpose — a single guard is not enough for
 * something this dangerous:
 *   1. NODE_ENV must NOT be "production"
 *   2. ENABLE_DEV_LOGIN must be exactly the string "true"
 * Both .env.example files default ENABLE_DEV_LOGIN to blank/unset —
 * it must be deliberately opted into, never on by accident.
 *
 * If this were ever reachable in a real production deployment, ANYONE
 * could obtain a valid admin session with no credentials whatsoever.
 * This is the single most dangerous file in the entire backend if
 * misconfigured — treat any change to isDevLoginEnabled() with extreme
 * caution, and never remove either half of the check.
 */
export function isDevLoginEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_LOGIN === "true";
}
