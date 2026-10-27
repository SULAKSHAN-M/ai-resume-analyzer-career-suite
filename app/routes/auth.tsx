import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import type { Route } from "./+types/auth";
import { useAuthStore } from "~/lib/useAuthStore";
import { safeNextPath } from "~/lib/utils";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Sign in | AI Resume Analyzer & Career Suite" },
    { name: "description", content: "Sign in to review your resume, track applications, and access your AI-powered career workspace." },
  ];
}

const fieldClass = "auth-input mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60";

const features: [string, string, string][] = [
  ["01", "Understand your resume", "Get clear feedback and practical improvements."],
  ["02", "Match your next role", "Compare your strengths with job requirements."],
  ["03", "Keep your momentum", "Organize resume versions and application progress."],
];

function BrandIcon() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-950/20">
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M7 3.75h7l4 4v12.5H7a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M14 3.75v4h4M8.5 12h6.8M8.5 15.5h6.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNextPath(params.get("next"));

  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.user !== null);
  const email = useAuthStore((s) => s.user?.email);
  const error = useAuthStore((s) => s.error);
  const register = useAuthStore((s) => s.register);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const clearError = useAuthStore((s) => s.clearError);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, next, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") await login(emailInput.trim(), password);
      else await register(emailInput.trim(), password);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (nextMode: "login" | "register") => {
    setMode(nextMode);
    clearError();
  };

  return (
    <main className="auth-screen" aria-label="AI Resume Analyzer sign in">
      <div className="auth-card">
        <section className="auth-brand-panel" aria-label="Career Suite introduction">
          <div className="auth-brand-glow auth-brand-glow-one" />
          <div className="auth-brand-glow auth-brand-glow-two" />

          <div className="auth-brand-content">
            <Link to="/" className="auth-brand-lockup">
              <BrandIcon />
              <span>
                <span className="block font-display text-base font-extrabold tracking-tight text-white sm:text-lg">AI Resume Analyzer</span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Career Suite</span>
              </span>
            </Link>

            <div className="auth-brand-copy">
              <h1 className="auth-brand-title">Make your next move with <span>more clarity.</span></h1>
              <p className="auth-brand-description">Resume feedback, ATS-oriented checks, job matching, career writing, and interview preparation—all in one thoughtful workspace.</p>

              <div className="auth-feature-list">
                {features.map(([number, title, description]) => (
                  <div key={number} className="auth-feature-card">
                    <span className="auth-feature-number">{number}</span>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-white sm:text-base">{title}</h2>
                      <p className="auth-feature-description">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="auth-brand-bottom">
            <p className="text-xs text-slate-300 sm:text-sm">Designed &amp; Developed by <strong className="text-white">SULAKSHAN M</strong></p>
          </div>
        </section>

        <section className="auth-form-panel" aria-label="Account sign in">
          <div className="auth-form-top">
            <div className="auth-mobile-brand">
              <BrandIcon />
              <span>
                <span className="block text-sm font-extrabold tracking-tight text-slate-950">AI Resume Analyzer</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">Career Suite</span>
              </span>
            </div>
          </div>

          <div className="auth-form-content">
            {isLoading ? (
              <div className="flex items-center gap-3 py-14 text-sm font-medium text-slate-500" role="status"><span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /> Checking your secure session…</div>
            ) : isAuthenticated ? (
              <div className="py-6">
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">Session active</span>
                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">You’re signed in.</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Your workspace is ready for <strong>{email}</strong>.</p>
                <div className="mt-6 flex flex-wrap gap-3"><Link to="/" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">Go to workspace</Link><button type="button" onClick={() => void logout()} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Sign out</button></div>
              </div>
            ) : (
              <>
                <div className="auth-form-heading">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-600">Welcome to Career Suite</p>
                  <h2 className="auth-form-title">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
                  <p className="auth-form-description">{mode === "login" ? "Sign in to continue building a stronger application." : "Create a secure workspace for your resume reviews and career progress."}</p>
                </div>

                <div className="auth-account-tabs" role="tablist" aria-label="Account type">
                  <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => switchMode("login")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Sign in</button>
                  <button type="button" role="tab" aria-selected={mode === "register"} onClick={() => switchMode("register")} className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${mode === "register" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Create account</button>
                </div>

                <form onSubmit={handleSubmit} className="auth-form-fields">
                  <label className="block"><span className="text-sm font-bold text-slate-800">Email address</span><input type="email" name="email" autoComplete="email" required value={emailInput} disabled={busy} onChange={(e) => setEmailInput(e.target.value)} placeholder="you@example.com" className={fieldClass} /></label>
                  <label className="block"><span className="text-sm font-bold text-slate-800">Password</span><span className="relative mt-2 block"><input type={showPassword ? "text" : "password"} name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "register" ? 8 : undefined} value={password} disabled={busy} onChange={(e) => setPassword(e.target.value)} placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"} className={`${fieldClass} pr-20`} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-3 my-auto h-9 rounded-lg px-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></span>{mode === "register" && <span className="mt-2 block text-xs leading-5 text-slate-500">Use at least 8 characters. A longer, unique password is recommended.</span>}</label>

                  {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800"><strong className="font-bold">We couldn’t complete that request.</strong><p className="mt-1">{error}</p></div>}

                  <button type="submit" disabled={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-3 font-display text-sm font-extrabold text-white shadow-lg shadow-indigo-600/20 transition hover:-translate-y-0.5 hover:from-indigo-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {busy ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{mode === "login" ? "Signing in…" : "Creating account…"}</> : <>{mode === "login" ? "Sign in to your workspace" : "Create secure account"}<span aria-hidden="true">↗</span></>}
                  </button>
                </form>

                <p className="auth-legal-copy">By continuing, you agree to the <Link to="/terms" className="font-semibold text-indigo-700 hover:underline">Terms of Use</Link> and acknowledge the <Link to="/privacy" className="font-semibold text-indigo-700 hover:underline">Privacy Policy</Link>.</p>
              </>
            )}
          </div>

          <div className="auth-form-bottom">
            <span><span className="auth-security-dot" /> Private workspace · You stay in control</span>
          </div>
        </section>
      </div>
    </main>
  );
}
