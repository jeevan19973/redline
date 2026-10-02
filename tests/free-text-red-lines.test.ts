import { describe, expect, it } from "vitest";
import { analyzeDraft, displayReport, readStoredReport, type RedLine, type Report } from "../lib/analysis/index.ts";
import { fakeModelClient } from "./support/fake-model-client.ts";
import {
  analysisPayload,
  guarantyReference,
  loadFixture,
  modelFlag,
  redLineFlag,
  requotePayload,
} from "./support/fixtures.ts";

const lease = loadFixture("adhesion-contract");

// A term the catalog does not cover, in the Signer's own words, and the
// lease sentence that contains it. Not a planted clause, so no catalog flag
// quotes it.
const onEntry: RedLine = { id: "red-line-entry", kind: "freeText", text: "Landlord can come in on short notice" };
const entrySentence =
  "Landlord may enter the Premises during business hours on twenty-four hours' notice to inspect them or to show them to prospective buyers or lenders.";

const onAutoRenewal: RedLine = { id: "red-line-auto-renewal", kind: "catalog", clauseType: "autoRenewal" };

// The lease's planted Caution clauses as the model would flag them, with no
// separate guaranty: with no Red lines, this gets a Clean verdict.
const cautionFlags = lease.sidecar.clauses
  .filter((clause) => clause.expectedSeverity === "Caution")
  .map((clause) => modelFlag(clause));
const cautionOnly = (extra: ReturnType<typeof redLineFlag>[] = []) =>
  analysisPayload(lease, { riskFlags: [...cautionFlags, ...extra], guarantyReference: guarantyReference(null) });

function addedFlags(report: Report) {
  return report.riskFlags.filter((flag) => flag.clauseType === "redLine");
}

describe("analyzeDraft: free-text Red lines add flags", () => {
  it("adds a redLine flag that crosses the Red line when its Source sentence is in the text, and gives no Clean verdict", async () => {
    expect(lease.text).toContain(entrySentence);
    const client = fakeModelClient({ data: cautionOnly([redLineFlag(onEntry.id, entrySentence)]) });
    const report = await analyzeDraft(lease.text, [onEntry], client);

    const added = addedFlags(report);
    expect(added).toHaveLength(1);
    expect(added[0].crossesRedLine).toEqual(onEntry);
    expect(added[0].raisedByRedLine).toBeUndefined();
    expect(added[0].sourceSentences).toEqual([{ text: entrySentence, offset: lease.text.indexOf(entrySentence) }]);
    expect(added[0].severity).toBe("Caution");
    expect(report.cleanVerdict).toBeUndefined();
    expect(report.citationFailures).toEqual([]);
    expect(client.calls).toBe(1);

    // The same Draft with no Red lines gets the Clean verdict.
    const without = await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionOnly() }));
    expect(without.cleanVerdict).toBeDefined();
  });

  it("makes an added flag Dangerous only by the personal-reach test, and ranks it by severity and place", async () => {
    const data = cautionOnly([redLineFlag(onEntry.id, entrySentence, { reachesSignerPersonally: true })]);
    const report = await analyzeDraft(lease.text, [onEntry], fakeModelClient({ data }));
    const [added] = addedFlags(report);
    expect(added.severity).toBe("Dangerous");
    expect(added.raisedByRedLine).toBeUndefined();
    // The only Dangerous flag, so it comes first.
    expect(report.riskFlags[0]).toBe(added);
  });

  it("adds the flag when the one regeneration quotes the sentence exactly", async () => {
    const wrong = entrySentence.replace("twenty-four", "twenty four");
    const client = fakeModelClient(
      { data: cautionOnly([redLineFlag(onEntry.id, wrong)]) },
      { data: requotePayload([entrySentence]) },
    );
    const report = await analyzeDraft(lease.text, [onEntry], client);
    expect(addedFlags(report)).toHaveLength(1);
    expect(report.citationFailures).toEqual([]);
    expect(client.calls).toBe(2);
  });

  it("adds no flag and records the failure when the sentence is not in the text after the regeneration", async () => {
    const wrong = entrySentence.replace("twenty-four", "twenty four");
    expect(lease.text).not.toContain(wrong);
    const client = fakeModelClient(
      { data: cautionOnly([redLineFlag(onEntry.id, wrong)]) },
      { data: requotePayload([wrong]) },
    );
    const report = await analyzeDraft(lease.text, [onEntry], client);

    expect(addedFlags(report)).toEqual([]);
    expect(report.riskFlags).toHaveLength(cautionFlags.length);
    expect(report.citationFailures).toEqual([
      { flag: redLineFlag(onEntry.id, wrong), failedSentences: [wrong], attempts: 2 },
    ]);
    expect(client.calls).toBe(2);
    // The model found the term and only its quotation failed, so the report
    // cannot say nothing crosses a Red line.
    expect(report.cleanVerdict).toBeUndefined();
  });

  it("drops a redLine flag that names an id not passed in, and records it", async () => {
    const stray = redLineFlag("red-line-not-set", entrySentence);
    const client = fakeModelClient({ data: cautionOnly([stray]) });
    const report = await analyzeDraft(lease.text, [onEntry], client);

    expect(addedFlags(report)).toEqual([]);
    expect(report.unmatchedRedLineFlags).toEqual([stray]);
    expect(report.citationFailures).toEqual([]);
    // Dropped before verification: no regeneration call, and nothing the
    // Signer set was crossed, so the Clean verdict stands.
    expect(client.calls).toBe(1);
    expect(report.cleanVerdict).toBeDefined();
  });

  it("drops a redLine flag that names a catalog Red line, or any id when no free-text Red line is set", async () => {
    const onCatalog = redLineFlag(onAutoRenewal.id, entrySentence);
    const withCatalog = await analyzeDraft(
      lease.text,
      [onAutoRenewal, onEntry],
      fakeModelClient({ data: cautionOnly([onCatalog]) }),
    );
    expect(addedFlags(withCatalog)).toEqual([]);
    expect(withCatalog.unmatchedRedLineFlags).toEqual([onCatalog]);

    const stray = redLineFlag(onEntry.id, entrySentence);
    const none = await analyzeDraft(lease.text, [], fakeModelClient({ data: cautionOnly([stray]) }));
    expect(addedFlags(none)).toEqual([]);
    expect(none.unmatchedRedLineFlags).toEqual([stray]);
    expect(none.cleanVerdict).toBeDefined();
  });

  it("leaves every catalog flag exactly as it is when a free-text Red line is present", async () => {
    const payload = analysisPayload(lease);
    const baseline = await analyzeDraft(lease.text, [], fakeModelClient({ data: payload }));

    // The Red line is set but the model found its term nowhere.
    const unused = await analyzeDraft(lease.text, [onEntry], fakeModelClient({ data: payload }));
    expect(unused.riskFlags).toEqual(baseline.riskFlags);

    // The Red line adds a flag quoting the same sentence as a catalog flag,
    // and the catalog flag keeps its severity.
    const autoRenewal = lease.sidecar.clauses.find((clause) => clause.clauseType === "autoRenewal");
    if (!autoRenewal) throw new Error("The lease has no auto-renewal clause.");
    const withAdded = analysisPayload(lease, {
      riskFlags: [
        ...lease.sidecar.clauses.map((clause) => modelFlag(clause)),
        redLineFlag(onEntry.id, autoRenewal.sentence),
        redLineFlag(onEntry.id, entrySentence, { reachesSignerPersonally: true }),
      ],
    });
    const report = await analyzeDraft(lease.text, [onEntry], fakeModelClient({ data: withAdded }));
    const catalogFlags = report.riskFlags.filter((flag) => flag.clauseType !== "redLine");
    expect(catalogFlags).toEqual(baseline.riskFlags);
    expect(addedFlags(report)).toHaveLength(2);
  });

  it("leaves a catalog Red line's raising as it is alongside a free-text Red line", async () => {
    const data = cautionOnly([redLineFlag(onEntry.id, entrySentence)]);
    const catalogOnly = await analyzeDraft(lease.text, [onAutoRenewal], fakeModelClient({ data: cautionOnly() }));
    const both = await analyzeDraft(lease.text, [onAutoRenewal, onEntry], fakeModelClient({ data }));
    expect(both.riskFlags.filter((flag) => flag.clauseType !== "redLine")).toEqual(catalogOnly.riskFlags);
  });
});

