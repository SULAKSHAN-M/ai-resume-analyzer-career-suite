import { JobActions } from "~/components/JobActions";
import { useEffect, useState } from "react";
import { formatIsoDate } from "~/lib/utils";

type JobsState =
  | { status: "loading" }
  | { status: "error"; message: string; code: string }
  | { status: "ready"; jobs: JobListing[] };

const LOCAL_SITES = [
  { name: "ITPro.lk", href: "https://itpro.lk/" },
  { name: "TopJobs", href: "https://www.topjobs.lk/" },
  { name: "ikman.lk jobs", href: "https://ikman.lk/en/ads/sri-lanka/jobs" },
  { name: "MyJobs.lk (Xpress Jobs)", href: "https://myjobs.lk/" },
];

/** Real listings in Sri Lanka for the roles that suit this resume. */
export function Jobs({ queries, resumeId }: { queries: string[]; resumeId: string }) {
  const [state, setState] = useState<JobsState>({ status: "loading" });
  const queryKey = JSON.stringify(queries);

  useEffect(() => {
    const terms = JSON.parse(queryKey) as string[];
    if (terms.length === 0) {
      setState({ status: "ready", jobs: [] });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading" });

    const params = new URLSearchParams();
    terms.forEach((term) => params.append("q", term));

    (async () => {
      try {
        const res = await fetch(`/api/jobs?${params}`, { signal: controller.signal });
        const data = (await res.json().catch(() => null)) as
          | { jobs?: JobListing[]; error?: string; code?: string }
          | null;
        if (!res.ok || !data?.jobs) {
          setState({
            status: "error",
            message: data?.error ?? "Job search failed. Try again later.",
            code: data?.code ?? "upstream",
          });
          return;
        }
        setState({ status: "ready", jobs: data.jobs });
      } catch {
        if (controller.signal.aborted) return;
        setState({ status: "error", message: "Couldn't reach the job search. Check your connection.", code: "network" });
      }
    })();

    return () => controller.abort();
  }, [queryKey]);

  return (
    <section aria-labelledby="jobs-heading" className="mt-16">
      <h2 id="jobs-heading" className="text-3xl font-extrabold">
        Jobs you could apply for in Sri Lanka
      </h2>
      {queries.length > 0 && (
        <p className="mt-2 max-w-prose text-ink-soft">
          Searched for {queries.join(", ")}. Listings come from ITPro.lk and are ranked against the roles suggested by your AI resume review. Open a job to view the ITPro listing and apply through ITPro.
        </p>
      )}

      <div className="mt-6" aria-live="polite">
        {state.status === "loading" && <p className="text-ink-soft">Searching for jobs…</p>}

        {state.status === "error" && (
          <div role="alert" className="border-l-4 border-fix bg-sheet px-4 py-3">
            <p className="font-display font-semibold text-fix">Couldn't load job listings</p>
            <p className="mt-1 text-ink-soft">{state.message}</p>
          </div>
        )}

        {state.status === "ready" && state.jobs.length === 0 && (
          <p className="text-ink-soft">
            No listings matched these roles right now. Try the Sri Lankan job sites below.
          </p>
        )}

        {state.status === "ready" && state.jobs.length > 0 && (
          <ul className="divide-y divide-rule border-y border-rule">
            {state.jobs.map((job) => {
              const posted = job.updated ? formatIsoDate(job.updated) : "";
              return (
                <li key={job.id} className="grid gap-x-8 gap-y-2 py-5 md:grid-cols-[minmax(0,1fr)_14rem]">
                  <div className="min-w-0">
                    <h3 className="text-xl leading-snug font-bold">
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pencil underline-offset-4 hover:underline"
                      >
                        {job.title}
                      </a>
                    </h3>
                    {job.company && <p className="mt-0.5 font-medium">{job.company}</p>}
                    {job.snippet && (
                      <p className="mt-2 line-clamp-3 max-w-prose leading-relaxed text-ink-soft">{job.snippet}</p>
                    )}
                    <p className="mt-2 text-sm text-ink-soft">Found for {job.query}</p>
                    <JobActions resumeId={resumeId} job={job} />
                  </div>
                  <ul className="space-y-0.5 text-sm text-ink-soft md:text-right">
                    {job.location && <li>{job.location}</li>}
                    {job.type && <li>{job.type}</li>}
                    {job.salary && <li className="font-medium text-ink">{job.salary}</li>}
                    {posted && <li>Updated {posted}</li>}
                    {job.source && <li>via {job.source}</li>}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-6 text-ink-soft">
        Also search directly on{" "}
        {LOCAL_SITES.map((site, i) => (
          <span key={site.href}>
            {i > 0 && (i === LOCAL_SITES.length - 1 ? ", and " : ", ")}
            <a
              href={site.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-semibold text-pencil underline underline-offset-2"
            >
              {site.name}
            </a>
          </span>
        ))}
        .
      </p>
    </section>
  );
}
