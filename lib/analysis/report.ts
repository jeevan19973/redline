import { isRedLine, type RedLine } from "./red-lines.ts";

// What a Report holds. Later tickets add Risk flags, citation failures, the
// Clean verdict and the guaranty gap.
export type ReportContent = {
  readonly summary: string;
  readonly scopeStamp: string;
  readonly redLinesSnapshot: readonly RedLine[];
  // The model that wrote the summary, as the model client reported it.
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

// A Report as it comes back from storage or across the network to the
// browser. It is plain data for display: it has the same fields, but holding
// one is not proof that analyzeDraft produced it. A Report is a StoredReport;
// the reverse never holds.
export type StoredReport = ReportContent;

export function brandReport(content: ReportContent): Report {
  return Object.freeze({ ...content }) as Report;
}

// Reads a stored Report back for display, or returns null when the value is
// not a well-formed one (a Signer can write their own report rows, so the
// stored JSON is not trusted).
export function readStoredReport(value: unknown): StoredReport | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const { summary, scopeStamp, redLinesSnapshot, modelId, createdAt } = value as Record<string, unknown>;
  if (typeof summary !== "string" || !summary.trim()) return null;
  if (typeof scopeStamp !== "string" || !scopeStamp.trim()) return null;
  if (!Array.isArray(redLinesSnapshot) || !redLinesSnapshot.every(isRedLine)) return null;
  if (typeof modelId !== "string" || !modelId) return null;
  if (typeof createdAt !== "string" || Number.isNaN(Date.parse(createdAt))) return null;
  return { summary, scopeStamp, redLinesSnapshot, modelId, createdAt };
}
