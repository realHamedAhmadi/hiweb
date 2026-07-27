import type { Request, Response } from "express";
import { piLoginSchema } from "../validation/schemas";
import { loginWithPi, refreshSession, logout } from "../services/auth.service";
import { REFRESH_COOKIE_NAME } from "../lib/constants";

function refreshCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const, // see authentication-architecture.md Section 3 — exact SameSite value flagged as depending on Pi's own redirect behavior; "lax" is a reasonable default, not confirmed against real Pi SDK flow yet
    expires: expiresAt,
  };
}

export async function piLoginController(req: Request, res: Response) {
  const parsed = piLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body", issues: parsed.error.issues } });
  }

  try {
    const { user, accessToken, refreshToken, refreshTokenExpiresAt } = await loginWithPi(
      parsed.data.piAccessToken
    );
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(refreshTokenExpiresAt));
    return res.status(200).json({
      accessToken,
      user: { id: user.id, displayName: user.displayName, role: user.role },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "ACCOUNT_NOT_ACTIVE") {
      return res.status(403).json({ error: { message: "Account is not active" } });
    }
    // PiVerificationError (src/lib/piNetwork.ts) — a real, failed call
    // to Pi's /v2/me endpoint (invalid/expired token, or Pi's API
    // unreachable). Surfaced as 401, since from the client's
    // perspective this is an authentication failure either way.
    if (err instanceof Error && err.name === "PiVerificationError") {
      return res.status(401).json({ error: { message: err.message } });
    }
    return res.status(401).json({ error: { message: "Login failed" } });
  }
}

export async function refreshController(req: Request, res: Response) {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!rawRefreshToken) {
    return res.status(401).json({ error: { message: "No refresh token" } });
  }

  try {
    const { user, accessToken, refreshToken, refreshTokenExpiresAt } = await refreshSession(
      rawRefreshToken
    );
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(refreshTokenExpiresAt));
    return res.status(200).json({
      accessToken,
      user: { id: user.id, displayName: user.displayName, role: user.role },
    });
  } catch {
    res.clearCookie(REFRESH_COOKIE_NAME);
    return res.status(401).json({ error: { message: "Invalid session" } });
  }
}

export async function logoutController(req: Request, res: Response) {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
  if (rawRefreshToken) {
    await logout(rawRefreshToken);
  }
  res.clearCookie(REFRESH_COOKIE_NAME);
  return res.status(204).send();
}
