import { findUserById } from "../db.js";
import { SESSION_COOKIE, verifySession } from "../lib/tokens.js";

/** Rejects unauthenticated requests. On success, sets req.user = { id, email }. */
export function requireAuth(req, res, next) {
  const userId = verifySession(req.cookies?.[SESSION_COOKIE]);
  const user = userId ? findUserById(userId) : undefined;

  if (!user) {
    res.clearCookie(SESSION_COOKIE);
    return res.status(401).json({ error: "Sign in to continue.", code: "unauthenticated" });
  }

  req.user = { id: user.id, email: user.email };
  next();
}

/** Like requireAuth, but never rejects: sets req.user when there's a valid session, else leaves it unset. */
export function attachUserIfPresent(req, res, next) {
  const userId = verifySession(req.cookies?.[SESSION_COOKIE]);
  const user = userId ? findUserById(userId) : undefined;
  if (user) req.user = { id: user.id, email: user.email };
  next();
}
