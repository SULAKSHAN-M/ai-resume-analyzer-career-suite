import { useEffect, useState, type FormEvent } from "react";
import type { Route } from "./+types/career";
import { Shell } from "~/components/Shell";
import { AIIntelligence, type AIRouterStatus } from "~/components/AIIntelligence";
import { api } from "~/lib/api";
import { useRequireAuth } from "~/lib/useRequireAuth";
import { errorMessage, formatDate } from "~/lib/utils";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Career Suite | AI Resume Analyzer & Career Suite" }];
}

const STATUS_OPTIONS: ApplicationRecord["status"][] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

function ApplicationRow({ item, onChange, onDelete }: { item: ApplicationRecord; onChange: (next: ApplicationRecord) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(item), [item]);

  const save = async () => {
    setBusy(true); setSaved(false);
    try {
      const { application } = await api.put<{ application: ApplicationRecord }>(`/api/applications/${item.id}`, {
        status: draft.status,
        notes: draft.notes,
        nextAction: draft.nextAction,
        appliedAt: draft.appliedAt,
        interviewAt: draft.interviewAt,
      });
      setDraft(application); onChange(application); setSaved(true);
    } finally { setBusy(false); }
  };

  return (
    <article className="border border-rule bg-sheet p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">{item.title}</h3>
          <p className="text-ink-soft">{item.company || "Company not recorded"}{item.location ? ` · ${item.location}` : ""}</p>
          <p className="mt-1 text-xs text-ink-soft">Saved {formatDate(item.createdAt)}</p>
        </div>
        {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="font-display text-sm font-semibold text-pencil underline">Open job</a>}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="text-sm font-semibold">Status
          <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as ApplicationRecord["status"] })} className="mt-1 block w-full border border-rule bg-sheet px-3 py-2 font-normal">
            {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold md:col-span-2">Next action
          <input value={draft.nextAction} onChange={(e) => setDraft({ ...draft, nextAction: e.target.value })} placeholder="e.g. Follow up on Friday" className="mt-1 block w-full border border-rule bg-sheet px-3 py-2 font-normal" />
        </label>
      </div>
      <label className="mt-4 block text-sm font-semibold">Notes
        <textarea value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} rows={3} className="mt-1 block w-full border border-rule bg-sheet p-3 font-normal" />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => void save()} disabled={busy} className="bg-pencil px-4 py-2 font-display text-sm font-semibold text-white hover:bg-pencil-deep disabled:opacity-50">{busy ? "Saving…" : saved ? "Saved" : "Save changes"}</button>
        <button onClick={() => onDelete(item.id)} className="border border-rule px-4 py-2 font-display text-sm font-semibold text-fix">Delete</button>
      </div>
    </article>
  );
}

