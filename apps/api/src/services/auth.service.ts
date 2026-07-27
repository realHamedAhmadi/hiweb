import { prisma } from "../lib/prisma";
import { signAccessToken } from "../lib/jwt";
import { generateRefreshTokenValue, hashToken } from "../lib/hash";
import { verifyPiAccessToken } from "../lib/piNetwork";
import type { UserRole } from "@hiweb/database";

const REFRESH_EXPIRES_IN_DAYS = Number(process.env.JWT_REFRESH_EXPIRES_IN_DAYS ?? 30);

/**
 * Implements the Pi Login flow per authentication-architecture.md
 * Section 1 (happy path) and Section 2 (Decided: JWT + refresh token).
 *
 * NOTE: Step "verify against Pi's Platform API" calls verifyPiAccessToken,
 * which is a stub that always throws (see lib/piNetwork.ts) — this
 * entire function will fail until that's replaced with a real
 * implementation. It's written this way deliberately so the rest of
 * the flow (user lookup/creation, token issuance) is ready to go the
 * moment Pi verification is real, rather than blocking everything
 * else on that one piece.
 */
export async function loginWithPi(piAccessToken: string) {
  // Step 5 (authentication-architecture.md Section 1): verify server-side,
  // never trust the frontend's claim alone.
  const identity = await verifyPiAccessToken(piAccessToken);

  // Step 6: resolve or create the User by piUid — never by email, per
  // authentication-architecture.md Section 4 ("piUid is the stable
  // unique identifier"). Role always defaults to USER — Pi Login never
  // grants admin (Section 3's core security boundary).
  let user = await prisma.user.findUnique({ where: { piUid: identity.piUid } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        piUid: identity.piUid,
        displayName: identity.displayName,
        //email: identity.email,
        // role defaults to USER, accountStatus defaults to ACTIVE — see schema.prisma
      },
    });
  }

  // Fail closed on a suspended account (authentication-architecture.md
  // Section 1, failure branch) — verifying with Pi successfully does
  // not override account status.
  if (user.accountStatus !== "ACTIVE") {
    throw new Error("ACCOUNT_NOT_ACTIVE");
  }

  const session = await issueSessionForUser(user.id, user.role);
  return { user, ...session };
}

/**
 * Shared token-issuance step, extracted so both the real Pi Login flow
 * above and the dev-only bypass (controllers/devAuth.controller.ts)
 * issue tokens through the exact same path — avoiding two slightly-
 * different copies of this logic drifting apart over time.
 */
export async function issueSessionForUser(userId: string, role: UserRole) {
  const accessToken = signAccessToken({ sub: userId, role });
  const { rawRefreshToken, expiresAt } = await issueRefreshToken(userId);
  return { accessToken, refreshToken: rawRefreshToken, refreshTokenExpiresAt: expiresAt };
}

async function issueRefreshToken(userId: string) {
  const rawRefreshToken = generateRefreshTokenValue();
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawRefreshToken),
      expiresAt,
    },
  });

  return { rawRefreshToken, expiresAt };
}

/**
 * Refresh token rotation: the presented token is revoked and a new one
 * issued alongside a new access token, rather than reusing the same
 * refresh token indefinitely. Rotating on every use limits the damage
 * if a refresh token is ever stolen (it becomes invalid the next time
 * the legitimate client uses it, which is a detectable signal — though
 * no alerting on that signal is built yet).
 */
export async function refreshSession(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    // Fail closed — any invalid/expired/revoked token is rejected outright.
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const user = await prisma.user.findUnique({ where: { id: existing.userId } });
  if (!user || user.accountStatus !== "ACTIVE") {
    throw new Error("ACCOUNT_NOT_ACTIVE");
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  const session = await issueSessionForUser(user.id, user.role);
  return { user, ...session };
}

export async function logout(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
