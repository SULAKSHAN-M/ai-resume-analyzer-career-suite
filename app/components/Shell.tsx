import type { ReactNode } from "react";
import { Navbar } from "~/components/Navbar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
        {children}
      </main>
    </>
  );
}
