import type { SourceSentence } from "./report.ts";

// Citation verification (ADR 0001), shared by Risk flags and the guaranty
// gap: every quoted sentence must be an exact substring of the stored text.

// How many times a sentence is quoted before what rests on it is withheld:
// the analysis itself, then one regeneration.
export const ATTEMPTS = 2;

export type Located = { ok: true; sentences: SourceSentence[] } | { ok: false; failed: string[] };

// indexOf on the sentence as given, with no trimming, case folding,
// whitespace or quote normalization. A blank sentence, or an empty list,
// fails. Sentences come back in document order.
export function locateAll(extractedText: string, sentences: readonly string[]): Located {
  if (sentences.length === 0) return { ok: false, failed: [] };
  const found: SourceSentence[] = [];
  const failed: string[] = [];
  for (const sentence of sentences) {
    const offset = /\S/.test(sentence) ? extractedText.indexOf(sentence) : -1;
    if (offset === -1) failed.push(sentence);
    else found.push({ text: sentence, offset });
  }
  if (failed.length > 0) return { ok: false, failed };
  return { ok: true, sentences: found.sort((a, b) => a.offset - b.offset) };
}
