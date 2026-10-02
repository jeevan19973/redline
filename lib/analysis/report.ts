import { isClauseType, type ClauseType, type Severity } from "./catalog.ts";
import { isRedLine, type CatalogRedLine, type FreeTextRedLine, type RedLine } from "./red-lines.ts";

// A Source sentence on a shown Risk flag: the exact text, verified as a
// substring of the stored text, and where it starts there. The offset is a
// JavaScript string index (UTF-16 code units), the first place the sentence
// occurs.
export type SourceSentence = {
  readonly text: string;
  readonly offset: number;
};

// What every Risk flag that passed citation verification carries, with its
// severity decided in code (ADR 0001, ADR 0003).
type VerifiedFlagBody = {
  readonly severity: Severity;
  // In document order, so the first is the earliest in the text.
  readonly sourceSentences: readonly SourceSentence[];
  // One confident Reading, or two when the sentence honestly supports two.
  readonly readings: readonly string[];
  // The model's answer to the personal-reach test, kept as the basis for
  // the severity.
  readonly reachesSignerPersonally: boolean;
};

// A Risk flag on a catalog clause type.
export type CatalogRiskFlag = VerifiedFlagBody & {
  readonly clauseType: ClauseType;
  // Set when one of the Signer's catalog Red lines raised this flag from
  // Caution to Dangerous: that Red line, as the report ran against it.
  readonly raisedByRedLine?: CatalogRedLine;
  readonly crossesRedLine?: never;
};

// A Risk flag a free-text Red line added, where the document contains the
// term the Signer said they will not accept. Its severity comes from the
// personal-reach test alone, like any flag; it always crosses that Red line.
export type RedLineRiskFlag = VerifiedFlagBody & {
  readonly clauseType: "redLine";
  // The free-text Red line that produced it, as the report ran against it.
  readonly crossesRedLine: FreeTextRedLine;
  // Never raised: no Red line raises a flag a free-text Red line added.
  readonly raisedByRedLine?: never;
};

export type RiskFlag = CatalogRiskFlag | RedLineRiskFlag;

// What every flag the model proposes carries, before verification.
type ProposedFlagBody = {
  readonly sourceSentences: readonly string[];
  readonly readings: readonly string[];
  readonly reachesSignerPersonally: boolean;
};

// A flag as the model proposed it on a catalog clause type.
export type ProposedCatalogFlag = ProposedFlagBody & { readonly clauseType: ClauseType };

// A flag as the model proposed it for a free-text Red line, naming that Red
// line by its id. The id is checked against the Red lines passed in.
export type ProposedRedLineFlag = ProposedFlagBody & { readonly clauseType: "redLine"; readonly redLineId: string };

export type ProposedFlag = ProposedCatalogFlag | ProposedRedLineFlag;

// A flag withheld because a Source sentence failed verification, even after
// a regeneration. For the maintainer and evals; never shown to the Signer.
export type FlagCitationFailure = {
  // The flag as the model first proposed it.
  readonly flag: ProposedFlag;
  // The sentences from the last attempt that are not in the stored text.
  readonly failedSentences: readonly string[];
  // How many times the model quoted the flag's sentences: the first
  // analysis plus one regeneration.
  readonly attempts: number;
};

// The guaranty gap's sentence, withheld because it failed verification even
// after a regeneration. The model still reported a reference to a separate
// guaranty, so the Clean verdict marks personal guarantee not checked.
export type GuarantyCitationFailure = {
  // The sentence as the model first quoted it.
  readonly guarantyReference: { readonly sourceSentence: string };
  readonly failedSentences: readonly string[];
  readonly attempts: number;
};

export type CitationFailure = FlagCitationFailure | GuarantyCitationFailure;

// The text refers to a separate guaranty, which Underline never saw, so the
// Signer's personal exposure under it was not checked (ADR 0003).
export type GuarantyGap = {
  // Fixed template text, never model output.
  readonly statement: string;
  // The sentence that refers to the guaranty, verified like a flag's.
  readonly sourceSentence: SourceSentence;
};

// One line of the Clean verdict's list: a catalog clause type and whether
// it was checked. Every type is checked except personal guarantee under a
// guaranty gap.
export type CheckedClause = {
  readonly clauseType: ClauseType;
  readonly checked: boolean;
};

// The result for a Draft with no Dangerous flag and nothing crossing a Red
// line (ADR 0004). Its wording is
// fixed template text, never model output; it describes the text only.
export type CleanVerdict = {
  readonly title: string;
  readonly statement: string;
  // Extra template sentences that apply to this Report, in order.
  readonly notes: readonly string[];
  // The whole fixed catalog, in catalog order.
  readonly checked: readonly CheckedClause[];
};

// What a Report holds. Later tickets add Confidence and Counter-offers.
export type ReportContent = {
  readonly summary: string;
  // Dangerous first, then by the offset of each flag's first Source sentence.
  readonly riskFlags: readonly RiskFlag[];
  readonly citationFailures: readonly CitationFailure[];
  // Flags the model said a free-text Red line produced, naming an id that is
  // not one of the free-text Red lines passed in. Dropped before citation
  // verification; for the maintainer and evals, never shown to the Signer.
  readonly unmatchedRedLineFlags: readonly ProposedRedLineFlag[];
  // Present only when no flag is Dangerous and no flag crosses a Red line.
  readonly cleanVerdict?: CleanVerdict;
  // Present only when the text refers to a separate guaranty and the
  // sentence that does so passed verification.
  readonly guarantyGap?: GuarantyGap;
  readonly scopeStamp: string;
  readonly redLinesSnapshot: readonly RedLine[];
  // The model that wrote the analysis, as the model client reported it.
  readonly modelId: string;
  // When the analysis finished, as an ISO 8601 timestamp.
  readonly createdAt: string;
};

