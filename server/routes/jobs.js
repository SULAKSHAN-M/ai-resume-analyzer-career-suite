import { Router } from "express";
import { badRequest } from "../lib/errors.js";
import { searchJobs } from "../lib/jobs.js";
import { requireAuth } from "../middleware/auth.js";

export const jobsRouter = Router();
jobsRouter.use(requireAuth);

jobsRouter.get("/", async (req, res, next) => {
  try {
    const queries = [
      ...new Set(
        [].concat(req.query.q ?? []).map((q) => String(q).trim().slice(0, 80)).filter(Boolean),
      ),
    ].slice(0, 3);

    if (queries.length === 0) throw badRequest("Add at least one search term.");

    const jobs = await searchJobs(queries, "Sri Lanka");
    res.set("Cache-Control", "private, max-age=300").json({ jobs });
  } catch (err) {
    next(err);
  }
});
