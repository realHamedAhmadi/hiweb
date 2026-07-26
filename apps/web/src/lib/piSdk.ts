"use client";

/**
 * Client-side wrapper around the Pi SDK, loaded globally via
 * <Script src="https://sdk.minepi.com/pi-sdk.js" /> in layout.tsx.
 *
 * Sandbox vs. mainnet (infrastructure-architecture.md Section 1 —
 * decided as an environment-level property) is controlled by
 * NEXT_PUBLIC_PI_SANDBOX, read at call time so it can differ between
 * apps/web's own dev/staging/production builds.
 */

let initialized = false;

function ensurePiInitialized() {
  if (initialized) return;
  if (typeof window === "undefined" || !window.Pi) {
    throw new Error("Pi SDK is not loaded — window.Pi is undefined");
  }
  window.Pi.init({
    version: "2.0",
    sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === "true",
  });
  initialized = true;
}

/**
 * Runs the real Pi SDK authentication popup and returns whatever Pi
 * gives back (accessToken + basic user info). This part is genuinely
 * real — it will actually prompt a real Pi Browser authentication flow
 * when run inside Pi Browser with the SDK script loaded. What happens
 * to the resulting accessToken next (verifying it server-side) is a
 * separate, currently-stubbed concern — see authService.ts and
 * apps/api's src/lib/piNetwork.ts.
 */
export async function authenticateWithPiSdk(): Promise<PiAuthResult> {
  ensurePiInitialized();

  if (!window.Pi) {
    throw new Error("Pi SDK is not loaded — window.Pi is undefined");
  }

  // "payments" scope requested even though Pi Payments isn't built yet
  // (Phase 2) — matches Pi's own recommended pattern of requesting
  // scopes needed for the whole app up front, not re-prompting later.
  // onIncompletePaymentFound is a required callback per Pi's SDK
  // contract; there's no payment flow yet for it to meaningfully act
  // on, so it just logs — flagged here, not silently ignored.
  return window.Pi.authenticate(["username", "payments"], (payment) => {
    console.warn("Incomplete Pi payment found (not yet handled):", payment);
  });
}
