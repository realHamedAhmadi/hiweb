import type { AccessTokenPayload } from "../lib/jwt";

// Augments Express's Request type so `req.user` is known after the
// auth middleware runs — avoids `req.user as any` scattered everywhere.
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
