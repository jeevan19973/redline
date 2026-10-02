// Fixed copy the Signer reads in a report. These are templates, never model
// output, so no model can make them say a document is safe to sign
// (spec, "Rules enforced inside the Analysis module"). Each was run through
// the humanizer skill.

// On every report (ADR 0005): the report covers only this exact text, a
// revision has to be added again, and documents that were not added, such as
// a separate guaranty, were not checked.
export const SCOPE_STAMP =
  "This report covers only this exact text. If the document changes, even by one clause, add the new version as a new Draft and analyze it again. Underline didn't check any document that wasn't added here, such as a separate guaranty.";

// Every piece of fixed copy, by name, for the banned-claims test. Tickets 07,
// 10 and 16 add the Clean verdict, the "does not say" reply and the landing
// page copy here.
export const FIXED_COPY: Readonly<Record<string, string>> = Object.freeze({
  scopeStamp: SCOPE_STAMP,
});
