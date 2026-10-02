import { describe, expect, it } from "vitest";
import { analyzeDraft, readStoredReport } from "../lib/analysis/index.ts";
import { fakeModelClient } from "./support/fake-model-client.ts";
import {
  analysisPayload,
  loadFixture,
  modelFlag,
  PERTURBATIONS,
  plantedClause,
  requotePayload,
} from "./support/fixtures.ts";

const lease = loadFixture("adhesion-contract");
const clean = loadFixture("clean-agreement");

// The planted clause every perturbation is applied to: Caution, and it holds
// a straight apostrophe ("Tenant's") for the curly-quote case.
const repairs = plantedClause(lease, "tenant-pays-structural-repairs");

describe("analyzeDraft: Risk flags from verbatim Source sentences", () => {
  it("turns every planted clause, quoted verbatim, into a flag at its offset in the text", async () => {
    const client = fakeModelClient({ data: analysisPayload(lease) });
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(1);
    expect(report.citationFailures).toEqual([]);
    expect(report.riskFlags).toHaveLength(lease.sidecar.clauses.length);
    for (const clause of lease.sidecar.clauses) {
      const flag = report.riskFlags.find((candidate) => candidate.sourceSentences[0].text === clause.sentence);
      expect(flag, clause.id).toBeDefined();
      expect(flag!.clauseType).toBe(clause.clauseType);
      expect(flag!.severity).toBe(clause.expectedSeverity);
      expect(flag!.readings).toEqual([clause.why]);
      const [sentence] = flag!.sourceSentences;
      expect(sentence.offset).toBe(lease.text.indexOf(clause.sentence));
      expect(lease.text.slice(sentence.offset, sentence.offset + sentence.text.length)).toBe(clause.sentence);
    }
  });

  it("quotes each sentence of a flag that rests on several, in document order with each offset", async () => {
    const indemnity = plantedClause(lease, "principal-uncapped-indemnity");
    const renewal = plantedClause(lease, "auto-renewal-short-window");
    const flag = modelFlag(indemnity, { sourceSentences: [indemnity.sentence, renewal.sentence] });
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: analysisPayload(lease, { riskFlags: [flag] }) }),
    );

    expect(report.riskFlags).toHaveLength(1);
    expect(report.riskFlags[0].sourceSentences).toEqual([
      { text: renewal.sentence, offset: lease.text.indexOf(renewal.sentence) },
      { text: indemnity.sentence, offset: lease.text.indexOf(indemnity.sentence) },
    ]);
  });

  it("keeps two Readings when the model gives two", async () => {
    const readings = ["You pay for the roof and structure.", "You pay only for repairs inside your space."];
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: analysisPayload(lease, { riskFlags: [modelFlag(repairs, { readings })] }) }),
    );
    expect(report.riskFlags[0].readings).toEqual(readings);
  });

  it("gives the clean agreement no flags when the model finds none", async () => {
    const client = fakeModelClient({ data: analysisPayload(clean) });
    const report = await analyzeDraft(clean.text, [], client);
    expect(report.riskFlags).toEqual([]);
    expect(report.citationFailures).toEqual([]);
    expect(client.calls).toBe(1);
  });
});

