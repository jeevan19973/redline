import { describe, expect, it } from "vitest";
import { askDraft, displayAnswer, FIXED_COPY, QUESTION_MAX_LENGTH, type Answer } from "../lib/analysis/index.ts";
import type { ModelRequest } from "../lib/model/port.ts";
import { fakeModelClient } from "./support/fake-model-client.ts";
import {
  answerPayload,
  loadFixture,
  noSupportPayload,
  PERTURBATIONS,
  plantedClause,
  requotePayload,
} from "./support/fixtures.ts";

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

  it("gives the fixed reply when the model reports support but writes no answer, with no regeneration", async () => {
    const data = answerPayload({ documentAnswers: true, answer: "  ", sourceSentences: [lateCharge.sentence] });
    const client = fakeModelClient({ data });
    expectDoesNotSay(await askDraft(lease.text, question, client));
    expect(client.calls).toBe(1);
  });

  it("gives the fixed reply with no regeneration when the model reports no support, even with a misquoted sentence", async () => {
    const data = answerPayload({
      documentAnswers: false,
      answer: "",
      sourceSentences: [PERTURBATIONS[0][1](repairs.sentence)],
    });
    const client = fakeModelClient({ data });
    expectDoesNotSay(await askDraft(lease.text, question, client));
    expect(client.calls).toBe(1);
  });
});

describe("askDraft: one regeneration for a failed Source sentence", () => {
  describe.each(PERTURBATIONS)("a Source sentence with %s", (_case, perturb) => {
    const wrong = perturb(repairs.sentence);

    it("returns the answer with the corrected sentence and its offset when the regeneration quotes it exactly", async () => {
      expect(lease.text).not.toContain(wrong);
      const client = fakeModelClient({ data: answered([wrong]) }, { data: requotePayload([repairs.sentence]) });
      const answer = await askDraft(lease.text, "Who pays for roof repairs?", client);

      expect(client.calls).toBe(2);
      expect(answer.kind).toBe("answered");
      if (answer.kind !== "answered") return;
      expect(answer.text).toBe(answerText);
      expect(answer.sourceSentences).toEqual([{ text: repairs.sentence, offset: lease.text.indexOf(repairs.sentence) }]);
      const [sentence] = answer.sourceSentences;
      expect(lease.text.slice(sentence.offset, sentence.offset + sentence.text.length)).toBe(repairs.sentence);
    });

    it("gives the fixed reply when the regeneration quotes it wrong again", async () => {
      const client = fakeModelClient({ data: answered([wrong]) }, { data: requotePayload([wrong]) });
      expectDoesNotSay(await askDraft(lease.text, "Who pays for roof repairs?", client));
      expect(client.calls).toBe(2);
    });
  });

  it("returns every sentence the regeneration quotes when one of several failed", async () => {
    const wrong = PERTURBATIONS[0][1](repairs.sentence);
    const client = fakeModelClient(
      { data: answered([lateCharge.sentence, wrong]) },
      { data: requotePayload([lateCharge.sentence, repairs.sentence]) },
    );
    const answer = await askDraft(lease.text, question, client);
    expect(client.calls).toBe(2);
    expect(answer.kind).toBe("answered");
    if (answer.kind !== "answered") return;
    expect(answer.sourceSentences).toEqual(
      [lateCharge.sentence, repairs.sentence]
        .map((text) => ({ text, offset: lease.text.indexOf(text) }))
        .sort((a, b) => a.offset - b.offset),
    );
  });

  it("gives the fixed reply when the regeneration fixes one of several sentences but not the other", async () => {
    const wrong = PERTURBATIONS[0][1](repairs.sentence);
    const client = fakeModelClient(
      { data: answered([lateCharge.sentence, wrong]) },
      { data: requotePayload([lateCharge.sentence, wrong]) },
    );
    expectDoesNotSay(await askDraft(lease.text, question, client));
    expect(client.calls).toBe(2);
  });

  it("gives the fixed reply when the regeneration finds no sentences", async () => {
    const client = fakeModelClient({ data: answered([" "]) }, { data: requotePayload([]) });
    expectDoesNotSay(await askDraft(lease.text, question, client));
    expect(client.calls).toBe(2);
  });

  it("gives the fixed reply for a sentence that is in another document but not this one, still missing after the regeneration", async () => {
    const clean = loadFixture("clean-agreement");
    const elsewhere = clean.text.split("\n").find((line) => line.trim().length > 40 && !lease.text.includes(line));
    expect(elsewhere).toBeDefined();
    const client = fakeModelClient({ data: answered([elsewhere!]) }, { data: requotePayload([elsewhere!]) });
    expectDoesNotSay(await askDraft(lease.text, question, client));
  });

  it("gives the fixed reply, not an error, when the regeneration call fails", async () => {
    const client = fakeModelClient(
      { data: answered([PERTURBATIONS[0][1](repairs.sentence)]) },
      { error: new Error("The provider is down.") },
    );
    expectDoesNotSay(await askDraft(lease.text, question, client));
    expect(client.calls).toBe(2);
  });

  it.each([
    ["not an object", "sentences"],
    ["sourceSentences missing", {}],
    ["a sentence not text", { sourceSentences: [7] }],
  ])("gives the fixed reply, not an error, when the regeneration's output is malformed: %s", async (_case, data) => {
    const client = fakeModelClient({ data: answered([PERTURBATIONS[0][1](repairs.sentence)]) }, { data });
    expectDoesNotSay(await askDraft(lease.text, question, client));
    expect(client.calls).toBe(2);
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
  ])("rejects malformed output on both tries: %s", async (_case, data) => {
    const client = fakeModelClient({ data }, { data });
    await expect(askDraft(lease.text, question, client)).rejects.toThrow(/malformed/);
    expect(client.calls).toBe(2);
  });

  it("does not retry when the model call itself fails", async () => {
    const client = fakeModelClient({ error: new Error("The provider timed out.") });
    await expect(askDraft(lease.text, question, client)).rejects.toThrow("The provider timed out.");
    expect(client.calls).toBe(1);
  });
});

// FINDINGS.md, seen once: a question showed "couldn't finish answering" and
// the retry worked. A malformed reply is now asked for once more, with the
// same request, and discarded whole.
describe("askDraft: one retry for a malformed reply", () => {
  const malformed = { documentAnswers: true, answer: "From the malformed reply.", sourceSentences: repairs.sentence };

  it("answers from the second reply when the first is malformed", async () => {
    const requests: ModelRequest[] = [];
    const reply = (data: unknown) => (request: ModelRequest) => {
      requests.push(request);
      return { data, modelId: "fake/scripted-model" };
    };
    const client = fakeModelClient(reply(malformed), reply(answered([lateCharge.sentence])));
    const answer = await askDraft(lease.text, question, client);

    expect(client.calls).toBe(2);
    expect(requests[1]).toEqual(requests[0]);
    expect(displayAnswer(answer)).toEqual({
      kind: "answered",
      text: answerText,
      sourceSentences: [{ text: lateCharge.sentence, offset: lease.text.indexOf(lateCharge.sentence) }],
    });
  });

  it("gives the fixed reply when the second reply honestly finds no support", async () => {
    const client = fakeModelClient({ data: malformed }, { data: noSupportPayload() });
    expectDoesNotSay(await askDraft(lease.text, question, client));
    expect(client.calls).toBe(2);
  });

  it("makes one call when the first reply is well formed", async () => {
    const client = fakeModelClient({ data: answered([lateCharge.sentence]) });
    await askDraft(lease.text, question, client);
    expect(client.calls).toBe(1);
  });
});
