"use client";

/**
 * Client-side calls to apps/api's auth endpoints. Deliberately
 * separate from lib/api.ts (which is server-only, plain `API_URL`,
 * used by Server Components) — this file runs in the browser, so it
 * needs the NEXT_PUBLIC_-prefixed URL and must send cookies
 * (`credentials: "include"`) so the httpOnly refresh-token cookie
 * (authentication-architecture.md Section 2) travels with each call.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AuthUser {
  id: string;
  displayName: string;
  role: "USER" | "ADMIN";
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export class AuthApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function parseAuthResponse(res: Response): Promise<AuthResponse> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AuthApiError(body?.error?.message ?? "Request failed", res.status);
  }
  return res.json();
}

export async function piLoginRequest(piAccessToken: string): Promise<AuthResponse> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const res = await fetch(`${API_URL}/auth/pi-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ piAccessToken }),
  });
  return parseAuthResponse(res);
}

/**
 * Attempts to restore a session from the httpOnly refresh-token
 * cookie (e.g. on page load, since the access token itself is kept
 * in-memory only and doesn't survive a refresh — see
 * authentication-architecture.md Section 2). Returns null on any
 * failure rather than throwing, since "no existing session" is an
 * entirely expected, non-error outcome here.
 */
export async function refreshSessionRequest(): Promise<AuthResponse | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function logoutRequest(): Promise<void> {
  if (!API_URL) return;
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {
    // Best-effort — if this fails, clearing local state client-side
    // (done by the caller) still logs the user out of this browser,
    // even if the server-side refresh token record isn't revoked.
  });
}

/**
 * ⚠️ DEV-ONLY — calls apps/api's /auth/dev-login, which itself is
 * double-guarded (NODE_ENV + ENABLE_DEV_LOGIN) and returns 404 unless
 * explicitly enabled server-side. This function is only ever invoked
 * from UI that's itself gated behind
 * NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true" — see Header.tsx.
 */
export async function devLoginRequest(role: "USER" | "ADMIN"): Promise<AuthResponse> {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  const res = await fetch(`${API_URL}/auth/dev-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  return parseAuthResponse(res);
}
