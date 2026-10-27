import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";

export const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
let developmentSecret = null;

function secret() {
  const value = process.env.JWT_SECRET?.trim();
  if (value) return value;

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not set. Add it to server/.env and restart the server.");
  }

  if (!developmentSecret) {
    developmentSecret = randomBytes(32).toString("hex");
    console.warn("[auth] JWT_SECRET is not set; using a temporary development secret. Sessions will reset when the server restarts.");
  }
  return developmentSecret;
}

export function signSession(userId) {
  return jwt.sign({ sub: userId }, secret(), { expiresIn: "30d" });
}

/** Returns the user id, or null if the token is missing, expired, or invalid. */
export function verifySession(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    // Only sent over HTTPS once deployed. Local dev is plain HTTP, so this is
    // conditional rather than always-on.
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_MS,
    path: "/",
  };
}
