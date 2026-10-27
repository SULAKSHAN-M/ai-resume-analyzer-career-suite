# Updated Setup — Career Suite v4.2

This build includes the complete career suite, the five-model Google Gemini intelligence router, and a cleaned React Router 7/Vite 8 development configuration with the v8 future flags enabled.

## Gemini model pool

By default the backend uses:

- Precision: `gemini-3.8-flash`
- Advanced Reasoning: `gemini-3.6-flash`
- Core Analysis: `gemini-3.5-flash-lite`
- Career Writer: `gemini-3.1-flash-lite`
- High-Volume Fallback: `gemini-3-flash-preview`

The router automatically changes model order by task and fails over on 404, 408, 429, any 5xx, and recognized network timeouts. The recommended routing mode is `smart`. The Google SDK is limited to one attempt per endpoint so the app-level router can advance promptly.

## Run locally

1. Copy `server/.env.example` to `server/.env`.
2. Add a fresh `JWT_SECRET` and your current `GEMINI_API_KEY`.
3. Keep the five distinct default Gemini endpoints unless Google changes availability for your project. If you are upgrading from v4.6.3, update the five `GEMINI_*_MODEL` entries in your existing `server/.env` to the list above; an existing `.env` does not get overwritten when you copy the example file.
4. Keep `GEMINI_ROUTING_MODE=smart`.
5. Keep `ITPRO_API_KEY` blank unless you later use protected recruiter endpoints.
6. From the project root run:

```bash
npm ci
npm run dev
```

If you extracted this version over an older copy of the project and already have a `node_modules` folder, run this once instead:

```bash
npm run reinstall
npm run dev
```

`npm run reinstall` removes stale root/server dependencies and performs a clean `npm ci`. This is the recommended fix if an older React Router installation continues to print the deprecated `envFile` warning.

Frontend: `http://localhost:5173`
API: `http://localhost:4000`
Career dashboard: `http://localhost:5173/career`
AI router status: `http://localhost:4000/api/ai/status`

## Routing modes

- `smart` — chooses the best route for each career task.
- `quality` — starts with the highest-accuracy model for every task.
- `quota-saver` — prioritizes balanced/lighter models before the newest models where appropriate.
- `fast` — starts with Flash-Lite for lowest latency.

## Security

Do not commit `server/.env`. Gemini and ITPro keys stay on the server. The distributable ZIP intentionally contains no real secrets, user resumes, local data file, or uploaded files.
