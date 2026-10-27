export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Formats a YYYY-MM-DD string without letting the viewer's timezone shift the day. */
export function formatIsoDate(iso: string): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return "";
  return new Date(time).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** The backend rejects with {error, code} JSON as often as it throws a plain Error. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Try again."): string {
  if (typeof err === "string" && err) return err;
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object") {
    const e = err as { message?: unknown; error?: unknown };
    if (typeof e.message === "string" && e.message) return e.message;
    if (typeof e.error === "string" && e.error) return e.error;
  }
  return fallback;
}

/** Only allow redirects to paths inside this app. */
export function safeNextPath(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

// ---------------------------------------------------------------------------
// Scores
// ---------------------------------------------------------------------------

export type ScoreTier = "good" | "mid" | "fix";

export function scoreTier(score: number): ScoreTier {
  if (score >= 70) return "good";
  if (score >= 50) return "mid";
  return "fix";
}

/** Full class names so Tailwind can see them. */
export const tierStyles: Record<ScoreTier, { text: string; bar: string; badge: string }> = {
  good: { text: "text-good", bar: "bg-good", badge: "bg-good-wash text-good" },
  mid: { text: "text-mid", bar: "bg-mid", badge: "bg-mid-wash text-mid" },
  fix: { text: "text-fix", bar: "bg-fix", badge: "bg-fix-wash text-fix" },
};

export function scoreVerdict(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Solid start";
  if (score >= 40) return "Needs work";
  return "Major gaps";
}

export function matchVerdict(score: number): string {
  if (score >= 80) return "Strong match";
  if (score >= 60) return "Good match";
  if (score >= 40) return "Partial match";
  return "Weak match";
}

/** The terms used to search for listings: the job the user targets first, then roles the AI suggested. */
export function searchTerms(jobTitle: string, suggestedRoles: string[], max = 3): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const raw of [jobTitle, ...suggestedRoles]) {
    const term = raw.trim();
    const key = term.toLowerCase();
    if (!term || seen.has(key)) continue;
    seen.add(key);
    terms.push(term);
    if (terms.length === max) break;
  }
  return terms;
}
