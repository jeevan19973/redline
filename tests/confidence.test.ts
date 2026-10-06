import { describe, expect, it } from "vitest";
import { analyzeDraft, displayReport, readStoredReport, type RedLine, type Report } from "../lib/analysis/index.ts";
import { fakeModelClient } from "./support/fake-model-client.ts";
import {
  analysisPayload,
  guarantyReference,
  loadFixture,
  modelFlag,
  plantedClause,
  type Fixture,
  type ModelFlag,
} from "./support/fixtures.ts";

const lease = loadFixture("adhesion-contract");
const clean = loadFixture("clean-agreement");

const indemnity = plantedClause(lease, "principal-uncapped-indemnity");
const LEVELS = ["high", "medium", "low"] as const;

// Every planted clause flagged, each with the Confidence `levelFor` gives it.
function flagsWith(fixture: Fixture, levelFor: (index: number) => ModelFlag["confidence"]): ModelFlag[] {
  return fixture.sidecar.clauses.map((clause, index) => modelFlag(clause, { confidence: levelFor(index) }));
}

// A Report's flags with their Confidence taken off: everything severity,
// ordering, raising and visibility decide.
function withoutConfidence(report: Report) {
  return report.riskFlags.map(({ confidence: _confidence, ...flag }) => flag);
}

describe("analyzeDraft: Confidence", () => {
  it("gives every flag the Confidence the model rated it", async () => {
    const flags = flagsWith(lease, (index) => LEVELS[index % 3]);
    const report = await analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease, { riskFlags: flags }) }));

    expect(report.riskFlags).toHaveLength(flags.length);
    for (const flag of flags) {
      const shown = report.riskFlags.find((candidate) => candidate.sourceSentences[0].text === flag.sourceSentences[0]);
      expect(shown?.confidence).toBe(flag.confidence);
    }
  });

  it.each([
    ["missing", undefined],
    ["not one of the three levels", "very high"],
    ["a number", 0.9],
    ["in capitals", "High"],
  ])("rejects the analysis when a flag's Confidence is %s on both tries", async (_case, confidence) => {
    const flag = { ...modelFlag(indemnity), confidence };
    const data = analysisPayload(lease, { riskFlags: [flag as unknown as ModelFlag] });
    const client = fakeModelClient({ data }, { data });
    await expect(analyzeDraft(lease.text, [], client)).rejects.toThrow(/confidence/);
    expect(client.calls).toBe(2);
  });

  it("keeps a low-Confidence Dangerous flag Dangerous, shown first, and rules out the Clean verdict", async () => {
    const flags = lease.sidecar.clauses.map((clause) =>
      modelFlag(clause, { confidence: clause.id === indemnity.id ? "low" : "high" }),
    );
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: analysisPayload(lease, { riskFlags: flags, guarantyReference: guarantyReference(null) }) }),
    );

    const shown = report.riskFlags.find((flag) => flag.sourceSentences[0].text === indemnity.sentence);
    expect(shown).toBeDefined();
    expect(shown!.confidence).toBe("low");
    expect(shown!.severity).toBe("Dangerous");
    expect(report.riskFlags.findIndex((flag) => flag === shown)).toBeLessThan(
      report.riskFlags.findIndex((flag) => flag.severity === "Caution"),
    );
    expect(report.citationFailures).toEqual([]);
    expect(report.cleanVerdict).toBeUndefined();
  });

  it("shows a lone low-Confidence Dangerous flag, with no Clean verdict", async () => {
    const data = analysisPayload(lease, {
      riskFlags: [modelFlag(indemnity, { confidence: "low" })],
      guarantyReference: guarantyReference(null),
    });
    const report = await analyzeDraft(lease.text, [], fakeModelClient({ data }));
    expect(report.riskFlags).toHaveLength(1);
    expect(report.riskFlags[0]).toMatchObject({ severity: "Dangerous", confidence: "low" });
    expect(report.cleanVerdict).toBeUndefined();
  });

  const onAutoRenewal: RedLine = { id: "red-line-auto-renewal", kind: "catalog", clauseType: "autoRenewal" };
  const cautionOnly = lease.sidecar.clauses.filter((clause) => clause.expectedSeverity === "Caution");

  describe.each([
    ["the lease, every planted clause", lease, lease.sidecar.clauses, [] as RedLine[], true],
    ["the lease with a Red line that raises auto-renewal", lease, lease.sidecar.clauses, [onAutoRenewal], true],
    ["the lease's Caution clauses only, with no guaranty", lease, cautionOnly, [] as RedLine[], false],
    ["the clean agreement", clean, clean.sidecar.clauses, [] as RedLine[], undefined],
  ])("%s, scripted all high and then all low", (_case, fixture, clauses, redLines, withGuaranty) => {
    const payload = (confidence: ModelFlag["confidence"]) =>
      analysisPayload(fixture, {
        riskFlags: clauses.map((clause) => modelFlag(clause, { confidence })),
        ...(withGuaranty === false && { guarantyReference: guarantyReference(null) }),
      });

    it("gives identical severities, ordering, flag set and Clean verdict", async () => {
      const high = await analyzeDraft(fixture.text, redLines, fakeModelClient({ data: payload("high") }));
      const low = await analyzeDraft(fixture.text, redLines, fakeModelClient({ data: payload("low") }));

      expect(high.riskFlags.every((flag) => flag.confidence === "high")).toBe(true);
      expect(low.riskFlags.every((flag) => flag.confidence === "low")).toBe(true);
      expect(low.riskFlags.map((flag) => flag.severity)).toEqual(high.riskFlags.map((flag) => flag.severity));
      // Same flags, in the same order, identical in everything but Confidence.
      expect(withoutConfidence(low)).toEqual(withoutConfidence(high));
      expect(low.cleanVerdict).toEqual(high.cleanVerdict);
      expect(Boolean(low.cleanVerdict)).toBe(Boolean(high.cleanVerdict));
      expect(low.citationFailures).toEqual(high.citationFailures);
    });
  });
});