// The brand that makes a Report something only this module can produce. It
// exists only in the types: the symbol is declared, never created, and never
// exported, so code outside lib/analysis/ cannot write a value of this type
// without a cast.
declare const reportBrand: unique symbol;

// A Report produced by analyzeDraft, with every rule applied.
export type Report = ReportContent & { readonly [reportBrand]: true };

// A Report as the Signer sees it, read back from storage or sent to the
// browser. It is plain data for display: holding one is not proof that
// analyzeDraft produced it. It never carries citation failures, so they
// never reach the browser, and neither do unmatched Red line flags.
// `riskFlags` is absent on a Report stored before
// Risk flags existed, which was never checked for them.
export type StoredReport = Omit<ReportContent, "riskFlags" | "citationFailures" | "unmatchedRedLineFlags"> & {
  readonly riskFlags?: readonly RiskFlag[];
};

export function brandReport(content: ReportContent): Report {
  return Object.freeze({ ...content }) as Report;
}

// The part of a fresh Report the Signer may see, for sending to the browser.
export function displayReport(report: Report): StoredReport {
  const { citationFailures: _withheld, unmatchedRedLineFlags: _dropped, ...shown } = report;
  return shown;
}

// Reads a stored Report back for display, or returns null when the value is
// not a well-formed one (a Signer can write their own report rows, so the
// stored JSON is not trusted). Citation failures and unmatched Red line
// flags are dropped.
export function readStoredReport(value: unknown): StoredReport | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { summary, riskFlags, cleanVerdict, guarantyGap, scopeStamp, redLinesSnapshot, modelId, createdAt } =
    value as Record<string, unknown>;
  if (typeof summary !== "string" || !summary.trim()) return null;
  if (typeof scopeStamp !== "string" || !scopeStamp.trim()) return null;
  if (!Array.isArray(redLinesSnapshot) || !redLinesSnapshot.every(isRedLine)) return null;
  if (typeof modelId !== "string" || !modelId) return null;
  if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt))) return null;
  // Both are absent on a Report stored before they existed, and on one
  // where they do not apply.
  if (cleanVerdict !== undefined && !isCleanVerdict(cleanVerdict)) return null;
  if (guarantyGap !== undefined && !isGuarantyGap(guarantyGap)) return null;
  const base: StoredReport = {
    summary,
    ...(cleanVerdict !== undefined && { cleanVerdict }),
    ...(guarantyGap !== undefined && { guarantyGap }),
    scopeStamp,
    redLinesSnapshot,
    modelId,
    createdAt,
  };
  if (riskFlags === undefined) return base;
  if (!Array.isArray(riskFlags) || !riskFlags.every((flag) => isRiskFlag(flag, redLinesSnapshot))) return null;
  return { ...base, riskFlags };
}

function isCleanVerdict(value: unknown): value is CleanVerdict {
  if (typeof value !== "object" || value === null) return false;
  const { title, statement, notes, checked } = value as Record<string, unknown>;
  return (
    isText(title) &&
    isText(statement) &&
    Array.isArray(notes) &&
    notes.every(isText) &&
    Array.isArray(checked) &&
    checked.length > 0 &&
    checked.every(isCheckedClause)
  );
}

function isCheckedClause(value: unknown): value is CheckedClause {
  if (typeof value !== "object" || value === null) return false;
  const { clauseType, checked } = value as Record<string, unknown>;
  return isClauseType(clauseType) && typeof checked === "boolean";
}

function isGuarantyGap(value: unknown): value is GuarantyGap {
  if (typeof value !== "object" || value === null) return false;
  const { statement, sourceSentence } = value as Record<string, unknown>;
  return isText(statement) && isSourceSentence(sourceSentence);
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function isRiskFlag(value: unknown, redLinesSnapshot: readonly RedLine[]): value is RiskFlag {
  if (typeof value !== "object" || value === null) return false;
  const { clauseType, severity, sourceSentences, readings, reachesSignerPersonally, raisedByRedLine, crossesRedLine } =
    value as Record<string, unknown>;
  if (clauseType === "redLine") {
    // An added flag is never raised, and it crosses a free-text Red line the
    // report ran against, exactly as that Red line was snapshotted.
    if (raisedByRedLine !== undefined) return false;
    if (!isRedLine(crossesRedLine) || crossesRedLine.kind !== "freeText") return false;
    const snapshotted = redLinesSnapshot.find((redLine) => redLine.id === crossesRedLine.id);
    if (!snapshotted || snapshotted.kind !== "freeText" || snapshotted.text !== crossesRedLine.text) return false;
  } else {
    if (!isClauseType(clauseType) || crossesRedLine !== undefined) return false;
    // Only a Dangerous flag can have been raised, and only by a catalog Red
    // line on its own clause type.
    if (raisedByRedLine !== undefined) {
      if (!isRedLine(raisedByRedLine) || raisedByRedLine.kind !== "catalog") return false;
      if (raisedByRedLine.clauseType !== clauseType || severity !== "Dangerous") return false;
    }
  }
  return (
    (severity === "Dangerous" || severity === "Caution") &&
    Array.isArray(sourceSentences) &&
    sourceSentences.length > 0 &&
    sourceSentences.every(isSourceSentence) &&
    Array.isArray(readings) &&
    (readings.length === 1 || readings.length === 2) &&
    readings.every((reading) => typeof reading === "string" && reading.trim() !== "") &&
    typeof reachesSignerPersonally === "boolean"
  );
}

function isSourceSentence(value: unknown): value is SourceSentence {
  if (typeof value !== "object" || value === null) return false;
  const { text, offset } = value as Record<string, unknown>;
  return typeof text === "string" && text !== "" && Number.isInteger(offset) && (offset as number) >= 0;
}
