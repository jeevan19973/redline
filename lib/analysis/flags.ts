import type { ModelClient } from "../model/port.ts";
import { severityFor } from "./catalog.ts";
import { parseRequote } from "./parse.ts";
import { requoteRequest } from "./prompt.ts";
import type { CitationFailure, ProposedFlag, RiskFlag, SourceSentence } from "./report.ts";

// Turns the model's proposed flags into the Risk flags a Report shows:
// citation verification with one regeneration (ADR 0001), severity from the
// catalog and the personal-reach test (ADR 0003), then ordering.

// How many times a flag's sentences are quoted before it is withheld: the
// analysis itself, then one regeneration.
const ATTEMPTS = 2;

export type VerifiedFlags = {
  riskFlags: RiskFlag[];
  citationFailures: CitationFailure[];
};

export async function verifyFlags(
  extractedText: string,
  proposed: readonly ProposedFlag[],
  modelClient: ModelClient,
): Promise<VerifiedFlags> {
  // Each flag that fails gets its own focused regeneration call. The calls
  // run together; each starts in flag order.
  const outcomes = await Promise.all(proposed.map((flag) => verifyOne(extractedText, flag, modelClient)));

  const riskFlags: RiskFlag[] = [];
  const citationFailures: CitationFailure[] = [];
  for (const outcome of outcomes) {
    if ("flag" in outcome) citationFailures.push(outcome);
    else riskFlags.push(outcome);
  }
  return { riskFlags: rank(riskFlags), citationFailures };
}

async function verifyOne(
  extractedText: string,
  proposed: ProposedFlag,
  modelClient: ModelClient,
): Promise<RiskFlag | CitationFailure> {
  let sentences = proposed.sourceSentences;
  let located = locateAll(extractedText, sentences);

  if (!located.ok) {
    // A failure of the regeneration call itself rejects the whole analysis,
    // like any other model failure, rather than silently dropping a flag
    // that may be Dangerous.
    const { data } = await modelClient.complete(requoteRequest(extractedText, proposed, located.failed));
    sentences = parseRequote(data);
    located = locateAll(extractedText, sentences);
    if (!located.ok) return { flag: proposed, failedSentences: located.failed, attempts: ATTEMPTS };
  }

  return {
    clauseType: proposed.clauseType,
    severity: severityFor(proposed.clauseType, proposed.reachesSignerPersonally),
    sourceSentences: located.sentences,
    readings: proposed.readings,
    reachesSignerPersonally: proposed.reachesSignerPersonally,
  };
}

type Located = { ok: true; sentences: SourceSentence[] } | { ok: false; failed: string[] };

// Every sentence must be an exact substring of the stored text: indexOf on
// the sentence as given, with no trimming, case folding, whitespace or quote
// normalization. A blank sentence, or an empty list, fails. Sentences come
// back in document order.
function locateAll(extractedText: string, sentences: readonly string[]): Located {
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

// Dangerous first, then by the offset of the first Source sentence. The sort
// is stable, so flags that start at the same place keep the model's order.
function rank(flags: RiskFlag[]): RiskFlag[] {
  const tier = (flag: RiskFlag) => (flag.severity === "Dangerous" ? 0 : 1);
  return flags.sort(
    (a, b) => tier(a) - tier(b) || a.sourceSentences[0].offset - b.sourceSentences[0].offset,
  );
}
