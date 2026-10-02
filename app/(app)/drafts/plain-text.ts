// A file is accepted when it says it is plain text or is named .txt.
export function isPlainText(file: File) {
  return file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
}
