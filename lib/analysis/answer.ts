import type { ModelClient } from "../model/port.ts";
import { locateAll } from "./citations.ts";
import { parseQuestionAnswer } from "./parse.ts";
import { questionRequest } from "./prompt.ts";
import type { SourceSentence } from "./report.ts";
import { DOES_NOT_SAY } from "./templates.ts";

// The question box (spec, "Question box"): an answer drawn only from the
// Draft's text, resting on Source sentences verified by the same
// exact-substring rule as a Risk flag's (ADR 0001), or the fixed "does not
// say" reply. Unlike a flag, an answer gets no regeneration: a failed
// citation gives the fixed reply, which keeps a question to one model call.

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
  // A Source sentence is not in the text exactly as quoted.
  | "citationFailed";

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
  const located = locateAll(extractedText, [...new Set(sourceSentences)]);
  if (!located.ok) return doesNotSay("citationFailed");
  return brandAnswer({ kind: "answered", text: answer, sourceSentences: located.sentences });
}
