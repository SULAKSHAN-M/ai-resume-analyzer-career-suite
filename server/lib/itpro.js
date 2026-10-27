import { HttpError } from "./errors.js";

const REQUEST_TIMEOUT_MS = 10_000;

function baseUrl() {
  return (process.env.ITPRO_API_URL || "https://itpro.lk/api/v1").replace(/\/$/, "");
}

function apiKeyHeaders(apiKey) {
  const key = apiKey?.trim() || process.env.ITPRO_API_KEY?.trim();
  if (!key) {
    throw new HttpError(
      503,
      "This ITPro operation needs an API key. Add ITPRO_API_KEY to server/.env.",
      "not_configured",
    );
  }
  return { "X-API-Key": key };
}

async function request(path, { method = "GET", body, protectedRoute = false, apiKey } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (protectedRoute) Object.assign(headers, apiKeyHeaders(apiKey));

  let response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    console.error("ITPro API request failed:", err);
    throw new HttpError(502, "The ITPro API didn't respond. Try again shortly.", "upstream");
  }

  const data = await response.json().catch(() => null);

  if (response.status === 401 || response.status === 403) {
    throw new HttpError(502, "ITPro rejected the API key.", "upstream");
  }
  if (response.status === 429) {
    throw new HttpError(429, "ITPro is temporarily rate-limiting requests.", "upstream");
  }
  if (!response.ok) {
    throw new HttpError(
      502,
      data?.message || data?.error || `ITPro returned an error (${response.status}).`,
      "upstream",
    );
  }

  return data;
}

// Public endpoints from the supplied OpenAPI document.
export function getITProJobs(limit = 50) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  return request(`/jobs?limit=${safeLimit}`);
}

export function getITProJob(id) {
  return request(`/jobs/${encodeURIComponent(id)}`);
}

export function postITProJob(job) {
  return request("/jobs/post", { method: "POST", body: job });
}

// Protected endpoints. Pass apiKey explicitly or set ITPRO_API_KEY in server/.env.
export function updateITProJob(id, job, apiKey) {
  return request(`/jobs/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: job,
    protectedRoute: true,
    apiKey,
  });
}

export function deleteITProJob(id, apiKey) {
  return request(`/jobs/${encodeURIComponent(id)}`, {
    method: "DELETE",
    protectedRoute: true,
    apiKey,
  });
}

export function getITProJobApplications(id, apiKey) {
  return request(`/jobs/${encodeURIComponent(id)}/applications`, {
    protectedRoute: true,
    apiKey,
  });
}

export function getITProApplication(id, apiKey) {
  return request(`/applications/${encodeURIComponent(id)}`, {
    protectedRoute: true,
    apiKey,
  });
}

export function updateITProApplication(id, body, apiKey) {
  return request(`/applications/${encodeURIComponent(id)}`, {
    method: "PUT",
    body,
    protectedRoute: true,
    apiKey,
  });
}
