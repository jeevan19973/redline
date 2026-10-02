import { isClauseType, type ClauseType, type Severity } from "./catalog.ts";
import { isRedLine, type CatalogRedLine, type FreeTextRedLine, type RedLine } from "./red-lines.ts";

// How sure Underline is of a flag's Reading (ADR 0004), as the model rated
// it. It answers a different question from severity, so nothing that decides
// severity, ordering, raising, the Severity floor, the Clean verdict or
// whether a flag shows ever reads it: those rules see a Judged flag, which
// has no Confidence (below). It is only carried to the Report and, when the
// display switch is on, shown.
export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;

export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export function isConfidence(value: unknown): value is Confidence {
  return (CONFIDENCE_LEVELS as readonly unknown[]).includes(value);
}

// A flag type as the severity, ordering, raising, Severity floor, Clean
// verdict and visibility rules see it: without its Confidence. Those rules
// take Judged flags (or a type parameter bounded by one), so reading
// Confidence there does not typecheck. Distributes over a union.
export type Judged<T> = T extends unknown ? Omit<T, "confidence"> : never;

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

// Whether the Signer can negotiate a flagged clause (ADR 0003), decided from
// the text. A negotiable flag carries the Counter-offer the model wrote, or
// none when the model gave none even after a regeneration (recorded in the
// Report's counterOfferGaps). A Non-negotiable flag carries the sentence its
// basis rests on, verified like a Source sentence, and never a Counter-offer.
// Negotiability never changes severity.
export type Negotiability =
  | {
      readonly negotiability: "negotiable";
      // Replacement contract wording the Signer can send as written.
      readonly counterOffer?: string;
      readonly nonNegotiableBasis?: never;
    }
  | {
      readonly negotiability: "nonNegotiable";
      // The sentence that shows the Counterparty will not change the clause,
      // such as a statement that the terms are standard and not negotiable.
      readonly nonNegotiableBasis: SourceSentence;
      readonly counterOffer?: never;
    };

// A Risk flag of either shape, before negotiability.
type FlagWithoutNegotiability = CatalogRiskFlag | RedLineRiskFlag;

export type RiskFlag = FlagWithoutNegotiability & Negotiability & { readonly confidence: Confidence };

// A Risk flag as the Signer's browser receives it. Its Confidence is there
// only when the display switch is on, and absent on a Report stored before
// Confidence existed.
export type ShownRiskFlag = Judged<RiskFlag> & { readonly confidence?: Confidence };

// A Risk flag read back from a Report stored before negotiability existed:
// it was never checked for it, so it shows neither a Counter-offer nor a
// take-it-or-leave-it label.
export type OlderRiskFlag = FlagWithoutNegotiability & {
  readonly negotiability?: never;
  readonly counterOffer?: never;
  readonly nonNegotiableBasis?: never;
  readonly confidence?: never;
};

