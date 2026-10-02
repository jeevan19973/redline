import { describe, expect, it } from "vitest";
import { analyzeDraft, displayReport, readStoredReport, type RedLine } from "../lib/analysis/index.ts";
import { fakeModelClient } from "./support/fake-model-client.ts";
import {
  analysisPayload,
  basisRequotePayload,
  counterOfferFor,
  counterOfferPayload,
  guarantyReference,
  loadFixture,
  modelFlag,
  nonNegotiableFlag,
  plantedClause,
  redLineFlag,
} from "./support/fixtures.ts";

const lease = loadFixture("adhesion-contract");

// The lease's own statement that its terms are not open to negotiation.
const basis = lease.sidecar.nonNegotiableBasis!;
const basisSentence = { text: basis, offset: lease.text.indexOf(basis) };

const indemnity = plantedClause(lease, "principal-uncapped-indemnity");
const renewal = plantedClause(lease, "auto-renewal-short-window");

// A basis sentence one character off the lease's.
const wrongBasis = basis.replace("standard form", "standard  form");

function onlyFlags(...riskFlags: ReturnType<typeof modelFlag>[]) {
  return analysisPayload(lease, { riskFlags, guarantyReference: guarantyReference(null) });
}

describe("analyzeDraft: Non-negotiable clauses", () => {
  it("strips a Counter-offer the model supplies for a Non-negotiable flag, and keeps it Dangerous", async () => {
    expect(basisSentence.offset).toBeGreaterThanOrEqual(0);
    const flag = nonNegotiableFlag(indemnity, basis, { counterOffer: "Principal's liability is capped at one month of Rent." });
    const client = fakeModelClient({ data: onlyFlags(flag) });
    const report = await analyzeDraft(lease.text, [], client);

    expect(report.riskFlags).toHaveLength(1);
    const [shown] = report.riskFlags;
    expect(shown.severity).toBe("Dangerous");
    expect(shown.negotiability).toBe("nonNegotiable");
    expect(shown.nonNegotiableBasis).toEqual(basisSentence);
    expect(shown).not.toHaveProperty("counterOffer");
    expect(report.citationFailures).toEqual([]);
    expect(report.counterOfferGaps).toEqual([]);
    expect(client.calls).toBe(1);
  });

  it("gives every planted clause the same severity whether it is negotiable or not", async () => {
    const negotiable = await analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease) }));
    const fixed = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({
        data: analysisPayload(lease, {
          riskFlags: lease.sidecar.clauses.map((clause) => nonNegotiableFlag(clause, basis)),
        }),
      }),
    );

    expect(fixed.riskFlags.every((flag) => flag.negotiability === "nonNegotiable" && !flag.counterOffer)).toBe(true);
    const severities = (report: typeof fixed) =>
      report.riskFlags.map((flag) => [flag.sourceSentences[0].text, flag.severity]);
    expect(severities(fixed)).toEqual(severities(negotiable));
    for (const clause of lease.sidecar.clauses) {
      const flag = fixed.riskFlags.find((candidate) => candidate.sourceSentences[0].text === clause.sentence);
      expect(flag?.severity, clause.id).toBe(clause.expectedSeverity);
    }
  });

  it("shows the take-it-or-leave-it call once the regeneration quotes the basis exactly", async () => {
    const client = fakeModelClient(
      { data: onlyFlags(nonNegotiableFlag(indemnity, wrongBasis)) },
      { data: basisRequotePayload(basis) },
    );
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(2);
    expect(report.riskFlags[0].negotiability).toBe("nonNegotiable");
    expect(report.riskFlags[0].nonNegotiableBasis).toEqual(basisSentence);
    expect(report.citationFailures).toEqual([]);
  });

  it("keeps the flag and its severity but shows neither the label nor the model's Counter-offer when the basis is still not in the text, and records it", async () => {
    expect(lease.text).not.toContain(wrongBasis);
    const proposed = nonNegotiableFlag(indemnity, wrongBasis, {
      counterOffer: "Principal's obligations under this Section are limited to six months of Base Rent.",
    });
    // A third call would fail as unscripted: no Counter-offer is asked for.
    const client = fakeModelClient({ data: onlyFlags(proposed) }, { data: basisRequotePayload(wrongBasis) });
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(2);
    expect(report.riskFlags).toHaveLength(1);
    const [shown] = report.riskFlags;
    expect(shown.severity).toBe("Dangerous");
    expect(shown.sourceSentences).toEqual([{ text: indemnity.sentence, offset: lease.text.indexOf(indemnity.sentence) }]);
    expect(shown.negotiability).toBe("unconfirmedNonNegotiable");
    expect(shown).not.toHaveProperty("nonNegotiableBasis");
    expect(shown).not.toHaveProperty("counterOffer");
    expect(report.citationFailures).toEqual([
      { nonNegotiableBasis: { flag: proposed }, failedSentences: [wrongBasis], attempts: 2 },
    ]);
    expect(report.counterOfferGaps).toEqual([]);

    // The same on the way to the browser and back from storage.
    const displayed = displayReport(report, { showConfidence: false }).riskFlags![0];
    expect(displayed.negotiability).toBe("unconfirmedNonNegotiable");
    expect(displayed).not.toHaveProperty("counterOffer");
    expect(readStoredReport(JSON.parse(JSON.stringify(report)), { showConfidence: true })?.riskFlags).toEqual(
      report.riskFlags,
    );
  });

  it("asks for no Counter-offer when the model gave none and its basis fails", async () => {
    const client = fakeModelClient(
      { data: onlyFlags(nonNegotiableFlag(renewal, "")) },
      { data: basisRequotePayload("") },
    );
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(2);
    expect(report.riskFlags[0]).toMatchObject({ severity: "Caution", negotiability: "unconfirmedNonNegotiable" });
    expect(report.riskFlags[0]).not.toHaveProperty("counterOffer");
    expect(report.citationFailures).toHaveLength(1);
    expect(report.counterOfferGaps).toEqual([]);
    // The flag was shown, so a failed basis does not count against the
    // Clean verdict.
    expect(report.cleanVerdict).toBeDefined();
  });

  it("rejects the analysis when the basis regeneration call fails", async () => {
    await expect(
      analyzeDraft(
        lease.text,
        [],
        fakeModelClient({ data: onlyFlags(nonNegotiableFlag(indemnity, wrongBasis)) }, { error: new Error("provider unavailable") }),
      ),
    ).rejects.toThrow("provider unavailable");
  });
});

