import { describe, expect, it } from "vitest";
import { analyzeDraft, readStoredReport, type ClauseType, type RedLine, type Report } from "../lib/analysis/index.ts";
import { fakeModelClient } from "./support/fake-model-client.ts";
import { analysisPayload, guarantyReference, loadFixture, modelFlag, plantedClause, requotePayload } from "./support/fixtures.ts";

const lease = loadFixture("adhesion-contract");

const autoRenewal = plantedClause(lease, "auto-renewal-short-window");
const nonCompete = plantedClause(lease, "principal-radius-non-compete");

// The lease's planted Caution clauses, as the model would flag them.
const cautionFlags = lease.sidecar.clauses
  .filter((clause) => clause.expectedSeverity === "Caution")
  .map((clause) => modelFlag(clause));

const onAutoRenewal: RedLine = { id: "red-line-auto-renewal", kind: "catalog", clauseType: "autoRenewal" };
const onNonCompete: RedLine = { id: "red-line-non-compete", kind: "catalog", clauseType: "individualNonCompete" };

// The lease analyzed with every planted clause, against the given Red lines.
function analyzeLease(redLines: readonly RedLine[], data: unknown = analysisPayload(lease)): Promise<Report> {
  return analyzeDraft(lease.text, redLines, fakeModelClient({ data }));
}

// The lease's Caution flags only, with no separate guaranty, so that with no
// Red lines it gets a Clean verdict.
const cautionOnly = analysisPayload(lease, { riskFlags: cautionFlags, guarantyReference: guarantyReference(null) });

function flagQuoting(report: Report, sentence: string) {
  const flag = report.riskFlags.find((candidate) => candidate.sourceSentences[0].text === sentence);
  if (!flag) throw new Error("The report has no flag quoting that sentence.");
  return flag;
}

describe("analyzeDraft: Red lines raise severity", () => {
  it("raises the lease's auto-renewal flag from Caution to Dangerous and marks the Red line that raised it", async () => {
    const without = await analyzeLease([]);
    expect(flagQuoting(without, autoRenewal.sentence).severity).toBe("Caution");
    expect(flagQuoting(without, autoRenewal.sentence).raisedByRedLine).toBeUndefined();

    const report = await analyzeLease([onAutoRenewal]);
    const flag = flagQuoting(report, autoRenewal.sentence);
    expect(flag.severity).toBe("Dangerous");
    expect(flag.raisedByRedLine).toEqual({ id: "red-line-auto-renewal", kind: "catalog", clauseType: "autoRenewal" });

    // Nothing else changes: every other flag keeps its severity and is not
    // marked raised.
    const others = report.riskFlags.filter((candidate) => candidate !== flag);
    expect(others.every((candidate) => candidate.raisedByRedLine === undefined)).toBe(true);
    expect(others.map((candidate) => [candidate.clauseType, candidate.severity]).sort()).toEqual(
      without.riskFlags
        .filter((candidate) => candidate.sourceSentences[0].text !== autoRenewal.sentence)
        .map((candidate) => [candidate.clauseType, candidate.severity])
        .sort(),
    );
  });

  it("ranks a raised flag among the Dangerous flags, by its place in the text", async () => {
    const report = await analyzeLease([onAutoRenewal]);
    const dangerous = report.riskFlags.filter((flag) => flag.severity === "Dangerous");
    expect(report.riskFlags.slice(0, dangerous.length)).toEqual(dangerous);
    const offsets = dangerous.map((flag) => flag.sourceSentences[0].offset);
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
    expect(dangerous.map((flag) => flag.sourceSentences[0].text)).toContain(autoRenewal.sentence);
  });

  it("does not raise anything for a free-text Red line", async () => {
    const report = await analyzeLease([{ id: "red-line-words", kind: "freeText", text: "automatically renews" }]);
    expect(flagQuoting(report, autoRenewal.sentence).severity).toBe("Caution");
    expect(report.riskFlags.every((flag) => flag.raisedByRedLine === undefined)).toBe(true);
  });
});

