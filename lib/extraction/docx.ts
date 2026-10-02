// Reads a Word (.docx) file in the browser with mammoth, which loads only
// when a .docx is chosen. The text is mammoth's raw text exactly as it
// returns it (each paragraph followed by a blank line), or null when the
// file holds no text.
export async function readDocx(data: ArrayBuffer): Promise<string | null> {
  const mammoth = (await import("mammoth")).default;
  const { value } = await mammoth.extractRawText({ arrayBuffer: data });
  return /\S/.test(value) ? value : null;
}
