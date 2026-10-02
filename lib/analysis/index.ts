import type { ModelClient } from "../model/port.ts";
import { verifyFlags } from "./flags.ts";
import { parseAnalysis } from "./parse.ts";
import { analysisRequest } from "./prompt.ts";
import { snapshotRedLines, type RedLine } from "./red-lines.ts";
import { brandReport, type Report } from "./report.ts";
import { SCOPE_STAMP } from "./templates.ts";

// The Analysis module: the one place a Report comes from, and the single
// test seam (spec, "Analysis module"). Everything that makes a report
// trustworthy lives behind analyzeDraft. Only this file is public; the rest
// of lib/analysis/ is internal.

export type { CitationFailure, Report, RiskFlag, SourceSentence, StoredReport } from "./report.ts";
export { displayReport, readStoredReport } from "./report.ts";
export type { RedLine } from "./red-lines.ts";
export type { ClauseType, Severity } from "./catalog.ts";
export { CATALOG, clauseTypeLabel } from "./catalog.ts";
export { FIXED_COPY } from "./templates.ts";

// Analyzes one Draft's extracted text against the Signer's Red lines.
// Rejects, rather than returning part of a Report, when a model call fails
// or its output is malformed. A flag whose Source sentences cannot be
// verified, even after one regeneration call, is withheld and recorded in
// citationFailures instead.
export async function analyzeDraft(
  extractedText: string,
  redLines: readonly RedLine[],
  modelClient: ModelClient,
): Promise<Report> {
  if (!/\S/.test(extractedText)) throw new Error("There is no text to analyze.");
  const redLinesSnapshot = snapshotRedLines(redLines);

  const { data, modelId } = await modelClient.complete(analysisRequest(extractedText));
  const { summary, riskFlags: proposed } = parseAnalysis(data);
  const { riskFlags, citationFailures } = await verifyFlags(extractedText, proposed, modelClient);

  return brandReport({
    summary,
    riskFlags,
    citationFailures,
    scopeStamp: SCOPE_STAMP,
    redLinesSnapshot,
    modelId,
    createdAt: new Date().toISOString(),
  });
}
