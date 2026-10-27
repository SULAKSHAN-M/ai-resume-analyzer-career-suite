import { HttpError } from "./errors.js";

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(Math.min(100, Math.max(0, n)));
}

function stringList(value, max) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);
}

function normalizeCategory(input) {
  const obj = input && typeof input === "object" ? input : {};
  const rawTips = Array.isArray(obj.tips) ? obj.tips : [];

  const tips = rawTips.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const tip = typeof raw.tip === "string" ? raw.tip.trim() : "";
    if (!tip) return [];
    const explanation = typeof raw.explanation === "string" ? raw.explanation.trim() : "";
    return [{ type: raw.type === "good" ? "good" : "improve", tip, explanation: explanation || undefined }];
  });

  return { score: clampScore(obj.score), tips };
}

function normalizeJobMatch(input) {
  if (!input || typeof input !== "object") return undefined;
  if (typeof input.score !== "number" && typeof input.score !== "string") return undefined;
  return {
    score: clampScore(input.score),
    summary: typeof input.summary === "string" ? input.summary.trim() : "",
    matchedKeywords: stringList(input.matchedKeywords, 12),
    missingKeywords: stringList(input.missingKeywords, 12),
    tips: normalizeCategory({ tips: input.tips }).tips,
  };
}

/**
 * Turns the model's raw text reply into a validated Feedback object. Tolerates markdown
 * fences and stray text around the JSON, and fills in safe defaults for missing fields.
 * @param {string} raw
 * @param {{ requireJobMatch?: boolean }} [options]
 */
export function parseFeedback(raw, { requireJobMatch = false } = {}) {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new HttpError(502, "The AI didn't return a review. Try again.", "ai_bad_reply");
  }

  let data;
  try {
    data = JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new HttpError(502, "The AI's review was cut off or malformed. Try again.", "ai_bad_reply");
  }

  const categories = {
    ATS: normalizeCategory(data.ATS),
    toneAndStyle: normalizeCategory(data.toneAndStyle),
    content: normalizeCategory(data.content),
    structure: normalizeCategory(data.structure),
    skills: normalizeCategory(data.skills),
  };
  const values = Object.values(categories);

  if (values.every((c) => c.tips.length === 0)) {
    throw new HttpError(502, "The AI's review had no feedback in it. Try again.", "ai_bad_reply");
  }

  const jobMatch = normalizeJobMatch(data.jobMatch);
  if (requireJobMatch && !jobMatch) {
    throw new HttpError(502, "The AI didn't return the job match. Try again.", "ai_bad_reply");
  }

  const average = Math.round(values.reduce((sum, c) => sum + c.score, 0) / values.length);

  const skillGapInput = data.skillGap && typeof data.skillGap === "object" ? data.skillGap : {};
  const skillGap = {
    existingSkills: stringList(skillGapInput.existingSkills, 30),
    requestedSkills: stringList(skillGapInput.requestedSkills, 30),
    missingSkills: stringList(skillGapInput.missingSkills, 30),
    weakSkills: stringList(skillGapInput.weakSkills, 20),
    recommendedNextSkills: stringList(skillGapInput.recommendedNextSkills, 20),
    learningSuggestions: stringList(skillGapInput.learningSuggestions, 20),
  };

  const sectionAnalysis = Array.isArray(data.sectionAnalysis)
    ? data.sectionAnalysis.slice(0, 8).flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const section = typeof item.section === "string" ? item.section.trim() : "";
        if (!section) return [];
        return [{
          section,
          score: clampScore(item.score),
          detected: Boolean(item.detected),
          strengths: stringList(item.strengths, 8),
          issues: stringList(item.issues, 8),
          suggestions: stringList(item.suggestions, 8),
          improvedVersion: typeof item.improvedVersion === "string" ? item.improvedVersion.trim() : "",
        }];
      })
    : [];

  return {
    overallScore: typeof data.overallScore === "number" ? clampScore(data.overallScore) : average,
    summary: typeof data.summary === "string" ? data.summary.trim() : "",
    ...categories,
    ...(jobMatch ? { jobMatch } : {}),
    skillGap,
    sectionAnalysis,
    topFixes: stringList(data.topFixes, 6),
    suggestedRoles: stringList(data.suggestedRoles, 5),
  };
}
