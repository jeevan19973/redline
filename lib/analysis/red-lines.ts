import { isClauseType, type ClauseType } from "./catalog.ts";

// A Red line the Signer has set: either a catalog clause type they will not
// accept, or a term in their own words. `id` is the Red line's own id, so a
// flag can say which Red line raised or produced it.
export type RedLine =
  | { readonly id: string; readonly kind: "catalog"; readonly clauseType: ClauseType }
  | { readonly id: string; readonly kind: "freeText"; readonly text: string };

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
