import { describe, expect, it } from "vitest";
import { analyzeDraft, CATALOG, clauseTypeLabel, FIXED_COPY, readStoredReport, type Report } from "../lib/analysis/index.ts";
import { bannedClaimsIn } from "./support/banned-claims.ts";
import { fakeModelClient } from "./support/fake-model-client.ts";
import {
  analysisPayload,
  guarantyReference,
  guarantyRequotePayload,
  loadFixture,
  modelFlag,
  PERTURBATIONS,
  plantedClause,
  requotePayload,
} from "./support/fixtures.ts";

const lease = loadFixture("adhesion-contract");
const clean = loadFixture("clean-agreement");

// The lease's planted Caution clauses, as the model would flag them.
const cautionFlags = lease.sidecar.clauses
  .filter((clause) => clause.expectedSeverity === "Caution")
  .map((clause) => modelFlag(clause));

// The sentence in the lease that refers to its separate guaranty.
const guarantySentence = lease.sidecar.guarantyReference!;

// Every clause type in the catalog, in order, checked unless named here.
function checklist(notChecked: readonly string[] = []) {
  return CATALOG.map((entry) => ({ clauseType: entry.clauseType, checked: !notChecked.includes(entry.clauseType) }));
}

// Everything a Signer reads in a Clean verdict.
function verdictText(report: Report): string[] {
  const verdict = report.cleanVerdict!;
  return [
    verdict.title,
    verdict.statement,
    ...verdict.notes,
    ...verdict.checked.map((line) => clauseTypeLabel(line.clauseType)),
  ];
}

describe("analyzeDraft: Clean verdict", () => {
  it("gives the clean agreement with no flags a Clean verdict listing the whole catalog, all checked", async () => {
    const report = await analyzeDraft(clean.text, [], fakeModelClient({ data: analysisPayload(clean) }));

    expect(report.riskFlags).toEqual([]);
    expect(report.guarantyGap).toBeUndefined();
    expect(report.cleanVerdict).toBeDefined();
    expect(report.cleanVerdict!.checked).toEqual(checklist());
    expect(report.cleanVerdict!.notes).toEqual([]);
  });

  it("gives the lease with its Dangerous flags no Clean verdict", async () => {
    const report = await analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease) }));

    expect(report.riskFlags.some((flag) => flag.severity === "Dangerous")).toBe(true);
    expect(report.cleanVerdict).toBeUndefined();
  });

  it("gives no Clean verdict when a single Caution type is raised to Dangerous by personal reach", async () => {
    const lateFee = plantedClause(lease, "late-charge-and-interest");
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({
        data: analysisPayload(lease, {
          riskFlags: [modelFlag(lateFee, { reachesSignerPersonally: true })],
          guarantyReference: guarantyReference(null),
        }),
      }),
    );
    expect(report.riskFlags.map((flag) => flag.severity)).toEqual(["Dangerous"]);
    expect(report.cleanVerdict).toBeUndefined();
  });

  it("keeps Caution flags alongside the Clean verdict, with a note that they still cost the business", async () => {
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({
        data: analysisPayload(lease, { riskFlags: cautionFlags, guarantyReference: guarantyReference(null) }),
      }),
    );

    expect(report.riskFlags).toHaveLength(cautionFlags.length);
    expect(report.riskFlags.every((flag) => flag.severity === "Caution")).toBe(true);
    expect(report.cleanVerdict!.checked).toEqual(checklist());
    expect(report.cleanVerdict!.notes).toEqual([FIXED_COPY["cleanVerdict.cautionNote"]]);
  });

  it("gives no Clean verdict when a Dangerous flag is withheld for a failed citation", async () => {
    const nonCompete = plantedClause(lease, "principal-radius-non-compete");
    const wrong = nonCompete.sentence.replace("Principal", "principal");
    const client = fakeModelClient(
      {
        data: analysisPayload(lease, {
          riskFlags: [...cautionFlags, modelFlag(nonCompete, { sourceSentences: [wrong] })],
          guarantyReference: guarantyReference(null),
        }),
      },
      { data: requotePayload([wrong]) },
    );
    const report = await analyzeDraft(lease.text, [], client);

    expect(report.riskFlags.every((flag) => flag.severity === "Caution")).toBe(true);
    expect(report.citationFailures).toHaveLength(1);
    expect(report.cleanVerdict).toBeUndefined();
  });

  it("uses the fixed template, whatever verdict the model writes itself", async () => {
    const report = await analyzeDraft(
      clean.text,
      [],
      fakeModelClient({
        data: {
          ...analysisPayload(clean),
          cleanVerdict: { title: "Safe to sign", statement: "This agreement is fine to sign." },
        },
      }),
    );
    for (const text of [report.cleanVerdict!.title, report.cleanVerdict!.statement, ...report.cleanVerdict!.notes]) {
      expect(Object.values(FIXED_COPY)).toContain(text);
    }
  });

  it.each([
    ["the clean agreement", clean, analysisPayload(clean)],
    ["the lease's Caution flags", lease, analysisPayload(lease, { riskFlags: cautionFlags })],
  ])("never says %s is safe to sign or compares Underline to a lawyer", async (_case, fixture, data) => {
    const report = await analyzeDraft(fixture.text, [], fakeModelClient({ data }));
    for (const text of verdictText(report)) {
      expect(Object.values(FIXED_COPY)).toContain(text);
      expect(bannedClaimsIn(text)).toEqual([]);
    }
  });
});

