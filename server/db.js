// Portable file-backed data store.
//
// Career Suite v4.4 intentionally avoids native database addons so the dev
// server starts consistently on Windows, macOS and Linux without rebuilding a
// platform-specific better-sqlite3 binary. Data is stored in server/data.json
// (or DATA_DIR/data.json when DATA_DIR is configured).
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, process.env.DATA_DIR ?? ".");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

const dataPath = resolve(dataDir, "data.json");
const EMPTY_STATE = { users: [], resumes: [], applications: [], resumeVersions: [] };

function loadState() {
  if (!existsSync(dataPath)) return structuredClone(EMPTY_STATE);
  try {
    const parsed = JSON.parse(readFileSync(dataPath, "utf8"));
    return {
      users: Array.isArray(parsed?.users) ? parsed.users : [],
      resumes: Array.isArray(parsed?.resumes) ? parsed.resumes : [],
      applications: Array.isArray(parsed?.applications) ? parsed.applications : [],
      resumeVersions: Array.isArray(parsed?.resumeVersions) ? parsed.resumeVersions : [],
    };
  } catch (error) {
    console.error(`[db] Could not read ${dataPath}:`, error?.message ?? error);
    console.error("[db] Rename or remove the invalid data.json file, then restart the server.");
    throw error;
  }
}

let state = loadState();

function persist() {
  // Synchronous persistence is intentional here. The app is a small local
  // career tool and these records are tiny; keeping writes synchronous avoids
  // races between closely-spaced tracker/version updates.
  writeFileSync(dataPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function newestFirst(a, b) {
  return (b.created_at ?? 0) - (a.created_at ?? 0);
}

// Exposed only for diagnostics; application code should use the functions below.
export const db = { backend: "json", path: dataPath };

// --- users -----------------------------------------------------------------
export function createUser(email, passwordHash) {
  if (state.users.some((row) => row.email === email)) {
    const error = new Error("UNIQUE constraint failed: users.email");
    error.code = "SQLITE_CONSTRAINT_UNIQUE";
    throw error;
  }
  const row = {
    id: randomUUID(),
    email,
    password_hash: passwordHash,
    created_at: Date.now(),
  };
  state.users.push(row);
  persist();
  return { ...row };
}

export function findUserByEmail(email) {
  const row = state.users.find((item) => item.email === email);
  return row ? { ...row } : undefined;
}

export function findUserById(id) {
  const row = state.users.find((item) => item.id === id);
  return row ? { ...row } : undefined;
}

// --- resumes ---------------------------------------------------------------
export function createResume(record) {
  const row = {
    id: record.id,
    user_id: record.userId,
    company_name: record.companyName ?? "",
    job_title: record.jobTitle ?? "",
    job_description: record.jobDescription ?? "",
    job_description_file_name: record.jobDescriptionFileName ?? "",
    file_name: record.fileName,
    feedback_json: record.feedbackJson,
    created_at: Date.now(),
  };
  state.resumes.push(row);
  persist();
  return { ...row };
}

export function listResumesForUser(userId) {
  return state.resumes.filter((row) => row.user_id === userId).sort(newestFirst).map((row) => ({ ...row }));
}

export function getResume(id) {
  const row = state.resumes.find((item) => item.id === id);
  return row ? { ...row } : undefined;
}

export function deleteResume(id) {
  state.resumes = state.resumes.filter((row) => row.id !== id);
  state.resumeVersions = state.resumeVersions.filter((row) => row.resume_id !== id);
  state.applications = state.applications.map((row) => row.resume_id === id ? { ...row, resume_id: null } : row);
  persist();
}

export function resumeIdsForUser(userId) {
  return state.resumes.filter((row) => row.user_id === userId).map((row) => row.id);
}

export function deleteAllResumesForUser(userId) {
  const ids = new Set(resumeIdsForUser(userId));
  state.resumes = state.resumes.filter((row) => row.user_id !== userId);
  state.resumeVersions = state.resumeVersions.filter((row) => row.user_id !== userId && !ids.has(row.resume_id));
  state.applications = state.applications.map((row) => ids.has(row.resume_id) ? { ...row, resume_id: null } : row);
  persist();
}

// --- application tracker ---------------------------------------------------
const APPLICATION_STATUSES = new Set(["Saved", "Applied", "Interview", "Offer", "Rejected"]);

export function createApplication(record) {
  const now = Date.now();
  const row = {
    id: randomUUID(),
    user_id: record.userId,
    resume_id: record.resumeId || null,
    external_job_id: record.externalJobId || "",
    title: record.title,
    company: record.company || "",
    location: record.location || "",
    url: record.url || "",
    status: APPLICATION_STATUSES.has(record.status) ? record.status : "Saved",
    notes: record.notes || "",
    next_action: record.nextAction || "",
    applied_at: record.appliedAt || null,
    interview_at: record.interviewAt || null,
    created_at: now,
    updated_at: now,
  };
  state.applications.push(row);
  persist();
  return { ...row };
}

export function listApplicationsForUser(userId) {
  return state.applications.filter((row) => row.user_id === userId).sort((a, b) => (b.updated_at ?? 0) - (a.updated_at ?? 0)).map((row) => ({ ...row }));
}

export function getApplication(id) {
  const row = state.applications.find((item) => item.id === id);
  return row ? { ...row } : undefined;
}

export function updateApplication(userId, id, patch) {
  const index = state.applications.findIndex((row) => row.id === id && row.user_id === userId);
  if (index < 0) return null;
  const current = state.applications[index];
  const next = {
    ...current,
    status: APPLICATION_STATUSES.has(patch.status) ? patch.status : current.status,
    notes: patch.notes ?? current.notes,
    next_action: patch.nextAction ?? current.next_action,
    applied_at: patch.appliedAt === undefined ? current.applied_at : patch.appliedAt,
    interview_at: patch.interviewAt === undefined ? current.interview_at : patch.interviewAt,
    updated_at: Date.now(),
  };
  state.applications[index] = next;
  persist();
  return { ...next };
}

export function deleteApplication(userId, id) {
  const before = state.applications.length;
  state.applications = state.applications.filter((row) => !(row.id === id && row.user_id === userId));
  if (state.applications.length === before) return false;
  persist();
  return true;
}

// --- resume versions -------------------------------------------------------
export function createResumeVersion(record) {
  const row = {
    id: randomUUID(),
    user_id: record.userId,
    resume_id: record.resumeId,
    label: record.label,
    target_job_id: record.targetJobId || "",
    target_job_title: record.targetJobTitle || "",
    target_company: record.targetCompany || "",
    content_json: JSON.stringify(record.content ?? {}),
    ats_json: JSON.stringify(record.ats ?? {}),
    created_at: Date.now(),
  };
  state.resumeVersions.push(row);
  persist();
  return { ...row };
}

export function listResumeVersions(userId, resumeId) {
  return state.resumeVersions
    .filter((row) => row.user_id === userId && row.resume_id === resumeId)
    .sort(newestFirst)
    .map((row) => ({ ...row }));
}

export function listAllResumeVersions(userId) {
  return state.resumeVersions.filter((row) => row.user_id === userId).sort(newestFirst).map((row) => ({ ...row }));
}

export function getResumeVersion(id) {
  const row = state.resumeVersions.find((item) => item.id === id);
  return row ? { ...row } : undefined;
}

export function deleteResumeVersion(userId, id) {
  const before = state.resumeVersions.length;
  state.resumeVersions = state.resumeVersions.filter((row) => !(row.id === id && row.user_id === userId));
  if (state.resumeVersions.length === before) return false;
  persist();
  return true;
}
