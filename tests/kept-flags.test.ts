import { describe, expect, it } from "vitest";
import {
  analyzeDraft,
  readPreviousReport,
  readStoredReport,
  type RedLine,
  type Report,
  type RiskFlag,
} from "../lib/analysis/index.ts";
import { fakeModelClient } from "./support/fake-model-client.ts";
import { analysisPayload, guarantyReference, loadFixture, modelFlag, plantedClause, redLineFlag } from "./support/fixtures.ts";

// A re-run of the same Draft never lowers or drops a flag that the report it
// replaces showed as Dangerous because of a Red line (spec, "Severity floor";
// user story 45).

const lease = loadFixture("adhesion-contract");

const autoRenewal = plantedClause(lease, "auto-renewal-short-window");
const onAutoRenewal: RedLine = { id: "red-line-auto-renewal", kind: "catalog", clauseType: "autoRenewal" };

// A term the catalog does not cover, and the lease sentence that contains it.
const onEntry: RedLine = { id: "red-line-entry", kind: "freeText", text: "Landlord can come in on short notice" };
const entrySentence =
  "Landlord may enter the Premises during business hours on twenty-four hours' notice to inspect them or to show them to prospective buyers or lenders.";

const cautionClauses = lease.sidecar.clauses.filter((clause) => clause.expectedSeverity === "Caution");

// The lease's Caution flags, optionally without auto-renewal, plus any extra
// flags, and no separate guaranty: with no Red lines this gets a Clean verdict.
function cautionPayload({ withAutoRenewal = true, extra = [] as ReturnType<typeof modelFlag>[] } = {}) {
  const flags = cautionClauses
    .filter((clause) => withAutoRenewal || clause.id !== autoRenewal.id)
    .map((clause) => modelFlag(clause, clause.id === autoRenewal.id ? { confidence: "medium" } : {}));
  return analysisPayload(lease, { riskFlags: [...flags, ...extra], guarantyReference: guarantyReference(null) });
}

// The report as the re-run reads it back from storage.
const stored = (report: Report) => readPreviousReport(JSON.parse(JSON.stringify(report)))!;

function quoting(report: Report, sentence: string): RiskFlag | undefined {
  return report.riskFlags.find((flag) => flag.sourceSentences.some((source) => source.text === sentence));
}

async function raisedReport(): Promise<Report> {
  const report = await analyzeDraft(lease.text, [onAutoRenewal], fakeModelClient({ data: cautionPayload() }));
  expect(quoting(report, autoRenewal.sentence)).toMatchObject({ severity: "Dangerous", raisedByRedLine: onAutoRenewal });
  return report;
}

