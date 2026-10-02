import type { Extraction } from "@/lib/extraction/index.ts";

// Text extraction for the Add a Draft and Analyze forms. The module, and
// PDF.js and mammoth behind it, load only in the browser when a file is
// chosen. Next compiles `typeof window` to a constant in each build, so the
// server-rendering build drops this import and none of them reaches a
// server bundle. A file is only ever chosen in the browser.
export async function readFile(file: File): Promise<Extraction> {
  if (typeof window !== "undefined") {
    try {
      const { extractText } = await import("@/lib/extraction/index.ts");
      return await extractText(file);
    } catch (error) {
      // The module's own chunk failed to load.
      console.error("Could not load text extraction", error);
    }
  }
  return { ok: false, reason: "unreadable" };
}
