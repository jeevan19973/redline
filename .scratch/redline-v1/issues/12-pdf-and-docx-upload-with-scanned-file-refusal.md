# 12: PDF and DOCX upload, with scanned-file refusal

**What to build:** A Signer can upload a text-based PDF or a DOCX, extracted in their browser like a plain-text file. A scanned PDF with no text layer is refused plainly, because there is no OCR and a citation is worthless against misread text (ADR 0001). An unsupported file type gets a plain message telling the Signer to export to a supported format.

**Blocked by:** 02 (Upload a plain-text file or paste text as a Draft)

**Status:** done

**Dependencies approved for this ticket (2026-09-30):** `pdfjs-dist` for PDF text and `mammoth` for DOCX text. Anything beyond this still waits for approval.

- [x] Text-based PDF and DOCX files are extracted in the browser; the original file is never uploaded or stored
- [x] Extraction returns plain text or a typed refusal: unsupported type, or no text layer
- [x] A PDF with no extractable text is refused as scanned, with no OCR fallback and no Draft created
- [x] An unsupported file type is refused with the list of supported types
- [x] The extracted text shown on the Draft page is exactly the text later citations are checked against

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 189 tests and build pass; package.json gained only pdfjs-dist 6.3.289 and mammoth 1.13.0 (pdfjs-dist brings its own optional @napi-rs/canvas). The real libraries were exercised in headless Chrome on a text PDF, an image-only PDF, a DOCX, a fake PDF, an empty DOCX, .rtf and .doc; no request carried the file. Decisions: the PDF.js worker is served unmodified from the app via new URL(import.meta.url); PDF.js is kept out of the server bundle; PDF text joining rule documented in lib/extraction/pdf.ts. Open: CJK PDFs needing CMap files may extract wrong text; an empty .docx gets the damaged-or-password-protected message; refusals render below the text box.
