import { Router } from "express";
import { createUser, findUserByEmail } from "../db.js";
import { asyncRoute, badRequest, unauthorized } from "../lib/errors.js";
import { hashPassword, verifyPassword } from "../lib/passwords.js";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "../lib/tokens.js";

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function normalizeEmail(raw) {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

function publicUser(user) {
  return { id: user.id, email: user.email };
}

function startSession(res, userId) {
  res.cookie(SESSION_COOKIE, signSession(userId), sessionCookieOptions());
}

authRouter.post(
  "/register",
  asyncRoute(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!EMAIL_RE.test(email)) throw badRequest("Enter a valid email address.", "invalid_email");
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, "weak_password");
    }
    if (findUserByEmail(email)) {
      throw badRequest("An account with this email already exists.", "email_taken");
    }

    const user = createUser(email, await hashPassword(password));
    startSession(res, user.id);
    res.status(201).json({ user: publicUser(user) });
  }),
);

authRouter.post(
  "/login",
  asyncRoute(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    const user = findUserByEmail(email);
    // Hash a dummy password on a miss so a wrong email doesn't respond faster than a wrong password.
    const ok = user
      ? await verifyPassword(password, user.password_hash)
      : await verifyPassword(password, "$2a$12$invalidsaltinvalidsaltinvalidsaltinvalidsalt");
    if (!user || !ok) throw unauthorized("Incorrect email or password.");

    startSession(res, user.id);
    res.json({ user: publicUser(user) });
  }),
);

authRouter.post("/logout", (req, res) => {
  res.clearCookie(SESSION_COOKIE);
  res.status(204).end();
});

authRouter.get("/me", (req, res) => {
  // Not requireAuth: a signed-out visitor gets {user: null}, not a 401, since checking
  // "am I signed in?" is routine and shouldn't read as an error in the browser console.
  const user = req.user;
  res.json({ user: user ? publicUser(user) : null });
});
