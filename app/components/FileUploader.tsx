import { useState, type DragEvent } from "react";
import { MAX_UPLOAD_BYTES } from "../../constants";
import { cn, formatSize } from "~/lib/utils";

interface FileUploaderProps {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function FileUploader({ file, onChange, disabled }: FileUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = (candidate: File | undefined) => {
    if (!candidate) return;
    const isPdf = candidate.type === "application/pdf" || /\.pdf$/i.test(candidate.name);
    if (!isPdf) {
      setError("That isn't a PDF. Export your resume as a PDF and try again.");
      return;
    }
    if (candidate.size > MAX_UPLOAD_BYTES) {
      setError(`That file is ${formatSize(candidate.size)}. The limit is ${formatSize(MAX_UPLOAD_BYTES)}.`);
      return;
    }
    setError(null);
    onChange(candidate);
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) accept(e.dataTransfer.files[0]);
  };

  return (
    <div>
      {file ? (
        <div className="flex items-center justify-between gap-4 border border-rule bg-sheet px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display font-semibold">{file.name}</p>
            <p className="text-sm text-ink-soft">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            className="shrink-0 font-display font-semibold text-pencil underline underline-offset-2 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor="resume-file"
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-start gap-1 border-2 border-dashed px-6 py-10 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pencil",
            dragging ? "border-pencil bg-pencil/5" : "border-rule bg-sheet hover:border-pencil",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            id="resume-file"
            type="file"
            accept="application/pdf,.pdf"
            disabled={disabled}
            className="sr-only"
            onChange={(e) => accept(e.target.files?.[0])}
          />
          <span className="font-display text-lg font-semibold">Drop your resume here</span>
          <span className="text-ink-soft">or choose a PDF, up to {formatSize(MAX_UPLOAD_BYTES)}</span>
        </label>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-fix">
          {error}
        </p>
      )}
    </div>
  );
}
