# AI Resume Analyzer & Career Suite

A full-stack AI career assistant that analyzes resumes, calculates a deterministic ATS (Applicant Tracking System) compatibility score, matches live IT jobs, generates grounded application materials, and tracks career progress. It uses its own Express/portable JSON backend and calls Gemini directly from the server.

## v4.6 interface refresh

The v4.6 UI update adds a responsive 2026-style navigation bar, refreshed sign-in/register experience, a global footer crediting **SULAKSHAN M**, a Developer Story page, detailed FAQ/Privacy/Terms pages, and a branded not-found route using the supplied 404 illustration. See `V4.6_MODERN_UI.md` for setup and public-launch checks.

New public routes: `/faq`, `/privacy`, `/terms`, and `/developer`. Unknown page paths show the branded 404 view.

## Features

### Resume intelligence
- **Deterministic ATS compatibility score** calculated locally from machine-readable PDF text rather than asking the AI for a single opaque score.
- **ATS sub-scores** for contact details, standard headings, keyword coverage, skills match, experience relevance, education, dates, and formatting.
- **PDF hyperlink-aware contact detection** reads embedded Word/PDF link annotations for LinkedIn, GitHub, portfolio/website, and mail links instead of relying only on visible URL text.
- **Five-model Gemini intelligence router** with task-aware routing, schema-constrained JSON, model-aware thinking levels, short retries, and automatic multi-model failover.
- **Job-aware review** from pasted job text, a job-description PDF, or an image.
- **Skill-gap analysis**: demonstrated skills, requested skills, missing/weak skills, next skills, and practical learning ideas.
- **Detailed section analysis** for Professional Summary, Experience, Education, Projects, Technical Skills, Certifications, Contact Information, and Formatting.
- **Top fixes, suggested roles, and job-match analysis** with matched/missing keywords.

### Job-specific career tools
- **Live ITPro.lk jobs** ranked against the roles suggested from the resume.
- **Tailor Resume for this Job**: creates a truth-guarded resume draft using only facts present in the source resume, then recalculates its ATS score.
- **Tailored resume PDF export** and editable text before download.
- **Resume versions**: save named variants such as `QA CV`, `Business Analyst CV`, or `Software Engineer CV` and compare ATS scores with the original.
- **AI cover-letter generator** with edit, copy, regenerate, and PDF export.
- **Interview preparation** with technical, behavioral, role, and employer-context questions.
- **Mock interview answer assessment** with score, strengths, improvements, and a grounded rewritten answer.

### Career management
- **Application tracker** with `Saved → Applied → Interview → Offer → Rejected` statuses, notes, and next actions.
- **Career dashboard** with average ATS score, score trend, applications, interviews, offers, application pipeline, common missing skills, and target roles.
- **Accounts and private data** backed by a portable JSON data store and cookie sessions.
- **Wipe all data** for the signed-in account.
- **Responsive, keyboard-friendly UI** with reduced-motion support.


## Tooling warning cleanup (v4.2)

This build stays on the current React Router 7 line (`7.18.4`) and pins the compatible Vite toolchain. All published React Router v8 future flags are enabled in `react-router.config.ts`, so the development console no longer needs to print the five v8 migration warnings. Current React Router 7.18.4 also contains the Vite child-compiler fix that replaces the deprecated internal `envFile: false` option.

For a fresh checkout, use `npm ci`. If you copied this build over an older project directory, use `npm run reinstall` once to remove stale `node_modules` before starting the app.

## Architecture

```
Browser  ──►  React SPA (Vite + React Router 7, client-side only)
                    │
                    │  fetch("/api/...") — same origin, cookie-based session
                    ▼
             Express API  (/server)
                    │
        ┌───────────┼─────────────────┐
        ▼           ▼                 ▼
  JSON data     local disk      Gemini 5-model router
  users, reviews, (resume PDFs,   3.8 Flash → 3.6 Flash → 3.5 Flash-Lite → 3.1 Flash-Lite → 3 Flash Preview
  applications,   preview PNGs)   (task-aware ordering + failover)
  resume versions       │
                        └── local PDF text extraction for deterministic ATS scoring
```

