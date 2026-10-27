import { useState } from "react";
import { AccordionItem } from "~/components/Accordion";
import { ScoreBadge } from "~/components/ScoreBadge";
import { TipList } from "~/components/TipList";

const SECTIONS = [
  { key: "toneAndStyle", label: "Tone and style" },
  { key: "content", label: "Content" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills" },
] as const;

export function Details({ feedback }: { feedback: Feedback }) {
  // Start with the weakest section open: that's where the most gain is.
  const [open, setOpen] = useState<Set<string>>(() => {
    const weakest = SECTIONS.reduce((low, s) =>
      feedback[s.key].score < feedback[low.key].score ? s : low,
    );
    return new Set([weakest.key]);
  });

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <section aria-labelledby="details-heading" className="border border-rule bg-sheet px-6 pt-6 sm:px-8 sm:pt-8">
      <h2 id="details-heading" className="text-2xl font-bold">
        Detailed feedback
      </h2>
      <div className="mt-2">
        {SECTIONS.map(({ key, label }) => (
          <AccordionItem
            key={key}
            id={`section-${key}`}
            title={label}
            meta={<ScoreBadge score={feedback[key].score} />}
            open={open.has(key)}
            onToggle={() => toggle(key)}
          >
            <TipList tips={feedback[key].tips} />
          </AccordionItem>
        ))}
      </div>
    </section>
  );
}
