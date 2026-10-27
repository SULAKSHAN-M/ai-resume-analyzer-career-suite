import type { Route } from "./+types/not-found";
import { NotFoundView } from "~/components/NotFoundView";
import { Shell } from "~/components/Shell";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Page not found | AI Resume Analyzer & Career Suite" },
    { name: "robots", content: "noindex" },
  ];
}

export default function NotFoundPage() {
  return (
    <Shell>
      <NotFoundView />
    </Shell>
  );
}
