import type { ModelClient } from "../model/port.ts";
import { ATTEMPTS, locateWithRequote } from "./citations.ts";
import { parseGuarantyRequote } from "./parse.ts";
import { guarantyRequoteRequest } from "./prompt.ts";
import type { GuarantyCitationFailure, GuarantyGap } from "./report.ts";
import { GUARANTY_GAP } from "./templates.ts";

// The guaranty gap (ADR 0003): when the text refers to a separate guaranty,
// the Report says the Signer's personal exposure under it was not checked,
// quoting the sentence that refers to it. That sentence is verified by the
// same exact-substring rule as a flag's, with one regeneration.

export type VerifiedGuaranty =
  // The model reported no reference to a separate guaranty.
  | { kind: "none" }
  // It did, and the sentence is in the text.
  | { kind: "gap"; guarantyGap: GuarantyGap }
  // It did, but the sentence is not in the text, even after a regeneration.
  // Nothing is shown, but the reference still counts against the Clean
  // verdict's personal guarantee line.
  | { kind: "withheld"; citationFailure: GuarantyCitationFailure };

export async function verifyGuaranty(
  extractedText: string,
  reference: string | null,
  modelClient: ModelClient,
): Promise<VerifiedGuaranty> {
  if (reference === null) return { kind: "none" };

  // As with a flag, a failure of the regeneration call itself rejects the
  // whole analysis.
  const located = await locateWithRequote(extractedText, [reference], async () => {
    const { data } = await modelClient.complete(guarantyRequoteRequest(extractedText, reference));
    return [parseGuarantyRequote(data)];
  });
  if (!located.ok) {
    return {
      kind: "withheld",
      citationFailure: {
        guarantyReference: { sourceSentence: reference },
        failedSentences: located.failed,
        attempts: ATTEMPTS,
      },
    };
  }

  return { kind: "gap", guarantyGap: { statement: GUARANTY_GAP, sourceSentence: located.sentences[0] } };
}
