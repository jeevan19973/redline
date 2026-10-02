import type { ModelClient } from "../model/port.ts";
import { verifyFlags } from "./flags.ts";
import { verifyGuaranty } from "./guaranty.ts";
import { parseAnalysis } from "./parse.ts";
import { analysisRequest } from "./prompt.ts";
import { freeTextRedLines, snapshotRedLines, type RedLine } from "./red-lines.ts";
import { brandReport, type Report } from "./report.ts";
import { SCOPE_STAMP } from "./templates.ts";
import { cleanVerdictFor } from "./verdict.ts";

// The Analysis module: the one place a Report or an Answer comes from, and
// the single test seam (spec, "Analysis module"). Everything that makes them
// trustworthy lives behind analyzeDraft and askDraft. Only this file is
// public; the rest of lib/analysis/ is internal.

export type {
  BasisCitationFailure,
  CatalogRiskFlag,
  CheckedClause,
  CitationFailure,
  CleanVerdict,
  Confidence,
  CounterOfferGap,
  DisplayOptions,
  FlagCitationFailure,
  GuarantyCitationFailure,
  GuarantyGap,
  Negotiability,
  OlderRiskFlag,
  ProposedRedLineFlag,
  RedLineRiskFlag,
  Report,
  RiskFlag,
  ShownRiskFlag,
  SourceSentence,
  StoredReport,
} from "./report.ts";
export { displayReport, readStoredReport } from "./report.ts";
export type { CatalogRedLine, FreeTextRedLine, RedLine } from "./red-lines.ts";
export { FREE_TEXT_MAX_LENGTH } from "./red-lines.ts";
export type { ClauseType, Severity } from "./catalog.ts";
export { CATALOG, clauseTypeLabel, isClauseType } from "./catalog.ts";
export { FIXED_COPY } from "./templates.ts";

// Answers one question from a Draft's extracted text: either an answer whose
// Source sentences are all exact substrings of the text, with their offsets,
// or the fixed "does not say" reply. The fixed reply is given when the model
// finds no support or gives no answer or no Source sentence (one model call),
// or quotes a sentence that is not in the text exactly even after one
// regeneration call, or that call fails. An empty or overlong question (see
// checkQuestion) is rejected before any model call, and a failed first call
// or malformed output from it rejects too.
export type { Answer, DoesNotSayReason, QuestionCheck, ShownAnswer } from "./answer.ts";
export { askDraft, checkQuestion, displayAnswer, QUESTION_MAX_LENGTH } from "./answer.ts";

// Analyzes one Draft's extracted text against the Signer's Red lines: a
// catalog Red line raises a matching Caution flag to Dangerous, a free-text
// Red line adds a flag where the document contains its term (and touches no
// other flag), and nothing lowers or hides a Dangerous flag (the Severity
// floor). A flag that names a free-text Red line not passed in is dropped
// and recorded in unmatchedRedLineFlags.
// Rejects, rather than returning part of a Report, when a model call fails
// or its output is malformed. A flag whose Source sentences cannot be
// verified, even after one regeneration call, is withheld and recorded in
// citationFailures instead; so is a guaranty-gap sentence that fails the
// same way.
// Every shown flag is negotiable, Non-negotiable or unconfirmed. A
// Non-negotiable flag never carries a Counter-offer, and its basis sentence
// is verified like a Source sentence; one that still fails after a
// regeneration is recorded in citationFailures and the flag shows as
// unconfirmed, with neither the take-it-or-leave-it label nor a
// Counter-offer, and none is asked for. A negotiable flag the
// model gives no Counter-offer, even after a regeneration, shows without one
// and is recorded in counterOfferGaps. Negotiability never hides a flag or
// changes its severity.
// Every flag carries the model's Confidence in its Reading, which nothing
// here reads: it never changes a severity, the order, raising, the Clean
// verdict or whether a flag shows (ADR 0004).
export async function analyzeDraft(
  extractedText: string,
  redLines: readonly RedLine[],
  modelClient: ModelClient,
): Promise<Report> {
  if (!/\S/.test(extractedText)) throw new Error("There is no text to analyze.");
  const redLinesSnapshot = snapshotRedLines(redLines);

  const { data, modelId } = await modelClient.complete(analysisRequest(extractedText, freeTextRedLines(redLinesSnapshot)));
  const { summary, riskFlags: proposed, guarantyReference } = parseAnalysis(data);
  // The first regeneration calls go out flags first, in flag order, then the
  // guaranty sentence's. A flag's own later calls (its Non-negotiable basis,
  // then its Counter-offer) follow its earlier ones.
  const [flags, guaranty] = await Promise.all([
    verifyFlags(extractedText, proposed, redLinesSnapshot, modelClient),
    verifyGuaranty(extractedText, guarantyReference, modelClient),
  ]);
  const cleanVerdict = cleanVerdictFor(flags.riskFlags, flags.citationFailures, guaranty, redLinesSnapshot);

  return brandReport({
    summary,
    riskFlags: flags.riskFlags,
    citationFailures: [
      ...flags.citationFailures,
      ...(guaranty.kind === "withheld" ? [guaranty.citationFailure] : []),
      ...flags.basisFailures,
    ],
    counterOfferGaps: flags.counterOfferGaps,
    unmatchedRedLineFlags: flags.unmatchedRedLineFlags,
    ...(cleanVerdict && { cleanVerdict }),
    ...(guaranty.kind === "gap" && { guarantyGap: guaranty.guarantyGap }),
    scopeStamp: SCOPE_STAMP,
    redLinesSnapshot,
    modelId,
    createdAt: new Date().toISOString(),
  });
}