describe("analyzeDraft: Counter-offers", () => {
  it("carries the Counter-offer the model supplied on a negotiable flag", async () => {
    const wording = "Tenant may give notice of non-renewal at any time up to 30 days before the end of the then-current term.";
    const client = fakeModelClient({ data: onlyFlags(modelFlag(renewal, { counterOffer: wording })) });
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(1);
    const [shown] = report.riskFlags;
    expect(shown.negotiability).toBe("negotiable");
    expect(shown.counterOffer).toBe(wording);
    expect(shown).not.toHaveProperty("nonNegotiableBasis");
    expect(report.counterOfferGaps).toEqual([]);
  });

  it("gives every planted clause the Counter-offer written for it", async () => {
    const report = await analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease) }));
    for (const clause of lease.sidecar.clauses) {
      const flag = report.riskFlags.find((candidate) => candidate.sourceSentences[0].text === clause.sentence);
      expect(flag?.counterOffer, clause.id).toBe(counterOfferFor(clause));
    }
  });

  it("ignores a basis sentence on a negotiable flag", async () => {
    const report = await analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: onlyFlags(modelFlag(renewal, { nonNegotiableBasis: basis })) }),
    );
    expect(report.riskFlags[0].negotiability).toBe("negotiable");
    expect(report.riskFlags[0]).not.toHaveProperty("nonNegotiableBasis");
  });

  it("asks once for a missing Counter-offer and carries the one the regeneration writes", async () => {
    const wording = "Landlord shall give Tenant written notice of the renewal date at least 30 days before the notice window opens.";
    const client = fakeModelClient(
      { data: onlyFlags(modelFlag(renewal, { counterOffer: "" })) },
      { data: counterOfferPayload(wording) },
    );
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(2);
    expect(report.riskFlags[0].counterOffer).toBe(wording);
    expect(report.counterOfferGaps).toEqual([]);
  });

  it("still shows a negotiable flag with no Counter-offer after the regeneration, and records the gap", async () => {
    const proposed = modelFlag(indemnity, { counterOffer: "  " });
    const client = fakeModelClient({ data: onlyFlags(proposed) }, { data: counterOfferPayload("") });
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(2);
    expect(report.riskFlags).toHaveLength(1);
    const [shown] = report.riskFlags;
    expect(shown.severity).toBe("Dangerous");
    expect(shown.negotiability).toBe("negotiable");
    expect(shown).not.toHaveProperty("counterOffer");
    expect(report.counterOfferGaps).toEqual([{ flag: proposed, attempts: 2 }]);
    expect(report.citationFailures).toEqual([]);
  });

  it("never asks for a Counter-offer on a flag whose Source sentences were withheld", async () => {
    const flag = modelFlag(renewal, { sourceSentences: ["Not in the lease."], counterOffer: "" });
    const client = fakeModelClient({ data: onlyFlags(flag) }, { data: { sourceSentences: ["Still not."] } });
    const report = await analyzeDraft(lease.text, [], client);

    expect(client.calls).toBe(2);
    expect(report.riskFlags).toEqual([]);
    expect(report.counterOfferGaps).toEqual([]);
  });

  it("rejects the analysis when the model sends a negotiability that is neither value", async () => {
    const flag = { ...modelFlag(renewal), negotiability: "maybe" };
    await expect(
      analyzeDraft(lease.text, [], fakeModelClient({ data: analysisPayload(lease, { riskFlags: [flag as never] }) })),
    ).rejects.toThrow();
  });
});

