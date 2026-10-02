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

// What the model would return for a fixture, built from its sidecar, with
// any field replaced by `overrides`. Ticket 04 adds the planted clauses as
// flags here, with options to perturb a sentence.
export function analysisPayload(
  fixture: Fixture,
  overrides: { summary?: string } = {},
): Record<string, unknown> {
  return {
    summary: overrides.summary ?? fixture.sidecar.description,
  };
}
