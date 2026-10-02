import { readFileSync } from "node:fs";

// The shared test documents in tests/fixtures/, each with its sidecar of
// planted clauses, and the model payloads a fake client returns for them.

export type FixtureName = "adhesion-contract" | "clean-agreement";

export type PlantedClause = {
  id: string;
  clauseType: string;
  sentence: string;
  expectedSeverity: "Dangerous" | "Caution";
  why: string;
};

export type Sidecar = {
  document: string;
  documentType: string;
  description: string;
  nonNegotiableBasis: string | null;
  guarantyReference: string | null;
  clauses: PlantedClause[];
};

export type Fixture = { name: FixtureName; text: string; sidecar: Sidecar };

export const FIXTURE_NAMES: readonly FixtureName[] = ["adhesion-contract", "clean-agreement"];

export function loadFixture(name: FixtureName): Fixture {
  const read = (extension: string) =>
    readFileSync(new URL(`../fixtures/${name}.${extension}`, import.meta.url), "utf8");
  return { name, text: read("txt"), sidecar: JSON.parse(read("json")) as Sidecar };
}

// A Risk flag as the model returns it in its structured output.
export type ModelFlag = {
  clauseType: string;
  sourceSentences: string[];
  readings: string[];
  reachesSignerPersonally: boolean;
};

// The flag the model would return for one planted clause: its sentence
// verbatim, one Reading, and the personal-reach fact the sidecar's expected
// severity implies (a planted clause is Dangerous only because it reaches
// the Signer personally). `overrides` replaces any field.
export function modelFlag(clause: PlantedClause, overrides: Partial<ModelFlag> = {}): ModelFlag {
  return {
    clauseType: clause.clauseType,
    sourceSentences: [clause.sentence],
    readings: [clause.why],
    reachesSignerPersonally: clause.expectedSeverity === "Dangerous",
    ...overrides,
  };
}

// One planted clause by its sidecar id.
export function plantedClause(fixture: Fixture, id: string): PlantedClause {
  const clause = fixture.sidecar.clauses.find((candidate) => candidate.id === id);
  if (!clause) throw new Error(`${fixture.name} has no planted clause "${id}".`);
  return clause;
}

// Whether the text refers to a separate guaranty, as the model returns it.
export type ModelGuarantyReference = { refersToSeparateGuaranty: boolean; sourceSentence: string };

// The model's guaranty reference: the given sentence, or none when null.
export function guarantyReference(sentence: string | null): ModelGuarantyReference {
  return sentence === null
    ? { refersToSeparateGuaranty: false, sourceSentence: "" }
    : { refersToSeparateGuaranty: true, sourceSentence: sentence };
}

// What the model would return for a fixture, built from its sidecar: the
// description as the summary, every planted clause as a flag, verbatim, in
// sidecar order, and the sidecar's guaranty reference, verbatim. `overrides`
// replaces any field.
export function analysisPayload(
  fixture: Fixture,
  overrides: { summary?: string; riskFlags?: ModelFlag[]; guarantyReference?: ModelGuarantyReference } = {},
): Record<string, unknown> {
  return {
    summary: overrides.summary ?? fixture.sidecar.description,
    riskFlags: overrides.riskFlags ?? fixture.sidecar.clauses.map((clause) => modelFlag(clause)),
    guarantyReference: overrides.guarantyReference ?? guarantyReference(fixture.sidecar.guarantyReference),
  };
}

// What the model would return for a regeneration request.
export function requotePayload(sourceSentences: string[]): Record<string, unknown> {
  return { sourceSentences };
}

// What the model would return for the guaranty sentence's regeneration.
export function guarantyRequotePayload(sourceSentence: string): Record<string, unknown> {
  return { sourceSentence };
}

// Ways a quoted sentence can differ from the text by one character, each of
// which citation verification must reject.
export const PERTURBATIONS: ReadonlyArray<readonly [string, (sentence: string) => string]> = [
  ["an extra space", (sentence) => sentence.replace(" ", "  ")],
  ["a curly quote in place of a straight one", (sentence) => replaceOnce(sentence, "'", "\u2019")],
  ["a change of case", (sentence) => sentence.charAt(0).toLowerCase() + sentence.slice(1)],
];

function replaceOnce(sentence: string, from: string, to: string): string {
  if (!sentence.includes(from)) throw new Error(`The sentence has no ${JSON.stringify(from)} to replace.`);
  return sentence.replace(from, to);
}
