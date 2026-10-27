import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/home";
import { ResumeCard } from "~/components/ResumeCard";
import { Shell } from "~/components/Shell";
import { api } from "~/lib/api";
import { useRequireAuth } from "~/lib/useRequireAuth";
import { errorMessage } from "~/lib/utils";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Workspace | AI Resume Analyzer & Career Suite" },
    { name: "description", content: "Your saved resume reviews, ATS-oriented feedback, and next steps in one workspace." },
  ];
}

export default function Home() {
  const { ready } = useRequireAuth("/");
  const [resumes, setResumes] = useState<Resume[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    api
      .get<{ resumes: Resume[] }>("/api/resumes")
      .then(({ resumes }) => {
        if (!cancelled) setResumes(resumes);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err, "Couldn't load your reviews."));
      });

    return () => {
      cancelled = true;
    };
  }, [ready, reloadToken]);

  const metrics = useMemo(() => {
    if (!resumes?.length) return { average: 0, matches: 0, latest: "No reviews yet" };
    const average = Math.round(resumes.reduce((sum, resume) => sum + (resume.feedback.overallScore ?? 0), 0) / resumes.length);
    const matches = resumes.filter((resume) => Boolean(resume.feedback.jobMatch)).length;
    const latestDate = resumes.reduce((latest, resume) => resume.createdAt > latest ? resume.createdAt : latest, resumes[0].createdAt);
    return {
      average,
      matches,
      latest: new Date(latestDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
    };
  }, [resumes]);

  return (
    <Shell>
      <div className="animate-rise-in mx-auto max-w-6xl">
        {!ready || resumes === null && !error ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm" role="status">
            <div className="flex items-center gap-3"><span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /><p className="text-sm font-semibold text-slate-600">{!ready ? "Checking your secure session…" : "Preparing your workspace…"}</p></div>
          </div>
        ) : error ? (
          <section role="alert" className="rounded-3xl border border-rose-200 bg-white p-7 shadow-sm sm:p-9">
            <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-rose-700">Workspace unavailable</span>
            <h1 className="mt-4 text-3xl font-extrabold">We couldn’t load your reviews.</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">{error}</p>
            <button type="button" onClick={() => { setError(null); setResumes(null); setReloadToken((value) => value + 1); }} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Try again</button>
          </section>
        ) : resumes.length === 0 ? (
          <>
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
              <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-indigo-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Your career workspace</p>
                  <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">Your next opportunity deserves a <span className="text-indigo-300">stronger story.</span></h1>
                  <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">Start with one resume. Get actionable feedback, check role alignment, and turn your next application into a more confident step forward.</p>
                  <div className="mt-8 flex flex-wrap gap-3"><Link to="/upload" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:-translate-y-0.5 hover:bg-indigo-100">＋ Review my resume</Link><Link to="/career" className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Explore Career Suite ↗</Link></div>
                  <p className="mt-5 text-xs text-slate-400">Your results are a guide—not a guarantee of an employer’s decision.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {[
                    ["01", "Analyze", "Find strengths and specific improvements."],
                    ["02", "Match", "Compare your resume with a role."],
                    ["03", "Move forward", "Track applications and your next action."],
                  ].map(([n, title, body]) => <div key={n} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/25 font-display text-sm font-extrabold text-indigo-200">{n}</span><div><h2 className="font-display font-bold text-white">{title}</h2><p className="mt-1 text-sm leading-6 text-slate-400">{body}</p></div></div>)}
                </div>
              </div>
            </section>
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              {[ ["Resume feedback", "A structured review with actionable priority fixes."], ["Career writing", "Draft and refine role-specific application content."], ["Application tracking", "Keep your opportunities, statuses, and follow-ups organized."] ].map(([title, body]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 h-1 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400"/><h2 className="font-display text-lg font-extrabold">{title}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{body}</p></article>)}
            </section>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-600">Your workspace</p><h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Keep your momentum.</h1><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Your reviews, resume progress, and job-focused feedback in one place.</p></div>
              <Link to="/upload" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-700">＋ New review</Link>
            </div>
            <section aria-label="Resume review summary" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Saved reviews", String(resumes.length), "Your review history"],
                ["Average ATS estimate", `${metrics.average}/100`, "Across saved reviews"],
                ["Job-matched reviews", String(metrics.matches), "Reviews with a target role"],
                ["Most recent review", metrics.latest, "Latest saved analysis"],
              ].map(([label, value, help]) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-3 break-words font-display text-2xl font-extrabold text-slate-950 sm:text-3xl">{value}</p><p className="mt-2 text-xs text-slate-500">{help}</p></article>)}
            </section>
            <div className="mb-5 mt-11 flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-extrabold">Recent reviews</h2><p className="mt-1 text-sm text-slate-500">{resumes.length} saved {resumes.length === 1 ? "review" : "reviews"}, newest first.</p></div><Link to="/career" className="text-sm font-bold text-indigo-700 hover:underline">Open Career Suite ↗</Link></div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{resumes.map((resume) => <li key={resume.id}><ResumeCard resume={resume} /></li>)}</ul>
          </>
        )}
      </div>
    </Shell>
  );
}