describe("analyzeDraft: guaranty gap", () => {
  it("gives the lease's Caution flags and guaranty reference a Clean verdict with personal guarantee not checked", async () => {
    const client = fakeModelClient({ data: analysisPayload(lease, { riskFlags: cautionFlags }) });
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(1);
    expect(report.guarantyGap).toEqual({
      statement: FIXED_COPY.guarantyGap,
      sourceSentence: { text: guarantySentence, offset: lease.text.indexOf(guarantySentence) },
    });
    const { offset, text } = report.guarantyGap!.sourceSentence;
    expect(lease.text.slice(offset, offset + text.length)).toBe(guarantySentence);

    expect(report.cleanVerdict).toBeDefined();
    expect(report.cleanVerdict!.checked).toEqual(checklist(["personalGuarantee"]));
    expect(report.cleanVerdict!.notes).toContain(FIXED_COPY["cleanVerdict.guarantyGapNote"]);
    expect(report.citationFailures).toEqual([]);
  });

  it("shows the guaranty gap on a report with Dangerous flags too", async () => {
    const report = await analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease) }));
    expect(report.cleanVerdict).toBeUndefined();
    expect(report.guarantyGap?.sourceSentence.text).toBe(guarantySentence);
  });

  it("has no guaranty gap, and checks personal guarantee, when the model reports no reference", async () => {
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({
        data: analysisPayload(lease, {
          riskFlags: cautionFlags,
          // A sentence given alongside "no reference" is ignored.
          guarantyReference: { refersToSeparateGuaranty: false, sourceSentence: guarantySentence },
        }),
      }),
    );
    expect(report.guarantyGap).toBeUndefined();
    expect(report.cleanVerdict!.checked).toEqual(checklist());
  });

  describe.each(PERTURBATIONS)("a guaranty sentence with %s", (_case, perturb) => {
    const wrong = perturb(guarantySentence);
    const payload = analysisPayload(lease, { riskFlags: cautionFlags, guarantyReference: guarantyReference(wrong) });

    it("is not the text's sentence", () => {
      expect(lease.text.includes(wrong)).toBe(false);
    });

    it("is shown once the regeneration quotes it exactly", async () => {
      const client = fakeModelClient({ data: payload }, { data: guarantyRequotePayload(guarantySentence) });
      const report = await analyzeDraft(lease.text, [], client);

      expect(client.calls).toBe(2);
      expect(report.guarantyGap?.sourceSentence).toEqual({
        text: guarantySentence,
        offset: lease.text.indexOf(guarantySentence),
      });
      expect(report.citationFailures).toEqual([]);
    });

    it("is withheld and recorded after failing twice, and personal guarantee stays not checked", async () => {
      const client = fakeModelClient({ data: payload }, { data: guarantyRequotePayload(wrong) });
      const report = await analyzeDraft(lease.text, [], client);

      expect(client.calls).toBe(2);
      expect(report.guarantyGap).toBeUndefined();
      expect(report.citationFailures).toEqual([
        { guarantyReference: { sourceSentence: wrong }, failedSentences: [wrong], attempts: 2 },
      ]);
      expect(report.cleanVerdict!.checked).toEqual(checklist(["personalGuarantee"]));
      expect(report.cleanVerdict!.notes).toContain(FIXED_COPY["cleanVerdict.guarantyUnverifiedNote"]);
      // Nothing unverified reaches the Signer: the failed sentence is nowhere
      // in what they can see.
      expect(JSON.stringify(readStoredReport(JSON.parse(JSON.stringify(report)), { showConfidence: true }))).not.toContain(wrong);
    });
  });

  it("withholds a blank guaranty sentence when the regeneration finds none", async () => {
    const client = fakeModelClient(
      { data: analysisPayload(lease, { riskFlags: cautionFlags, guarantyReference: guarantyReference(" ") }) },
      { data: guarantyRequotePayload("") },
    );
    const report = await analyzeDraft(lease.text, [], client);
    expect(report.guarantyGap).toBeUndefined();
    expect(report.citationFailures).toHaveLength(1);
    expect(report.cleanVerdict!.checked).toEqual(checklist(["personalGuarantee"]));
  });

  it("regenerates a failing flag and the guaranty sentence separately", async () => {
    const repairs = plantedClause(lease, "tenant-pays-structural-repairs");
    const flags = cautionFlags.map((flag) =>
      flag.sourceSentences[0] === repairs.sentence ? { ...flag, sourceSentences: [`${repairs.sentence} `] } : flag,
    );
    const client = fakeModelClient(
      { data: analysisPayload(lease, { riskFlags: flags, guarantyReference: guarantyReference(`${guarantySentence} `) }) },
      { data: requotePayload([repairs.sentence]) },
      { data: guarantyRequotePayload(guarantySentence) },
    );
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(3);
    expect(report.riskFlags).toHaveLength(cautionFlags.length);
    expect(report.guarantyGap?.sourceSentence.text).toBe(guarantySentence);
    expect(report.citationFailures).toEqual([]);
  });

  it("rejects the analysis when the guaranty reference is missing or malformed", async () => {
    for (const reference of [undefined, "yes", { refersToSeparateGuaranty: "yes", sourceSentence: "" }]) {
      const data = { ...analysisPayload(lease), guarantyReference: reference };
      await expect(analyzeDraft(lease.text, [], fakeModelClient({ data }))).rejects.toThrow();
    }
  });
});

