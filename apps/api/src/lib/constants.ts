/**
 * Shared constants used across multiple auth-related controllers —
 * extracted specifically to avoid the refresh-token cookie name being
 * hardcoded in two places (auth.controller.ts and
 * devAuth.controller.ts) and drifting apart if one is ever renamed.
 */
export const REFRESH_COOKIE_NAME = "hiweb_refresh_token";
