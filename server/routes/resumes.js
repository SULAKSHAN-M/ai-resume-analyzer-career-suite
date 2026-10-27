import { Router } from "express";
import multer from "multer";
import {
  createResume,
  deleteAllResumesForUser,
  deleteResume,
  getResume,
  listResumesForUser,
  resumeIdsForUser,
} from "../db.js";
import { asyncRoute, badRequest, notFound } from "../lib/errors.js";
import { reviewResume } from "../lib/ai.js";
import {
  deleteAllResumeFiles,
  deleteResumeFiles,
  readPreviewFile,
  readResumeFile,
  saveResumeFiles,
} from "../lib/storage.js";
import { requireAuth } from "../middleware/auth.js";

export const resumesRouter = Router();
resumesRouter.use(requireAuth);

// Gemini's inline-data request limit is ~20MB total, and base64 adds ~33% overhead.
// Resume + job-description file together stay well under that after encoding.
const MAX_RESUME_BYTES = 8 * 1024 * 1024;
const MAX_JD_FILE_BYTES = 4 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 6 * 1024 * 1024;
const JD_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  // The coarsest per-file cap; each field's own (smaller) limit is checked in the handler below.
  limits: { fileSize: MAX_RESUME_BYTES },
});

function toPublicResume(row) {
  return {
    id: row.id,
    companyName: row.company_name,
    jobTitle: row.job_title,
    jobDescription: row.job_description,
    jobDescriptionFileName: row.job_description_file_name,
    fileName: row.file_name,
    createdAt: row.created_at,
    feedback: JSON.parse(row.feedback_json),
  };
}

/** Throws if `file` is missing or its size/type don't match what's expected. */
function checkFile(file, { required, maxBytes, isPdf, isImage, label }) {
  if (!file) {
    if (required) throw badRequest(`Attach ${label}.`, "missing_file");
    return;
  }
  if (file.size > maxBytes) {
    throw badRequest(`${label} is larger than ${Math.round(maxBytes / (1024 * 1024))} MB.`, "file_too_large");
  }
  const name = file.originalname.toLowerCase();
  const looksLikePdf = file.mimetype === "application/pdf" || name.endsWith(".pdf");
  const looksLikeImage = JD_IMAGE_TYPES.has(file.mimetype) || /\.(png|jpe?g|webp)$/.test(name);
  const okType = (isPdf && looksLikePdf) || (isImage && looksLikeImage);
  if (!okType) {
    const kinds = [isPdf && "a PDF", isImage && "an image (PNG, JPG or WebP)"].filter(Boolean).join(" or ");
    throw badRequest(`${label} must be ${kinds}.`, "invalid_file_type");
  }
}

const uploadFields = upload.fields([
  { name: "resume", maxCount: 1 },
  { name: "preview", maxCount: 1 },
  { name: "jobDescriptionFile", maxCount: 1 },
]);

resumesRouter.post(
  "/",
  uploadFields,
  asyncRoute(async (req, res) => {
    const resumeFile = req.files?.resume?.[0];
    const previewFile = req.files?.preview?.[0];
    const jdFile = req.files?.jobDescriptionFile?.[0];

    checkFile(resumeFile, { required: true, maxBytes: MAX_RESUME_BYTES, isPdf: true, label: "your resume" });
    checkFile(previewFile, { required: false, maxBytes: MAX_PREVIEW_BYTES, isImage: true, label: "the preview image" });
    checkFile(jdFile, {
      required: false,
      maxBytes: MAX_JD_FILE_BYTES,
      isPdf: true,
      isImage: true,
      label: "the job description file",
    });

    const companyName = String(req.body.companyName ?? "").trim().slice(0, 200);
    const jobTitle = String(req.body.jobTitle ?? "").trim().slice(0, 200);
    const jobDescriptionText = String(req.body.jobDescriptionText ?? "").trim();

    const feedback = await reviewResume({
      resumeBuffer: resumeFile.buffer,
      jobTitle,
      jobDescriptionText,
      jobDescriptionFile: jdFile ? { buffer: jdFile.buffer, mimeType: jdFile.mimetype } : undefined,
    });

    const resumeId = await saveResumeFiles(req.user.id, {
      resumeBuffer: resumeFile.buffer,
      previewBuffer: previewFile?.buffer,
    });

    const row = createResume({
      id: resumeId,
      userId: req.user.id,
      companyName,
      jobTitle,
      jobDescription: jdFile ? "" : jobDescriptionText,
      jobDescriptionFileName: jdFile?.originalname ?? "",
      fileName: resumeFile.originalname,
      feedbackJson: JSON.stringify(feedback),
    });

    res.status(201).json({ resume: toPublicResume(row) });
  }),
);
resumesRouter.get(
  "/",
  asyncRoute(async (req, res) => {
    res.json({ resumes: listResumesForUser(req.user.id).map(toPublicResume) });
  }),
);

/** Loads a resume and checks it belongs to req.user. Returns the raw DB row. */
function ownedResume(req) {
  const row = getResume(req.params.id);
  // 404, not 403: this shouldn't confirm that a given id belongs to someone else.
  if (!row || row.user_id !== req.user.id) throw notFound("Review not found.");
  return row;
}

resumesRouter.get(
  "/:id",
  asyncRoute(async (req, res) => {
    res.json({ resume: toPublicResume(ownedResume(req)) });
  }),
);

resumesRouter.get(
  "/:id/resume.pdf",
  asyncRoute(async (req, res) => {
    const row = ownedResume(req);
    const buffer = await readResumeFile(req.user.id, row.id).catch(() => null);
    if (!buffer) throw notFound("The resume file is missing.");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(row.file_name)}"`);
    res.send(buffer);
  }),
);

resumesRouter.get(
  "/:id/preview.png",
  asyncRoute(async (req, res) => {
    const row = ownedResume(req);
    const buffer = await readPreviewFile(req.user.id, row.id).catch(() => null);
    if (!buffer) throw notFound("No preview image for this review.");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "private, max-age=31536000, immutable");
    res.send(buffer);
  }),
);

resumesRouter.delete(
  "/:id",
  asyncRoute(async (req, res) => {
    const row = ownedResume(req);
    await deleteResumeFiles(req.user.id, row.id);
    deleteResume(row.id);
    res.status(204).end();
  }),
);

/** Wipes every review and file this user has. Matches on no :id, so it must be registered last. */
resumesRouter.delete(
  "/",
  asyncRoute(async (req, res) => {
    const ids = resumeIdsForUser(req.user.id);
    deleteAllResumesForUser(req.user.id);
    await deleteAllResumeFiles(req.user.id);
    res.json({ deleted: ids.length });
  }),
);
