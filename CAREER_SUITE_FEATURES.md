# Career Suite Upgrade

This build adds the ten requested upgrades on top of the original resume analyzer.

## 1. Deterministic ATS score
`server/lib/ats.js` extracts machine-readable PDF text with pdfjs and calculates a weighted score for contact details, headings, keywords, skills, experience relevance, education, dates, and formatting. Gemini does not determine this final ATS number.

## 2. Job-specific resume tailoring
Every ITPro job card has **Tailor resume**. The server sends the original PDF plus job data to Gemini under a strict truth rule: only facts visible in the source resume may appear in the tailored version. The result is editable, rescored, saveable as a version, and exportable as PDF.

## 3. Skill gap analysis
New reviews contain demonstrated skills, requested skills, missing skills, weakly evidenced skills, recommended next skills, and practical learning suggestions. Tailored job views also show target-job skills and requirements intentionally kept out because they were not supported by the resume.

## 4. Cover-letter generator
Each job can generate an editable cover letter using the resume and job description. It supports copy, regenerate, edit, and PDF export.

## 5. Interview preparation
Each job can generate technical, behavioral, role-specific, and employer-context questions. The user can type an answer to any question and receive a grounded assessment and improved answer.

## 6. Application tracker
Jobs can be saved into the portable local data store and managed on `/career` through `Saved`, `Applied`, `Interview`, `Offer`, and `Rejected`, with notes and next actions.

## 7. Resume versions and comparison
Tailored resumes can be given names such as `QA CV` or `Business Analyst CV`. Saved versions are compared with the original resume's ATS score on the resume review page.

## 8. Structured AI output
Gemini calls use `responseSchema` with schemas in `server/lib/schemas.js`, reducing malformed JSON and making each AI workflow predictable.

## 9. Detailed section analysis
The review produces separate analysis for Professional Summary, Experience, Education, Projects, Technical Skills, Certifications, Contact Information, and Formatting.

## 10. Career dashboard
`/career` summarizes average ATS, review trends, applications, interviews, offers, pipeline status, common missing skills, top target roles, and saved resume-version count.

## Main new API routes

- `POST /api/career/tailor`
- `POST /api/career/cover-letter`
- `POST /api/career/interview`
- `POST /api/career/interview/assess`
- `GET|POST /api/career/versions`
- `DELETE /api/career/versions/:id`
- `POST /api/career/pdf`
- `GET|POST /api/applications`
- `PUT|DELETE /api/applications/:id`
- `GET /api/analytics`

## Existing databases
Career Suite v4.4 stores accounts, reviews, applications, and resume versions in `server/data.json`, avoiding native database binaries. The data file is created automatically on first write.

## 11. Five-model Gemini intelligence router
Career Suite v4 adds five independent Google Gemini model tiers:

1. `gemini-3.8-flash` — Precision
2. `gemini-3.6-flash` — Advanced Reasoning
3. `gemini-3.5-flash-lite` — Core Analysis
4. `gemini-3.1-flash-lite` — Career Writer
5. `gemini-3-flash-preview` — High-Volume Fallback

The router is task-aware: resume review/tailoring favor the accuracy route, interview preparation favors advanced reasoning, cover letters favor the writing route, and Flash-Lite remains the final high-volume fallback. HTTP 404, 408, 429, any 5xx, and recognized network timeouts move directly to the next configured distinct model. Thinking levels are normalized per model so incompatible Flash endpoints do not receive the unsupported `minimal` level.

`GET /api/ai/status` exposes the configured model pool, routes, and in-process success/failure counters without exposing API keys. The Career Dashboard displays those five modules.
