import "./env.js";

import cookieParser from "cookie-parser";
import express from "express";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { attachUserIfPresent } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { jobsRouter } from "./routes/jobs.js";
import { resumesRouter } from "./routes/resumes.js";
import { applicationsRouter } from "./routes/applications.js";
import { analyticsRouter } from "./routes/analytics.js";
import { careerRouter } from "./routes/career.js";
import { aiRouter } from "./routes/ai.js";

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;

const app = express();
app.disable("x-powered-by");

app.use(cookieParser());
app.use(express.json({ limit: "256kb" }));
app.use(attachUserIfPresent);

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/ai", aiRouter);
app.use("/api/auth", authRouter);
app.use("/api/resumes", resumesRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/career", careerRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found.", code: "not_found" });
});

// In production this one process also serves the built frontend (npm run build),
// so there's a single server to run. In dev, Vite serves the frontend on its own
// port and proxies /api/* here instead (see vite.config.ts).
const clientDir = resolve(here, "..", "build", "client");
if (existsSync(clientDir)) {
  app.use(express.static(clientDir, { index: false }));
  // No path pattern: this only runs if nothing above matched, which is exactly
  // what a SPA fallback needs (and sidesteps Express 5's stricter "*" syntax).
  app.use((req, res) => {
    res.sendFile(resolve(clientDir, "index.html"));
  });
} else if (process.env.NODE_ENV === "production") {
  console.warn(`No frontend build found at ${clientDir}. Run "npm run build" first.`);
}

// Registered last: catches errors thrown or passed to next() by any route above.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err?.name === "MulterError") {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "That file is too large." : "The upload didn't go through. Try again.";
    return res.status(400).json({ error: message, code: "upload_error" });
  }

  const status = typeof err?.status === "number" ? err.status : 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err?.message || "Something went wrong.", code: err?.code ?? "server_error" });
});

const server = app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.error(`[server] Port ${PORT} is already in use.`);
    console.error(`[server] Close the other Node process or set PORT to another value in server/.env.`);
    console.error(`[server] Windows quick fix: taskkill /F /IM node.exe`);
  } else {
    console.error("[server] Failed to start:", error);
  }
  process.exitCode = 1;
});
