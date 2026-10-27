import { Link } from "react-router";
import { Shell } from "~/components/Shell";

export type PolicySection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export function PolicyPage({
  eyebrow,
  title,
  intro,
  updated,
  sections,
  notice,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: PolicySection[];
  notice?: string;
}) {
  return (
    <Shell>
      <article className="animate-rise-in mx-auto max-w-5xl">
        <header className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-9 text-white shadow-xl shadow-slate-900/10 sm:px-10 sm:py-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-indigo-300">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{intro}</p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Last updated: {updated}</p>
        </header>

        {notice && (
          <aside className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6" role="note">
            <h2 className="font-display font-extrabold text-amber-950">Important before public launch</h2>
            <p className="mt-2 text-sm leading-7 text-amber-900">{notice}</p>
          </aside>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">On this page</p>
            <nav className="mt-4 flex flex-col gap-1.5">
              {sections.map((section) => <a key={section.id} href={`#${section.id}`} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700">{section.title.replace(/^\d+\.\s*/, "")}</a>)}
            </nav>
          </aside>

          <div className="min-w-0 space-y-8">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_3px_14px_rgba(15,23,42,0.025)] sm:p-7">
                <h2 className="text-xl font-extrabold sm:text-2xl">{section.title}</h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph, index) => <p key={index} className="text-sm leading-7 text-slate-600 sm:text-base">{paragraph}</p>)}
                </div>
              </section>
            ))}
          </div>
        </div>

        <nav aria-label="Related legal pages" className="mt-10 flex flex-wrap gap-3">
          <Link to="/faq" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-700">FAQs</Link>
          <Link to="/privacy" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-700">Privacy policy</Link>
          <Link to="/terms" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-700">Terms of use</Link>
          <Link to="/developer" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-200 hover:text-indigo-700">Developer story</Link>
        </nav>
      </article>
    </Shell>
  );
}