describe("analyzeDraft re-run: a flag a Red line made Dangerous stays Dangerous", () => {
  it("keeps the flag Dangerous and marked when the Red line that raised it is removed", async () => {
    const earlier = await raisedReport();
    const client = fakeModelClient({ data: cautionPayload() });
    const report = await analyzeDraft(lease.text, [], client, { previousReport: stored(earlier) });

    expect(client.calls).toBe(1);
    const flag = quoting(report, autoRenewal.sentence)!;
    expect(flag.severity).toBe("Dangerous");
    expect(flag.raisedByRedLine).toEqual(onAutoRenewal);
    expect(flag.keptFromEarlierReport).toEqual({ redLine: onAutoRenewal, redLineChanged: true, carriedForward: false });
    // The new run's own flag: its Reading and Confidence, not the earlier one's.
    expect(flag.confidence).toBe("medium");
    // A kept flag rules out the Clean verdict, and leads the ranking.
    expect(report.cleanVerdict).toBeUndefined();
    expect(report.riskFlags[0]).toBe(flag);
    // Every other flag is as a fresh run makes it.
    expect(report.riskFlags.filter((other) => other !== flag).every((other) => other.severity === "Caution")).toBe(true);
    expect(report.redLinesSnapshot).toEqual([]);
  });

  it("marks the Red line changed when it now names another clause type", async () => {
    const earlier = await raisedReport();
    const edited: RedLine = { id: onAutoRenewal.id, kind: "catalog", clauseType: "individualNonCompete" };
    const report = await analyzeDraft(lease.text, [edited], fakeModelClient({ data: cautionPayload() }), {
      previousReport: stored(earlier),
    });
    expect(quoting(report, autoRenewal.sentence)?.keptFromEarlierReport).toMatchObject({ redLineChanged: true });
  });

  it("needs no keeping when the Red line is still there: the new run raises it itself", async () => {
    const earlier = await raisedReport();
    const report = await analyzeDraft(lease.text, [onAutoRenewal], fakeModelClient({ data: cautionPayload() }), {
      previousReport: stored(earlier),
    });
    const flag = quoting(report, autoRenewal.sentence)!;
    expect(flag).toMatchObject({ severity: "Dangerous", raisedByRedLine: onAutoRenewal });
    expect(flag.keptFromEarlierReport).toBeUndefined();
  });

  it("carries the earlier flag forward when the new run does not flag the clause at all", async () => {
    const earlier = await raisedReport();
    const earlierFlag = quoting(earlier, autoRenewal.sentence)!;
    const client = fakeModelClient({ data: cautionPayload({ withAutoRenewal: false }) });
    const report = await analyzeDraft(lease.text, [], client, { previousReport: stored(earlier) });

    expect(client.calls).toBe(1);
    const flag = quoting(report, autoRenewal.sentence)!;
    expect(flag).toEqual({
      ...earlierFlag,
      keptFromEarlierReport: { redLine: onAutoRenewal, redLineChanged: true, carriedForward: true },
    });
    expect(flag.sourceSentences).toEqual([
      { text: autoRenewal.sentence, offset: lease.text.indexOf(autoRenewal.sentence) },
    ]);
    expect(report.cleanVerdict).toBeUndefined();
  });

  it("says the Red line is unchanged when the earlier flag is carried forward under a Red line still on the list", async () => {
    const earlier = await raisedReport();
    const report = await analyzeDraft(
      lease.text,
      [onAutoRenewal],
      fakeModelClient({ data: cautionPayload({ withAutoRenewal: false }) }),
      { previousReport: stored(earlier) },
    );
    expect(quoting(report, autoRenewal.sentence)?.keptFromEarlierReport).toEqual({
      redLine: onAutoRenewal,
      redLineChanged: false,
      carriedForward: true,
    });
  });

  it("does not carry a flag whose Source sentence is no longer in the text", async () => {
    const earlier = await raisedReport();
    // The same Draft cannot change its text, so this stands in for a
    // sentence that would not verify.
    const otherText = lease.text.replace(autoRenewal.sentence, "This Lease ends at the end of the term.");
    expect(otherText).not.toContain(autoRenewal.sentence);
    const report = await analyzeDraft(otherText, [], fakeModelClient({ data: cautionPayload({ withAutoRenewal: false }) }), {
      previousReport: stored(earlier),
    });
    expect(quoting(report, autoRenewal.sentence)).toBeUndefined();
    expect(report.riskFlags.every((flag) => flag.keptFromEarlierReport === undefined)).toBe(true);
    // Nothing else is Dangerous or crosses a Red line.
    expect(report.cleanVerdict).toBeDefined();
  });

  it("keeps a kept flag again on the next re-run", async () => {
    const first = await raisedReport();
    const second = await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionPayload() }), {
      previousReport: stored(first),
    });
    const third = await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionPayload({ withAutoRenewal: false }) }), {
      previousReport: stored(second),
    });
    expect(quoting(third, autoRenewal.sentence)).toMatchObject({
      severity: "Dangerous",
      raisedByRedLine: onAutoRenewal,
      keptFromEarlierReport: { redLine: onAutoRenewal, redLineChanged: true, carriedForward: true },
    });
  });

  it("keeps a Dangerous flag a free-text Red line added after that Red line is removed", async () => {
    const added = redLineFlag(onEntry.id, entrySentence, { reachesSignerPersonally: true });
    const earlier = await analyzeDraft(lease.text, [onEntry], fakeModelClient({ data: cautionPayload({ extra: [added] }) }));
    const earlierFlag = quoting(earlier, entrySentence)!;
    expect(earlierFlag).toMatchObject({ clauseType: "redLine", severity: "Dangerous", crossesRedLine: onEntry });

    const report = await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionPayload() }), {
      previousReport: stored(earlier),
    });
    const flag = quoting(report, entrySentence)!;
    expect(flag).toEqual({
      ...earlierFlag,
      keptFromEarlierReport: { redLine: onEntry, redLineChanged: true, carriedForward: true },
    });
    expect(report.cleanVerdict).toBeUndefined();
    // It reads back from storage, though its Red line is not in this
    // report's snapshot.
    expect(readStoredReport(JSON.parse(JSON.stringify(report)), { showConfidence: true })?.riskFlags).toEqual(
      report.riskFlags,
    );
  });

  it("keeps a free-text flag Dangerous when the re-run rates it Caution under the same Red line", async () => {
    const earlier = await analyzeDraft(
      lease.text,
      [onEntry],
      fakeModelClient({ data: cautionPayload({ extra: [redLineFlag(onEntry.id, entrySentence, { reachesSignerPersonally: true })] }) }),
    );
    const report = await analyzeDraft(
      lease.text,
      [onEntry],
      fakeModelClient({ data: cautionPayload({ extra: [redLineFlag(onEntry.id, entrySentence)] }) }),
      { previousReport: stored(earlier) },
    );
    expect(quoting(report, entrySentence)).toMatchObject({
      severity: "Dangerous",
      crossesRedLine: onEntry,
      reachesSignerPersonally: false,
      keptFromEarlierReport: { redLine: onEntry, redLineChanged: false, carriedForward: false },
    });
  });
});

