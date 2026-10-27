import { GoogleGenAI } from "@google/genai";
import { HttpError } from "./errors.js";
import { parseFeedback } from "./parseFeedback.js";
import { computeAtsScore, extractPdfText } from "./ats.js";
import { reviewSchema } from "./schemas.js";
import {
  normalizeThinkingLevel,
  recordModelAttempt,
  recordModelFailure,
  recordModelSuccess,
  routeForTask,
} from "./modelRouter.js";
import { MAX_OUTPUT_TOKENS, prepareInstructions } from "./prompts.js";
import { canFallThroughToAnotherModel, isNetworkFailure, messageOf, statusOf } from "./geminiErrors.js";

let client = null;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new HttpError(
      503,
      "The AI review isn't set up. Add GEMINI_API_KEY to server/.env and restart the server.",
      "not_configured",
    );
  }
  if (!client || client.__apiKey !== apiKey) {
    const configuredTimeout = Number.parseInt(process.env.GEMINI_REQUEST_TIMEOUT_MS || "45000", 10);
    const timeout = Number.isFinite(configuredTimeout) && configuredTimeout >= 5000
      ? configuredTimeout
      : 45000;
    const httpOptions = {
      // Let the application-level model router control failover rather than
      // spending the full SDK retry budget on a single model endpoint.
      timeout,
      retryOptions: { attempts: 1 },
    };
    if (process.env.GEMINI_BASE_URL?.trim()) {
      httpOptions.baseUrl = process.env.GEMINI_BASE_URL.trim();
    }
    client = new GoogleGenAI({ apiKey, httpOptions });
    client.__apiKey = apiKey;
  }
  return client;
}

export function filePart(buffer, mimeType) {
  return { inlineData: { mimeType, data: buffer.toString("base64") } };
}

async function callModel({ module, contents, schema, maxOutputTokens, thinking }) {
  const thinkingLevel = normalizeThinkingLevel(module.model, thinking || module.defaultThinking);
  recordModelAttempt(module.id);
  try {
    console.log(`[AI] ${module.label} (${module.model}) request; thinking=${thinkingLevel}`);
    return await getClient().models.generateContent({
      model: module.model,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        maxOutputTokens,
        thinkingConfig: { thinkingLevel },
      },
    });
  } catch (err) {
    recordModelFailure(module.id, statusOf(err));
    throw err;
  }
}

function mapGeminiError(err, attemptedModels = []) {
  if (err instanceof HttpError) return err;
  const status = statusOf(err);
  const message = messageOf(err);
  const suffix = attemptedModels.length ? ` Tried: ${attemptedModels.join(", ")}.` : "";

  if ([400, 401, 403].includes(status) && /api.?key|credential|authentication|invalid key/i.test(message)) {
    return new HttpError(502, "The AI API key was rejected. Check GEMINI_API_KEY.", "ai_auth");
  }
  if (status === 404 && /model|not found|not available|not supported/i.test(message)) {
    return new HttpError(502, `The configured Gemini models are unavailable.${suffix}`, "ai_model_unavailable");
  }
  if (status === 429) {
    return new HttpError(429, `All available AI model routes are rate-limited or out of free-tier quota right now.${suffix}`, "ai_rate_limited");
  }
  if (status === 413) return new HttpError(413, "The uploaded file is too large for the AI to read.", "ai_too_large");
  if (isNetworkFailure(err)) {
    return new HttpError(
      503,
      `The Gemini API connection timed out or failed across the configured model routes.${suffix} Check your internet connection and try again.`,
      "ai_network",
    );
  }
  if (status === 503) {
    return new HttpError(503, `Google's AI service is temporarily busy across the available model routes.${suffix}`, "ai_unavailable");
  }
  if (status === 403) {
    return new HttpError(502, `This Google AI project does not currently have access to the configured models.${suffix}`, "ai_access");
  }
  return new HttpError(502, `The AI request failed after trying the available model routes.${suffix}`, "ai_upstream");
}

