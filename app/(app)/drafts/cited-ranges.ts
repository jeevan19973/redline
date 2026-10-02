import type { SourceSentence } from "@/lib/analysis/index.ts";

// Where each Risk flag's Source sentences sit in the Draft text, so the
// text can underline them in place and each flag can link to its sentences.
// The guaranty gap's sentence is placed the same way, as one more entry
// after the flags.

// Anything in a report that quotes the text: a Risk flag or the guaranty gap.
export type Citing = { readonly sourceSentences: readonly SourceSentence[] };

export type CitedRange = {
  // The element id of the underlined range in the text.
  readonly id: string;
  readonly start: number;
  readonly end: number;
  // Indexes of the entries (flags in display order, then the guaranty gap)
  // that quote text in this range.
  readonly flags: readonly number[];
};

export type CitedText = {
  // The underlined ranges, in document order, never overlapping.
  readonly ranges: readonly CitedRange[];
  // For each flag and each of its Source sentences, the id of the range that
  // holds it, or null when the sentence is not at its offset in this text.
  readonly targets: readonly (readonly (string | null)[])[];
};

export function citedText(text: string, flags: readonly Citing[]): CitedText {
  // A stored Report is not trusted (readStoredReport), so a sentence is only
  // placed when the text really holds it at its offset.
  const spans = flags.flatMap((flag, flagIndex) =>
    flag.sourceSentences.flatMap((sentence, sentenceIndex) =>
      text.startsWith(sentence.text, sentence.offset)
        ? [{ start: sentence.offset, end: sentence.offset + sentence.text.length, flagIndex, sentenceIndex }]
        : [],
    ),
  );
  spans.sort((a, b) => a.start - b.start || b.end - a.end);

  // Overlapping sentences (two flags quoting the same one, say) merge into
  // one underlined range that belongs to every flag involved.
  const merged: { start: number; end: number; members: typeof spans }[] = [];
  for (const span of spans) {
    const last = merged.at(-1);
    if (last && span.start < last.end) {
      last.end = Math.max(last.end, span.end);
      last.members.push(span);
    } else {
      merged.push({ start: span.start, end: span.end, members: [span] });
    }
  }

  const targets: (string | null)[][] = flags.map((flag) => flag.sourceSentences.map(() => null));
  const ranges = merged.map((range, index) => {
    const id = `cited-${index + 1}`;
    for (const member of range.members) targets[member.flagIndex][member.sentenceIndex] = id;
    const flagIndexes = [...new Set(range.members.map((member) => member.flagIndex))].sort((a, b) => a - b);
    return { id, start: range.start, end: range.end, flags: flagIndexes };
  });
  return { ranges, targets };
}