describe("analyzeDraft: citation verification", () => {
  describe.each(PERTURBATIONS)("a sentence with %s", (_case, perturb) => {
    const wrong = perturb(repairs.sentence);
    const payload = analysisPayload(lease, { riskFlags: [modelFlag(repairs, { sourceSentences: [wrong] })] });

    it("is not the text's sentence", () => {
      expect(wrong).not.toBe(repairs.sentence);
      expect(lease.text.includes(wrong)).toBe(false);
    });

    it("is shown once the regeneration quotes it exactly", async () => {
      const client = fakeModelClient({ data: payload }, { data: requotePayload([repairs.sentence]) });
      const report = await analyzeDraft(lease.text, [], client);

      expect(client.calls).toBe(2);
      expect(report.citationFailures).toEqual([]);
      expect(report.riskFlags).toHaveLength(1);
      expect(report.riskFlags[0].sourceSentences).toEqual([
        { text: repairs.sentence, offset: lease.text.indexOf(repairs.sentence) },
      ]);
    });

    it("is withheld and recorded when the regeneration is still wrong", async () => {
      const client = fakeModelClient({ data: payload }, { data: requotePayload([wrong]) });
      const report = await analyzeDraft(lease.text, [], client);

      expect(client.calls).toBe(2);
      expect(report.riskFlags).toEqual([]);
      expect(report.citationFailures).toEqual([
        { flag: modelFlag(repairs, { sourceSentences: [wrong] }), failedSentences: [wrong], attempts: 2 },
      ]);
    });
  });

  it("withholds a multi-sentence flag whole when one of its sentences is wrong", async () => {
    const indemnity = plantedClause(lease, "principal-uncapped-indemnity");
    const wrong = indemnity.sentence.replace("jointly", "Jointly");
    const flag = modelFlag(indemnity, { sourceSentences: [repairs.sentence, wrong] });
    const client = fakeModelClient(
      { data: analysisPayload(lease, { riskFlags: [flag] }) },
      { data: requotePayload([repairs.sentence, wrong]) },
    );
    const report = await analyzeDraft(lease.text, [], client);

    expect(report.riskFlags).toEqual([]);
    expect(report.citationFailures).toHaveLength(1);
    expect(report.citationFailures[0]).toHaveProperty("flag.sourceSentences", [repairs.sentence, wrong]);
    expect(report.citationFailures[0].failedSentences).toEqual([wrong]);
  });

  it("withholds a flag when the regeneration finds no sentences", async () => {
    const flag = modelFlag(repairs, { sourceSentences: ["Tenant shall repair the roof."] });
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: analysisPayload(lease, { riskFlags: [flag] }) }, { data: requotePayload([]) }),
    );
    expect(report.riskFlags).toEqual([]);
    expect(report.citationFailures).toHaveLength(1);
  });

  it("rejects a blank sentence, which is in every text", async () => {
    const flag = modelFlag(repairs, { sourceSentences: [" "] });
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: analysisPayload(lease, { riskFlags: [flag] }) }, { data: requotePayload([" "]) }),
    );
    expect(report.riskFlags).toEqual([]);
    expect(report.citationFailures[0].failedSentences).toEqual([" "]);
  });

  it("regenerates only the failing flag and keeps the rest", async () => {
    const flags = lease.sidecar.clauses.map((clause) =>
      clause.id === repairs.id ? modelFlag(clause, { sourceSentences: [`${clause.sentence} `] }) : modelFlag(clause),
    );
    const client = fakeModelClient(
      { data: analysisPayload(lease, { riskFlags: flags }) },
      { data: requotePayload([`${repairs.sentence} `]) },
    );
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(2);
    expect(report.riskFlags).toHaveLength(lease.sidecar.clauses.length - 1);
    expect(report.riskFlags.some((flag) => flag.sourceSentences[0].text.startsWith(repairs.sentence))).toBe(false);
    expect(report.citationFailures).toHaveLength(1);
  });

  it("checks every sentence it shows against the text it was given", async () => {
    const report = await analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease) }));
    for (const flag of report.riskFlags) {
      for (const { text, offset } of flag.sourceSentences) {
        expect(lease.text.indexOf(text)).toBe(offset);
      }
    }
  });

  it("rejects the analysis when the regeneration call fails", async () => {
    const flag = modelFlag(repairs, { sourceSentences: [repairs.sentence.toUpperCase()] });
    await expect(
      analyzeDraft(
        lease.text,
        [],
        fakeModelClient(
          { data: analysisPayload(lease, { riskFlags: [flag] }) },
          { error: new Error("provider unavailable") },
        ),
      ),
    ).rejects.toThrow("provider unavailable");
  });
});

describe("analyzeDraft: severity", () => {
  const indemnity = plantedClause(lease, "principal-uncapped-indemnity");
  const nonCompete = plantedClause(lease, "principal-radius-non-compete");
  const lateFee = plantedClause(lease, "late-charge-and-interest");

  async function severityOf(flag: ReturnType<typeof modelFlag>) {
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: analysisPayload(lease, { riskFlags: [flag] }) }),
    );
    return report.riskFlags[0].severity;
  }

  it("makes a Dangerous catalog type Dangerous even when the model says it is not personal", async () => {
    expect(await severityOf(modelFlag(nonCompete, { reachesSignerPersonally: false }))).toBe("Dangerous");
    const guarantee = { ...modelFlag(indemnity), clauseType: "personalGuarantee", reachesSignerPersonally: false };
    expect(await severityOf(guarantee)).toBe("Dangerous");
    const priorWork = { ...modelFlag(repairs), clauseType: "preExistingIpAssignment" };
    expect(await severityOf(priorWork)).toBe("Dangerous");
  });

  it("makes an uncapped indemnity Dangerous when personal and Caution when not", async () => {
    expect(await severityOf(modelFlag(indemnity, { reachesSignerPersonally: true }))).toBe("Dangerous");
    expect(await severityOf(modelFlag(indemnity, { reachesSignerPersonally: false }))).toBe("Caution");
  });

  it("makes a Caution type Dangerous when the model says it reaches the Signer personally", async () => {
    expect(await severityOf(modelFlag(lateFee, { reachesSignerPersonally: false }))).toBe("Caution");
    expect(await severityOf(modelFlag(lateFee, { reachesSignerPersonally: true }))).toBe("Dangerous");
  });

  it("ignores a severity the model writes in itself", async () => {
    const flag = { ...modelFlag(lateFee), severity: "Dangerous" };
    expect(await severityOf(flag)).toBe("Caution");
  });
});