describe("Reports with flags a free-text Red line added", () => {
  async function reportWithAdded(): Promise<Report> {
    const data = cautionOnly([redLineFlag(onEntry.id, entrySentence)]);
    return analyzeDraft(lease.text, [onEntry], fakeModelClient({ data }));
  }

  it("reads an added flag back from storage with the Red line it crosses", async () => {
    const report = await reportWithAdded();
    const stored = readStoredReport(JSON.parse(JSON.stringify(report)));
    expect(stored?.riskFlags).toEqual(report.riskFlags);
    expect(stored?.redLinesSnapshot).toEqual([onEntry]);
  });

  it("refuses a stored added flag whose Red line is not in the snapshot, or that is marked raised", async () => {
    const report = JSON.parse(JSON.stringify(await reportWithAdded()));
    const index = report.riskFlags.findIndex((flag: { clauseType: string }) => flag.clauseType === "redLine");
    const added = report.riskFlags[index];
    const withFlag = (flag: unknown) => ({
      ...report,
      riskFlags: report.riskFlags.map((candidate: unknown, at: number) => (at === index ? flag : candidate)),
    });
    expect(readStoredReport(withFlag(added))).not.toBeNull();
    expect(readStoredReport(withFlag({ ...added, crossesRedLine: { ...onEntry, text: "something else" } }))).toBeNull();
    expect(readStoredReport(withFlag({ ...added, crossesRedLine: { ...onEntry, id: "red-line-other" } }))).toBeNull();
    expect(readStoredReport(withFlag({ ...added, crossesRedLine: undefined }))).toBeNull();
    expect(readStoredReport(withFlag({ ...added, raisedByRedLine: onAutoRenewal }))).toBeNull();
  });

  it("keeps unmatched Red line flags off the Report the Signer sees", async () => {
    const stray = redLineFlag("red-line-not-set", entrySentence);
    const report = await analyzeDraft(lease.text, [onEntry], fakeModelClient({ data: cautionOnly([stray]) }));
    expect(report.unmatchedRedLineFlags).toHaveLength(1);
    expect(displayReport(report)).not.toHaveProperty("unmatchedRedLineFlags");
    expect(displayReport(report)).not.toHaveProperty("citationFailures");
  });
});
