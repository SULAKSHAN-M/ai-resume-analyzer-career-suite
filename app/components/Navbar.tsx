import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { useAuthStore } from "~/lib/useAuthStore";

export function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = user !== null;
  const logout = useAuthStore((s) => s.logout);

  const items = [
    ...(isAuthenticated
      ? [
          { to: "/", label: "Workspace", end: true },
          { to: "/career", label: "Career suite" },
        ]
      : []),
  ];

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
    ].join(" ");

  async function handleSignOut() {
    setMobileOpen(false);
    await logout();
    navigate("/auth", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-[0_4px_24px_rgba(15,23,42,0.035)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-3 rounded-xl"
          aria-label="AI Resume Analyzer home"
          onClick={() => setMobileOpen(false)}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:-rotate-3">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
              <path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M14 3.75v4h4M8.5 12h6.8M8.5 15.5h6.8M8.5 9h2.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-[15px] font-extrabold tracking-tight text-slate-950 sm:text-base">
              AI Resume Analyzer
            </span>
            <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
              Career Suite
            </span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={"end" in item ? item.end : false}
              className={navItemClass}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/upload"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <span aria-hidden="true" className="text-base">＋</span>
                New review
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                title={user?.email ? `Sign out ${user.email}` : "Sign out"}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Sign in <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 lg:hidden"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-navigation" className="border-t border-slate-200 bg-white px-5 py-4 shadow-lg lg:hidden sm:px-8">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : false}
                onClick={() => setMobileOpen(false)}
                className={navItemClass}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2">
              {isAuthenticated ? (
                <>
                  <Link to="/upload" onClick={() => setMobileOpen(false)} className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white">＋ New review</Link>
                  <button type="button" onClick={() => void handleSignOut()} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Sign out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white">Sign in / Create account</Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
