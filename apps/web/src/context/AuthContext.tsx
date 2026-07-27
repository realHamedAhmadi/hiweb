"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { authenticateWithPiSdk } from "@/lib/piSdk";
import {
  piLoginRequest,
  refreshSessionRequest,
  logoutRequest,
  devLoginRequest,
  type AuthUser,
} from "@/lib/authApi";

/**
 * Session state lives here, in React state — deliberately NOT in
 * localStorage/sessionStorage, per authentication-architecture.md
 * Section 2 (access token kept in memory to limit XSS exposure). This
 * means a hard page refresh loses `accessToken` from memory by design;
 * `refreshSessionRequest()` on mount re-derives it from the httpOnly
 * refresh-token cookie, which does survive a refresh.
 */

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  /** ⚠️ DEV-ONLY — see authApi.ts's devLoginRequest and Header.tsx for the gating. */
  devLogin: (role: "USER" | "ADMIN") => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On mount: try to silently restore a session from the refresh
  // cookie. Expected to fail (no cookie yet) for most visitors right
  // now — that's a normal "unauthenticated" outcome, not an error.
  useEffect(() => {
    let cancelled = false;
    refreshSessionRequest().then((result) => {
      if (cancelled) return;
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async () => {
    setError(null);
    try {
      // Real Pi SDK call — see lib/piSdk.ts. This part genuinely works
      // in a Pi Browser context with the SDK script loaded.
      const piAuthResult = await authenticateWithPiSdk();

      // Backend verification — now REAL (apps/api's verifyPiAccessToken
      // calls Pi's /v2/me endpoint for real, see
      // apps/api/src/lib/piNetwork.ts). Still wrapped in try/catch since
      // a real network/API error is always possible, same as any
      // external call.
      const result = await piLoginRequest(piAuthResult.accessToken);
      setUser(result.user);
      setAccessToken(result.accessToken);
      setStatus("authenticated");
    } catch (err) {
      setStatus("unauthenticated");
      setError(
        err instanceof Error ? err.message : "Login failed for an unknown reason"
      );
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setAccessToken(null);
    setStatus("unauthenticated");
  }, []);

  const devLogin = useCallback(async (role: "USER" | "ADMIN") => {
    setError(null);
    try {
      const result = await devLoginRequest(role);
      setUser(result.user);
      setAccessToken(result.accessToken);
      setStatus("authenticated");
    } catch (err) {
      setStatus("unauthenticated");
      setError(err instanceof Error ? err.message : "Dev login failed");
    }
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, accessToken, error, login, logout, devLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
