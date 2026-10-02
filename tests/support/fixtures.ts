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

// A Risk flag as the model returns it in its structured output. redLineId
// names the free-text Red line a "redLine" flag crosses. nonNegotiableBasis
// and counterOffer are empty strings where they do not apply, as the strict
// schema has the model send them.
export type ModelFlag = {
  clauseType: string;
  redLineId?: string;
  sourceSentences: string[];
  readings: string[];
  reachesSignerPersonally: boolean;
  negotiability: "negotiable" | "nonNegotiable";
  nonNegotiableBasis: string;
  counterOffer: string;
  confidence: "high" | "medium" | "low";
};

// The Counter-offer the model would write for a planted clause. Scripted
// wording, unique per clause, so a test can tell which flag carries it.
export function counterOfferFor(clause: PlantedClause): string {
  return `Replacement wording for the clause "${clause.id}".`;
}

// The flag the model would return for one planted clause: its sentence
// verbatim, one Reading, the personal-reach fact the sidecar's expected
// severity implies (a planted clause is Dangerous only because it reaches
// the Signer personally), negotiable with a Counter-offer, and high
// Confidence. `overrides` replaces any field.
export function modelFlag(clause: PlantedClause, overrides: Partial<ModelFlag> = {}): ModelFlag {
  return {
    clauseType: clause.clauseType,
    sourceSentences: [clause.sentence],
    readings: [clause.why],
    reachesSignerPersonally: clause.expectedSeverity === "Dangerous",
    negotiability: "negotiable",
    nonNegotiableBasis: "",
    counterOffer: counterOfferFor(clause),
    confidence: "high",
    ...overrides,
  };
}

// The same planted clause flagged Non-negotiable on the given basis
// sentence, with no Counter-offer unless `overrides` supplies one.
export function nonNegotiableFlag(
  clause: PlantedClause,
  basis: string,
  overrides: Partial<ModelFlag> = {},
): ModelFlag {
  return modelFlag(clause, { negotiability: "nonNegotiable", nonNegotiableBasis: basis, counterOffer: "", ...overrides });
}

// The flag the model would return for a free-text Red line: clause type
// "redLine", the Red line's id, and the given sentence quoted as is, with
// the personal-reach fact false, a Counter-offer and high Confidence unless
// `overrides` says otherwise.
export function redLineFlag(redLineId: string, sentence: string, overrides: Partial<ModelFlag> = {}): ModelFlag {
  return {
    clauseType: "redLine",
    redLineId,
    sourceSentences: [sentence],
    readings: ["The document contains a term on your Red lines."],
    reachesSignerPersonally: false,
    negotiability: "negotiable",
    nonNegotiableBasis: "",
    counterOffer: "Replacement wording for the clause with a term on your Red lines.",
    confidence: "high",
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

// What the model would return for a Non-negotiable basis sentence's
// regeneration.
export function basisRequotePayload(sourceSentence: string): Record<string, unknown> {
  return { sourceSentence };
}

// What the model would return for a Counter-offer regeneration.
export function counterOfferPayload(counterOffer: string): Record<string, unknown> {
  return { counterOffer };
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