The frontend is a plain single-page app: it never talks to a database, a file store, or the AI directly. Everything goes through the Express API in `/server`, which is the only part of this project that holds secrets or touches the database.

**API note:** Gemini availability, quotas, pricing, and data-handling terms can change. This project uses five configurable Gemini models and routes around model-level overload/quota failures, but no hosted AI provider can guarantee uninterrupted service. Review the provider's current terms before using real resumes in production.

## Tech stack

**Frontend** — React 19, TypeScript, React Router 7 (SPA mode), Vite, Tailwind CSS 4, Zustand, pdfjs-dist for resume preview rendering.

**Backend** — Node.js, Express 5, bcryptjs + jsonwebtoken, multer, pdfjs-dist for local ATS text extraction, `@google/genai` for structured AI workflows, and the ITPro.lk Job API.

## Project structure

```
ai-resume-analyzer/
├── app/                      # React SPA
│   ├── components/               # ScoreMark, Summary, ATS, Details, JobMatch,
│   │                              TopFixes, Jobs, JobDescriptionField, FileUploader, ...
│   ├── lib/
│   │   ├── api.ts                    # fetch wrapper for the Express API
│   │   ├── useAuthStore.ts           # Zustand: session state, register/login/logout
│   │   ├── pdf2img.ts                # Client-side resume preview thumbnail (pdf.js)
│   │   ├── useRequireAuth.ts
│   │   └── utils.ts                  # Display helpers (formatting, score tiers, etc.)
│   ├── routes/               # home, auth, upload, resume, career dashboard, wipe
│   ├── app.css                # Tailwind import and design tokens
│   ├── root.tsx               # App root, error boundary
│   └── routes.ts              # Route table
├── server/                   # Express API — the actual backend
│   ├── index.js                   # Entry point: wires everything, serves the built
│   │                                frontend in production
│   ├── db.js                       # Portable JSON persistence: users, resumes, applications, versions
│   ├── middleware/auth.js          # Session cookie verification
│   ├── routes/                     # auth, resumes, jobs, career tools, applications, analytics
│   ├── lib/
│   │   ├── ai.js                       # Five-model failover + structured generation
│   │   ├── modelRouter.js              # Task profiles, thinking levels, model stats
│   │   ├── schemas.js                  # JSON Schemas for AI outputs
│   │   ├── ats.js                      # PDF text extraction + deterministic ATS score
│   │   ├── pdf.js                      # Lightweight PDF export for generated documents
│   │   ├── prompts.js                  # Resume-review prompt/model configuration
│   │   ├── parseFeedback.js            # Normalizes the model's structured reply
│   │   ├── jobs.js / itpro.js          # ITPro client + local job ranking
│   │   ├── storage.js                  # Saves/reads/deletes files on local disk
│   │   ├── passwords.js, tokens.js     # bcrypt hashing, JWT session cookies
│   │   └── errors.js                   # Shared HTTP error type
│   ├── uploads/                    # Resume PDFs + preview PNGs (git-ignored)
│   ├── data.json                   # Portable data store (git-ignored)
│   └── .env.example                # Copy to server/.env
├── constants/                 # Client-side upload size limits
├── public/                    # favicon and pdf.worker.min.mjs
├── scripts/                   # copy-pdf-worker.mjs (runs after npm install)
├── types/                     # Global TypeScript types (Feedback, Resume, JobListing)
├── AI_INTELLIGENCE_ROUTER.md  # Five-model routing/failover design
├── vite.config.ts             # Also proxies /api to the backend in dev
└── package.json                # npm workspace root (includes /server)
```

