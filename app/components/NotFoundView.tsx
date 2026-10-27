import { Link } from "react-router";

export function NotFoundView() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 items-center px-5 py-10 sm:px-8 sm:py-14">
      <div className="grid w-full items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="animate-rise-in order-2 lg:order-1">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> 404 · Page not found
          </p>
          <p className="mt-7 font-display text-7xl font-extrabold leading-none tracking-[-0.08em] text-indigo-600 sm:text-8xl">404</p>
          <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-950 sm:text-5xl">
            Looks like you’ve lost your path.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            The page may have moved, the link might be outdated, or the address may have a typo. No worries—your next career step is still within reach.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-indigo-700">
              <span aria-hidden="true">←</span> Back to workspace
            </Link>
            <Link to="/faq" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-indigo-200 hover:bg-indigo-50">
              Visit help center <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">Need a hand? Start with the FAQs or navigate using the tabs above.</p>
        </div>

        <div className="animate-rise-in order-1 lg:order-2" style={{ animationDelay: "100ms" }}>
          <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white p-2 shadow-[0_28px_90px_rgba(35,46,85,0.12)] ring-1 ring-slate-200/80">
            <div className="pointer-events-none absolute inset-x-10 top-0 h-1 rounded-b-full bg-gradient-to-r from-indigo-300 via-blue-400 to-emerald-300" />
            <img
              src="/404-explorer.png"
              alt="A playful illustrated explorer puzzled by a missing path"
              className="h-auto max-h-[430px] w-full rounded-[1.5rem] object-contain"
              width="800"
              height="600"
            />
          </div>
          <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg" aria-hidden="true">🧭</span>
            <span><strong className="text-slate-900">Even explorers take a wrong turn.</strong><br />Choose a path and keep moving.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
