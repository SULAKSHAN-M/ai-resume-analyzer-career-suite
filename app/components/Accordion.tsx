import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface AccordionItemProps {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function AccordionItem({ id, title, meta, open, onToggle, children }: AccordionItemProps) {
  return (
    <div className="border-b border-rule last:border-b-0">
      <h3>
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 py-5 text-left"
        >
          <span className="text-xl font-bold">{title}</span>
          <span className="flex shrink-0 items-center gap-3">
            {meta}
            <svg
              viewBox="0 0 20 20"
              className={cn(
                "size-5 text-ink-soft transition-transform motion-reduce:transition-none",
                open && "rotate-180",
              )}
              fill="none"
              aria-hidden="true"
            >
              <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </h3>
      {open && (
        <div
          id={`${id}-panel`}
          role="region"
          aria-labelledby={`${id}-trigger`}
          className="animate-in fade-in-0 slide-in-from-top-1 pb-6 duration-200 motion-reduce:animate-none"
        >
          {children}
        </div>
      )}
    </div>
  );
}