## Quick start

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- A [Gemini API key](https://aistudio.google.com/apikey) (AI features will not run without one). Check Google AI Studio for the currently available quota/pricing for your account and region.

### Install

```bash
git clone https://github.com/yourusername/AI-Powered-Resume-Analyzer.git
cd ai-resume-analyzer
npm install
```

This is an npm workspace: one `npm install` at the root installs both the frontend and the `server/` backend.

### Configure the backend

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in:

- **`JWT_SECRET`** — required. Any long random string. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **`GEMINI_API_KEY`** — required for AI features. Create/manage it in [Google AI Studio](https://aistudio.google.com/apikey).
- **`ITPRO_API_URL`** — defaults to `https://itpro.lk/api/v1`. `GET /jobs` is public in the API specification used by this project, so no key is required for job listings.
- **`ITPRO_API_KEY`** — optional and server-side only; needed only if you later use protected employer/application-management endpoints.

### Run it

```bash
npm run dev
```

This starts the frontend (Vite, port 5173) and the API (Express, port 4000) together. Open http://localhost:5173 — Vite proxies `/api/*` to the backend, so it behaves exactly like a single site.

### Build for production

```bash
npm run build
npm run start
```

`npm run start` runs **one process** (`server/index.js`) that serves the built frontend and the API together on `PORT` (default 4000). There's no separate frontend server in production.

### Type check

```bash
npm run typecheck
```

## Usage

1. **Create an account** (or sign in).
2. **Upload a resume**: go to "New review", optionally add the company and job title.
3. **Add a job description** (optional): paste it, or attach a PDF or a screenshot. A file is read directly by the AI during the review — nothing is extracted or shown back to you beforehand.
4. **Choose your resume PDF** and click **Analyze resume**.
5. **Wait for the review** — usually well under a minute.
6. **Read the feedback**:
   - Overall score, and detailed tips by section (the weakest section opens first)
   - If a job description was given: a **job match score**, matched and missing keywords, and tips for closing the gap
   - **Fix these first**: the highest-impact changes, in order
   - **Jobs in Sri Lanka**: live listings for roles this resume suits, or a note if job search isn't set up
7. **Manage your data**: "Wipe data" deletes every review and file tied to your account.

## How it works

1. The browser generates a preview thumbnail of the resume's first page client-side (pdf.js) — purely cosmetic, shown on the results page.
2. The resume PDF, the preview PNG, and the job details are POSTed as one multipart request to `POST /api/resumes`.
3. The backend sends the resume PDF straight to Gemini for semantic review. Separately, pdfjs extracts machine-readable resume text locally for the deterministic ATS checks; this is not OCR and scanned/image-only PDFs may have limited local ATS extraction.
4. Gemini is constrained with a JSON response schema, then `server/lib/parseFeedback.js` normalizes the result.
5. The resume PDF and preview PNG are saved to `server/uploads/<userId>/<resumeId>/`, and the review is saved to the local JSON data store.
6. On the results page, suggested job titles are sent to `GET /api/jobs`, which fetches recent ITPro listings and ranks them locally. Job cards can then trigger tailoring, cover-letter, interview, and tracker workflows.
7. Resume variants and application history are stored in the local data store and summarized by `/api/analytics` for the Career Dashboard.

Every `/api/resumes/*` and `/api/jobs` route requires a signed-in session and checks that the resume being accessed belongs to that account.

## AI response format

The review uses a JSON Schema (`server/lib/schemas.js`) so Gemini returns a predictable `Feedback` object. It includes category feedback, skill gaps, eight resume-section analyses, top fixes, suggested roles, and an optional job-match block. The final ATS score shown to the user is then replaced with the deterministic local ATS score from `server/lib/ats.js`.

## Configuration

**Five-model AI router.** The recommended distinct model pool is `gemini-3.8-flash`, `gemini-3.6-flash`, `gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`, and `gemini-3-flash-preview`. Override them with `GEMINI_PRECISION_MODEL`, `GEMINI_ADVANCED_MODEL`, `GEMINI_CORE_MODEL`, `GEMINI_WRITER_MODEL`, and `GEMINI_VOLUME_MODEL`. `GEMINI_ROUTING_MODE=smart` selects task-specific routes; `quality`, `quota-saver`, and `fast` are also supported. A 404, 408, 429, any 5xx, or a recognized network timeout immediately moves to the next distinct configured endpoint. The Google SDK is configured for one attempt per endpoint so application-level failover can run without waiting through the SDK retry budget.


**Change the job search country or provider.** `searchJobs` in `server/lib/jobs.js` is called with `"Sri Lanka"` hardcoded (see `server/routes/jobs.js`). The current provider is ITPro.lk; recent jobs are fetched and ranked locally against the suggested roles. Replace the provider layer in `server/lib/jobs.js` if you later switch APIs.

**Session length.** Sessions last 30 days; change `SESSION_MAX_AGE_MS` and the `expiresIn` in `server/lib/tokens.js` together.

**Upload limits.** Resume/job-description file size limits are defined in two places that must be kept in sync: `constants/index.ts` (client-side check, for a fast error before uploading) and `server/routes/resumes.js` (the real, enforced limit). They're set conservatively (8 MB resume, 4 MB job description file) to stay under Gemini's ~20 MB inline-request limit once both files are base64-encoded together.

**PDF worker.** `public/pdf.worker.min.mjs` is copied from `node_modules/pdfjs-dist` by `npm install`, matching the installed pdf.js version. If the preview thumbnail fails, run `node scripts/copy-pdf-worker.mjs`.

## Deploying

This is one Node process (`npm start`) that needs:

- A writable disk for `server/data.json` and `server/uploads/` — set `DATA_DIR` and `UPLOADS_DIR` in `server/.env` if you want them somewhere specific (both default to inside `server/`).
- The environment variables in `server/.env` set on the host.
- HTTPS in front of it (a reverse proxy is fine) — the session cookie is marked `secure` once `NODE_ENV=production`, so it won't be sent over plain HTTP.

There's no separate frontend host or CDN needed; `npm run build` produces the static files and `server/index.js` serves them itself.

## Troubleshooting

- **"The AI review isn't set up."** Add `GEMINI_API_KEY` to `server/.env` and restart the server.
- **"The AI review's API key was rejected."** Double check the key in `server/.env` — copy it fresh from [Google AI Studio](https://aistudio.google.com/apikey) if unsure.
- **AI rate-limit/unavailable errors.** The backend can fail over across five distinct Gemini endpoints. HTTP 404, 408, 429, any 5xx, and recognized network/timeouts move to the next endpoint. If all five fail, review model access, API quotas, and Google AI service status for your project.
- **ITPro job errors.** `GET /jobs` does not require an API key in the supplied specification. If protected ITPro operations are added later, set `ITPRO_API_KEY` in `server/.env`.
- **Preview thumbnail is blank.** Some scanned or encrypted PDFs can't be rendered client-side; the review itself is unaffected.
- **Session doesn't stick in dev.** Make sure you're opening the app on Vite's port (5173), not the API's port (4000) directly — the proxy is what makes the cookie behave like a same-origin cookie.
- **Server exits immediately on Windows.** Run `npm run check:server` first. v4.4 uses a portable JSON store and no native database addon, removing the most common Node/Windows binary mismatch.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## More resources

- [Gemini API docs](https://ai.google.dev/gemini-api/docs)
- [ITPro.lk](https://itpro.lk/)
- [React Router docs](https://reactrouter.com/)
- [Express docs](https://expressjs.com/)


### ITPro application flow
Job cards always link to the ITPro.lk job-detail page first. Users can then apply from ITPro instead of being sent directly to an employer website.

## PDF font-warning fix (v4.3)

The server-side ATS parser now runs PDF.js in errors-only verbosity. Non-fatal embedded TrueType hinting messages such as `TT: undefined function` and `TT: invalid function id` are no longer printed, while real extraction failures remain visible in the server log. Text reconstruction also preserves page line endings for better ATS section detection.



## v4.6.3 — Gemini failover reliability

Network errors including `TypeError: fetch failed` and nested Undici timeout codes now trigger the next configured model, like HTTP 404, 429, and 5xx errors. The SDK uses one attempt per model so application-level failover controls the route progression. Per-model timeout defaults to 45 seconds and is configurable with `GEMINI_REQUEST_TIMEOUT_MS`. See `V4.6.3_GEMINI_FAILOVER_FIX.md` and `V4.6.4_GEMINI_FAILOVER_FIX.md`.
