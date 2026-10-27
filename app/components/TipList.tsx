import { cn } from "~/lib/utils";

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" className="fill-good" />
      <path d="m5.8 10.3 2.7 2.7 5.7-5.9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-5" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" className="stroke-fix" strokeWidth="1.6" />
      <path
        d="m6.5 13.6.6-2.5 5.3-5.3 1.9 1.9-5.3 5.3-2.5.6Z"
        className="stroke-fix"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Fixes first, then strengths, so the list opens with what to act on. */
function sortTips(tips: Tip[]): Tip[] {
  return [...tips].sort((a, b) => Number(a.type === "good") - Number(b.type === "good"));
}

export function TipList({ tips, className }: { tips: Tip[]; className?: string }) {
  if (tips.length === 0) {
    return <p className="text-ink-soft">No tips came back for this section.</p>;
  }

  return (
    <ul className={cn("divide-y divide-rule", className)}>
      {sortTips(tips).map((tip, i) => {
        const good = tip.type === "good";
        return (
          <li key={`${tip.tip}-${i}`} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
            <span className="mt-0.5 shrink-0">{good ? <CheckIcon /> : <PencilIcon />}</span>
            <div className="min-w-0">
              <p className="font-display leading-snug font-semibold">
                <span className="sr-only">{good ? "Strength: " : "Fix: "}</span>
                <span className={good ? undefined : "marked"}>{tip.tip}</span>
              </p>
              {tip.explanation && (
                <p className="mt-1 max-w-prose leading-relaxed text-ink-soft">{tip.explanation}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
