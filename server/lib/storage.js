import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const uploadsRoot = resolve(here, "..", process.env.UPLOADS_DIR ?? "uploads");

function resumeDir(userId, resumeId) {
  return resolve(uploadsRoot, userId, resumeId);
}

/**
 * Saves the resume PDF and its preview image under a freshly generated resume id.
 * The caller must use the same id for the matching database row (see db.js's createResume).
 */
export async function saveResumeFiles(userId, { resumeBuffer, previewBuffer }) {
  const resumeId = randomUUID();
  const dir = resumeDir(userId, resumeId);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "resume.pdf"), resumeBuffer);
  if (previewBuffer) await writeFile(resolve(dir, "preview.png"), previewBuffer);
  return resumeId;
}

export function readResumeFile(userId, resumeId) {
  return readFile(resolve(resumeDir(userId, resumeId), "resume.pdf"));
}

export function readPreviewFile(userId, resumeId) {
  return readFile(resolve(resumeDir(userId, resumeId), "preview.png"));
}

export async function deleteResumeFiles(userId, resumeId) {
  await rm(resumeDir(userId, resumeId), { recursive: true, force: true });
}

export async function deleteAllResumeFiles(userId) {
  await rm(resolve(uploadsRoot, userId), { recursive: true, force: true });
}
