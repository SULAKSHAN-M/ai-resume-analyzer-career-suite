import { useState } from "react";
import { api } from "~/lib/api";
import { errorMessage } from "~/lib/utils";

const button = "border border-rule bg-sheet px-3 py-2 font-display text-sm font-semibold hover:border-pencil hover:text-pencil disabled:cursor-not-allowed disabled:opacity-50";
const primary = "bg-pencil px-3 py-2 font-display text-sm font-semibold text-white hover:bg-pencil-deep disabled:opacity-50";

async function downloadPdf(title: string, text: string, filename: string) {
  const response = await fetch("/api/career/pdf", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, text, filename }),
  });
  if (!response.ok) throw new Error("PDF export failed.");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function MockQuestion({ resumeId, job, item }: { resumeId: string; job: JobListing; item: InterviewQuestion }) {
  const [answer, setAnswer] = useState("");
  const [assessment, setAssessment] = useState<AnswerAssessment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const assess = async () => {
    if (!answer.trim()) return;
    setBusy(true); setError("");
    try {
      const result = await api.post<{ assessment: AnswerAssessment }>("/api/career/interview/assess", {
        resumeId, job, question: item.question, answer,
      });
      setAssessment(result.assessment);
    } catch (err) { setError(errorMessage(err, "Couldn't assess this answer.")); }
    finally { setBusy(false); }
  };

  return (
    <details className="border-t border-rule py-4 first:border-t-0">
      <summary className="cursor-pointer font-display font-semibold">{item.question}</summary>
      <p className="mt-2 text-sm text-ink-soft"><strong>Why it is asked:</strong> {item.whyAsked}</p>
      {item.answerStructure.length > 0 && <div className="mt-3"><p className="text-sm font-semibold">Suggested structure</p><ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-ink-soft">{item.answerStructure.map((x) => <li key={x}>{x}</li>)}</ol></div>}
      {item.evidenceToUse.length > 0 && <div className="mt-3"><p className="text-sm font-semibold">Evidence from your resume</p><ul className="mt-1 space-y-1 text-sm text-ink-soft">{item.evidenceToUse.map((x) => <li key={x}>• {x}</li>)}</ul></div>}
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={5} placeholder="Type your mock interview answer…" className="mt-4 w-full border border-rule bg-sheet p-3 text-sm" />
      <button type="button" onClick={() => void assess()} disabled={busy || !answer.trim()} className={`mt-2 ${primary}`}>{busy ? "Assessing…" : "Assess my answer"}</button>
      {error && <p className="mt-2 text-sm text-fix">{error}</p>}
      {assessment && <div className="mt-4 bg-paper p-4">
        <div className="flex items-center justify-between gap-4"><h4 className="font-bold">Answer assessment</h4><span className="font-display text-lg font-bold">{assessment.score}/100</span></div>
        <p className="mt-2 text-sm">{assessment.verdict}</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2"><div><p className="text-sm font-semibold text-good">Strengths</p><ul className="mt-1 text-sm text-ink-soft">{assessment.strengths.map((x) => <li key={x}>• {x}</li>)}</ul></div><div><p className="text-sm font-semibold text-fix">Improve</p><ul className="mt-1 text-sm text-ink-soft">{assessment.improvements.map((x) => <li key={x}>• {x}</li>)}</ul></div></div>
        <p className="mt-3 text-sm font-semibold">Improved answer</p><p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{assessment.improvedAnswer}</p>
      </div>}
    </details>
  );
}

export function JobActions({ resumeId, job }: { resumeId: string; job: JobListing }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [tailoring, setTailoring] = useState<TailoredResume | null>(null);
  const [tailoredAts, setTailoredAts] = useState<AtsMetrics | null>(null);
  const [tailoredText, setTailoredText] = useState("");
  const [cover, setCover] = useState<CoverLetter | null>(null);
  const [coverText, setCoverText] = useState("");
  const [interview, setInterview] = useState<InterviewPrep | null>(null);
  const [versionSaved, setVersionSaved] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");

  const run = async (kind: string, work: () => Promise<void>) => {
    setBusy(kind); setError("");
    try { await work(); }
    catch (err) { setError(errorMessage(err, `Couldn't ${kind}.`)); }
    finally { setBusy(null); }
  };

  const saveJob = () => run("save this job", async () => {
    await api.post("/api/applications", {
      resumeId, externalJobId: job.id, title: job.title, company: job.company,
      location: job.location, url: job.link, status: "Saved",
    });
    setSaved(true);
  });

  const tailor = () => run("tailor the resume", async () => {
    const result = await api.post<{ tailoring: TailoredResume; ats: AtsMetrics }>("/api/career/tailor", { resumeId, job });
    setTailoring(result.tailoring); setTailoredAts(result.ats); setTailoredText(result.tailoring.plainTextResume); setVersionLabel(result.tailoring.versionLabel || `${job.title} CV`); setVersionSaved(false);
  });

  const generateCover = (variation = "") => run("generate the cover letter", async () => {
    const result = await api.post<{ coverLetter: CoverLetter }>("/api/career/cover-letter", { resumeId, job, variation });
    setCover(result.coverLetter); setCoverText(result.coverLetter.fullText);
  });

  const prepareInterview = () => run("prepare the interview", async () => {
    const result = await api.post<{ interview: InterviewPrep }>("/api/career/interview", { resumeId, job });
    setInterview(result.interview);
  });

  const saveVersion = () => run("save this resume version", async () => {
    if (!tailoring || !tailoredAts) return;
    await api.post("/api/career/versions", {
      resumeId, label: versionLabel.trim() || tailoring.versionLabel || `${job.title} version`, job,
      content: { ...tailoring, plainTextResume: tailoredText }, ats: tailoredAts,
    });
    setVersionSaved(true);
    window.dispatchEvent(new CustomEvent("resume-version-saved", { detail: { resumeId } }));
  });

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <a href={job.link} target="_blank" rel="noopener noreferrer" className={primary}>
          View & apply on ITPro
        </a>
        <button type="button" onClick={() => void saveJob()} disabled={Boolean(busy) || saved} className={button}>{saved ? "Saved to tracker" : "Save job"}</button>
        <button type="button" onClick={() => void tailor()} disabled={Boolean(busy)} className={primary}>{busy === "tailor the resume" ? "Tailoring…" : "Tailor resume"}</button>
        <button type="button" onClick={() => void generateCover()} disabled={Boolean(busy)} className={button}>{busy === "generate the cover letter" ? "Writing…" : "Generate cover letter"}</button>
        <button type="button" onClick={() => void prepareInterview()} disabled={Boolean(busy)} className={button}>{busy === "prepare the interview" ? "Preparing…" : "Prepare for interview"}</button>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-fix">{error}</p>}

      {tailoring && tailoredAts && <section className="mt-5 border-l-4 border-pencil bg-paper p-4">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="text-lg font-bold">Tailored resume draft</h4><p className="text-sm text-ink-soft">Truth-guarded rewrite for {job.title}. Missing requirements are not silently added.</p></div><span className="font-display text-lg font-bold">ATS {tailoredAts.score}/100</span></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><p className="text-sm font-semibold">Skills detected for this match</p><p className="mt-1 text-sm text-ink-soft">{tailoredAts.detectedSkills.length ? tailoredAts.detectedSkills.join(" · ") : "No standard skills detected."}</p></div>
          <div><p className="text-sm font-semibold">Target-job skills</p><p className="mt-1 text-sm text-ink-soft">{tailoredAts.targetSkills.length ? tailoredAts.targetSkills.join(" · ") : "No standard target skills detected."}</p></div>
        </div>
        {tailoring.missingButNotClaimed.length > 0 && <div className="mt-4"><p className="text-sm font-semibold">Missing requirements kept out of the resume</p><p className="mt-1 text-sm text-ink-soft">{tailoring.missingButNotClaimed.join(" · ")}</p></div>}
        <textarea value={tailoredText} onChange={(e) => setTailoredText(e.target.value)} rows={18} className="mt-4 w-full border border-rule bg-sheet p-3 font-mono text-xs leading-relaxed" aria-label="Editable tailored resume" />
        <label className="mt-3 block max-w-sm text-sm font-semibold">Version name
          <input value={versionLabel} onChange={(e) => { setVersionLabel(e.target.value); setVersionSaved(false); }} placeholder="e.g. QA CV" className="mt-1 block w-full border border-rule bg-sheet px-3 py-2 font-normal" />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void downloadPdf(`${job.title} — Tailored Resume`, tailoredText, `${job.title}-tailored-resume.pdf`)} className={button}>Download PDF</button>
          <button type="button" onClick={() => void saveVersion()} disabled={Boolean(busy) || versionSaved} className={button}>{versionSaved ? "Version saved" : "Save as resume version"}</button>
        </div>
      </section>}

      {cover && <section className="mt-5 border-l-4 border-good bg-paper p-4">
        <h4 className="text-lg font-bold">AI cover letter</h4>
        <p className="mt-1 text-sm text-ink-soft">Editable before copying or exporting.</p>
        <textarea value={coverText} onChange={(e) => setCoverText(e.target.value)} rows={14} className="mt-4 w-full border border-rule bg-sheet p-3 text-sm leading-relaxed" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => void navigator.clipboard.writeText(coverText)} className={button}>Copy</button>
          <button type="button" onClick={() => void generateCover("Use a noticeably different opening and structure while keeping every factual claim grounded in the resume.")} disabled={Boolean(busy)} className={button}>Regenerate</button>
          <button type="button" onClick={() => void downloadPdf(cover.subject || `Cover Letter — ${job.title}`, coverText, `${job.title}-cover-letter.pdf`)} className={button}>Export PDF</button>
        </div>
      </section>}

      {interview && <section className="mt-5 border-l-4 border-marker bg-paper p-4">
        <h4 className="text-lg font-bold">Interview preparation</h4>
        <p className="mt-2 text-sm text-ink-soft">{interview.roleSummary}</p>
        <div className="mt-3"><p className="text-sm font-semibold">Focus areas</p><p className="mt-1 text-sm text-ink-soft">{interview.focusAreas.join(" · ")}</p></div>
        <div className="mt-4 border-y border-rule bg-sheet px-4">{interview.questions.map((item) => <MockQuestion key={item.id || item.question} resumeId={resumeId} job={job} item={item} />)}</div>
        <div className="mt-4 grid gap-5 md:grid-cols-2"><div><h5 className="font-bold">Questions to ask the employer</h5><ul className="mt-2 space-y-1 text-sm text-ink-soft">{interview.questionsToAskEmployer.map((x) => <li key={x}>• {x}</li>)}</ul></div><div><h5 className="font-bold">Final checklist</h5><ul className="mt-2 space-y-1 text-sm text-ink-soft">{interview.finalChecklist.map((x) => <li key={x}>• {x}</li>)}</ul></div></div>
      </section>}
    </div>
  );
}
