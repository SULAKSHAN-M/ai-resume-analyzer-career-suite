# Five-Model Google AI Intelligence Router

Career Suite v4 uses five stable Gemini Flash-family models behind one server-side router. The user only needs one `GEMINI_API_KEY`.

| Module | Default model | Project role |
|---|---|---|
| Precision | `gemini-3.8-flash` | Highest-accuracy review, tailoring, and answer assessment |
| Advanced Reasoning | `gemini-3.6-flash` | Complex interview preparation and second-pass reasoning |
| Core Analysis | `gemini-3.5-flash-lite` | Balanced general resume/career analysis |
| Career Writer | `gemini-3.1-flash-lite` | Cover-letter and drafting workflows |
| High-Volume Fallback | `gemini-3-flash-preview` | Alternate endpoint for simple structured work |

## Smart task routing

- Resume review: 3.8 Flash → 3.6 Flash → 3.5 Flash-Lite → 3.1 Flash-Lite → 3 Flash Preview
- Resume tailoring: 3.8 Flash → 3.6 Flash → 3.5 Flash-Lite → 3.1 Flash-Lite → 3 Flash Preview
- Cover letter: 3.1 Flash-Lite → 3.5 Flash-Lite → 3.6 Flash → 3.8 Flash → 3 Flash Preview
- Interview preparation: 3.6 Flash → 3.8 Flash → 3.5 Flash-Lite → 3.1 Flash-Lite → 3 Flash Preview
- Interview answer assessment: 3.8 Flash → 3.6 Flash → 3.5 Flash-Lite → 3.1 Flash-Lite → 3 Flash Preview

The ordering is an application-level routing policy, not an endorsement of provider availability. Confirm each model is enabled for the API key in use.

## Failure behavior

- HTTP 404, 408, 429, and any 5xx: immediately move to the next distinct configured model, including SDK errors where status is reported only as text (for example, “Retryable HTTP Error: Service Unavailable”).
- Network errors and timeouts (including Undici `UND_ERR_HEADERS_TIMEOUT`): immediately move to the next distinct model.
- Model-specific 403: try another model unless the error clearly indicates a bad API credential.
- Empty or invalid JSON: try the next model.
- The SDK is configured for one HTTP attempt per model so its internal retries do not delay application-level failover. The request timeout defaults to 45 seconds and can be changed with `GEMINI_REQUEST_TIMEOUT_MS`.
- If all configured models fail, the API returns a clear final error including models attempted. Failover cannot recover from a completely offline machine, DNS/network blocks, or a shared provider-wide outage; it will attempt the remaining models and then report the failure.

## Thinking levels

The router selects a thinking level per task and normalizes it for each model. In particular, Gemini 3.8 Flash and 3.6 Flash do not accept `minimal`, so the router automatically upgrades `minimal` to `low` for those models.

## Routing modes

Set `GEMINI_ROUTING_MODE` in `server/.env`:

- `smart` — task-specific routes (default)
- `quality` — always starts with the Precision route
- `quota-saver` — starts with Flash-Lite and works upward
- `fast` — also starts with Flash-Lite for low latency

## Runtime visibility

`GET /api/ai/status` returns the five configured modules, current routing order, and in-process success/failure counters. No API key or secret is returned. The Career Dashboard renders this as the **5 intelligence modules** panel.

## Current Google references

Verified September 25, 2026:

- Models: https://ai.google.dev/gemini-api/docs/models
- Pricing/free tier: https://ai.google.dev/gemini-api/docs/pricing
- Thinking levels: https://ai.google.dev/gemini-api/docs/thinking

Provider quotas and availability can change. The router improves resilience but cannot guarantee uninterrupted free service.
