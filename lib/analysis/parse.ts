import { isClauseType } from "./catalog.ts";
import type { ProposedFlag } from "./report.ts";

// Checks the model's structured output. The model client vouches for
// nothing, so anything that does not match what the prompt asked for fails
// the whole analysis: a partial Report is never returned. Whether a Source
// sentence is really in the text is not checked here; that is citation
// verification, in citations.ts.

export type ModelAnalysis = {
  summary: string;
  riskFlags: ProposedFlag[];
  // The sentence the model quoted as referring to a separate guaranty, or
  // null when it reported no such reference.
  guarantyReference: string | null;
};

export class MalformedModelOutput extends Error {
  constructor(problem: string) {
    super(`The model's output was malformed: ${problem}`);
    this.name = "MalformedModelOutput";
  }
}

export function parseAnalysis(data: unknown): ModelAnalysis {
  const { summary, riskFlags, guarantyReference } = asObject(data, "the output");
  if (typeof summary !== "string") throw new MalformedModelOutput("summary is missing or not text");
  if (!summary.trim()) throw new MalformedModelOutput("summary is empty");
  if (!Array.isArray(riskFlags)) throw new MalformedModelOutput("riskFlags is missing or not a list");
  return {
    summary,
    riskFlags: riskFlags.map((flag, index) => parseFlag(flag, `riskFlags[${index}]`)),
    guarantyReference: parseGuarantyReference(guarantyReference),
  };
}

// Whether the text refers to a separate guaranty, and the sentence that does.
// The sentence is taken exactly as given; a blank one, when the model says
// there is a reference, fails verification later rather than here. A
// sentence given alongside "no reference" is ignored.
function parseGuarantyReference(value: unknown): string | null {
  const { refersToSeparateGuaranty, sourceSentence } = asObject(value, "guarantyReference");
  if (typeof refersToSeparateGuaranty !== "boolean") {
    throw new MalformedModelOutput("guarantyReference.refersToSeparateGuaranty is not true or false");
  }
  if (typeof sourceSentence !== "string") {
    throw new MalformedModelOutput("guarantyReference.sourceSentence is not text");
  }
  return refersToSeparateGuaranty ? sourceSentence : null;
}

// The answer to the guaranty sentence's regeneration request. An empty string
// is the model saying it cannot find it, which verification then rejects.
export function parseGuarantyRequote(data: unknown): string {
  const { sourceSentence } = asObject(data, "the regeneration");
  if (typeof sourceSentence !== "string") {
    throw new MalformedModelOutput("the regeneration's sourceSentence is not text");
  }
  return sourceSentence;
}

// The answer to a regeneration request: the flag's Source sentences, quoted
// again. An empty list is the model saying it cannot find them, which
// verification then treats as a failure.
export function parseRequote(data: unknown): string[] {
  const { sourceSentences } = asObject(data, "the regeneration");
  return parseSentences(sourceSentences, "the regeneration's sourceSentences", { allowEmpty: true });
}

function parseFlag(value: unknown, where: string): ProposedFlag {
  const { clauseType, sourceSentences, readings, reachesSignerPersonally } = asObject(value, where);
  if (!isClauseType(clauseType)) {
    throw new MalformedModelOutput(`${where}.clauseType is not a catalog clause type`);
  }
  if (!Array.isArray(readings) || readings.length < 1 || readings.length > 2) {
    throw new MalformedModelOutput(`${where}.readings must hold one or two Readings`);
  }
  if (!readings.every((reading) => typeof reading === "string" && reading.trim() !== "")) {
    throw new MalformedModelOutput(`${where}.readings must be non-empty text`);
  }
  if (typeof reachesSignerPersonally !== "boolean") {
    throw new MalformedModelOutput(`${where}.reachesSignerPersonally is not true or false`);
  }
  return {
    clauseType,
    sourceSentences: parseSentences(sourceSentences, `${where}.sourceSentences`),
    readings: readings as string[],
    reachesSignerPersonally,
  };
}

// A list of quoted sentences, taken exactly as given: no trimming or other
// change, since verification compares them character for character. A
// blank entry stays in the list and fails verification there.
function parseSentences(value: unknown, where: string, { allowEmpty = false } = {}): string[] {
  if (!Array.isArray(value)) throw new MalformedModelOutput(`${where} is missing or not a list`);
  if (value.length === 0 && !allowEmpty) {
    throw new MalformedModelOutput(`${where} must hold at least one sentence`);
  }
  if (!value.every((sentence) => typeof sentence === "string")) {
    throw new MalformedModelOutput(`${where} must be text`);
  }
  return value as string[];
}

function asObject(value: unknown, where: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new MalformedModelOutput(`expected ${where} to be an object`);
  }
  return value as Record<string, unknown>;
}
