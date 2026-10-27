import { useEffect, useState } from "react";
import { api } from "~/lib/api";
import { formatDate } from "~/lib/utils";

export function ResumeVersions({ resume }: { resume: Resume }) {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [error, setError] = useState("");

  const load = () => api.get<{ versions: ResumeVersion[] }>(`/api/career/versions?resumeId=${encodeURIComponent(resume.id)}`)
    .then(({ versions }) => setVersions(versions))
    .catch(() => setError("Couldn't load saved versions."));

  useEffect(() => {
    void load();
    const onSaved = (event: Event) => {
      const detail = (event as CustomEvent<{ resumeId?: string }>).detail;
      if (!detail?.resumeId || detail.resumeId === resume.id) void load();
    };
    window.addEventListener("resume-version-saved", onSaved);
    return () => window.removeEventListener("resume-version-saved", onSaved);
  }, [resume.id]);

  const remove = async (id: string) => {
    await api.del(`/api/career/versions/${id}`);
    setVersions((current) => current.filter((v) => v.id !== id));
  };

  const original = resume.feedback.atsMetrics?.score ?? resume.feedback.ATS.score;
  return (
    <section id="resume-versions" aria-labelledby="versions-heading" className="mt-12 border border-rule bg-sheet p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="versions-heading" className="text-2xl font-bold">Resume versions & comparison</h2>
          <p className="mt-1 text-ink-soft">Tailored versions saved from job cards appear here for side-by-side ATS comparison.</p>
        </div>
        <button type="button" onClick={() => void load()} className="font-display font-semibold text-pencil underline underline-offset-2">Refresh</button>
      </div>
      {error && <p className="mt-4 text-fix">{error}</p>}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead><tr className="border-b border-rule font-display"><th className="py-3 pr-4">Version</th><th className="py-3 pr-4">Target</th><th className="py-3 pr-4">ATS</th><th className="py-3 pr-4">Change</th><th className="py-3">Saved</th></tr></thead>
          <tbody>
            <tr className="border-b border-rule/70"><td className="py-3 pr-4 font-semibold">Original CV</td><td className="py-3 pr-4">{resume.jobTitle || "General"}</td><td className="py-3 pr-4 font-bold">{original}/100</td><td className="py-3 pr-4">—</td><td className="py-3">{formatDate(resume.createdAt)}</td></tr>
            {versions.map((version) => {
              const change = version.ats.score - original;
              return <tr key={version.id} className="border-b border-rule/70">
                <td className="py-3 pr-4"><div className="font-semibold">{version.label}</div><button onClick={() => void remove(version.id)} className="mt-1 text-xs text-fix underline">Delete</button></td>
                <td className="py-3 pr-4">{version.targetJobTitle}{version.targetCompany ? ` · ${version.targetCompany}` : ""}</td>
                <td className="py-3 pr-4 font-bold">{version.ats.score}/100</td>
                <td className={change > 0 ? "py-3 pr-4 font-semibold text-good" : change < 0 ? "py-3 pr-4 font-semibold text-fix" : "py-3 pr-4"}>{change > 0 ? `+${change}` : change}</td>
                <td className="py-3">{formatDate(version.createdAt)}</td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>
      {!versions.length && <p className="mt-4 text-sm text-ink-soft">No tailored versions saved yet. Use “Tailor resume” on an ITPro job below.</p>}
    </section>
  );
}
