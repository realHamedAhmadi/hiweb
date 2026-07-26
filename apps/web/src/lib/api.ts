/**
 * Minimal fetch helper for calling apps/api from Server Components.
 *
 * Uses the plain (non-`NEXT_PUBLIC_`) `API_URL` env var already listed
 * in the repo root `.env.example` — deliberately NOT prefixed with
 * `NEXT_PUBLIC_`, since this only ever runs server-side (inside a
 * Server Component, never in the browser bundle), so there's no reason
 * to expose it to the client.
 *
 * HONEST STATUS: this has never been tested against a running API —
 * apps/api has never actually been started anywhere (see its README).
 * Every call here is wrapped so a failure (API not running, network
 * error, timeout) falls back to `null` rather than crashing the page
 * or hanging indefinitely — callers are expected to fall back to
 * placeholder data when this returns null, exactly as they already did
 * before any backend existed.
 */

const API_URL = process.env.API_URL;
const TIMEOUT_MS = 3000;

export async function fetchFromApi<T>(path: string): Promise<T | null> {
  if (!API_URL) {
    // No API URL configured at all — expected in this environment
    // right now, not an error condition worth logging loudly.
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      cache: "no-store", // admin-managed content — always fetch fresh, no stale build-time cache
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network error, timeout, or API simply not running — fail
    // silently to null so the page can fall back to placeholder data
    // instead of breaking.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
