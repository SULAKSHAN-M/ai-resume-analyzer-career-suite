import { Router } from "express";
import { listAllResumeVersions, listApplicationsForUser, listResumesForUser } from "../db.js";
import { asyncRoute } from "../lib/errors.js";
import { requireAuth } from "../middleware/auth.js";

export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

function countValues(values) {
  const map = new Map();
  for (const value of values) {
    const key = String(value ?? "").trim();
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
}

analyticsRouter.get("/", asyncRoute(async (req, res) => {
  const rows = listResumesForUser(req.user.id);
  const feedbacks = rows.map((row) => {
    try { return { createdAt: row.created_at, feedback: JSON.parse(row.feedback_json) }; }
    catch { return null; }
  }).filter(Boolean);
  const applications = listApplicationsForUser(req.user.id);
  const versions = listAllResumeVersions(req.user.id);

  const atsScores = feedbacks.map(({ feedback }) => Number(feedback?.atsMetrics?.score ?? feedback?.ATS?.score ?? 0)).filter(Number.isFinite);
  const overallScores = feedbacks.map(({ feedback }) => Number(feedback?.overallScore ?? 0)).filter(Number.isFinite);
  const avg = (values) => values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;

  const trend = feedbacks
    .slice(0, 12)
    .reverse()
    .map(({ createdAt, feedback }) => ({
      createdAt,
      ats: Number(feedback?.atsMetrics?.score ?? feedback?.ATS?.score ?? 0),
      overall: Number(feedback?.overallScore ?? 0),
    }));

  const missingSkills = countValues(feedbacks.flatMap(({ feedback }) => feedback?.skillGap?.missingSkills ?? [])).slice(0, 8);
  const roles = countValues(feedbacks.flatMap(({ feedback }) => feedback?.suggestedRoles ?? [])).slice(0, 8);
  const statusCounts = Object.fromEntries(["Saved", "Applied", "Interview", "Offer", "Rejected"].map((status) => [status, applications.filter((a) => a.status === status).length]));

  res.json({
    analytics: {
      resumeReviews: rows.length,
      resumeVersions: versions.length,
      averageAtsScore: avg(atsScores),
      averageOverallScore: avg(overallScores),
      applicationsSubmitted: applications.filter((a) => ["Applied", "Interview", "Offer", "Rejected"].includes(a.status)).length,
      interviewsReceived: applications.filter((a) => ["Interview", "Offer"].includes(a.status)).length,
      offers: applications.filter((a) => a.status === "Offer").length,
      statusCounts,
      trend,
      commonMissingSkills: missingSkills,
      topTargetRoles: roles,
    },
  });
}));