/**
 * Generate schema-constrained JSON through the five-model intelligence router.
 * `task` chooses the model order and reasoning effort; failures automatically
 * cascade to the next distinct model.
 */
export async function generateStructured({
  contents,
  schema,
  maxOutputTokens = MAX_OUTPUT_TOKENS,
  task = "default",
}) {
  const route = routeForTask(task);
  const attempted = [];
  let lastError;

  for (const [index, module] of route.modules.entries()) {
    attempted.push(module.model);
    try {
      const response = await callModel(
        { module, contents, schema, maxOutputTokens, thinking: route.thinking },
      );

      const text = response?.text?.trim();
      if (!text) {
        const err = new Error(`${module.model} returned an empty response.`);
        err.status = 502;
        recordModelFailure(module.id, 502);
        lastError = err;
        console.warn(`[AI] ${module.model} returned no structured text; trying the next model.`);
        continue;
      }

      try {
        const data = JSON.parse(text);
        recordModelSuccess(module.id);
        console.log(`[AI] ${task} completed with ${module.model}.`);
        return data;
      } catch (parseError) {
        const err = new Error(`${module.model} returned invalid JSON.`);
        err.status = 502;
        recordModelFailure(module.id, 502);
        lastError = err;
        console.warn(`[AI] ${module.model} returned invalid structured JSON; trying the next model.`, parseError);
      }
    } catch (err) {
      lastError = err;
      const status = statusOf(err);
      const networkFailure = isNetworkFailure(err);
      if (!canFallThroughToAnotherModel(err)) {
        console.error(`[AI] ${module.model} failed with a non-fallback error (status=${status || "unknown"}); stopping this route.`, messageOf(err));
        break;
      }
      const failure = status || (networkFailure ? "network/timeout" : "retryable upstream error");
      const nextModule = route.modules[index + 1];
      if (nextModule) {
        console.warn(`[AI] ${module.model} unavailable (${failure}); switching to ${nextModule.label} (${nextModule.model}).`);
      } else {
        console.warn(`[AI] ${module.model} unavailable (${failure}); no configured model routes remain.`);
      }
    }
  }

  console.error("[AI] All routed Gemini calls failed:", lastError);
  throw mapGeminiError(lastError, attempted);
}

export async function reviewResume({ resumeBuffer, jobTitle, jobDescriptionText, jobDescriptionFile }) {
  const hasJobMatch = Boolean(jobDescriptionText?.trim() || jobDescriptionFile);
  const instructions = prepareInstructions({
    jobTitle,
    jobDescriptionText,
    hasJobDescriptionFile: Boolean(jobDescriptionFile),
  });

  const contents = [filePart(resumeBuffer, "application/pdf")];
  if (jobDescriptionFile) contents.push(filePart(jobDescriptionFile.buffer, jobDescriptionFile.mimeType));
  contents.push({ text: instructions });

  const raw = await generateStructured({
    contents,
    schema: reviewSchema(hasJobMatch),
    task: "resume-review",
  });
  const feedback = parseFeedback(JSON.stringify(raw), { requireJobMatch: hasJobMatch });

  // Deterministic ATS scoring is calculated from machine-readable text,
  // independently of whichever LLM intelligence module handled the review.
  const extracted = await extractPdfText(resumeBuffer);
  let atsJobDescription = jobDescriptionText ?? "";
  if (!atsJobDescription.trim() && jobDescriptionFile?.mimeType === "application/pdf") {
    const extractedJob = await extractPdfText(jobDescriptionFile.buffer);
    atsJobDescription = extractedJob.text;
  }
  const atsScore = computeAtsScore({
    resumeText: extracted.text,
    detectedLinks: extracted.links,
    pageCount: extracted.pageCount,
    extractionOk: extracted.extractionOk,
    jobDescriptionText: atsJobDescription,
    jobTitle,
  });

  feedback.ATS.score = atsScore.score;
  feedback.atsMetrics = atsScore;
  return feedback;
}