export default function CareerDashboard() {
  const { ready } = useRequireAuth("/career");
  const [analytics, setAnalytics] = useState<CareerAnalytics | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [aiStatus, setAiStatus] = useState<AIRouterStatus | null>(null);
  const [error, setError] = useState("");
  const [manual, setManual] = useState({ title: "", company: "", url: "" });

  const load = async () => {
    try {
      const [a, b] = await Promise.all([
        api.get<{ analytics: CareerAnalytics }>("/api/analytics"),
        api.get<{ applications: ApplicationRecord[] }>("/api/applications"),
      ]);
      setAnalytics(a.analytics); setApplications(b.applications); setError("");
      api.get<{ ai: AIRouterStatus }>("/api/ai/status").then((result) => setAiStatus(result.ai)).catch(() => setAiStatus(null));
    } catch (err) { setError(errorMessage(err, "Couldn't load the career dashboard.")); }
  };

  useEffect(() => { if (ready) void load(); }, [ready]);

  const addManual = async (e: FormEvent) => {
    e.preventDefault();
    if (!manual.title.trim()) return;
    const { application } = await api.post<{ application: ApplicationRecord }>("/api/applications", { ...manual, status: "Saved" });
    setApplications((current) => [application, ...current]);
    setManual({ title: "", company: "", url: "" });
    void load();
  };

  const remove = async (id: string) => {
    await api.del(`/api/applications/${id}`);
    setApplications((current) => current.filter((x) => x.id !== id));
    void load();
  };

  if (!ready) return <Shell><p className="text-ink-soft">Checking your session…</p></Shell>;

  return (
    <Shell>
      <div className="max-w-3xl">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-pencil">Career workspace</p>
        <h1 className="mt-2 text-4xl font-extrabold">Career dashboard</h1>
        <p className="mt-3 text-lg text-ink-soft">Track resume quality, applications, interviews, skill gaps, and the roles you are targeting.</p>
      </div>
      {error && <p role="alert" className="mt-6 text-fix">{error}</p>}
      {aiStatus && <AIIntelligence status={aiStatus} />}

      {analytics && <>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Average ATS", `${analytics.averageAtsScore}/100`],
            ["Reviews", analytics.resumeReviews],
            ["Applications", analytics.applicationsSubmitted],
            ["Interviews", analytics.interviewsReceived],
            ["Offers", analytics.offers],
          ].map(([label, value]) => <div key={String(label)} className="border border-rule bg-sheet p-5"><p className="font-display text-sm font-semibold text-ink-soft">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div>)}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="border border-rule bg-sheet p-6"><h2 className="text-2xl font-bold">Resume improvement</h2><div className="mt-5 space-y-3">{analytics.trend.length ? analytics.trend.map((point) => <div key={point.createdAt}><div className="flex justify-between text-sm"><span>{formatDate(point.createdAt)}</span><span className="font-semibold">ATS {point.ats}</span></div><div className="mt-1 h-2 bg-paper"><div className="h-full bg-pencil" style={{ width: `${point.ats}%` }} /></div></div>) : <p className="text-ink-soft">Analyze more resumes to build a trend.</p>}</div></section>
          <section className="border border-rule bg-sheet p-6"><h2 className="text-2xl font-bold">Application pipeline</h2><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">{STATUS_OPTIONS.map((status) => <div key={status} className="bg-paper p-3 text-center"><p className="text-2xl font-bold">{analytics.statusCounts[status] ?? 0}</p><p className="text-xs text-ink-soft">{status}</p></div>)}</div><p className="mt-5 text-sm text-ink-soft">Saved resume versions: {analytics.resumeVersions}</p></section>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="border border-rule bg-sheet p-6"><h2 className="text-xl font-bold">Most common missing skills</h2><ol className="mt-4 space-y-2">{analytics.commonMissingSkills.map((x) => <li key={x.name} className="flex justify-between border-b border-rule/70 pb-2"><span>{x.name}</span><span className="font-display font-bold">{x.count}</span></li>)}</ol>{!analytics.commonMissingSkills.length && <p className="mt-3 text-ink-soft">No skill-gap data yet.</p>}</section>
          <section className="border border-rule bg-sheet p-6"><h2 className="text-xl font-bold">Top target roles</h2><ol className="mt-4 space-y-2">{analytics.topTargetRoles.map((x) => <li key={x.name} className="flex justify-between border-b border-rule/70 pb-2"><span>{x.name}</span><span className="font-display font-bold">{x.count}</span></li>)}</ol>{!analytics.topTargetRoles.length && <p className="mt-3 text-ink-soft">No role data yet.</p>}</section>
        </div>
      </>}

      <section className="mt-12" aria-labelledby="tracker-heading">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><h2 id="tracker-heading" className="text-3xl font-extrabold">Application tracker</h2><p className="mt-1 text-ink-soft">Save jobs from a resume review, or add one manually.</p></div></div>
        <form onSubmit={(e) => void addManual(e)} className="mt-5 grid gap-3 border border-rule bg-sheet p-5 md:grid-cols-[1fr_1fr_1.3fr_auto]">
          <input required placeholder="Job title" value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} className="border border-rule px-3 py-2" />
          <input placeholder="Company" value={manual.company} onChange={(e) => setManual({ ...manual, company: e.target.value })} className="border border-rule px-3 py-2" />
          <input placeholder="Job URL" value={manual.url} onChange={(e) => setManual({ ...manual, url: e.target.value })} className="border border-rule px-3 py-2" />
          <button className="bg-pencil px-4 py-2 font-display font-semibold text-white">Add</button>
        </form>
        <div className="mt-5 grid gap-4">{applications.map((item) => <ApplicationRow key={item.id} item={item} onChange={(next) => { setApplications((current) => current.map((x) => x.id === next.id ? next : x)); void load(); }} onDelete={(id) => void remove(id)} />)}</div>
        {!applications.length && <p className="mt-5 text-ink-soft">No applications tracked yet.</p>}
      </section>
    </Shell>
  );
}
