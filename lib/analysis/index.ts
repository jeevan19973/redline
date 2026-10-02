import type { ModelClient } from "../model/port.ts";
import { verifyFlags } from "./flags.ts";
import { verifyGuaranty } from "./guaranty.ts";
import { parseAnalysis } from "./parse.ts";
import { analysisRequest } from "./prompt.ts";
import { snapshotRedLines, type RedLine } from "./red-lines.ts";
import { brandReport, type Report } from "./report.ts";
import { SCOPE_STAMP } from "./templates.ts";
import { cleanVerdictFor } from "./verdict.ts";

// The Analysis module: the one place a Report comes from, and the single
// test seam (spec, "Analysis module"). Everything that makes a report
// trustworthy lives behind analyzeDraft. Only this file is public; the rest
// of lib/analysis/ is internal.

export type {
  CheckedClause,
  CitationFailure,
  CleanVerdict,
  FlagCitationFailure,
  GuarantyCitationFailure,
  GuarantyGap,
  Report,
  RiskFlag,
  SourceSentence,
  StoredReport,
} from "./report.ts";
export { displayReport, readStoredReport } from "./report.ts";
export type { RedLine } from "./red-lines.ts";
export type { ClauseType, Severity } from "./catalog.ts";
export { CATALOG, clauseTypeLabel } from "./catalog.ts";
export { FIXED_COPY } from "./templates.ts";

// Analyzes one Draft's extracted text against the Signer's Red lines.
// Rejects, rather than returning part of a Report, when a model call fails
// or its output is malformed. A flag whose Source sentences cannot be
// verified, even after one regeneration call, is withheld and recorded in
// citationFailures instead; so is a guaranty-gap sentence that fails the
// same way.
export async function analyzeDraft(
  extractedText: string,
  redLines: readonly RedLine[],
  modelClient: ModelClient,
): Promise<Report> {
  if (!/\S/.test(extractedText)) throw new Error("There is no text to analyze.");
  const redLinesSnapshot = snapshotRedLines(redLines);

  const { data, modelId } = await modelClient.complete(analysisRequest(extractedText));
  const { summary, riskFlags: proposed, guarantyReference } = parseAnalysis(data);
  // Any regeneration calls go out flags first, in flag order, then the
  // guaranty sentence's.
  const [flags, guaranty] = await Promise.all([
    verifyFlags(extractedText, proposed, modelClient),
    verifyGuaranty(extractedText, guarantyReference, modelClient),
  ]);
  const cleanVerdict = cleanVerdictFor(flags.riskFlags, flags.citationFailures, guaranty);

  return brandReport({
    summary,
    riskFlags: flags.riskFlags,
    citationFailures:
      guaranty.kind === "withheld" ? [...flags.citationFailures, guaranty.citationFailure] : flags.citationFailures,
    ...(cleanVerdict && { cleanVerdict }),
    ...(guaranty.kind === "gap" && { guarantyGap: guaranty.guarantyGap }),
    scopeStamp: SCOPE_STAMP,
    redLinesSnapshot,
    modelId,
    createdAt: new Date().toISOString(),
  });
}
