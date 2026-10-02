import { isClauseType, type ClauseType, type Severity } from "./catalog.ts";
import { isRedLine, type RedLine } from "./red-lines.ts";

// A Source sentence on a shown Risk flag: the exact text, verified as a
// substring of the stored text, and where it starts there. The offset is a
// JavaScript string index (UTF-16 code units), the first place the sentence
// occurs.
export type SourceSentence = {
  readonly text: string;
  readonly offset: number;
};

// A Risk flag that passed citation verification, with its severity decided
// in code (ADR 0001, ADR 0003).
export type RiskFlag = {
  readonly clauseType: ClauseType;
  readonly severity: Severity;
  // In document order, so the first is the earliest in the text.
  readonly sourceSentences: readonly SourceSentence[];
  // One confident Reading, or two when the sentence honestly supports two.
  readonly readings: readonly string[];
  // The model's answer to the personal-reach test, kept as the basis for
  // the severity.
  readonly reachesSignerPersonally: boolean;
};

// A flag as the model proposed it, before verification.
export type ProposedFlag = {
  readonly clauseType: ClauseType;
  readonly sourceSentences: readonly string[];
  readonly readings: readonly string[];
  readonly reachesSignerPersonally: boolean;
};

// A flag withheld because a Source sentence failed verification, even after
// a regeneration. For the maintainer and evals; never shown to the Signer.
export type CitationFailure = {
  // The flag as the model first proposed it.
  readonly flag: ProposedFlag;
  // The sentences from the last attempt that are not in the stored text.
  readonly failedSentences: readonly string[];
  // How many times the model quoted the flag's sentences: the first
  // analysis plus one regeneration.
  readonly attempts: number;
};

// What a Report holds. Later tickets add Confidence, Counter-offers, the
// Clean verdict and the guaranty gap.
export type ReportContent = {
  readonly summary: string;
  // Dangerous first, then by the offset of each flag's first Source sentence.
  readonly riskFlags: readonly RiskFlag[];
  readonly citationFailures: readonly CitationFailure[];
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
// never reach the browser. `riskFlags` is absent on a Report stored before
// Risk flags existed, which was never checked for them.
export type StoredReport = Omit<ReportContent, "riskFlags" | "citationFailures"> & {
  readonly riskFlags?: readonly RiskFlag[];
};

export function brandReport(content: ReportContent): Report {
  return Object.freeze({ ...content }) as Report;
}

// The part of a fresh Report the Signer may see, for sending to the browser.
export function displayReport(report: Report): StoredReport {
  const { citationFailures: _withheld, ...shown } = report;
  return shown;
}

// Reads a stored Report back for display, or returns null when the value is
// not a well-formed one (a Signer can write their own report rows, so the
// stored JSON is not trusted). Citation failures are dropped.
export function readStoredReport(value: unknown): StoredReport | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { summary, riskFlags, scopeStamp, redLinesSnapshot, modelId, createdAt } = value as Record<string, unknown>;
  if (typeof summary !== "string" || !summary.trim()) return null;
  if (typeof scopeStamp !== "string" || !scopeStamp.trim()) return null;
  if (!Array.isArray(redLinesSnapshot) || !redLinesSnapshot.every(isRedLine)) return null;
  if (typeof modelId !== "string" || !modelId) return null;
  if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt))) return null;
  const base = { summary, scopeStamp, redLinesSnapshot, modelId, createdAt };
  if (riskFlags === undefined) return base;
  if (!Array.isArray(riskFlags) || !riskFlags.every(isRiskFlag)) return null;
  return { ...base, riskFlags };
}

function isRiskFlag(value: unknown): value is RiskFlag {
  if (typeof value !== "object" || value === null) return false;
  const { clauseType, severity, sourceSentences, readings, reachesSignerPersonally } = value as Record<
    string,
    unknown
  >;
  return (
    isClauseType(clauseType) &&
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
