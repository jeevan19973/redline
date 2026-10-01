# 12: PDF and DOCX upload, with scanned-file refusal

**What to build:** A Signer can upload a text-based PDF or a DOCX, extracted in their browser like a plain-text file. A scanned PDF with no text layer is refused plainly, because there is no OCR and a citation is worthless against misread text (ADR 0001). An unsupported file type gets a plain message telling the Signer to export to a supported format.

**Blocked by:** 02 (Upload a plain-text file as a Draft)

**Status:** ready-for-agent

**Dependencies approved for this ticket (2026-09-30):** `pdfjs-dist` for PDF text and `mammoth` for DOCX text. Anything beyond this still waits for approval.

- [ ] Text-based PDF and DOCX files are extracted in the browser; the original file is never uploaded or stored
- [ ] Extraction returns plain text or a typed refusal: unsupported type, or no text layer
- [ ] A PDF with no extractable text is refused as scanned, with no OCR fallback and no Draft created
- [ ] An unsupported file type is refused with the list of supported types
- [ ] The extracted text shown on the Draft page is exactly the text later citations are checked against
