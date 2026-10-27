import { cn } from "~/lib/utils";

// An imperfect loop that overshoots where it started, like a circle drawn with a pencil.
const LOOP =
  "M 30 20 C 50 5, 94 6, 107 34 C 119 60, 104 97, 74 108 C 44 119, 13 101, 9 66 C 5 35, 32 10, 63 11 C 79 12, 91 18, 98 27";

interface ScoreMarkProps {
  score: number;
  size?: "sm" | "md" | "lg";
  /** Play the one-time drawing animation. */
  draw?: boolean;
  className?: string;
}

export function ScoreMark({ score, size = "lg", draw = false, className }: ScoreMarkProps) {
  const large = size === "lg";
  const medium = size === "md";

  return (
    <div
      role="img"
      aria-label={`Score: ${score} out of 100`}
      className={cn(
        "relative grid shrink-0 place-items-center",
        large ? "size-40 sm:size-44" : medium ? "size-28" : "size-16",
        className,
      )}
    >
      <svg
        viewBox="-6 -6 132 132"
        className="absolute inset-0 size-full overflow-visible text-pencil"
        fill="none"
        aria-hidden="true"
      >
        <path
          className="pencil-stroke"
          data-draw={draw}
          d={LOOP}
          pathLength={1}
          stroke="currentColor"
          strokeWidth={large ? 4 : medium ? 5 : 6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        aria-hidden="true"
        className={cn(
          "relative font-display leading-none font-extrabold tabular-nums",
          large ? "text-6xl" : medium ? "text-4xl" : "text-xl",
        )}
      >
        {score}
      </span>
    </div>
  );
}
