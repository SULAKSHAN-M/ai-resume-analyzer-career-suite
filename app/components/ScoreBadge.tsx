import { cn, scoreTier, tierStyles } from "~/lib/utils";

export function ScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 font-display text-sm font-bold tabular-nums",
        tierStyles[scoreTier(score)].badge,
      )}
    >
      {score}/100
    </span>
  );
}