describe("analyzeDraft re-run: what is not kept", () => {
  it("is unchanged by an earlier report with no flag a Red line made Dangerous", async () => {
    const earlier = await analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease) }));
    const fresh = await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionPayload() }));
    const rerun = await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionPayload() }), {
      previousReport: stored(earlier),
    });
    // The earlier report's Dangerous flags were Dangerous by their own
    // reach, not because of a Red line, so the re-run follows its own run.
    expect(rerun.riskFlags).toEqual(fresh.riskFlags);
    expect(rerun.cleanVerdict).toEqual(fresh.cleanVerdict);
  });

  it("leaves a fresh analysis with no previous report as it was", async () => {
    const without = await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionPayload() }));
    const withEmptyOptions = await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionPayload() }), {});
    expect(quoting(without, autoRenewal.sentence)?.severity).toBe("Caution");
    expect(without.riskFlags.every((flag) => flag.keptFromEarlierReport === undefined)).toBe(true);
    expect(without.cleanVerdict).toBeDefined();
    expect({ ...withEmptyOptions, createdAt: "" }).toEqual({ ...without, createdAt: "" });
  });

  it("still never lowers or drops a flag of the new run", async () => {
    const earlier = await raisedReport();
    const fresh = await analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease) }));
    const rerun = await analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease) }), {
      previousReport: stored(earlier),
    });
    expect(rerun.riskFlags).toHaveLength(fresh.riskFlags.length);
    for (const flag of fresh.riskFlags) {
      const same = quoting(rerun, flag.sourceSentences[0].text)!;
      expect(same.clauseType).toBe(flag.clauseType);
      if (flag.severity === "Dangerous") expect(same.severity).toBe("Dangerous");
    }
    expect(quoting(rerun, autoRenewal.sentence)?.severity).toBe("Dangerous");
  });
});

describe("readStoredReport: kept flags", () => {
  async function keptReport() {
    const earlier = await raisedReport();
    return JSON.parse(
      JSON.stringify(
        await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionPayload() }), { previousReport: stored(earlier) }),
      ),
    );
  }

  const keptIndex = (report: { riskFlags: { keptFromEarlierReport?: unknown }[] }) =>
    report.riskFlags.findIndex((flag) => flag.keptFromEarlierReport !== undefined);

  it("reads a kept flag back with its marker", async () => {
    const report = await keptReport();
    const read = readStoredReport(report, { showConfidence: true });
    expect(read?.riskFlags?.[keptIndex(report)]?.keptFromEarlierReport).toEqual({
      redLine: onAutoRenewal,
      redLineChanged: true,
      carriedForward: false,
    });
  });

  it("refuses a kept flag that is not Dangerous", async () => {
    const report = await keptReport();
    const flag = report.riskFlags[keptIndex(report)];
    flag.severity = "Caution";
    delete flag.raisedByRedLine;
    expect(readStoredReport(report, { showConfidence: true })).toBeNull();
  });

  it("refuses a kept catalog flag whose marker names another Red line than the one that raised it", async () => {
    const report = await keptReport();
    report.riskFlags[keptIndex(report)].keptFromEarlierReport.redLine = onEntry;
    expect(readStoredReport(report, { showConfidence: true })).toBeNull();
  });
});
