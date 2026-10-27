// Copies the pdf.js worker into public/ so the browser can load it from "/pdf.worker.min.mjs".
// Runs after `npm install`, which keeps the worker in sync with the installed pdfjs-dist version.
// It must be the legacy worker, to match the legacy build imported in app/lib/pdf2img.ts.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs");
const target = resolve(root, "public/pdf.worker.min.mjs");

if (!existsSync(source)) {
  console.warn("pdfjs-dist worker not found, skipping copy.");
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
console.log("Copied pdf.worker.min.mjs to public/");