describe("readStoredReport: Clean verdict and guaranty gap", () => {
  it("reads both back from a stored Report", async () => {
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: analysisPayload(lease, { riskFlags: cautionFlags }) }),
    );
    const stored = readStoredReport(JSON.parse(JSON.stringify(report)), { showConfidence: true });
    expect(stored?.cleanVerdict).toEqual(report.cleanVerdict);
    expect(stored?.guarantyGap).toEqual(report.guarantyGap);
  });

  it("reads a Report stored before either existed", async () => {
    const report = await analyzeDraft(clean.text, [], fakeModelClient({ data: analysisPayload(clean) }));
    const { cleanVerdict: _verdict, ...older } = JSON.parse(JSON.stringify(report));
    const stored = readStoredReport(older, { showConfidence: true });
    expect(stored).not.toBeNull();
    expect(stored?.cleanVerdict).toBeUndefined();
  });

  it("refuses a stored Report whose verdict is malformed", async () => {
    const report = await analyzeDraft(clean.text, [], fakeModelClient({ data: analysisPayload(clean) }));
    const value = JSON.parse(JSON.stringify(report));
    expect(readStoredReport({ ...value, cleanVerdict: { title: "Safe to sign" } }, { showConfidence: true })).toBeNull();
    expect(readStoredReport({ ...value, guarantyGap: { statement: "Not checked." } }, { showConfidence: true })).toBeNull();
  });
});
