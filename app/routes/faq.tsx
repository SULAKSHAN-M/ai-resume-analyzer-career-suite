import { Link } from "react-router";
import type { Route } from "./+types/faq";
import { Shell } from "~/components/Shell";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "FAQs | AI Resume Analyzer & Career Suite" },
    { name: "description", content: "Answers about resume reviews, ATS scores, AI career tools, job matching, privacy, and troubleshooting." },
  ];
}

const groups = [
  {
    title: "Getting started",
    description: "The essentials for setting up your workspace and understanding the tools.",
    items: [
      { q: "What is AI Resume Analyzer & Career Suite?", a: "It brings resume feedback, ATS-oriented checks, job-description matching, AI writing assistance, interview preparation, resume versions, and application tracking into one workspace. Features depend on the current application configuration." },
      { q: "How do I create an account?", a: "Open Sign in / Create account from the header, switch to Create account, enter a valid email address, and choose a password of at least eight characters. Use an email address you control and keep your password private." },
      { q: "How do I analyze a resume?", a: "Sign in, choose New review, upload a PDF resume, and optionally add the role, company, or job description. Start the analysis and review the feedback. The application has upload limits and expects a supported PDF resume." },
      { q: "Can I use the application without an account?", a: "Public informational pages such as the FAQ, Developer Story, Privacy Policy, and Terms of Use are available without signing in. Personal resume reviews, saved records, and career dashboard features require an account." },
    ],
  },
  {
    title: "ATS scores and resume quality",
    description: "Understand what the results mean—and what they do not mean.",
    items: [
      { q: "What is an Applicant Tracking System (ATS)?", a: "An ATS is software employers may use to collect and organize applications and help recruiters review candidates. Employers configure their systems differently, so there is no universal ATS score or single format that guarantees success." },
      { q: "How is the ATS score calculated?", a: "The app calculates an estimate from local resume-text signals and criteria implemented in its ATS analysis module. Depending on the inputs, feedback may consider structure, contact information, sections, keywords, and job alignment. It is a diagnostic aid, not an employer's official screening result." },
      { q: "Does a high score guarantee an interview or job?", a: "No. Hiring decisions depend on employer requirements, experience, education, eligibility, competition, interviews, timing, and many other factors. Use the score to find improvements, not as a prediction of the hiring outcome." },
      { q: "How can I improve my resume?", a: "Use clear section headings, concise accomplishment-focused bullets, consistent dates and formatting, relevant role-specific keywords, and measurable results where available. Prioritize the top fixes identified by the analysis and keep all statements truthful." },
      { q: "Why did the score change after I ran the analysis again?", a: "The deterministic ATS score should generally be consistent for the same extracted text and settings, but AI-generated commentary may vary. Scores can also change if a different file, job description, or contact-link information is processed." },
      { q: "Does the tool read LinkedIn and GitHub hyperlinks?", a: "The current project includes detection for links embedded in PDF annotations. Results may still vary according to the PDF export method and how the original document stores its hyperlinks. Verify the extracted contact links before applying." },
    ],
  },
  {
    title: "AI career tools",
    description: "Ways to turn feedback into an action plan.",
    items: [
      { q: "Can I tailor my resume to a specific job description?", a: "Yes, where the resume tailoring workflow is available. Provide the role description and use the suggestions to emphasize relevant, real experience. Do not add skills, education, employers, dates, or achievements that are not true." },
      { q: "Can the application write a cover letter?", a: "The career workflows can generate a starting draft for a target job. Verify the company and role details, adapt the tone to your own voice, and ensure every factual claim reflects your actual background before submitting it." },
      { q: "How does skill gap analysis help?", a: "It compares skills identified in your resume with skills mentioned in a target role and surfaces areas to strengthen. AI extraction is imperfect; use the result as a learning checklist and verify the job's actual requirements." },
      { q: "Can I prepare for interviews with it?", a: "Use the interview preparation feature to practice role-specific questions and draft concise examples. Ground your answers in genuine experiences and follow the STAR approach when relevant: Situation, Task, Action, Result." },
      { q: "What are resume versions?", a: "Where enabled, versions let you keep track of tailored or revised resume iterations. Check each version before use so you submit the correct file for the right role." },
    ],
  },
  {
    title: "Job search and application tracking",
    description: "Keep external job listings and your own tracking records clear.",
    items: [
      { q: "Are job listings guaranteed to be current?", a: "No. Listings can expire or change after they are retrieved. Verify the role, salary, location, deadline, eligibility, and application instructions on the original ITPro.lk listing or other linked source before applying." },
      { q: "Does the tool automatically apply to jobs for me?", a: "No automatic submission should be assumed. Job cards can take you to the listing, while the career dashboard can help you track your own progress. Complete and submit the employer's application yourself unless an explicitly documented feature says otherwise." },
      { q: "How do I track an application?", a: "Open Career Suite and use the application tracker. Record the job title, company, URL, status, and useful follow-up notes. Keep the record updated when you apply, get an interview, receive an offer, or close the application." },
    ],
  },
  {
    title: "Privacy, accounts, and troubleshooting",
    description: "Keep your career documents and sign-in details safe.",
    items: [
      { q: "What happens to my resume after upload?", a: "The backend sends the resume and any included job description to the configured Gemini AI service for analysis. The app also saves resume files and review information in its configured storage. Read the Privacy Policy before uploading personal data." },
      { q: "Where is my data stored?", a: "In the provided implementation, structured user and review records use a JSON-backed data store, and resume files are stored in server upload directories by default. A production deployment should configure persistent, access-controlled storage and backup/retention practices. Hosting on an ephemeral filesystem can cause data loss." },
      { q: "How can I delete my saved reviews?", a: "Use the data-management feature in your signed-in workspace. Deleting reviews should remove the associated records and uploaded files managed by the app, but it cannot guarantee deletion of prior backups, logs, or data retained by third-party services." },
      { q: "Why did AI analysis fail?", a: "Check that your server environment contains a valid Gemini API key, your model configuration is supported, your network is working, and the upload is within the allowed limits. Rate limits, temporary outages, invalid keys, and provider-side model availability can also cause failures." },
      { q: "What should I do if I see a blank page or an error?", a: "Refresh once and check that both the frontend and backend are running. In local development, the frontend usually uses port 5173 and the API uses port 4000. Note the exact error from the browser console or terminal; never share your API key, JWT secret, or password when asking for help." },
      { q: "How do I report a bug or ask for help?", a: "Use the support or project contact channel made available by the project maintainer. Include the page, steps that caused the issue, and a redacted error message. Do not attach resumes containing personal information unless that information is necessary and you have chosen to share it." },
    ],
  },
];

