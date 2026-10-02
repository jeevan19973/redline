import { CATALOG } from "./catalog.ts";

// Fixed copy the Signer reads in a report. These are templates, never model
// output, so no model can make them say a document is safe to sign
// (spec, "Rules enforced inside the Analysis module"). Each was run through
// the humanizer skill.

// On every report (ADR 0005): the report covers only this exact text, a
// revision has to be added again, and documents that were not added, such as
// a separate guaranty, were not checked.
export const SCOPE_STAMP =
  "This report covers only this exact text. If the document changes, even by one clause, add the new version as a new Draft and analyze it again. Underline didn't check any document that wasn't added here, such as a separate guaranty.";

// The Clean verdict (ADR 0004): it describes the text only, never says the
// document is safe to sign, and never implies a separate guaranty was
// checked (ADR 0003). The notes are added only when they apply.
export const CLEAN_VERDICT = Object.freeze({
  title: "No Dangerous clause found in this text",
  statement:
    "Underline didn't find a clause in this text that reaches past the business to you personally. Whether to sign is still your decision.",
  // When Caution flags sit alongside the verdict.
  cautionNote: "The Caution flags below still cost the business.",
  // Personal guarantee is not checked, and the guaranty gap above quotes the
  // sentence that refers to the separate guaranty.
  guarantyGapNote:
    "Personal guarantee is marked not checked because this text refers to a separate guaranty, quoted above, that wasn't added here.",
  // Personal guarantee is not checked, but the sentence the model quoted for
  // the separate guaranty failed verification, so nothing is quoted.
  guarantyUnverifiedNote:
    "Personal guarantee is marked not checked because Underline couldn't rule out a separate guaranty, and it read only this text.",
});

// The guaranty gap (ADR 0003), shown with the sentence that refers to the
// separate guaranty.
export const GUARANTY_GAP =
  "This text refers to a separate guaranty. That document wasn't added here, so Underline didn't check your personal exposure under it.";

// The question box's reply when the text does not answer the question, or
// when the answer's Source sentences cannot be verified. It never guesses
// and never says what the document leaves out means.
export const DOES_NOT_SAY =
  "This document doesn't say. Underline found nothing in this text that answers your question.";

// Every piece of fixed copy, by name, for the banned-claims test. Ticket 16
// adds the landing page copy here.
export const FIXED_COPY: Readonly<Record<string, string>> = Object.freeze({
  scopeStamp: SCOPE_STAMP,
  doesNotSay: DOES_NOT_SAY,
  ...Object.fromEntries(Object.entries(CLEAN_VERDICT).map(([name, text]) => [`cleanVerdict.${name}`, text])),
  guarantyGap: GUARANTY_GAP,
  // The clause names the Clean verdict lists as checked.
  ...Object.fromEntries(CATALOG.map((entry) => [`catalog.${entry.clauseType}`, entry.label])),
});
