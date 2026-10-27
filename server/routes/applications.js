import { Router } from "express";
import {
  createApplication,
  deleteApplication,
  getResume,
  getApplication,
  listApplicationsForUser,
  updateApplication,
} from "../db.js";
import { asyncRoute, badRequest, notFound } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";

export const applicationsRouter = Router();
applicationsRouter.use(requireAuth);

const STATUSES = new Set(["Saved", "Applied", "Interview", "Offer", "Rejected"]);

function publicApplication(row) {
  return {
    id: row.id,
    resumeId: row.resume_id,
    externalJobId: row.external_job_id,
    title: row.title,
    company: row.company,
    location: row.location,
    url: row.url,
    status: row.status,
    notes: row.notes,
    nextAction: row.next_action,
    appliedAt: row.applied_at,
    interviewAt: row.interview_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

applicationsRouter.get("/", asyncRoute(async (req, res) => {
  res.json({ applications: listApplicationsForUser(req.user.id).map(publicApplication) });
}));

applicationsRouter.post("/", asyncRoute(async (req, res) => {
  const title = String(req.body?.title ?? "").trim().slice(0, 240);
  if (!title) throw badRequest("Job title is required.");
  const status = String(req.body?.status ?? "Saved");
  if (!STATUSES.has(status)) throw badRequest("Invalid application status.");

  const resumeId = String(req.body?.resumeId ?? "").trim() || null;
  if (resumeId) {
    const resume = getResume(resumeId);
    if (!resume || resume.user_id !== req.user.id) throw badRequest("That resume review isn't available.");
  }
  const row = createApplication({
    userId: req.user.id,
    resumeId,
    externalJobId: String(req.body?.externalJobId ?? "").trim().slice(0, 100),
    title,
    company: String(req.body?.company ?? "").trim().slice(0, 240),
    location: String(req.body?.location ?? "").trim().slice(0, 240),
    url: String(req.body?.url ?? "").trim().slice(0, 1000),
    status,
    notes: String(req.body?.notes ?? "").trim().slice(0, 4000),
    nextAction: String(req.body?.nextAction ?? "").trim().slice(0, 500),
    appliedAt: status === "Applied" ? Date.now() : null,
    interviewAt: null,
  });
  res.status(201).json({ application: publicApplication(row) });
}));

applicationsRouter.put("/:id", asyncRoute(async (req, res) => {
  const existing = getApplication(req.params.id);
  if (!existing || existing.user_id !== req.user.id) throw notFound("Application not found.");

  const status = req.body?.status === undefined ? existing.status : String(req.body.status);
  if (!STATUSES.has(status)) throw badRequest("Invalid application status.");

  const row = updateApplication(req.user.id, req.params.id, {
    status,
    notes: req.body?.notes === undefined ? undefined : String(req.body.notes).trim().slice(0, 4000),
    nextAction: req.body?.nextAction === undefined ? undefined : String(req.body.nextAction).trim().slice(0, 500),
    appliedAt: req.body?.appliedAt === undefined
      ? (status === "Applied" && !existing.applied_at ? Date.now() : undefined)
      : (req.body.appliedAt ? Number(req.body.appliedAt) : null),
    interviewAt: req.body?.interviewAt === undefined
      ? (status === "Interview" && !existing.interview_at ? Date.now() : undefined)
      : (req.body.interviewAt ? Number(req.body.interviewAt) : null),
  });
  res.json({ application: publicApplication(row) });
}));

applicationsRouter.delete("/:id", asyncRoute(async (req, res) => {
  if (!deleteApplication(req.user.id, req.params.id)) throw notFound("Application not found.");
  res.status(204).end();
}));
