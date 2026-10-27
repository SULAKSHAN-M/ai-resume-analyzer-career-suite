export interface PdfConversionResult {
  file: File | null;
  error?: string;
}

let pdfjsPromise: Promise<typeof import("pdfjs-dist/legacy/build/pdf.mjs")> | null = null;

/**
 * pdf.js touches browser-only globals when it loads, so it's imported on demand
 * from the browser instead of at the top of the file. That keeps server rendering safe.
 *
 * This uses pdf.js's "legacy" build. The standard build needs newer browser features
 * (such as Promise.try) and fails on browsers older than late 2024.
 */
function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((lib) => {
      // Copied into public/ by scripts/copy-pdf-worker.mjs after `npm install`.
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return lib;
    });
  }
  return pdfjsPromise;
}

/** Renders page one of a PDF to a PNG, used as the preview image shown in the app. */
export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  let task: ReturnType<Awaited<ReturnType<typeof loadPdfJs>>["getDocument"]> | undefined;
  try {
    const pdfjs = await loadPdfJs();
    task = pdfjs.getDocument({ data: await file.arrayBuffer() });
    const pdf = await task.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    await page.render({ canvas, viewport }).promise;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png", 1.0),
    );
    if (!blob) return { file: null, error: "Couldn't create a preview image from the PDF." };

    const baseName = file.name.replace(/\.pdf$/i, "") || "resume";
    return { file: new File([blob], `${baseName}.png`, { type: "image/png" }) };
  } catch (err) {
    return {
      file: null,
      error: `Couldn't read this PDF: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  } finally {
    void task?.destroy();
  }
}
