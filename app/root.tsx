import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { useAuthStore } from "~/lib/useAuthStore";
import Footer from "~/components/Footer";
import { Navbar } from "~/components/Navbar";
import { NotFoundView } from "~/components/NotFoundView";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Inter:wght@400;500;600;700;800&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0b1224" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  const { pathname } = useLocation();
  const isAuthRoute = pathname === "/auth";

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className={isAuthRoute ? "h-dvh overflow-hidden" : "flex min-h-screen flex-col"}>
      <div className={isAuthRoute ? "h-full min-h-0" : "flex flex-1 flex-col"}>
        <Outlet />
      </div>
      {!isAuthRoute && <Footer />}
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <NotFoundView />
        </main>
        <Footer />
      </div>
    );
  }

  let heading = "Something went wrong";
  let details = "An unexpected error occurred. Please try again.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    heading = `Error ${error.status}`;
    details = error.statusText || details;
  } else if (import.meta.env.DEV && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-5 py-16 sm:px-8">
        <span className="inline-flex w-fit items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-rose-700">
          Application error
        </span>
        <h1 className="mt-5 text-4xl font-extrabold sm:text-5xl">{heading}</h1>
        <p className="mt-3 text-lg leading-8 text-ink-soft">{details}</p>
        {stack && (
          <pre className="mt-6 max-h-80 overflow-auto rounded-2xl border border-rule bg-sheet p-4 text-sm shadow-sm">
            <code>{stack}</code>
          </pre>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/" className="rounded-xl bg-pencil px-5 py-3 font-display font-bold text-white transition hover:bg-pencil-deep">Back to workspace</a>
          <a href="/faq" className="rounded-xl border border-rule bg-white px-5 py-3 font-display font-bold text-ink transition hover:border-indigo-200 hover:bg-indigo-50">Visit help center</a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
