import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import type { Route } from "./+types/resume";
import { ATS } from "~/components/ATS";
import { ATSBreakdown } from "~/components/ATSBreakdown";
import { Details } from "~/components/Details";
import { JobMatchSection } from "~/components/JobMatch";
import { Jobs } from "~/components/Jobs";
import { SkillGapAnalysis } from "~/components/SkillGap";
import { SectionAnalysis } from "~/components/SectionAnalysis";
import { ResumeVersions } from "~/components/ResumeVersions";
import { Shell } from "~/components/Shell";
import { Summary } from "~/components/Summary";
import { TopFixes } from "~/components/TopFixes";
import { ApiError, api, resumeFileUrl, resumePreviewUrl } from "~/lib/api";
import { useRequireAuth } from "~/lib/useRequireAuth";
import { errorMessage, formatDate, searchTerms } from "~/lib/utils";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Resume review | AI Resume Analyzer & Career Suite" }];
}

type LoadState =
  | { status: "loading" }
  | { status: "missing" }
  | { status: "error"; message: string }
  | { status: "ready"; resume: Resume };

export default function ResumePage() {
  const { id } = useParams();
  const { ready } = useRequireAuth(`/resume/${id}`);
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [previewOk, setPreviewOk] = useState(true);

  useEffect(() => {
    if (!ready || !id) return;
    let cancelled = false;

    api
      .get<{ resume: Resume }>(`/api/resumes/${id}`)
      .then(({ resume }) => {
        if (!cancelled) setState({ status: "ready", resume });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) setState({ status: "missing" });
        else setState({ status: "error", message: errorMessage(err, "Couldn't load this review.") });
      });

    return () => {
      cancelled = true;
    };
  }, [ready, id]);

  if (!ready || state.status === "loading") {
    return (
      <Shell>
        <p className="text-ink-soft" role="status">
          Loading your review…
        </p>
      </Shell>
    );
  }

  if (state.status === "missing" || state.status === "error") {
    return (
      <Shell>
        <div className="max-w-xl" role={state.status === "error" ? "alert" : undefined}>
          <h1 className="text-4xl font-extrabold">
            {state.status === "missing" ? "Review not found" : "Couldn't load this review"}
          </h1>
          <p className="mt-3 text-lg text-ink-soft">
            {state.status === "missing"
              ? "It may have been deleted, or it belongs to a different account."
              : state.message}
          </p>
          <Link to="/" className="mt-6 inline-block font-display font-semibold text-pencil underline underline-offset-2">
            Back to your reviews
          </Link>
        </div>
      </Shell>
    );
  }

  const { resume } = state;
  const { feedback } = resume;

  return (
    <Shell>
      <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="font-display text-sm font-bold text-indigo-700 underline underline-offset-4">
          All reviews
        </Link>
        <h1 className="mt-3 text-4xl font-extrabold">{resume.jobTitle || "General review"}</h1>
        <p className="mt-1 text-ink-soft">
          {resume.companyName ? `${resume.companyName}, reviewed ` : "Reviewed "}
          {formatDate(resume.createdAt)}
        </p>
      </div>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <aside className="lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {previewOk ? (
              <a href={resumeFileUrl(resume.id)} target="_blank" rel="noreferrer" aria-label="Open the full PDF in a new tab">
                <img
                  src={resumePreviewUrl(resume.id)}
                  alt={`First page of ${resume.fileName}`}
                  className="w-full"
                  onError={() => setPreviewOk(false)}
                />
              </a>
            ) : (
              <div className="aspect-[17/22] bg-paper" />
            )}
          </div>
          <p className="mt-3 truncate text-sm text-ink-soft">{resume.fileName}</p>
          <a
            href={resumeFileUrl(resume.id)}
            target="_blank"
            rel="noreferrer"
            className="font-display font-semibold text-pencil underline underline-offset-2"
          >
            Open PDF
          </a>
        </aside>

        <div className="space-y-8">
          <Summary feedback={feedback} />
          {feedback.jobMatch && (
            <JobMatchSection
              match={feedback.jobMatch}
              jobTitle={resume.jobTitle}
              jobDescription={resume.jobDescription}
              jobDescriptionFileName={resume.jobDescriptionFileName}
            />
          )}
          <TopFixes fixes={feedback.topFixes} />
          <ATSBreakdown ats={feedback.atsMetrics} />
          <ATS category={feedback.ATS} />
          <SkillGapAnalysis gap={feedback.skillGap} />
          <SectionAnalysis sections={feedback.sectionAnalysis} />
          <Details feedback={feedback} />
        </div>
      </div>

      <ResumeVersions resume={resume} />
      <Jobs resumeId={resume.id} queries={searchTerms(resume.jobTitle, feedback.suggestedRoles)} />
    </Shell>
  );
}
