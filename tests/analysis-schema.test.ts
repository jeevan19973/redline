import { describe, expect, it } from "vitest";
import type { FreeTextRedLine } from "../lib/analysis/red-lines.ts";
import { analysisRequest } from "../lib/analysis/prompt.ts";
import type { JsonSchema } from "../lib/model/port.ts";
import { loadFixture } from "./support/fixtures.ts";

const lease = loadFixture("adhesion-contract");

const exclusiveDealing: FreeTextRedLine = { id: "red-line-words", kind: "freeText", text: "exclusive dealing" };

// The schema for a Risk flag's Readings, found by property name.
function readingsSchema(schema: JsonSchema): JsonSchema {
  const riskFlags = (schema.properties as Record<string, JsonSchema>).riskFlags;
  const flag = riskFlags.items as JsonSchema;
  return (flag.properties as Record<string, JsonSchema>).readings;
}

describe("analysisRequest: a Risk flag holds one or two Readings", () => {
  it.each([
    ["without Red lines", [] as FreeTextRedLine[]],
    ["with a free-text Red line", [exclusiveDealing]],
  ])("the schema limits readings to one or two items %s", (_, redLines) => {
    const readings = readingsSchema(analysisRequest(lease.text, redLines).schema);
    expect(readings).toMatchObject({ type: "array", minItems: 1, maxItems: 2 });
  });
});
