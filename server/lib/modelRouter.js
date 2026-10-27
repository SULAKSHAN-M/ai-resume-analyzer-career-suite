const configured = (name, fallback) => process.env[name]?.trim() || fallback;

/**
 * Five-model Gemini intelligence pool.
 *
 * Dedicated env vars let deployments swap a model without touching code.
 * GEMINI_MODEL and GEMINI_FALLBACK_MODEL are still honored as backwards-
 * compatible aliases for the Core and Volume tiers used in Career Suite v3.
 */
export const AI_MODULES = Object.freeze({
  precision: {
    id: "precision",
    label: "Precision",
    model: configured("GEMINI_PRECISION_MODEL", "gemini-3.8-flash"),
    role: "Highest-accuracy resume tailoring, review, and answer assessment",
    defaultThinking: "high",
  },
  advanced: {
    id: "advanced",
    label: "Advanced Reasoning",
    model: configured("GEMINI_ADVANCED_MODEL", "gemini-3.6-flash"),
    role: "Complex interview preparation and second-pass reasoning",
    defaultThinking: "medium",
  },
  core: {
    id: "core",
    label: "Core Analysis",
    model: configured("GEMINI_CORE_MODEL", process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite"),
    role: "Balanced resume analysis and general career workflows",
    defaultThinking: "medium",
  },
  writer: {
    id: "writer",
    label: "Career Writer",
    model: configured("GEMINI_WRITER_MODEL", "gemini-3.1-flash-lite"),
    role: "Cover letters, concise rewriting, and communication tasks",
    defaultThinking: "low",
  },
  volume: {
    id: "volume",
    label: "High-Volume Fallback",
    model: configured("GEMINI_VOLUME_MODEL", process.env.GEMINI_FALLBACK_MODEL?.trim() || "gemini-3-flash-preview"),
    role: "Low-latency final fallback and simpler structured tasks",
    defaultThinking: "minimal",
  },
});

const ROUTES = Object.freeze({
  accuracy: ["precision", "advanced", "core", "writer", "volume"],
  analysis: ["advanced", "precision", "core", "writer", "volume"],
  balanced: ["core", "writer", "advanced", "precision", "volume"],
  writing: ["writer", "core", "advanced", "precision", "volume"],
  fast: ["volume", "writer", "core", "advanced", "precision"],
});

const TASKS = Object.freeze({
  "resume-review": { profile: "accuracy", thinking: "medium" },
  "resume-tailor": { profile: "accuracy", thinking: "high" },
  "cover-letter": { profile: "writing", thinking: "low" },
  "interview-prep": { profile: "analysis", thinking: "medium" },
  "interview-assess": { profile: "accuracy", thinking: "high" },
  default: { profile: "balanced", thinking: "medium" },
});

const stats = new Map(
  Object.values(AI_MODULES).map((module) => [
    module.id,
    { attempts: 0, successes: 0, failures: 0, lastSuccessAt: null, lastFailureAt: null, lastStatus: null },
  ]),
);

export function moduleForId(id) {
  return AI_MODULES[id] ?? null;
}

function uniqueModules(ids) {
  const seen = new Set();
  return ids
    .map((id) => moduleForId(id))
    .filter(Boolean)
    .filter((item) => {
      if (seen.has(item.model)) return false;
      seen.add(item.model);
      return true;
    });
}

export function routeForTask(task = "default") {
  const taskConfig = TASKS[task] ?? TASKS.default;
  const mode = (process.env.GEMINI_ROUTING_MODE?.trim().toLowerCase() || "smart");

  let profile = taskConfig.profile;
  if (mode === "quality") profile = "accuracy";
  else if (mode === "quota-saver") profile = "fast";
  else if (mode === "fast") profile = "fast";

  return {
    task,
    mode,
    profile,
    thinking: taskConfig.thinking,
    modules: uniqueModules(ROUTES[profile] ?? ROUTES.balanced),
  };
}

/**
 * Gemini 3.8 Flash rejects "minimal". Other configured endpoints support it.
 */
export function normalizeThinkingLevel(model, desired = "medium") {
  if (desired === "minimal" && /gemini-3\.8-flash(?:$|-)/.test(model)) return "low";
  return ["minimal", "low", "medium", "high"].includes(desired) ? desired : "medium";
}

export function recordModelAttempt(moduleId) {
  const entry = stats.get(moduleId);
  if (entry) entry.attempts += 1;
}

export function recordModelSuccess(moduleId) {
  const entry = stats.get(moduleId);
  if (!entry) return;
  entry.successes += 1;
  entry.lastSuccessAt = new Date().toISOString();
  entry.lastStatus = 200;
}

export function recordModelFailure(moduleId, status) {
  const entry = stats.get(moduleId);
  if (!entry) return;
  entry.failures += 1;
  entry.lastFailureAt = new Date().toISOString();
  entry.lastStatus = Number(status) || null;
}

export function getAIRouterStatus() {
  const routing = Object.fromEntries(
    Object.keys(TASKS)
      .filter((task) => task !== "default")
      .map((task) => {
        const route = routeForTask(task);
        return [task, route.modules.map((item) => item.model)];
      }),
  );

  return {
    mode: process.env.GEMINI_ROUTING_MODE?.trim().toLowerCase() || "smart",
    modules: Object.values(AI_MODULES).map((module) => ({
      id: module.id,
      label: module.label,
      model: module.model,
      role: module.role,
      defaultThinking: module.defaultThinking,
      stats: { ...stats.get(module.id) },
    })),
    routing,
  };
}
