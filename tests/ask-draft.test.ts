import { describe, expect, it } from "vitest";
import { askDraft, displayAnswer, FIXED_COPY, QUESTION_MAX_LENGTH, type Answer } from "../lib/analysis/index.ts";
import { fakeModelClient } from "./support/fake-model-client.ts";
import { answerPayload, loadFixture, noSupportPayload, PERTURBATIONS, plantedClause } from "./support/fixtures.ts";

const lease = loadFixture("adhesion-contract");

const question = "What happens if the rent is late?";
const lateCharge = plantedClause(lease, "late-charge-and-interest");
const answerText = "You pay a late charge of fifteen percent of the overdue amount, plus interest at eighteen percent a year.";

// The lease's sentence on repairs. It holds a straight apostrophe, for the
// curly-quote case.
const repairs = plantedClause(lease, "tenant-pays-structural-repairs");

const answered = (sourceSentences: string[]) =>
  answerPayload({ documentAnswers: true, answer: answerText, sourceSentences });

// The fixed reply, and only it: the text is the registered template, with no
// Source sentences and nothing from the model.
function expectDoesNotSay(answer: Answer) {
  expect(answer.kind).toBe("doesNotSay");
  expect(answer.text).toBe(FIXED_COPY.doesNotSay);
  expect(displayAnswer(answer)).toEqual({ kind: "doesNotSay", text: FIXED_COPY.doesNotSay });
}

describe("askDraft: answers from verbatim Source sentences", () => {
  it("returns an answer quoting a lease sentence verbatim, with that sentence and its offset", async () => {
    const client = fakeModelClient({ data: answered([lateCharge.sentence]) });
    const answer = await askDraft(lease.text, question, client);

    expect(client.calls).toBe(1);
    expect(answer.kind).toBe("answered");
    if (answer.kind !== "answered") return;
    expect(answer.text).toBe(answerText);
    expect(answer.sourceSentences).toEqual([
      { text: lateCharge.sentence, offset: lease.text.indexOf(lateCharge.sentence) },
    ]);
    const [sentence] = answer.sourceSentences;
    expect(lease.text.slice(sentence.offset, sentence.offset + sentence.text.length)).toBe(lateCharge.sentence);
  });

  it("quotes each sentence an answer rests on in document order, once each", async () => {
    const answer = await askDraft(
      lease.text,
      question,
      fakeModelClient({ data: answered([repairs.sentence, lateCharge.sentence, repairs.sentence]) }),
    );
    expect(answer.kind).toBe("answered");
    if (answer.kind !== "answered") return;
    expect(answer.sourceSentences).toEqual(
      [lateCharge.sentence, repairs.sentence]
        .map((text) => ({ text, offset: lease.text.indexOf(text) }))
        .sort((a, b) => a.offset - b.offset),
    );
  });
});

describe("askDraft: the fixed \"does not say\" reply", () => {
  it("gives the fixed reply when the model reports no support", async () => {
    const client = fakeModelClient({ data: noSupportPayload() });
    expectDoesNotSay(await askDraft(lease.text, "Can I sublet the Premises to a friend?", client));
    expect(client.calls).toBe(1);
  });

  it("gives the fixed reply when the model reports no support, even with an answer and a real sentence", async () => {
    const data = answerPayload({ documentAnswers: false, answer: answerText, sourceSentences: [lateCharge.sentence] });
    expectDoesNotSay(await askDraft(lease.text, question, fakeModelClient({ data })));
  });

  it("gives the fixed reply when the model answers with no Source sentences", async () => {
    const client = fakeModelClient({ data: answered([]) });
    expectDoesNotSay(await askDraft(lease.text, question, client));
    expect(client.calls).toBe(1);
  });

  it("gives the fixed reply when the model reports support but writes no answer", async () => {
    const data = answerPayload({ documentAnswers: true, answer: "  ", sourceSentences: [lateCharge.sentence] });
    expectDoesNotSay(await askDraft(lease.text, question, fakeModelClient({ data })));
  });

  describe.each(PERTURBATIONS)("a Source sentence with %s", (_case, perturb) => {
    it("gives the fixed reply, with no regeneration call", async () => {
      const wrong = perturb(repairs.sentence);
      expect(lease.text).not.toContain(wrong);
      const client = fakeModelClient({ data: answered([wrong]) });
      expectDoesNotSay(await askDraft(lease.text, "Who pays for roof repairs?", client));
      expect(client.calls).toBe(1);
    });
  });

  it("gives the fixed reply when one of several Source sentences fails verification", async () => {
    const data = answered([lateCharge.sentence, PERTURBATIONS[0][1](repairs.sentence)]);
    expectDoesNotSay(await askDraft(lease.text, question, fakeModelClient({ data })));
  });

  it("gives the fixed reply for a blank Source sentence", async () => {
    expectDoesNotSay(await askDraft(lease.text, question, fakeModelClient({ data: answered([" "]) })));
  });

  it("gives the fixed reply for a sentence that is in another document but not this one", async () => {
    const clean = loadFixture("clean-agreement");
    const elsewhere = clean.text.split("\n").find((line) => line.trim().length > 40 && !lease.text.includes(line));
    expect(elsewhere).toBeDefined();
    expectDoesNotSay(await askDraft(lease.text, question, fakeModelClient({ data: answered([elsewhere!]) })));
  });
});

describe("askDraft: refusals before any model call", () => {
  it.each([
    ["an empty question", ""],
    ["a question of spaces and line breaks", "  \n\t "],
    ["a question over the limit", "a".repeat(QUESTION_MAX_LENGTH + 1)],
  ])("rejects %s and makes no model call", async (_case, refused) => {
    const client = fakeModelClient();
    await expect(askDraft(lease.text, refused, client)).rejects.toThrow();
    expect(client.calls).toBe(0);
  });

  it("counts characters as a reader does, and accepts a question at the limit", async () => {
    // Each of these is one character but two UTF-16 code units.
    const atLimit = "\u{1F3E0}".repeat(QUESTION_MAX_LENGTH);
    const client = fakeModelClient({ data: noSupportPayload() });
    expectDoesNotSay(await askDraft(lease.text, atLimit, client));
    expect(client.calls).toBe(1);
  });

  it("rejects when there is no text to ask about, with no model call", async () => {
    const client = fakeModelClient();
    await expect(askDraft(" \n ", question, client)).rejects.toThrow();
    expect(client.calls).toBe(0);
  });
});

describe("askDraft: failures", () => {
  it("rejects when the model call fails", async () => {
    const client = fakeModelClient({ error: new Error("The provider is down.") });
    await expect(askDraft(lease.text, question, client)).rejects.toThrow("The provider is down.");
  });

  it.each([
    ["not an object", "an answer"],
    ["documentAnswers missing", { answer: answerText, sourceSentences: [lateCharge.sentence] }],
    ["the answer not text", { documentAnswers: true, answer: 3, sourceSentences: [lateCharge.sentence] }],
    ["sourceSentences not a list", { documentAnswers: true, answer: answerText, sourceSentences: lateCharge.sentence }],
    ["a Source sentence not text", { documentAnswers: true, answer: answerText, sourceSentences: [7] }],
  ])("rejects malformed output: %s", async (_case, data) => {
    await expect(askDraft(lease.text, question, fakeModelClient({ data }))).rejects.toThrow(/malformed/);
  });
});
