import { useState } from "react";
import { AccordionItem } from "~/components/Accordion";
import { ScoreBadge } from "~/components/ScoreBadge";

export function SectionAnalysis({ sections }: { sections?: ResumeSectionAnalysis[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  if (!sections?.length) return null;
  const toggle = (name: string) => setOpen((prev) => {
    const next = new Set(prev);
    next.has(name) ? next.delete(name) : next.add(name);
    return next;
  });

  return (
    <section aria-labelledby="section-analysis-heading" className="border border-rule bg-sheet px-6 pt-6 sm:px-8 sm:pt-8">
      <h2 id="section-analysis-heading" className="text-2xl font-bold">Resume section analysis</h2>
      <p className="mt-2 text-ink-soft">Eight sections reviewed individually, with improvements grounded in the content already present.</p>
      <div className="mt-3">
        {sections.map((section) => (
          <AccordionItem
            key={section.section}
            id={`resume-section-${section.section.replace(/\W+/g, "-").toLowerCase()}`}
            title={`${section.section}${section.detected ? "" : " — not detected"}`}
            meta={<ScoreBadge score={section.score} />}
            open={open.has(section.section)}
            onToggle={() => toggle(section.section)}
          >
            <div className="grid gap-5 md:grid-cols-3">
              <div><h4 className="font-bold text-good">Strengths</h4><ul className="mt-2 space-y-1 text-sm text-ink-soft">{section.strengths.map((x) => <li key={x}>• {x}</li>)}</ul></div>
              <div><h4 className="font-bold text-fix">Issues</h4><ul className="mt-2 space-y-1 text-sm text-ink-soft">{section.issues.map((x) => <li key={x}>• {x}</li>)}</ul></div>
              <div><h4 className="font-bold">Suggestions</h4><ul className="mt-2 space-y-1 text-sm text-ink-soft">{section.suggestions.map((x) => <li key={x}>• {x}</li>)}</ul></div>
            </div>
            {section.improvedVersion && (
              <div className="mt-5 border-l-4 border-pencil bg-paper px-4 py-3">
                <h4 className="font-bold">Improved version</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{section.improvedVersion}</p>
              </div>
            )}
          </AccordionItem>
        ))}
      </div>
    </section>
  );
}
