import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { isDevLoginEnabled } from "../lib/devAuth";
import { issueSessionForUser } from "../services/auth.service";
import { REFRESH_COOKIE_NAME } from "../lib/constants";

/**
 * ⚠️ DEV-ONLY — see src/lib/devAuth.ts for the full warning. ⚠️
 *
 * Returns 404 (not 403) when disabled, deliberately — a 403 would
 * confirm this route exists at all to anyone probing a real
 * deployment; 404 gives no such signal.
 */

const devLoginSchema = z.object({
  role: z.enum(["USER", "ADMIN"]).default("ADMIN"),
  displayName: z.string().min(1).max(120).optional(),
});

export async function devLoginController(req: Request, res: Response) {
  if (!isDevLoginEnabled()) {
    return res.status(404).json({ error: { message: "Not found" } });
  }

  const parsed = devLoginSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Invalid request body" } });
  }

  const { role, displayName } = parsed.data;
  // Fixed, obviously-fake piUid per role — reused across dev-login
  // calls so repeated logins resolve to the same test user, rather
  // than creating a new one every time.
  const piUid = `dev-test-${role.toLowerCase()}`;

  let user = await prisma.user.findUnique({ where: { piUid } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        piUid,
        displayName: displayName ?? `Dev Test ${role}`,
        role,
      },
    });
  }

  const session = await issueSessionForUser(user.id, user.role);

  res.cookie(REFRESH_COOKIE_NAME, session.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: session.refreshTokenExpiresAt,
  });

  return res.status(200).json({
    accessToken: session.accessToken,
    user: { id: user.id, displayName: user.displayName, role: user.role },
  });
}
