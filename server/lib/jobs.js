/**
 * Job search through the ITPro.lk Job API.
 *
 * Public endpoint used here:
 *   GET https://itpro.lk/api/v1/jobs?limit=50
 *
 * The API only exposes a `limit` filter for recent jobs, so this module fetches
 * recent ITPro jobs and ranks/filters them locally against the AI-suggested roles.
 *
 * Keep the return shape stable because app/components/Jobs.tsx consumes it.
 */
import { HttpError } from "./errors.js";
import { getITProJobs } from "./itpro.js";

const REQUEST_TIMEOUT_MS = 10_000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_LIMIT = 50;
const MAX_TOTAL = 12;

const cache = new Map();

const ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function toPlainText(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);

  return text
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (entity) => ENTITIES[entity] ?? entity)
    .replace(/\s+/g, " ")
    .trim();
}

function words(value) {
  return toPlainText(value)
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .map((word) => word.trim())
    .filter((word) => word.length >= 2);
}

/**
 * Score a recent ITPro job against one AI-suggested role.
 * Title matches are intentionally weighted much more heavily than description matches.
 */
function scoreForQuery(job, query) {
  const q = toPlainText(query).toLowerCase();
  if (!q) return 0;

  const title = toPlainText(job.title).toLowerCase();
  const company = toPlainText(job.company).toLowerCase();
  const summary = toPlainText(job.summary);
  const description = toPlainText(job.description);
  const haystack = `${title} ${company} ${summary} ${description}`.toLowerCase();

  let score = 0;

  if (title === q) score += 160;
  else if (title.includes(q)) score += 100;

  if (haystack.includes(q)) score += 35;

  for (const token of new Set(words(q))) {
    if (title.includes(token)) score += 20;
    if (haystack.includes(token)) score += 4;
  }

  return score;
}

function bestQueryForJob(job, queries) {
  let bestQuery = queries[0] ?? "IT";
  let bestScore = 0;

  for (const query of queries) {
    const score = scoreForQuery(job, query);
    if (score > bestScore) {
      bestScore = score;
      bestQuery = query;
    }
  }

  return { query: bestQuery, score: bestScore };
}

function toListing(raw, queries) {
  if (!raw || typeof raw !== "object") return null;

  const title = toPlainText(raw.title);
  if (!title) return null;

  const id = String(raw.id ?? "").trim();
  const summary = toPlainText(raw.summary);
  const description = toPlainText(raw.description);
  const snippetSource = summary || description;
  const snippet =
    snippetSource.length > 300 ? `${snippetSource.slice(0, 297)}...` : snippetSource;

  // The OpenAPI schema defines location inconsistently across read/write operations.
  // Only display it when the API returns readable text; otherwise use a safe country label.
  const location =
    typeof raw.location === "string" && raw.location.trim()
      ? toPlainText(raw.location)
      : "Sri Lanka";

  // Always send users to the ITPro job-detail page first. The API's `website`
  // field can point directly to an employer/application site, which bypasses
  // ITPro. ITPro job URLs are keyed by the numeric job ID plus a readable slug.
  const jobSlug = [title, toPlainText(raw.company)]
    .filter(Boolean)
    .join(" at ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const link = id
    ? `https://itpro.lk/job/${encodeURIComponent(id)}/${jobSlug ? `${jobSlug}/` : ""}`
    : "https://itpro.lk/jobs/";

  const updated = /^\d{4}-\d{2}-\d{2}/.exec(String(raw.created_on ?? ""))?.[0] ?? "";
  const { query, score } = bestQueryForJob(raw, queries);

  return {
    id: id || `${title}|${toPlainText(raw.company)}|${updated}`,
    title,
    company: toPlainText(raw.company),
    location,
    snippet,
    description: description.slice(0, 18000),
    salary: "",
    type: "",
    source: "ITPro.lk",
    link,
    updated,
    query,
    _score: score,
  };
}

async function fetchRecentJobs() {
  const data = await getITProJobs(FETCH_LIMIT);

  // The supplied OpenAPI says GET /jobs returns an array. Wrapped forms are
  // tolerated defensively without changing the app contract.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.data)) return data.data;

  throw new HttpError(
    502,
    "ITPro returned an unexpected jobs response.",
    "upstream",
  );
}

export async function searchJobs(queries, location = "Sri Lanka") {
  const cleanQueries = [...new Set((queries ?? []).map((q) => toPlainText(q)).filter(Boolean))].slice(0, 3);

  if (cleanQueries.length === 0) return [];

  const cacheKey = JSON.stringify([cleanQueries, location]);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.jobs;

  const recentJobs = await fetchRecentJobs();

  const ranked = recentJobs
    .map((job) => toListing(job, cleanQueries))
    .filter((job) => job !== null)
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return String(b.updated).localeCompare(String(a.updated));
    });

  // Prefer relevant jobs. If the latest batch has no keyword match at all,
  // still show recent Sri Lankan IT jobs instead of an empty section.
  const relevant = ranked.filter((job) => job._score > 0);
  const selected = (relevant.length > 0 ? relevant : ranked).slice(0, MAX_TOTAL);

  const jobs = selected.map(({ _score, ...job }) => job);

  cache.set(cacheKey, { at: Date.now(), jobs });
  return jobs;
}
