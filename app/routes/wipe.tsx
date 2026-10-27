import { useEffect, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/wipe";
import { Shell } from "~/components/Shell";
import { api } from "~/lib/api";
import { useRequireAuth } from "~/lib/useRequireAuth";
import { errorMessage } from "~/lib/utils";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Wipe app data | AI Resume Analyzer & Career Suite" }];
}

type Phase = "idle" | "confirm" | "wiping" | "done";

export default function Wipe() {
  const { ready } = useRequireAuth("/wipe");
  const [count, setCount] = useState<number | null>(null);
  const [deleted, setDeleted] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    api
      .get<{ resumes: Resume[] }>("/api/resumes")
      .then(({ resumes }) => setCount(resumes.length))
      .catch((err) => setError(errorMessage(err, "Couldn't load your reviews.")));

  useEffect(() => {
    if (ready) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const wipe = async () => {
    setPhase("wiping");
    setError(null);
    try {
      const { deleted } = await api.del<{ deleted: number }>("/api/resumes");
      setDeleted(deleted);
      setCount(0);
      setPhase("done");
    } catch (err) {
      setError(errorMessage(err, "The wipe didn't finish."));
      setPhase("idle");
      void load();
    }
  };

  return (
    <Shell>
      <div className="max-w-2xl">
        <h1 className="text-4xl font-extrabold">Wipe app data</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Deletes every resume, preview and review saved to your account. Your account itself
          isn't affected.
        </p>

        {!ready || count === null ? (
          error ? (
            <p role="alert" className="mt-8 text-fix">
              {error}
            </p>
          ) : (
            <p className="mt-8 text-ink-soft" role="status">
              Loading your data…
            </p>
          )
        ) : phase === "done" ? (
          <div className="mt-8" role="status">
            <p className="font-display text-xl font-semibold text-good">
              Deleted {deleted} {deleted === 1 ? "review" : "reviews"}.
            </p>
            <Link to="/upload" className="mt-4 inline-block font-display font-semibold text-pencil underline underline-offset-2">
              Review a new resume
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-8 font-display text-xl font-semibold">
              {count === 0 ? "There's nothing to delete." : `${count} ${count === 1 ? "review" : "reviews"} stored`}
            </p>

            {error && (
              <p role="alert" className="mt-5 text-fix">
                {error}
              </p>
            )}

            {count > 0 && phase === "idle" && (
              <button
                type="button"
                onClick={() => setPhase("confirm")}
                className="mt-8 bg-fix px-6 py-3 font-display text-lg font-semibold text-white hover:bg-fix/90"
              >
                Wipe app data
              </button>
            )}

            {phase === "confirm" && (
              <div className="mt-8 border border-fix bg-sheet p-5" role="alertdialog" aria-labelledby="confirm-heading">
                <h2 id="confirm-heading" className="text-xl font-bold">
                  Delete everything?
                </h2>
                <p className="mt-1 text-ink-soft">This can't be undone.</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={wipe}
                    className="bg-fix px-5 py-2.5 font-display font-semibold text-white hover:bg-fix/90"
                  >
                    Delete everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhase("idle")}
                    className="font-display font-semibold text-pencil underline underline-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {phase === "wiping" && (
              <p className="mt-8 text-ink-soft" role="status">
                Deleting your data…
              </p>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
