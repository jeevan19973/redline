// Text extraction (spec, Modules). Runs only in the browser: the Add a Draft
// and Analyze forms import it when a file is chosen, and only the string it
// returns is ever sent to the server, never the file. Supported types are
// text-based PDF, Word (.docx) and plain text. There is no OCR (ADR 0001).
//
// The returned text is what the Draft stores and every Source sentence is
// checked against, so callers keep it exactly as returned.

export type Extraction =
  | { ok: true; text: string }
  | { ok: false; reason: "unsupportedType" | "noTextLayer" | "unreadable" };

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function extractText(file: File): Promise<Extraction> {
  const name = file.name.toLowerCase();
  try {
    const head = new Uint8Array(await file.slice(0, 1024).arrayBuffer());
    // The header decides: a file that starts like a PDF is read as one
    // whatever its name, and one only named or typed as a PDF is not a PDF.
    if (hasPdfHeader(head)) {
      const { readPdf } = await import("./pdf.ts");
      const text = await readPdf(new Uint8Array(await file.arrayBuffer()));
      return text === null ? { ok: false, reason: "noTextLayer" } : { ok: true, text };
    }
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      return { ok: false, reason: "unreadable" };
    }

    if (name.endsWith(".docx") || file.type === DOCX_TYPE) {
      const { readDocx } = await import("./docx.ts");
      const text = await readDocx(await file.arrayBuffer());
      return text === null ? { ok: false, reason: "unreadable" } : { ok: true, text };
    }

    // Plain text is read exactly as the file holds it, line endings included.
    if (file.type === "text/plain" || name.endsWith(".txt")) {
      return { ok: true, text: await file.text() };
    }

    return { ok: false, reason: "unsupportedType" };
  } catch (error) {
    // A damaged or password-protected file, or a library that failed to load.
    console.error("Could not read a file", error);
    return { ok: false, reason: "unreadable" };
  }
}

// Whether the first bytes carry a PDF header. PDF readers accept "%PDF-"
// anywhere in the first 1024 bytes, so this does too.
function hasPdfHeader(head: Uint8Array): boolean {
  const marker = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"
  for (let start = 0; start + marker.length <= head.length; start++) {
    if (marker.every((byte, offset) => head[start + offset] === byte)) return true;
  }
  return false;
}
