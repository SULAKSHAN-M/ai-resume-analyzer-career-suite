import { ScoreMark } from "~/components/ScoreMark";
import { cn, scoreTier, scoreVerdict, tierStyles } from "~/lib/utils";

const ROWS = [
  { key: "ATS", label: "ATS compatibility" },
  { key: "toneAndStyle", label: "Tone and style" },
  { key: "content", label: "Content" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills" },
] as const;

export function Summary({ feedback }: { feedback: Feedback }) {
  return (
    <section aria-labelledby="overall-heading" className="border border-rule bg-sheet p-6 sm:p-8">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
        <ScoreMark score={feedback.overallScore} size="lg" draw />
        <div className="min-w-0">
          <h2 id="overall-heading" className="text-3xl font-extrabold">
            {scoreVerdict(feedback.overallScore)}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Overall score</p>
          {feedback.summary && (
            <p className="mt-3 max-w-prose leading-relaxed">{feedback.summary}</p>
          )}
        </div>
      </div>

      <ul className="mt-8 space-y-3 border-t border-rule pt-6">
        {ROWS.map(({ key, label }) => {
          const score = feedback[key].score;
          return (
            <li key={key} className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-3 sm:grid-cols-[10rem_1fr_2.5rem]">
              <span className="font-display font-semibold">{label}</span>
              <span className="h-2 bg-paper" aria-hidden="true">
                <span
                  className={cn("block h-full", tierStyles[scoreTier(score)].bar)}
                  style={{ width: `${score}%` }}
                />
              </span>
              <span className={cn("text-right font-display font-bold tabular-nums", tierStyles[scoreTier(score)].text)}>
                {score}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