describe("analyzeDraft: Severity floor", () => {
  it("shows the lease's Dangerous flags as Dangerous with no Red lines at all", async () => {
    const report = await analyzeLease([]);
    const expected = lease.sidecar.clauses.filter((clause) => clause.expectedSeverity === "Dangerous");
    for (const clause of expected) {
      expect(flagQuoting(report, clause.sentence).severity).toBe("Dangerous");
    }
    expect(report.riskFlags.filter((flag) => flag.severity === "Dangerous")).toHaveLength(expected.length);
  });

  it("keeps a Dangerous flag Dangerous when the matching Red line is removed", async () => {
    const withRedLine = await analyzeLease([onNonCompete]);
    const removed = await analyzeLease([]);
    expect(flagQuoting(withRedLine, nonCompete.sentence).severity).toBe("Dangerous");
    expect(flagQuoting(removed, nonCompete.sentence).severity).toBe("Dangerous");
    expect(removed.riskFlags).toHaveLength(withRedLine.riskFlags.length);
  });

  it("leaves a Dangerous type Dangerous under a Red line on it, and does not mark it raised", async () => {
    const report = await analyzeLease([onNonCompete]);
    const flag = flagQuoting(report, nonCompete.sentence);
    expect(flag.severity).toBe("Dangerous");
    expect(flag.raisedByRedLine).toBeUndefined();
  });

  it("does not mark a Caution type raised when personal reach already made it Dangerous", async () => {
    const lateFee = plantedClause(lease, "late-charge-and-interest");
    const data = analysisPayload(lease, { riskFlags: [modelFlag(lateFee, { reachesSignerPersonally: true })] });
    const report = await analyzeLease([{ id: "red-line-late-fees", kind: "catalog", clauseType: "lateFees" }], data);
    expect(report.riskFlags).toHaveLength(1);
    expect(report.riskFlags[0].severity).toBe("Dangerous");
    expect(report.riskFlags[0].raisedByRedLine).toBeUndefined();
  });

  it("never lowers or hides a Dangerous flag, whatever Red lines are set", async () => {
    const baseline = await analyzeLease([]);
    const everyType: RedLine[] = lease.sidecar.clauses.map((clause, index) => ({
      id: `red-line-${index}`,
      kind: "catalog",
      clauseType: clause.clauseType as ClauseType,
    }));
    for (const redLines of [[], [onAutoRenewal], [onNonCompete], everyType]) {
      const report = await analyzeLease(redLines);
      expect(report.riskFlags).toHaveLength(baseline.riskFlags.length);
      for (const flag of baseline.riskFlags.filter((candidate) => candidate.severity === "Dangerous")) {
        expect(flagQuoting(report, flag.sourceSentences[0].text).severity).toBe("Dangerous");
      }
    }
  });
});

describe("analyzeDraft: Red lines and the Clean verdict", () => {
  it("gives the lease's Caution flags a Clean verdict with no Red lines", async () => {
    const report = await analyzeLease([], cautionOnly);
    expect(report.cleanVerdict).toBeDefined();
  });

  it("gives no Clean verdict when one Red line raises a Caution flag and nothing else is Dangerous", async () => {
    const report = await analyzeLease([onAutoRenewal], cautionOnly);
    expect(report.riskFlags.filter((flag) => flag.severity === "Dangerous")).toHaveLength(1);
    expect(report.riskFlags.filter((flag) => flag.raisedByRedLine)).toHaveLength(1);
    expect(report.cleanVerdict).toBeUndefined();
  });

  it("keeps the Clean verdict when no flag is of a clause type on the Signer's Red lines", async () => {
    const report = await analyzeLease([onNonCompete], cautionOnly);
    expect(report.riskFlags.every((flag) => flag.severity === "Caution")).toBe(true);
    expect(report.cleanVerdict).toBeDefined();
  });

  it("gives no Clean verdict when a flag on a Red line's clause type is withheld for a failed citation", async () => {
    const wrong = `${autoRenewal.sentence} `;
    const flags = cautionFlags.map((flag) =>
      flag.sourceSentences[0] === autoRenewal.sentence ? { ...flag, sourceSentences: [wrong] } : flag,
    );
    const client = fakeModelClient(
      { data: analysisPayload(lease, { riskFlags: flags, guarantyReference: guarantyReference(null) }) },
      { data: requotePayload([wrong]) },
    );
    const report = await analyzeDraft(lease.text, [onAutoRenewal], client);
    expect(report.riskFlags.every((flag) => flag.severity === "Caution")).toBe(true);
    expect(report.citationFailures).toHaveLength(1);
    expect(report.cleanVerdict).toBeUndefined();
  });
});

describe("analyzeDraft: Red lines snapshot", () => {
  it("stores exactly the Red lines passed in", async () => {
    const redLines: RedLine[] = [onAutoRenewal, onNonCompete, { id: "red-line-words", kind: "freeText", text: "exclusive dealing" }];
    const report = await analyzeLease(redLines);
    expect(report.redLinesSnapshot).toEqual(redLines);
  });

  it("stores an empty list when there are no Red lines", async () => {
    const report = await analyzeLease([]);
    expect(report.redLinesSnapshot).toEqual([]);
  });
});

describe("readStoredReport: raised flags", () => {
  it("reads a raised flag back with the Red line that raised it", async () => {
    const report = await analyzeLease([onAutoRenewal]);
    const stored = readStoredReport(JSON.parse(JSON.stringify(report)));
    expect(stored?.riskFlags).toEqual(report.riskFlags);
    expect(stored?.redLinesSnapshot).toEqual([onAutoRenewal]);
  });

  it("refuses a stored flag marked raised that is not Dangerous, or not raised by its own clause type", async () => {
    const report = JSON.parse(JSON.stringify(await analyzeLease([onAutoRenewal])));
    const index = report.riskFlags.findIndex((flag: { raisedByRedLine?: unknown }) => flag.raisedByRedLine);
    const withFlag = (flag: unknown) => ({
      ...report,
      riskFlags: report.riskFlags.map((candidate: unknown, at: number) => (at === index ? flag : candidate)),
    });
    const raised = report.riskFlags[index];
    expect(readStoredReport(withFlag({ ...raised, severity: "Caution" }))).toBeNull();
    expect(readStoredReport(withFlag({ ...raised, raisedByRedLine: { ...onNonCompete } }))).toBeNull();
    expect(readStoredReport(withFlag({ ...raised, raisedByRedLine: { id: "x", kind: "freeText", text: "renews" } }))).toBeNull();
  });
});
