interface AIModuleStatus {
  id: string;
  label: string;
  model: string;
  role: string;
  defaultThinking: string;
  stats: {
    attempts: number;
    successes: number;
    failures: number;
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
    lastStatus: number | null;
  };
}

export interface AIRouterStatus {
  mode: string;
  modules: AIModuleStatus[];
  routing: Record<string, string[]>;
}

export function AIIntelligence({ status }: { status: AIRouterStatus }) {
  return (
    <section className="mt-8 border border-rule bg-sheet p-6" aria-labelledby="ai-intelligence-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-pencil">Google AI routing</p>
          <h2 id="ai-intelligence-heading" className="mt-1 text-2xl font-bold">5 intelligence modules</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            The server chooses a model by task and automatically moves to another module when a model is overloaded, rate-limited, or unavailable.
          </p>
        </div>
        <span className="border border-rule bg-paper px-3 py-1 font-display text-xs font-semibold uppercase tracking-wide">{status.mode} mode</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {status.modules.map((module, index) => {
          const healthy = module.stats.lastStatus === null || module.stats.lastStatus === 200;
          return (
            <article key={module.id} className="border border-rule bg-paper p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-xs font-bold text-pencil">#{index + 1}</span>
                <span className={`text-xs font-semibold ${healthy ? "text-good" : "text-mid"}`}>
                  {module.stats.lastStatus === null ? "Ready" : module.stats.lastStatus === 200 ? "Healthy" : `HTTP ${module.stats.lastStatus}`}
                </span>
              </div>
              <h3 className="mt-2 text-base font-bold">{module.label}</h3>
              <p className="mt-1 break-words font-mono text-[11px] text-ink-soft">{module.model}</p>
              <p className="mt-3 text-xs leading-5 text-ink-soft">{module.role}</p>
              <div className="mt-3 border-t border-rule pt-2 text-[11px] text-ink-soft">
                <span>{module.stats.successes} successful</span>
                <span className="mx-1">·</span>
                <span>{module.stats.failures} failed</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
