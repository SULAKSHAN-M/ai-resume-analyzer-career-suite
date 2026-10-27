function Pills({ items, tone = "plain" }: { items: string[]; tone?: "plain" | "good" | "warn" }) {
  if (!items.length) return <p className="mt-2 text-sm text-ink-soft">None detected.</p>;
  const cls = tone === "good" ? "border-good/30 bg-good-wash text-good" : tone === "warn" ? "bg-marker/65 text-ink" : "border-rule bg-paper text-ink";
  return <ul className="mt-2 flex flex-wrap gap-2">{items.map((item) => <li key={item} className={`border px-2.5 py-1 text-sm ${cls}`}>{item}</li>)}</ul>;
}

export function SkillGapAnalysis({ gap }: { gap?: SkillGap }) {
  if (!gap) return null;
  return (
    <section aria-labelledby="skill-gap-heading" className="border border-rule bg-sheet p-6 sm:p-8">
      <h2 id="skill-gap-heading" className="text-2xl font-bold">Skill gap analysis</h2>
      <p className="mt-2 text-ink-soft">What your resume already demonstrates, what the role asks for, and what to learn next without overstating experience.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div><h3 className="font-bold">Skills you already have</h3><Pills items={gap.existingSkills} tone="good" /></div>
        <div><h3 className="font-bold">Skills requested</h3><Pills items={gap.requestedSkills} /></div>
        <div><h3 className="font-bold">Missing skills</h3><Pills items={gap.missingSkills} tone="warn" /></div>
        <div><h3 className="font-bold">Weakly evidenced skills</h3><Pills items={gap.weakSkills} tone="warn" /></div>
        <div><h3 className="font-bold">Recommended next skills</h3><Pills items={gap.recommendedNextSkills} /></div>
        <div>
          <h3 className="font-bold">Practical learning ideas</h3>
          <ul className="mt-2 space-y-2 text-sm text-ink-soft">{gap.learningSuggestions.map((item) => <li key={item}>• {item}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}