describe("analyzeDraft: ordering", () => {
  it("puts Dangerous first, then orders by offset, however the model orders them", async () => {
    const shuffled = [...lease.sidecar.clauses].reverse();
    shuffled.push(shuffled.splice(2, 1)[0]);
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: analysisPayload(lease, { riskFlags: shuffled.map((clause) => modelFlag(clause)) }) }),
    );

    const byOffset = (severity: string) =>
      lease.sidecar.clauses
        .filter((clause) => clause.expectedSeverity === severity)
        .map((clause) => lease.text.indexOf(clause.sentence))
        .sort((a, b) => a - b);
    expect(report.riskFlags.map((flag) => flag.severity)).toEqual([
      ...byOffset("Dangerous").map(() => "Dangerous"),
      ...byOffset("Caution").map(() => "Caution"),
    ]);
    expect(report.riskFlags.map((flag) => flag.sourceSentences[0].offset)).toEqual([
      ...byOffset("Dangerous"),
      ...byOffset("Caution"),
    ]);
  });

  it("puts a Caution type raised by personal reach among the Dangerous flags", async () => {
    const lateFee = plantedClause(lease, "late-charge-and-interest");
    const nonCompete = plantedClause(lease, "principal-radius-non-compete");
    const renewal = plantedClause(lease, "auto-renewal-short-window");
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({
        data: analysisPayload(lease, {
          riskFlags: [
            modelFlag(renewal),
            modelFlag(nonCompete),
            modelFlag(lateFee, { reachesSignerPersonally: true }),
          ],
        }),
      }),
    );
    expect(report.riskFlags.map((flag) => flag.clauseType)).toEqual(["lateFees", "individualNonCompete", "autoRenewal"]);
  });
});

describe("analyzeDraft: malformed flags", () => {
  it.each([
    ["riskFlags is missing", { riskFlags: undefined }],
    ["riskFlags is not a list", { riskFlags: "none" }],
    ["a clause type is not in the catalog", { riskFlags: [{ ...modelFlag(repairs), clauseType: "exclusiveDealing" }] }],
    ["a flag has no Reading", { riskFlags: [modelFlag(repairs, { readings: [] })] }],
    ["a flag has three Readings", { riskFlags: [modelFlag(repairs, { readings: ["One.", "Two.", "Three."] })] }],
    ["a flag has no sentences", { riskFlags: [modelFlag(repairs, { sourceSentences: [] })] }],
    ["the personal-reach fact is missing", { riskFlags: [{ ...modelFlag(repairs), reachesSignerPersonally: "yes" }] }],
  ])("rejects when %s", async (_case, override) => {
    const data = { ...analysisPayload(lease), ...override };
    await expect(analyzeDraft(lease.text, [], fakeModelClient({ data }))).rejects.toThrow();
  });
});

describe("readStoredReport: Risk flags", () => {
  it("reads a stored Report's flags back and leaves out its citation failures", async () => {
    const flags = [
      modelFlag(repairs, { sourceSentences: ["Not in the lease."] }),
      modelFlag(plantedClause(lease, "principal-uncapped-indemnity")),
    ];
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: analysisPayload(lease, { riskFlags: flags }) }, { data: requotePayload(["Still not."]) }),
    );
    expect(report.citationFailures).toHaveLength(1);

    const stored = readStoredReport(JSON.parse(JSON.stringify(report)));
    expect(stored?.riskFlags).toEqual(report.riskFlags);
    expect(stored).not.toHaveProperty("citationFailures");
  });

  it("reads a Report stored before Risk flags existed, with no flags field", async () => {
    const report = await analyzeDraft(clean.text, [], fakeModelClient({ data: analysisPayload(clean) }));
    const { riskFlags: _flags, citationFailures: _failures, ...older } = JSON.parse(JSON.stringify(report));
    const stored = readStoredReport(older);
    expect(stored).not.toBeNull();
    expect(stored?.riskFlags).toBeUndefined();
  });
});