describe("analyzeDraft: negotiability on Red line flags", () => {
  const onEntry: RedLine = { id: "red-line-entry", kind: "freeText", text: "Landlord can come in on short notice" };
  const entrySentence =
    "Landlord may enter the Premises during business hours on twenty-four hours' notice to inspect them or to show them to prospective buyers or lenders.";
  const onRenewal: RedLine = { id: "red-line-renewal", kind: "catalog", clauseType: "autoRenewal" };

  it("strips the Counter-offer from a Non-negotiable flag a free-text Red line added", async () => {
    const flag = redLineFlag(onEntry.id, entrySentence, { negotiability: "nonNegotiable", nonNegotiableBasis: basis });
    const report = await analyzeDraft(lease.text, [onEntry], fakeModelClient({ data: onlyFlags(flag) }));

    const [shown] = report.riskFlags;
    expect(shown.clauseType).toBe("redLine");
    expect(shown.crossesRedLine).toEqual(onEntry);
    expect(shown.negotiability).toBe("nonNegotiable");
    expect(shown.nonNegotiableBasis).toEqual(basisSentence);
    expect(shown).not.toHaveProperty("counterOffer");
  });

  it("carries the Counter-offer on a negotiable flag a free-text Red line added", async () => {
    const wording = "Landlord may enter the Premises only on 72 hours' written notice, accompanied by Tenant.";
    const flag = redLineFlag(onEntry.id, entrySentence, { counterOffer: wording });
    const report = await analyzeDraft(lease.text, [onEntry], fakeModelClient({ data: onlyFlags(flag) }));
    expect(report.riskFlags[0]).toMatchObject({ clauseType: "redLine", negotiability: "negotiable", counterOffer: wording });
  });

  it("keeps a Non-negotiable flag Non-negotiable, with no Counter-offer, when a catalog Red line raises it", async () => {
    const report = await analyzeDraft(
      lease.text,
      [onRenewal],
      fakeModelClient({ data: onlyFlags(nonNegotiableFlag(renewal, basis, { counterOffer: "Some wording." })) }),
    );
    const [shown] = report.riskFlags;
    expect(shown.severity).toBe("Dangerous");
    expect(shown.raisedByRedLine).toEqual(onRenewal);
    expect(shown.negotiability).toBe("nonNegotiable");
    expect(shown).not.toHaveProperty("counterOffer");
  });
});

describe("readStoredReport and displayReport: negotiability", () => {
  async function mixedReport() {
    return analyzeDraft(
      lease.text,
      [],
      fakeModelClient(
        { data: onlyFlags(nonNegotiableFlag(indemnity, basis), modelFlag(renewal), modelFlag(plantedClause(lease, "late-charge-and-interest"), { counterOffer: "" })) },
        { data: counterOfferPayload("") },
      ),
    );
  }

  it("reads Counter-offers and Non-negotiable bases back, and leaves out Counter-offer gaps", async () => {
    const report = await mixedReport();
    expect(report.counterOfferGaps).toHaveLength(1);

    const stored = readStoredReport(JSON.parse(JSON.stringify(report)), { showConfidence: true });
    expect(stored?.riskFlags).toEqual(report.riskFlags);
    expect(stored).not.toHaveProperty("counterOfferGaps");
    expect(displayReport(report, { showConfidence: true })).not.toHaveProperty("counterOfferGaps");
  });

  it("refuses a stored Non-negotiable flag that carries a Counter-offer", async () => {
    const stored = JSON.parse(JSON.stringify(await mixedReport()));
    const fixed = stored.riskFlags.find((flag: { negotiability: string }) => flag.negotiability === "nonNegotiable");
    fixed.counterOffer = "Wording written into the row.";
    expect(readStoredReport(stored, { showConfidence: true })).toBeNull();
  });

  async function unconfirmedReport() {
    return analyzeDraft(
      lease.text,
      [],
      fakeModelClient({ data: onlyFlags(nonNegotiableFlag(indemnity, wrongBasis)) }, { data: basisRequotePayload("") }),
    );
  }

  it("refuses a stored unconfirmed Non-negotiable flag that carries a Counter-offer", async () => {
    const stored = JSON.parse(JSON.stringify(await unconfirmedReport()));
    expect(readStoredReport(stored, { showConfidence: true })).not.toBeNull();
    stored.riskFlags[0].counterOffer = "Wording written into the row.";
    expect(readStoredReport(stored, { showConfidence: true })).toBeNull();
  });

  it("refuses a stored unconfirmed Non-negotiable flag that carries a basis", async () => {
    const stored = JSON.parse(JSON.stringify(await unconfirmedReport()));
    stored.riskFlags[0].nonNegotiableBasis = basisSentence;
    expect(readStoredReport(stored, { showConfidence: true })).toBeNull();
  });

  it("reads flags stored before negotiability existed, with none of its fields", async () => {
    const stored = JSON.parse(JSON.stringify(await mixedReport()));
    for (const flag of stored.riskFlags) {
      delete flag.negotiability;
      delete flag.counterOffer;
      delete flag.nonNegotiableBasis;
      // Confidence came later still.
      delete flag.confidence;
    }
    const read = readStoredReport(stored, { showConfidence: true });
    expect(read?.riskFlags).toHaveLength(3);
    expect(read?.riskFlags?.every((flag) => flag.negotiability === undefined)).toBe(true);
  });
});
