/**
 * Normalize Google GenAI SDK errors across SDK versions.
 * Some SDK HTTP errors expose no numeric `status` field; e.g.
 * `Retryable HTTP Error: Service Unavailable`. Parse those human-readable
 * names as well as nested Undici/network causes so the application router can
 * advance to another model instead of stopping after the first one.
 */
function statusFromText(value) {
  const text = String(value ?? "");
  if (!text) return 0;

  // First prefer an explicit HTTP/status code in the SDK message.
  const numeric = text.match(/\b([1-5]\d{2})\b/);
  if (numeric) return Number(numeric[1]);

  const normalized = text.toUpperCase().replace(/[\s-]+/g, "_");
  if (/TOO_MANY_REQUESTS|RESOURCE_EXHAUSTED|RATE_LIMIT(?:ED)?|QUOTA_EXCEEDED/.test(normalized)) return 429;
  if (/SERVICE_UNAVAILABLE|\bUNAVAILABLE\b/.test(normalized)) return 503;
  if (/BAD_GATEWAY/.test(normalized)) return 502;
  if (/GATEWAY_TIMEOUT|DEADLINE_EXCEEDED|REQUEST_TIMEOUT|TIMED_OUT/.test(normalized)) return 504;
  if (/INTERNAL_SERVER_ERROR|INTERNAL_ERROR|INTERNAL_FAILURE/.test(normalized)) return 500;
  if (/NOT_FOUND|MODEL_NOT_AVAILABLE|MODEL_UNAVAILABLE|NOT_SUPPORTED/.test(normalized)) return 404;
  if (/UNAUTHORIZED|UNAUTHENTICATED/.test(normalized)) return 401;
  if (/PERMISSION_DENIED|\bFORBIDDEN\b/.test(normalized)) return 403;
  if (/INVALID_ARGUMENT|BAD_REQUEST/.test(normalized)) return 400;
  return 0;
}

export function statusOf(err) {
  let current = err;
  const seen = new Set();

  for (let depth = 0; current && depth < 8 && !seen.has(current); depth += 1) {
    seen.add(current);
    const numericCandidates = [
      current.status,
      current.statusCode,
      current.response?.status,
      current.response?.statusCode,
      current.error?.status,
    ];
    for (const candidate of numericCandidates) {
      const number = Number(candidate);
      if (Number.isInteger(number) && number >= 100 && number <= 599) return number;
    }

    for (const candidate of [current.code, current.statusText, current.message, current.error]) {
      const parsed = statusFromText(typeof candidate === "string" ? candidate : "");
      if (parsed) return parsed;
      const number = Number(candidate);
      if (Number.isInteger(number) && number >= 100 && number <= 599) return number;
    }
    current = current.cause ?? current.error;
  }
  return 0;
}

export function messageOf(err) {
  const parts = [];
  let current = err;
  const seen = new Set();
  for (let depth = 0; current && depth < 8 && !seen.has(current); depth += 1) {
    seen.add(current);
    if (current.message) parts.push(String(current.message));
    if (typeof current.code === "string") parts.push(current.code);
    if (typeof current.statusText === "string") parts.push(current.statusText);
    current = current.cause ?? current.error;
  }
  return [...new Set(parts)].join(" | ");
}

export function isNetworkFailure(err) {
  let current = err;
  const seen = new Set();
  for (let depth = 0; current && depth < 8 && !seen.has(current); depth += 1) {
    seen.add(current);
    const code = String(current.code ?? "");
    const message = String(current.message ?? "");
    const name = String(current.name ?? "");
    if (
      /^(UND_ERR_|ECONNRESET$|ECONNREFUSED$|ECONNABORTED$|ETIMEDOUT$|EHOSTUNREACH$|ENETUNREACH$|EAI_AGAIN$|ENOTFOUND$|EPIPE$|ERR_SOCKET)/i.test(code) ||
      (name === "TypeError" && /fetch failed/i.test(message)) ||
      /headers timeout|socket hang up|network request failed|fetch failed|connection timed out|request timed out/i.test(message)
    ) return true;
    current = current.cause ?? current.error;
  }
  return false;
}

export function canFallThroughToAnotherModel(err) {
  const status = statusOf(err);
  const message = messageOf(err);
  if (status === 404 || status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599)) {
    return true;
  }
  if (isNetworkFailure(err)) return true;
  // The SDK marks certain upstream failures as retryable even if it doesn't
  // expose a numeric code. Treat those as eligible for an alternate model.
  if (status === 0 && /retryable\s+http\s+error/i.test(message)) return true;
  // Model-specific access restrictions may differ, but a bad key will not be fixed by another model.
  if (status === 403 && !/api.?key|credential|authentication|invalid key/i.test(message)) return true;
  return false;
}
