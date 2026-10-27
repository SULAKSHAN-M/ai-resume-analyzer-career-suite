import { Link } from "react-router";
import type { Route } from "./+types/developer";
import { Shell } from "~/components/Shell";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Developer Story | AI Resume Analyzer & Career Suite" },
    { name: "description", content: "The idea, design principles, and practical workflows behind AI Resume Analyzer & Career Suite, designed and developed by SULAKSHAN M." },
  ];
}

const principles = [
  { number: "01", title: "Clarity over guesswork", body: "Feedback should point to concrete next steps. Scores are useful only when the user can understand what to improve and why." },
  { number: "02", title: "AI with a human in control", body: "AI can accelerate review, writing, and practice, but people remain responsible for the truth, tone, and final decisions in their applications." },
  { number: "03", title: "One connected workflow", body: "Resume analysis is only one part of a job search. Matching, career writing, interview practice, versions, and application tracking belong in the same journey." },
];

export default function DeveloperStory() {
  return (
    <Shell>
      <div className="animate-rise-in mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-[#0b1224] px-6 py-10 text-white shadow-2xl shadow-slate-900/15 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="relative grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Behind the product</p>
              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">A clearer path from <span className="text-indigo-300">resume</span> to opportunity.</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">AI Resume Analyzer &amp; Career Suite was shaped around one practical question: how can a job seeker move from scattered advice to a focused, repeatable application workflow?</p>
              <div className="mt-8 flex flex-wrap gap-3"><Link to="/auth" className="rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-indigo-100">Explore the workspace ↗</Link><Link to="/faq" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Read the FAQs</Link></div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-400 text-xl font-black text-white shadow-lg shadow-indigo-500/20">SM</div>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">Designer &amp; developer</p>
              <h2 className="mt-2 text-3xl font-extrabold">SULAKSHAN M</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">Product design, application workflows, and practical AI-assisted career tools brought together in a single project.</p>
              <div className="mt-6 flex flex-wrap gap-2">{["Product thinking", "UX & interface", "AI workflows", "Career tools"].map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">{tag}</span>)}</div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">The story</p>
            <h2 className="mt-3 text-3xl font-extrabold">Why build a Career Suite?</h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>Job applications often involve many separate steps: preparing a resume, checking how it reads, tailoring it to a role, writing a cover letter, practicing for interviews, and remembering where each application stands.</p>
              <p>This project brings those steps together. It combines resume and ATS-oriented feedback with job matching, career writing, interview preparation, resume versions, and an application tracker—so each insight can lead to a useful action.</p>
              <p>The goal is not to promise a perfect resume or a guaranteed result. It is to make the process more organized, explainable, and easier to improve one step at a time.</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">Design principles</p>
            <h2 className="mt-3 text-3xl font-extrabold">Built around the person applying.</h2>
            <div className="mt-5 space-y-3">
              {principles.map((principle) => <article key={principle.number} className="group flex gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-6"><span className="font-display text-2xl font-extrabold text-indigo-300 transition group-hover:text-indigo-600">{principle.number}</span><div><h3 className="text-lg font-extrabold">{principle.title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{principle.body}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div><p className="text-3xl">✦</p><h2 className="mt-3 font-display text-lg font-extrabold">Analyze</h2><p className="mt-2 text-sm leading-7 text-slate-600">Understand strengths, potential gaps, and concrete resume improvements.</p></div>
            <div><p className="text-3xl">↗</p><h2 className="mt-3 font-display text-lg font-extrabold">Prepare</h2><p className="mt-2 text-sm leading-7 text-slate-600">Turn job requirements into tailored application documents and interview practice.</p></div>
            <div><p className="text-3xl">◎</p><h2 className="mt-3 font-display text-lg font-extrabold">Move forward</h2><p className="mt-2 text-sm leading-7 text-slate-600">Keep track of versions, application stages, and the next action to take.</p></div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 p-7 text-white shadow-xl shadow-indigo-600/15 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-100">Designed &amp; Developed by SULAKSHAN M</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">A more thoughtful job-search workflow starts here.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100">Use AI as a helpful assistant, verify the details, and keep the story in your application authentically yours.</p></div><Link to="/auth" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-indigo-700 transition hover:bg-indigo-50">Get started ↗</Link></div>
        </section>
      </div>
    </Shell>
  );
}
