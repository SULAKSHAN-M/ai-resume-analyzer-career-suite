import { useState, type ChangeEvent } from "react";
import { JD_ACCEPT, MAX_JD_FILE_BYTES } from "../../constants";
import { cn, formatSize } from "~/lib/utils";

interface JobDescriptionFieldProps {
  text: string;
  onTextChange: (text: string) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * A job description, as either pasted text or an attached PDF/image. The two are
 * mutually exclusive in this UI: attaching a file replaces the text box, since the
 * AI reads the file directly (no text is extracted from it here).
 */
export function JobDescriptionField({ text, onTextChange, file, onFileChange, disabled }: JobDescriptionFieldProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  const attachFile = (event: ChangeEvent<HTMLInputElement>) => {
    const candidate = event.target.files?.[0];
    event.target.value = ""; // lets the same file be chosen again
    if (!candidate) return;

    const looksLikePdf = candidate.type === "application/pdf" || /\.pdf$/i.test(candidate.name);
    const looksLikeImage = /^image\/(png|jpeg|webp)$/.test(candidate.type) || /\.(png|jpe?g|webp)$/i.test(candidate.name);
    if (!looksLikePdf && !looksLikeImage) {
      setFileError("That isn't a PDF, PNG, JPG or WebP file.");
      return;
    }
    if (candidate.size > MAX_JD_FILE_BYTES) {
      setFileError(`That file is ${formatSize(candidate.size)}. The limit is ${formatSize(MAX_JD_FILE_BYTES)}.`);
      return;
    }

    setFileError(null);
    onFileChange(candidate);
  };

  return (
    <div>
      <label htmlFor="job-description" className="block">
        <span className="font-display font-semibold">Job description</span>{" "}
        <span className="text-sm text-ink-soft">(optional)</span>
      </label>

      {file ? (
        <div className="mt-1.5 flex items-center justify-between gap-4 border border-rule bg-sheet px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-display font-semibold">{file.name}</p>
            <p className="text-sm text-ink-soft">{formatSize(file.size)} · read automatically during analysis</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onFileChange(null)}
            className="shrink-0 font-display font-semibold text-pencil underline underline-offset-2 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <textarea
            id="job-description"
            rows={7}
            value={text}
            disabled={disabled}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="Paste the job posting here, or attach a PDF or screenshot below"
            className={cn(
              "mt-1.5 w-full resize-y border border-rule bg-sheet px-3 py-2.5",
              "placeholder:text-ink-soft/70 disabled:opacity-60",
            )}
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
            <label
              className={cn(
                "inline-block cursor-pointer border border-pencil px-4 py-2 font-display font-semibold text-pencil",
                "focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-pencil hover:bg-pencil/5",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              Attach a PDF or image instead
              <input
                type="file"
                accept={JD_ACCEPT}
                disabled={disabled}
                onChange={attachFile}
                className="sr-only"
              />
            </label>
            <span className="text-sm text-ink-soft">Screenshots work. Up to {formatSize(MAX_JD_FILE_BYTES)}.</span>
          </div>
        </>
      )}

      {fileError && (
        <p role="alert" className="mt-2 text-sm text-fix">
          {fileError}
        </p>
      )}
    </div>
  );
}
