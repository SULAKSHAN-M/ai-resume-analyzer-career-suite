import { ScoreBadge } from "~/components/ScoreBadge";
import { cn, scoreTier, tierStyles } from "~/lib/utils";

const METRICS = [
  ["contactDetails", "Contact details"],
  ["standardHeadings", "Standard headings"],
  ["keywordMatch", "Keyword match"],
  ["skillsMatch", "Skills match"],
  ["experienceMatch", "Experience match"],
  ["education", "Education"],
  ["formatting", "Formatting"],
  ["dates", "Dates"],
] as const;

export function ATSBreakdown({ ats }: { ats?: AtsMetrics }) {
  if (!ats) return null;
  return (
    <section aria-labelledby="real-ats-heading" className="border border-rule bg-sheet p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-pencil">Deterministic score</p>
          <h2 id="real-ats-heading" className="mt-1 text-2xl font-bold">ATS compatibility breakdown</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">
            Calculated from machine-readable resume text and measurable checks. This score is separate from the AI opinion.
          </p>
        </div>
        <ScoreBadge score={ats.score} />
      </div>

      <div className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {METRICS.map(([key, label]) => {
          const score = ats.metrics[key];
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between gap-4">
                <span className="font-display text-sm font-semibold">{label}</span>
                <span className={cn("font-display text-sm font-bold tabular-nums", tierStyles[scoreTier(score)].text)}>{score}%</span>
              </div>
              <div className="h-2 bg-paper" aria-label={`${label}: ${score}%`}>
                <div className={cn("h-full", tierStyles[scoreTier(score)].bar)} style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-7 grid gap-5 border-t border-rule pt-6 sm:grid-cols-3">
        <div><p className="font-display text-sm font-semibold">Pages</p><p className="mt-1 text-2xl font-bold">{ats.pageCount || "—"}</p></div>
        <div><p className="font-display text-sm font-semibold">Readable words</p><p className="mt-1 text-2xl font-bold">{ats.wordCount}</p></div>
        <div><p className="font-display text-sm font-semibold">Parser extraction</p><p className="mt-1 text-2xl font-bold">{ats.extractionOk ? "Passed" : "Limited"}</p></div>
      </div>

      {ats.contactDetection && (
        <div className="mt-7 border-t border-rule pt-6">
          <h3 className="text-lg font-bold">Detected contact signals</h3>
          <p className="mt-1 text-sm text-ink-soft">
            Hyperlinks embedded behind Word/PDF labels are checked in addition to visible text.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Email", ats.contactDetection.email],
              ["Phone", ats.contactDetection.phone],
              ["LinkedIn", ats.contactDetection.linkedIn],
              ["GitHub", ats.contactDetection.github],
              ["Portfolio / website", ats.contactDetection.portfolioOrWebsite],
            ].map(([label, found]) => (
              <div key={String(label)} className="border border-rule bg-paper px-3 py-2">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-pencil">{label}</p>
                <p className="mt-1 font-semibold">{found ? "Detected" : "Not detected"}</p>
              </div>
            ))}
          </div>
          {ats.contactDetection.embeddedLinks.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer font-display text-sm font-semibold">
                Embedded PDF links ({ats.contactDetection.embeddedLinks.length})
              </summary>
              <ul className="mt-2 space-y-1 break-all text-sm text-ink-soft">
                {ats.contactDetection.embeddedLinks.map((link) => <li key={link}>{link}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}

      {ats.risks.length > 0 && (
        <div className="mt-7 border-t border-rule pt-6">
          <h3 className="text-lg font-bold">Detected ATS risks</h3>
          <ul className="mt-3 space-y-2 text-ink-soft">
            {ats.risks.map((risk) => <li key={risk}>• {risk}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
