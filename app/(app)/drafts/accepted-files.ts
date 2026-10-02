// What the file picker offers by default: text-based PDF, Word (.docx) and
// plain text. A Signer can still choose any file; Text extraction refuses
// the rest with the list of supported types.
export const ACCEPTED_FILES = [
  ".pdf",
  ".docx",
  ".txt",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
].join(",");
