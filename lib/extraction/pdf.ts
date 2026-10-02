import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";

// The text of a PDF's text layer, or null when there is none.
//
// The joining rule decides what every Source sentence is checked against
// (ADR 0001), so it is deliberately simple and is the only change made to
// what PDF.js returns:
//
// - Within a page, text items are concatenated in the order PDF.js returns
//   them (content-stream order). PDF.js already puts a space item between
//   words it sees a gap between, so nothing is added between items.
// - An item marked `hasEOL` (PDF.js saw the line end there) is followed by
//   one "\n". Nothing else becomes a line break.
// - Pages are separated by one blank line ("\n\n").
// - Nothing is trimmed, collapsed or de-hyphenated: a word hyphenated across
//   a line break stays "agree-\nment". PDF.js's own Unicode normalization
//   (ligatures such as "ﬁ" become "fi") is kept, because a quote typed or
//   copied from the page has the plain letters.
//
// A document whose pages yield no non-whitespace text at all is a scan (or
// an image-only PDF), and there is no OCR (ADR 0001), so this returns null.
export async function pdfDocumentText(doc: PDFDocumentProxy): Promise<string | null> {
  const pages: string[] = [];
  for (let number = 1; number <= doc.numPages; number++) {
    const page = await doc.getPage(number);
    const content = await page.getTextContent();
    pages.push(joinItems(content.items));
    page.cleanup();
  }
  const text = pages.join("\n\n");
  return /\S/.test(text) ? text : null;
}

function joinItems(items: (TextItem | TextMarkedContent)[]): string {
  let text = "";
  for (const item of items) {
    // Marked-content markers carry no text.
    if (!("str" in item)) continue;
    text += item.str;
    if (item.hasEOL) text += "\n";
  }
  return text;
}

// Reads a PDF in the browser with PDF.js, which loads only when a PDF is
// chosen. Its worker is a file the app itself serves, never a CDN or a
// third-party script: the bundler sees this `new URL(..., import.meta.url)`,
// copies PDF.js's own `pdf.worker.min.mjs` unchanged into the build's
// static files (`/_next/static/media/`), and turns the URL into that
// same-origin path. PDF.js then starts it as a module worker.
export async function readPdf(data: Uint8Array): Promise<string | null> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const task = pdfjs.getDocument({ data });
  try {
    return await pdfDocumentText(await task.promise);
  } finally {
    await task.destroy();
  }
}