export default function FAQ() {
  return (
    <Shell>
      <div className="animate-rise-in mx-auto max-w-5xl">
        <header className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-indigo-300">Help center · Career Suite</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">Frequently asked questions</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">A practical guide to resume analysis, ATS estimates, AI writing tools, job tracking, and using your career workspace with confidence.</p>
          <div className="mt-7 flex flex-wrap gap-2 text-xs font-semibold">
            {["Resume analysis", "AI career tools", "Privacy & accounts"].map((tag) => <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-slate-200">{tag}</span>)}
          </div>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">On this page</p>
            <nav className="mt-4 flex flex-col gap-2">
              {groups.map((group, index) => <a key={group.title} href={`#faq-group-${index}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">{group.title}</a>)}
            </nav>
            <div className="mt-5 border-t border-slate-100 pt-5 text-sm leading-6 text-slate-500">Want to know how the project came together? <Link to="/developer" className="font-semibold text-indigo-700 hover:underline">Read the developer story</Link>.</div>
          </aside>

          <div className="min-w-0 space-y-9">
            {groups.map((group, index) => (
              <section key={group.title} id={`faq-group-${index}`} className="scroll-mt-28">
                <div className="mb-4">
                  <h2 className="text-2xl font-extrabold sm:text-3xl">{group.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{group.description}</p>
                </div>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <details key={item.q} className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.035)] transition open:border-indigo-200 open:shadow-[0_10px_30px_rgba(79,70,229,0.08)] sm:p-6">
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-base font-bold text-slate-900 sm:text-lg">
                        <span>{item.q}</span>
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-normal text-indigo-700 transition group-open:rotate-45 group-open:bg-indigo-50">+</span>
                      </summary>
                      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <section className="mt-12 rounded-3xl border border-indigo-100 bg-indigo-50/75 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-xl font-extrabold">Still have questions?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Check the privacy and terms pages for information about AI processing, data storage, and responsible use.</p></div>
            <div className="flex flex-wrap gap-2"><Link to="/privacy" className="rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100">Privacy policy</Link><Link to="/terms" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Terms of use</Link></div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
