import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-slate-800 bg-[#0b1224] text-slate-300">
      <div className="pointer-events-none absolute -right-28 -top-32 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3 rounded-xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true"><path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M14 3.75v4h4M8.5 12h6.8M8.5 15.5h6.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
              </span>
              <span>
                <span className="block font-display text-lg font-extrabold tracking-tight text-white">AI Resume Analyzer</span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Career Suite</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              One calm workspace for resume feedback, ATS-oriented checks, job matching, career writing, and application planning.
            </p>
          </div>

          <div>
            <h2 className="font-display text-sm font-bold text-white">Explore</h2>
            <nav aria-label="Explore footer links" className="mt-4 flex flex-col items-start gap-3 text-sm">
              <Link to="/" className="transition hover:text-white">Resume workspace</Link>
              <Link to="/career" className="transition hover:text-white">Career suite</Link>
              <Link to="/upload" className="transition hover:text-white">Analyze a resume</Link>
              <Link to="/developer" className="transition hover:text-white">Developer story</Link>
            </nav>
          </div>

          <div>
            <h2 className="font-display text-sm font-bold text-white">Help &amp; policies</h2>
            <nav aria-label="Help footer links" className="mt-4 flex flex-col items-start gap-3 text-sm">
              <Link to="/faq" className="transition hover:text-white">Frequently asked questions</Link>
              <Link to="/privacy" className="transition hover:text-white">Privacy policy</Link>
              <Link to="/terms" className="transition hover:text-white">Terms of use</Link>
            </nav>
            <p className="mt-5 max-w-xs text-xs leading-5 text-slate-500">
              AI outputs are suggestions. Review details carefully and keep every application truthful to your experience.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-white">
              Designed &amp; Developed by <span className="text-indigo-300">SULAKSHAN M</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">Built with purpose for people navigating their next career move.</p>
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200">
              <span aria-hidden="true" className="text-indigo-300">✦</span> Career clarity starts here
            </p>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} AI Resume Analyzer &amp; Career Suite</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
