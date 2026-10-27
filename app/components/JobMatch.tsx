import { ScoreMark } from "~/components/ScoreMark";
import { TipList } from "~/components/TipList";
import { matchVerdict } from "~/lib/utils";

function KeywordGroup({ title, words, missing }: { title: string; words: string[]; missing?: boolean }) {
  if (words.length === 0) return null;
  return (
    <div>
      <h3 className="text-lg font-bold">{title}</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {words.map((word) => (
          <li
            key={word}
            className={
              missing
                ? "bg-marker/70 px-2.5 py-1 text-sm font-medium"
                : "border border-good/30 bg-good-wash px-2.5 py-1 text-sm text-good"
            }
          >
            {word}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface JobMatchProps {
  match: JobMatch;
  jobTitle: string;
  jobDescription: string;
  /** Set instead of jobDescription when a PDF or image was used rather than pasted text. */
  jobDescriptionFileName?: string;
}

export function JobMatchSection({ match, jobTitle, jobDescription, jobDescriptionFileName }: JobMatchProps) {
  return (
    <section aria-labelledby="match-heading" className="border border-rule bg-sheet p-6 sm:p-8">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
        <ScoreMark score={match.score} size="md" draw />
        <div className="min-w-0">
          <h2 id="match-heading" className="text-2xl font-bold">
            {matchVerdict(match.score)}
          </h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            How well your resume fits {jobTitle ? `the ${jobTitle} job` : "this job"}
          </p>
          {match.summary && <p className="mt-3 max-w-prose leading-relaxed">{match.summary}</p>}
        </div>
      </div>

      {(match.matchedKeywords.length > 0 || match.missingKeywords.length > 0) && (
        <div className="mt-8 space-y-6 border-t border-rule pt-6">
          <KeywordGroup title="In your resume and the job post" words={match.matchedKeywords} />
          <KeywordGroup title="In the job post, missing from your resume" words={match.missingKeywords} missing />
        </div>
      )}

      {match.tips.length > 0 && (
        <div className="mt-8 border-t border-rule pt-6">
          <h3 className="mb-4 text-lg font-bold">How to close the gap</h3>
          <TipList tips={match.tips} />
        </div>
      )}

      {jobDescription ? (
        <details className="mt-8 border-t border-rule pt-4">
          <summary className="cursor-pointer font-display font-semibold text-pencil">
            Job description used for this match
          </summary>
          <p className="mt-3 max-h-72 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap text-ink-soft">
            {jobDescription}
          </p>
        </details>
      ) : (
        jobDescriptionFileName && (
          <p className="mt-8 border-t border-rule pt-4 text-sm text-ink-soft">
            Matched against an attached file: {jobDescriptionFileName}
          </p>
        )
      )}
    </section>
  );
}
