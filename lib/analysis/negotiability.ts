import type { ModelClient } from "../model/port.ts";
import { ATTEMPTS, locateAll } from "./citations.ts";
import { parseBasisRequote, parseCounterOffer } from "./parse.ts";
import { basisRequoteRequest, counterOfferRequest } from "./prompt.ts";
import type { FreeTextRedLine } from "./red-lines.ts";
import type { BasisCitationFailure, CounterOfferGap, Negotiability, ProposedFlag, SourceSentence } from "./report.ts";

// Negotiability and the Counter-offer for one flag whose Source sentences
// already passed verification (ADR 0003). Nothing here can hide the flag or
// touch its severity: every outcome is a Negotiability for it, plus what the
// maintainer should know.
//
// - Non-negotiable: the basis sentence must be in the text by the same
//   exact-match rule as a Source sentence, with one regeneration. Any
//   Counter-offer the model wrote is dropped.
// - A basis that still fails is recorded, and the flag is treated as
//   negotiable, since a take-it-or-leave-it label that cannot cite its basis
//   is not shown.
// - Negotiable: the model's Counter-offer, or after one regeneration request
//   its new one, or none, recorded as a gap. Code never writes the wording.

export type ResolvedNegotiability = {
  negotiability: Negotiability;
  basisFailure?: BasisCitationFailure;
  counterOfferGap?: CounterOfferGap;
};

export async function resolveNegotiability(
  extractedText: string,
  proposed: ProposedFlag,
  sourceSentences: readonly SourceSentence[],
  redLine: FreeTextRedLine | undefined,
  modelClient: ModelClient,
): Promise<ResolvedNegotiability> {
  const sentences = sourceSentences.map((sentence) => sentence.text);
  let basisFailure: BasisCitationFailure | undefined;

  if (proposed.negotiability === "nonNegotiable") {
    let located = locateAll(extractedText, [proposed.nonNegotiableBasis]);
    if (!located.ok) {
      // A failure of the regeneration call itself rejects the whole analysis,
      // like every other model failure.
      const { data } = await modelClient.complete(basisRequoteRequest(extractedText, proposed, sentences, redLine));
      located = locateAll(extractedText, [parseBasisRequote(data)]);
    }
    if (located.ok) {
      return { negotiability: { negotiability: "nonNegotiable", nonNegotiableBasis: located.sentences[0] } };
    }
    basisFailure = { nonNegotiableBasis: { flag: proposed }, failedSentences: located.failed, attempts: ATTEMPTS };
  }

  let counterOffer = proposed.counterOffer.trim();
  if (!counterOffer) {
    const { data } = await modelClient.complete(counterOfferRequest(extractedText, proposed, sentences, redLine));
    counterOffer = parseCounterOffer(data).trim();
  }
  return {
    negotiability: counterOffer ? { negotiability: "negotiable", counterOffer } : { negotiability: "negotiable" },
    ...(basisFailure && { basisFailure }),
    ...(!counterOffer && { counterOfferGap: { flag: proposed, attempts: ATTEMPTS } }),
  };
}
