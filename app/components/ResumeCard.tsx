import { Link } from "react-router";
import { ScoreMark } from "~/components/ScoreMark";
import { resumePreviewUrl } from "~/lib/api";
import { formatDate } from "~/lib/utils";

export function ResumeCard({ resume }: { resume: Resume }) {
  return (
    <Link to={`/resume/${resume.id}`} className="group block h-full rounded-2xl focus-visible:outline-offset-4">
      <article className="relative h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_4px_18px_rgba(15,23,42,0.035)] transition duration-200 group-hover:-translate-y-1 group-hover:border-indigo-200 group-hover:shadow-[0_18px_45px_rgba(79,70,229,0.11)]">
        <div className="relative aspect-[17/16] overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-indigo-50">
          <img
            src={resumePreviewUrl(resume.id)}
            alt={`First page of ${resume.fileName}`}
            loading="lazy"
            className="size-full object-cover object-top transition duration-300 group-hover:scale-[1.025]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 shadow-sm">Resume review</div>
          <ScoreMark score={resume.feedback.overallScore} size="sm" className="absolute bottom-3 right-3 rounded-full bg-white shadow-lg ring-1 ring-slate-200" />
        </div>
        <div className="px-2 pb-3 pt-4">
          <h2 className="line-clamp-2 text-lg font-extrabold leading-tight text-slate-950 transition group-hover:text-indigo-700">{resume.jobTitle || "General review"}</h2>
          <p className="mt-1 truncate text-sm text-slate-500">{resume.companyName || resume.fileName}</p>
          {resume.feedback.jobMatch && <p className="mt-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">Job match: {resume.feedback.jobMatch.score}/100</p>}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><p className="text-xs text-slate-500">{formatDate(resume.createdAt)}</p><span className="text-sm font-bold text-indigo-700 transition group-hover:translate-x-0.5">Open review →</span></div>
        </div>
      </article>
    </Link>
  );
}
