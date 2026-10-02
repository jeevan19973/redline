import { isClauseType, type ClauseType } from "./catalog.ts";
import type { Judged, RiskFlag } from "./report.ts";

// A Red line the Signer has set: either a catalog clause type they will not
// accept, or a term in their own words. `id` is the Red line's own id, so a
// flag can say which Red line raised or produced it.
export type RedLine =
  | { readonly id: string; readonly kind: "catalog"; readonly clauseType: ClauseType }
  | { readonly id: string; readonly kind: "freeText"; readonly text: string };

// A Red line of the catalog kind: a clause type the Signer will not accept.
export type CatalogRedLine = Extract<RedLine, { kind: "catalog" }>;

// A Red line in the Signer's own words, for a term the catalog does not
// cover. It only ever adds flags.
export type FreeTextRedLine = Extract<RedLine, { kind: "freeText" }>;

// The longest free-text Red line, in characters. The screen and the server
// refuse a longer one, and a longer stored row is skipped, so a Signer's own
// words stay a short term rather than a page of instructions to the model.
export const FREE_TEXT_MAX_LENGTH = 120;

// The Signer's free-text Red lines, in the order given.
export function freeTextRedLines(redLines: readonly RedLine[]): FreeTextRedLine[] {
  return redLines.filter((redLine): redLine is FreeTextRedLine => redLine.kind === "freeText");
}

// The free-text Red line with this id, if one was passed in.
export function freeTextRedLineById(id: string, redLines: readonly RedLine[]): FreeTextRedLine | undefined {
  return freeTextRedLines(redLines).find((redLine) => redLine.id === id);
}

// The Signer's catalog Red line on a clause type, if they set one.
export function catalogRedLineFor(
  clauseType: ClauseType,
  redLines: readonly RedLine[],
): CatalogRedLine | undefined {
  return redLines.find(
    (redLine): redLine is CatalogRedLine => redLine.kind === "catalog" && redLine.clauseType === clauseType,
  );
}

// Red line raising (spec, "Severity floor"): a Caution flag whose clause type
// the Signer marked as one they will not accept becomes Dangerous, and says
// which Red line raised it. This can only raise. A Dangerous flag comes back
// untouched, nothing here writes Caution, and every flag given comes back,
// so no Red line, nor the lack of one, can hide or lower a Dangerous flag.
// Free-text Red lines never raise anything, and a flag a free-text Red line
// added is never raised either: it comes back untouched. It sees each flag as
// Judged, without its Confidence, and passes the rest of the flag through.
export function raiseByRedLines<F extends Judged<RiskFlag>>(flags: readonly F[], redLines: readonly RedLine[]): F[] {
  return flags.map((flag): F => {
    const judged: Judged<RiskFlag> = flag;
    if (judged.clauseType === "redLine" || judged.severity === "Dangerous") return flag;
    const redLine = catalogRedLineFor(judged.clauseType, redLines);
    if (!redLine) return flag;
    return {
      ...flag,
      severity: "Dangerous",
      raisedByRedLine: { id: redLine.id, kind: "catalog", clauseType: redLine.clauseType },
    };
  });
}

// A copy of the Red lines as given, so a report's snapshot cannot change when
// the caller's list does.
export function snapshotRedLines(redLines: readonly RedLine[]): readonly RedLine[] {
  return Object.freeze(redLines.map((redLine) => Object.freeze({ ...redLine })));
}

// Whether a value read back from storage is a well-formed Red line.
export function isRedLine(value: unknown): value is RedLine {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string") return false;
  if (candidate.kind === "catalog") {
    return isClauseType(candidate.clauseType);
  }
  if (candidate.kind === "freeText") return typeof candidate.text === "string";
  return false;
}
