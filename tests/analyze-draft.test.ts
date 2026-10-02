import { describe, expect, it } from "vitest";
import { analyzeDraft, FIXED_COPY, type RedLine } from "../lib/analysis/index.ts";
import { FAKE_MODEL_ID, fakeModelClient } from "./support/fake-model-client.ts";
import { analysisPayload, FIXTURE_NAMES, loadFixture } from "./support/fixtures.ts";

describe("analyzeDraft: scope stamp", () => {
  it.each(FIXTURE_NAMES)("puts the fixed scope stamp on the report for %s", async (name) => {
    const fixture = loadFixture(name);
    const report = await analyzeDraft(
      fixture.text,
      [],
      fakeModelClient({ data: analysisPayload(fixture) }),
    );
    expect(report.scopeStamp).toBe(FIXED_COPY.scopeStamp);
  });

  it("keeps the template even when the model returns a scope stamp of its own", async () => {
    const fixture = loadFixture("adhesion-contract");
    const report = await analyzeDraft(
      fixture.text,
      [],
      fakeModelClient({
        data: { ...analysisPayload(fixture), scopeStamp: "This document was reviewed in full." },
      }),
    );
    expect(report.scopeStamp).toBe(FIXED_COPY.scopeStamp);
  });
});

describe("analyzeDraft: summary and model id", () => {
  it("returns the summary the model wrote and the model id the client reported", async () => {
    const fixture = loadFixture("clean-agreement");
    const summary = "A fixed-fee copywriting agreement.\n\nThe contractor delivers drafts by the dates listed.";
    const report = await analyzeDraft(
      fixture.text,
      [],
      fakeModelClient({ data: analysisPayload(fixture, { summary }), modelId: "fake/another-model" }),
    );
    expect(report.summary).toBe(summary);
    expect(report.modelId).toBe("fake/another-model");
  });

  it("makes one model call and stamps the time it finished", async () => {
    const fixture = loadFixture("adhesion-contract");
    const client = fakeModelClient({ data: analysisPayload(fixture) });
    const before = Date.now();
    const report = await analyzeDraft(fixture.text, [], client);
    expect(client.calls).toBe(1);
    expect(report.modelId).toBe(FAKE_MODEL_ID);
    expect(Date.parse(report.createdAt)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(report.createdAt)).toBeLessThanOrEqual(Date.now());
  });
});

describe("analyzeDraft: Red lines snapshot", () => {
  it("records the Red lines it ran against, unaffected by later changes to the list", async () => {
    const fixture = loadFixture("adhesion-contract");
    const redLines: RedLine[] = [
      { id: "red-line-1", kind: "catalog", clauseType: "autoRenewal" },
      { id: "red-line-2", kind: "freeText", text: "exclusive dealing" },
    ];
    const report = await analyzeDraft(
      fixture.text,
      redLines,
      fakeModelClient({ data: analysisPayload(fixture) }),
    );
    redLines.pop();
    expect(report.redLinesSnapshot).toEqual([
      { id: "red-line-1", kind: "catalog", clauseType: "autoRenewal" },
      { id: "red-line-2", kind: "freeText", text: "exclusive dealing" },
    ]);
  });
});

describe("analyzeDraft: failures", () => {
  const fixture = loadFixture("adhesion-contract");

  it.each([
    ["the summary is missing", {}],
    ["the summary is a number", { summary: 42 }],
    ["the summary is a list", { summary: ["A lease."] }],
    ["the summary is blank", { summary: "  \n " }],
    ["the output is not an object", "A lease between a landlord and a tenant."],
    ["the output is null", null],
    ["the output is an array", [{ summary: "A lease." }]],
  ])("rejects when %s", async (_case, data) => {
    await expect(analyzeDraft(fixture.text, [], fakeModelClient({ data }))).rejects.toThrow();
  });

  it("rejects when the model call fails", async () => {
    await expect(
      analyzeDraft(fixture.text, [], fakeModelClient({ error: new Error("provider unavailable") })),
    ).rejects.toThrow("provider unavailable");
  });

  it("rejects text with nothing in it, without calling the model", async () => {
    const client = fakeModelClient();
    await expect(analyzeDraft(" \n\t", [], client)).rejects.toThrow();
    expect(client.calls).toBe(0);
  });
});
