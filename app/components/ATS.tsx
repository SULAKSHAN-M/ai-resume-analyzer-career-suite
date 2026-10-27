import { ScoreBadge } from "~/components/ScoreBadge";
import { TipList } from "~/components/TipList";

export function ATS({ category }: { category: FeedbackCategory }) {
  return (
    <section aria-labelledby="ats-heading" className="border border-rule bg-sheet p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="ats-heading" className="text-2xl font-bold">
          ATS compatibility
        </h2>
        <ScoreBadge score={category.score} />
      </div>
      <p className="mt-2 mb-6 max-w-prose text-ink-soft">
        Many employers run resumes through applicant tracking software before a person reads them.
        These checks show how well that software can read yours.
      </p>
      <TipList tips={category.tips} />
    </section>
  );
}