describe("displayReport and readStoredReport: the Confidence display switch", () => {
  async function leaseReport(): Promise<Report> {
    const flags = flagsWith(lease, (index) => LEVELS[index % 3]);
    return analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease, { riskFlags: flags }) }));
  }

  it("leaves Confidence out of every flag the Signer receives with the switch off", async () => {
    const report = await leaseReport();
    const stored = JSON.parse(JSON.stringify(report));

    for (const shown of [displayReport(report, { showConfidence: false }), readStoredReport(stored, { showConfidence: false })]) {
      expect(shown?.riskFlags).toHaveLength(report.riskFlags.length);
      expect(JSON.stringify(shown)).not.toContain("confidence");
      // Nothing else about the flags changes.
      expect(shown?.riskFlags).toEqual(withoutConfidence(report));
    }
  });

  it("keeps every flag's Confidence with the switch on", async () => {
    const report = await leaseReport();
    expect(displayReport(report, { showConfidence: true }).riskFlags).toEqual(report.riskFlags);
    expect(readStoredReport(JSON.parse(JSON.stringify(report)), { showConfidence: true })?.riskFlags).toEqual(
      report.riskFlags,
    );
  });

  it("reads a Report stored before Confidence existed, and refuses a stored flag with a wrong one", async () => {
    const report = await leaseReport();
    const stored = JSON.parse(JSON.stringify(report));
    const older = { ...stored, riskFlags: withoutConfidence(report) };
    expect(readStoredReport(older, { showConfidence: true })?.riskFlags).toEqual(withoutConfidence(report));

    const [first, ...rest] = stored.riskFlags;
    expect(readStoredReport({ ...stored, riskFlags: [{ ...first, confidence: "certain" }, ...rest] }, { showConfidence: true })).toBeNull();
    expect(readStoredReport({ ...stored, riskFlags: [{ ...first, confidence: "certain" }, ...rest] }, { showConfidence: false })).toBeNull();
  });
});
