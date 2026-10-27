import test from "node:test";
import assert from "node:assert/strict";
import { canFallThroughToAnotherModel, isNetworkFailure, statusOf } from "../server/lib/geminiErrors.js";

test("SDK message-only 503 Service Unavailable advances the model route", () => {
  const err = new Error("Retryable HTTP Error: Service Unavailable");
  assert.equal(statusOf(err), 503);
  assert.equal(canFallThroughToAnotherModel(err), true);
});

test("SDK Resource Exhausted advances the model route as HTTP 429", () => {
  const err = new Error("Retryable HTTP Error: RESOURCE_EXHAUSTED");
  assert.equal(statusOf(err), 429);
  assert.equal(canFallThroughToAnotherModel(err), true);
});

test("404 not found advances so a missing model endpoint does not block later models", () => {
  const err = new Error("404 Not Found: model not found");
  assert.equal(statusOf(err), 404);
  assert.equal(canFallThroughToAnotherModel(err), true);
});

test("every 5xx status advances to the next model", () => {
  for (let status = 500; status <= 599; status += 1) {
    const err = Object.assign(new Error(`HTTP ${status}`), { status });
    assert.equal(canFallThroughToAnotherModel(err), true, `Expected ${status} to fail over`);
  }
});

test("nested Undici header timeouts advance to the next model", () => {
  const cause = Object.assign(new Error("Headers Timeout Error"), { code: "UND_ERR_HEADERS_TIMEOUT" });
  const err = new TypeError("fetch failed", { cause });
  assert.equal(isNetworkFailure(err), true);
  assert.equal(canFallThroughToAnotherModel(err), true);
});

test("invalid API key errors do not futilely retry other models", () => {
  const err = Object.assign(new Error("API key invalid"), { status: 401 });
  assert.equal(canFallThroughToAnotherModel(err), false);
});

