import type { ModelClient } from "../model/port.ts";
import { locateWithRequote, type Located } from "./citations.ts";
import { parseQuestionAnswer, parseRequote } from "./parse.ts";
import { answerRequoteRequest, questionRequest } from "./prompt.ts";
import type { SourceSentence } from "./report.ts";
import { DOES_NOT_SAY } from "./templates.ts";

// The question box (spec, "Question box"): an answer drawn only from the
// Draft's text, resting on Source sentences verified by the same
// exact-substring rule as a Risk flag's (ADR 0001), or the fixed "does not
// say" reply. As with a flag, an answer whose Source sentences fail gets one
// regeneration request to quote them again; if they still fail, or that call
// fails, the Signer gets the fixed reply. No support, no answer or no Source
// sentence gives the fixed reply at once, with no regeneration.

// The longest question, in characters as a reader counts them (not UTF-16
// code units), after leading and trailing spaces are dropped. Long enough
// for a question in the Signer's own words, short enough that it stays a
// question rather than a page of instructions to the model.
export const QUESTION_MAX_LENGTH = 500;

export type QuestionCheck =
  | { ok: true; question: string }
  | { ok: false; problem: "empty" | "tooLong" };

// The one check on a question, shared by askDraft, the server actions and
// the screen, so a refused question never reaches the model.
export function checkQuestion(value: unknown): QuestionCheck {
  if (typeof value !== "string") return { ok: false, problem: "empty" };
  const question = value.trim();
  if (!question) return { ok: false, problem: "empty" };
  if ([...question].length > QUESTION_MAX_LENGTH) return { ok: false, problem: "tooLong" };
  return { ok: true, question };
}

// Why the fixed reply was given, for the maintainer's logs. Never shown to
// the Signer.
export type DoesNotSayReason =
  // The model said the text does not answer the question.
  | "noSupport"
  // The model said it does, but gave no answer or no Source sentence.
  | "unsupportedAnswer"
  // A Source sentence is not in the text exactly as quoted, even after one
  // regeneration.
  | "citationFailed"
  // The regeneration call failed, or its output was malformed.
  | "requoteFailed";

// An answer as the Signer sees it: plain data for display. Holding one is
// not proof that askDraft produced it.
export type ShownAnswer =
  | {
      readonly kind: "answered";
      // The model's answer, in plain English.
      readonly text: string;
      // Every sentence the answer rests on, verified, in document order.
      readonly sourceSentences: readonly SourceSentence[];
    }
  | {
      readonly kind: "doesNotSay";
      // Always the fixed template, never model output.
      readonly text: string;
    };

type AnswerContent =
  | Extract<ShownAnswer, { kind: "answered" }>
  | (Extract<ShownAnswer, { kind: "doesNotSay" }> & { readonly reason: DoesNotSayReason });

// The brand that makes an Answer something only askDraft can produce, as
// with a Report: declared, never created, never exported.
declare const answerBrand: unique symbol;

export type Answer = AnswerContent & { readonly [answerBrand]: true };

function brandAnswer(content: AnswerContent): Answer {
  return Object.freeze({ ...content }) as Answer;
}

// The part of an Answer the Signer may see: the reason for a fixed reply
// stays on the server.
export function displayAnswer(answer: Answer): ShownAnswer {
  if (answer.kind === "answered") {
    return { kind: "answered", text: answer.text, sourceSentences: answer.sourceSentences };
  }
  return { kind: "doesNotSay", text: answer.text };
}

function doesNotSay(reason: DoesNotSayReason): Answer {
  return brandAnswer({ kind: "doesNotSay", text: DOES_NOT_SAY, reason });
}

export async function askDraft(
  extractedText: string,
  question: string,
  modelClient: ModelClient,
): Promise<Answer> {
  if (!/\S/.test(extractedText)) throw new Error("There is no text to ask about.");
  const checked = checkQuestion(question);
  if (!checked.ok) {
    throw new Error(checked.problem === "empty" ? "There is no question to ask." : "The question is too long.");
  }

  const { data } = await modelClient.complete(questionRequest(extractedText, checked.question));
  const { documentAnswers, answer, sourceSentences } = parseQuestionAnswer(data);
  if (!documentAnswers) return doesNotSay("noSupport");
  if (!answer.trim() || sourceSentences.length === 0) return doesNotSay("unsupportedAnswer");

  // The same sentence quoted twice is one Source sentence.
  const quoted = [...new Set(sourceSentences)];
  let located: Located;
  try {
    located = await locateWithRequote(extractedText, quoted, async (failed) => {
      const { data: requoted } = await modelClient.complete(
        answerRequoteRequest(extractedText, checked.question, answer, quoted, failed),
      );
      return [...new Set(parseRequote(requoted))];
    });
  } catch {
    // The answer could not be verified, and the fixed reply is always a
    // truthful one. The first call's failure, above, still rejects.
    return doesNotSay("requoteFailed");
  }
  if (!located.ok) return doesNotSay("citationFailed");
  return brandAnswer({ kind: "answered", text: answer, sourceSentences: located.sentences });
}
