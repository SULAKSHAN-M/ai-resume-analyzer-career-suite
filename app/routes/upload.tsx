import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import type { Route } from "./+types/upload";
import { FileUploader } from "~/components/FileUploader";
import { JobDescriptionField } from "~/components/JobDescriptionField";
import { Shell } from "~/components/Shell";
import { api } from "~/lib/api";
import { convertPdfToImage } from "~/lib/pdf2img";
import { useRequireAuth } from "~/lib/useRequireAuth";
import { cn, errorMessage } from "~/lib/utils";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "New resume review | AI Resume Analyzer & Career Suite" },
    { name: "description", content: "Upload a resume and receive actionable ATS-oriented feedback and job-match guidance." },
  ];
}

const STEPS = ["Creating a preview", "Reviewing with AI", "Saving your review"] as const;
const fieldClass = "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

export default function Upload() {
  const navigate = useNavigate();
  const { ready } = useRequireAuth("/upload");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const working = step !== null;

  const analyze = async (resume: File) => {
    try {
      setStep(0);
      const { file: preview } = await convertPdfToImage(resume);
      const form = new FormData();
      form.set("companyName", companyName.trim());
      form.set("jobTitle", jobTitle.trim());
      form.set("resume", resume);
      if (preview) form.set("preview", preview);
      if (jobDescriptionFile) form.set("jobDescriptionFile", jobDescriptionFile);
      else if (jobDescriptionText.trim()) form.set("jobDescriptionText", jobDescriptionText.trim());
      setStep(1);
      const { resume: saved } = await api.post<{ resume: Resume }>("/api/resumes", form);
      setStep(2);
      navigate(`/resume/${saved.id}`);
    } catch (err) {
      setError(errorMessage(err, "The review didn't finish. Try again."));
      setStep(null);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resumeFile) {
      setError("Choose a PDF resume first.");
      return;
    }
    setError(null);
    void analyze(resumeFile);
  };

  return (
    <Shell>
      <div className="animate-rise-in mx-auto max-w-6xl">
        {!ready ? (
          <div role="status" className="rounded-3xl border border-slate-200 bg-white p-7"><p className="text-sm font-semibold text-slate-500">Checking your secure session…</p></div>
        ) : working ? (
          <section aria-live="polite" className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">Analysis in progress</p>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">Reviewing your resume</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">Keep this tab open while the file is prepared and the AI review completes.</p>
            <ol className="mt-8 space-y-4">
              {STEPS.map((label, i) => {
                const done = i < step;
                const current = i === step;
                return <li key={label} aria-current={current ? "step" : undefined} className={cn("flex items-center gap-4 rounded-2xl border p-4 font-display font-bold", done ? "border-emerald-100 bg-emerald-50 text-emerald-800" : current ? "border-indigo-200 bg-indigo-50 text-indigo-900" : "border-slate-100 bg-slate-50 text-slate-400")}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm shadow-sm" aria-hidden="true">{done ? "✓" : current ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /> : String(i + 1).padStart(2, "0")}</span><span>{label}<span className="sr-only">{done ? " (done)" : current ? " (in progress)" : ""}</span></span></li>;
              })}
            </ol>
          </section>
        ) : (
          <div className="grid items-start gap-7 lg:grid-cols-[0.75fr_1.25fr] lg:gap-8">
            <aside className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8 lg:sticky lg:top-28">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
              <div className="relative"><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-indigo-300">New analysis</p><h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Give your resume a clearer direction.</h1><p className="mt-4 text-sm leading-7 text-slate-300">Add your resume and, if you have one, the job description. Your review will help you prioritize improvements for the opportunity you want.</p>
                <div className="mt-7 space-y-4">{[["1", "Upload a PDF", "Your resume is the starting point."], ["2", "Add a target role", "Optional, but useful for job-match feedback."], ["3", "Review the priorities", "Use the strongest recommendations first."]].map(([n,title,body]) => <div key={n} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 font-display text-sm font-extrabold text-indigo-200">{n}</span><div><h2 className="text-sm font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-400">{body}</p></div></div>)}</div>
                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.06] p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-300">Good to know</p><p className="mt-2 text-sm leading-6 text-slate-300">Keep information accurate. An ATS score is an estimate and never a hiring guarantee.</p><Link to="/faq" className="mt-3 inline-block text-sm font-bold text-indigo-200 hover:text-white">Read the FAQs ↗</Link></div>
              </div>
            </aside>

            <form onSubmit={handleSubmit} noValidate className="rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-[0_12px_50px_rgba(23,37,84,0.06)] sm:p-8 lg:p-9">
              <div className="border-b border-slate-100 pb-6"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-indigo-600">Review details</p><h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Set up your resume review</h2><p className="mt-2 text-sm leading-6 text-slate-500">Role details are optional. Adding the job description enables more relevant matching feedback.</p></div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block"><span className="text-sm font-bold text-slate-800">Company <span className="font-normal text-slate-400">(optional)</span></span><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Example Technologies" className={fieldClass} /></label>
                <label className="block"><span className="text-sm font-bold text-slate-800">Target job title <span className="font-normal text-slate-400">(optional)</span></span><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Business Analyst Intern" className={fieldClass} /></label>
              </div>
              <div className="mt-6"><JobDescriptionField text={jobDescriptionText} onTextChange={setJobDescriptionText} file={jobDescriptionFile} onFileChange={setJobDescriptionFile} /></div>
              <div className="mt-6"><span className="text-sm font-bold text-slate-800">Your resume <span className="text-rose-600">*</span></span><p className="mt-1 text-xs text-slate-500">PDF only. Check the on-screen file-size limit before uploading.</p><div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-3 transition hover:border-indigo-300"><FileUploader file={resumeFile} onChange={(file) => { setResumeFile(file); setError(null); }} /></div></div>
              {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"><strong>We couldn’t start the review.</strong><p className="mt-1">{error}</p></div>}
              <button type="submit" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3.5 font-display text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-blue-700">Analyze resume <span aria-hidden="true">↗</span></button>
              <p className="mt-4 text-center text-xs leading-5 text-slate-500">By uploading, you confirm you’re authorized to share the document for analysis. <Link to="/privacy" className="font-semibold text-indigo-700 hover:underline">Privacy details</Link>.</p>
            </form>
          </div>
        )}
      </div>
    </Shell>
  );
}
