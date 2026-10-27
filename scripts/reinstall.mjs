import { rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import process from "node:process";

console.log("[tooling] Removing stale node_modules...");
rmSync("node_modules", { recursive: true, force: true });
rmSync("server/node_modules", { recursive: true, force: true });

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
console.log("[tooling] Installing the versions locked in package-lock.json...");
const result = spawnSync(npm, ["ci"], { stdio: "inherit" });

if (result.error) {
  console.error("[tooling] npm ci could not start:", result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
