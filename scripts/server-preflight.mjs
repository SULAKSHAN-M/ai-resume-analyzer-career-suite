import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const major = Number(process.versions.node.split(".")[0]);

if (!Number.isFinite(major) || major < 20) {
  console.error(`[preflight] Node ${process.version} detected. Career Suite requires Node 20 or newer.`);
  console.error("[preflight] Install a current Node LTS release, reopen PowerShell, then run npm install again.");
  process.exit(1);
}

const envPath = resolve(root, "server", ".env");
if (!existsSync(envPath)) {
  console.warn("[preflight] server/.env is missing. The server can start, but AI and persistent login need configuration.");
  console.warn("[preflight] Copy server/.env.example to server/.env and add your Gemini API key.");
}

const uploads = resolve(root, "server", "uploads");
if (!existsSync(uploads)) mkdirSync(uploads, { recursive: true });

console.log(`[preflight] Node ${process.version} · portable data store OK`);
