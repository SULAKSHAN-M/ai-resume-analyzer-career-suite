export function TopFixes({ fixes }: { fixes: string[] }) {
  if (fixes.length === 0) return null;

  return (
    <section aria-labelledby="fixes-heading" className="border border-rule bg-sheet p-6 sm:p-8">
      <h2 id="fixes-heading" className="text-2xl font-bold">
        Fix these first
      </h2>
      <p className="mt-1 text-ink-soft">Ordered by how much each change helps.</p>
      <ol className="mt-5 space-y-4">
        {fixes.map((fix, i) => (
          <li key={fix} className="grid grid-cols-[2rem_1fr] items-baseline gap-3">
            <span className="font-display text-2xl leading-none font-extrabold text-pencil tabular-nums">
              {i + 1}
            </span>
            <span className="leading-relaxed">{fix}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