// What every flag the model proposes carries, before verification. The
// negotiability fields are as the model wrote them: the basis is an empty
// string on a negotiable flag, and the Counter-offer may be one too.
type ProposedFlagBody = {
  readonly sourceSentences: readonly string[];
  readonly readings: readonly string[];
  readonly reachesSignerPersonally: boolean;
  readonly negotiability: "negotiable" | "nonNegotiable";
  readonly nonNegotiableBasis: string;
  readonly counterOffer: string;
  readonly confidence: Confidence;
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

// A Non-negotiable basis sentence that failed verification, even after a
// regeneration. The flag itself was shown, at its severity, as negotiable:
// the take-it-or-leave-it label is not shown when its basis cannot be cited.
export type BasisCitationFailure = {
  readonly nonNegotiableBasis: {
    // The flag as the model first proposed it, basis included.
    readonly flag: ProposedFlag;
  };
  readonly failedSentences: readonly string[];
  readonly attempts: number;
};

export type CitationFailure = FlagCitationFailure | GuarantyCitationFailure | BasisCitationFailure;

// A negotiable flag shown without a Counter-offer, because the model gave
// none even after a regeneration. Code never writes one in its place. For
// the maintainer and evals; never shown to the Signer.
export type CounterOfferGap = {
  // The flag as the model first proposed it.
  readonly flag: ProposedFlag;
  // How many times the model was asked: the first analysis, then one
  // regeneration.
  readonly attempts: number;
};

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

// What a Report holds.
export type ReportContent = {
  readonly summary: string;
  // Dangerous first, then by the offset of each flag's first Source sentence.
  readonly riskFlags: readonly RiskFlag[];
  readonly citationFailures: readonly CitationFailure[];
  readonly counterOfferGaps: readonly CounterOfferGap[];
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
// never reach the browser, and neither do unmatched Red line flags or
// Counter-offer gaps. `riskFlags` is absent on a Report stored before Risk
// flags existed, which was never checked for them, and its flags lack
// negotiability on one stored before that existed. Its flags carry their
// Confidence only when the display switch is on (DisplayOptions).
export type StoredReport = Omit<
  ReportContent,
  "riskFlags" | "citationFailures" | "unmatchedRedLineFlags" | "counterOfferGaps"
> & {
  readonly riskFlags?: readonly (ShownRiskFlag | OlderRiskFlag)[];
};

// How a Report is prepared for the Signer. Every caller must say whether
// Confidence is shown, so it cannot reach the browser by default. The app
// reads the switch from the environment (lib/env.ts); this module never does.
export type DisplayOptions = { readonly showConfidence: boolean };

export function brandReport(content: ReportContent): Report {
  return Object.freeze({ ...content }) as Report;
}

// The part of a fresh Report the Signer may see, for sending to the browser.
// With the switch off, every flag's Confidence is left out too.
export function displayReport(report: Report, options: DisplayOptions): StoredReport {
  const { citationFailures: _withheld, unmatchedRedLineFlags: _dropped, counterOfferGaps: _gaps, ...shown } = report;
  return withConfidenceShownOrNot(shown, options);
}

// Leaves the flags' Confidence in place with the switch on, and takes it off
// every flag with it off, so it is not in the page at all.
function withConfidenceShownOrNot(report: StoredReport, { showConfidence }: DisplayOptions): StoredReport {
  if (showConfidence || report.riskFlags === undefined) return report;
  return {
    ...report,
    riskFlags: report.riskFlags.map(({ confidence: _hidden, ...flag }) => flag as ShownRiskFlag | OlderRiskFlag),
  };
}

// Reads a stored Report back for display, or returns null when the value is
// not a well-formed one (a Signer can write their own report rows, so the
// stored JSON is not trusted). Citation failures, unmatched Red line flags
// and Counter-offer gaps are dropped, and so is every flag's Confidence with
// the display switch off.
export function readStoredReport(value: unknown, options: DisplayOptions): StoredReport | null {
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
  return withConfidenceShownOrNot({ ...base, riskFlags }, options);
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

function isRiskFlag(value: unknown, redLinesSnapshot: readonly RedLine[]): value is ShownRiskFlag | OlderRiskFlag {
  if (typeof value !== "object" || value === null) return false;
  const {
    clauseType,
    severity,
    sourceSentences,
    readings,
    reachesSignerPersonally,
    raisedByRedLine,
    crossesRedLine,
    negotiability,
    confidence,
  } = value as Record<string, unknown>;
  if (!hasNegotiability(value as Record<string, unknown>)) return false;
  // Absent on a flag stored before Confidence existed, and so on every flag
  // stored before negotiability did.
  if (confidence !== undefined && (negotiability === undefined || !isConfidence(confidence))) return false;
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

// A negotiable flag with or without a Counter-offer, a Non-negotiable flag
// with its basis and no Counter-offer, or a flag stored before negotiability
// existed, with none of the three fields.
function hasNegotiability(flag: Record<string, unknown>): boolean {
  const { negotiability, counterOffer, nonNegotiableBasis } = flag;
  if (negotiability === undefined) return counterOffer === undefined && nonNegotiableBasis === undefined;
  if (negotiability === "negotiable") {
    return nonNegotiableBasis === undefined && (counterOffer === undefined || isText(counterOffer));
  }
  if (negotiability === "nonNegotiable") return counterOffer === undefined && isSourceSentence(nonNegotiableBasis);
  return false;
}

function isSourceSentence(value: unknown): value is SourceSentence {
  if (typeof value !== "object" || value === null) return false;
  const { text, offset } = value as Record<string, unknown>;
  return typeof text === "string" && text !== "" && Number.isInteger(offset) && (offset as number) >= 0;
}
