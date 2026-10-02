"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { checkQuestion, QUESTION_MAX_LENGTH, type ShownAnswer } from "@/lib/analysis/index.ts";
import { copy } from "../copy";
import type { AskResult } from "./actions";
import { Quoted, type FlagLinking } from "./report-view";

const text = copy.question;

// A question and the answer Underline gave, held only in this page's memory:
// nothing about either is stored (spec, "Questions and answers are not
// persisted").
export type Asked = { readonly question: string; readonly answer: ShownAnswer };

// The question box under the report: a labeled field and an Ask button (the
// secondary style everywhere, so it never competes with a view's one primary
// action, such as Analyze on the no-account page), the
// question in progress, then the answer on paper with its Source sentences
// underlined in ink like a flag's, or the fixed "does not say" reply.
// DraftReading holds the answer so its sentences are underlined in the
// Draft text too; `index` is the answer's place in that linking.
export function QuestionBox({
  ask,
  asked,
  onAsked,
  index,
  linking,
}: {
  // Runs the question on the server.
  ask: (question: string) => Promise<AskResult>;
  asked: Asked | null;
  onAsked: (asked: Asked | null) => void;
  index: number;
  linking: FlagLinking;
}) {
  const [pending, startTransition] = useTransition();
  const [question, setQuestion] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const answerRegion = useRef<HTMLElement>(null);

  // Move focus to a new answer so a screen reader announces it.
  useEffect(() => {
    if (asked) answerRegion.current?.focus();
  }, [asked]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const checked = checkQuestion(question);
    if (!checked.ok) {
      setMessage(checked.problem === "empty" ? text.errors.empty : text.errors.tooLong(QUESTION_MAX_LENGTH));
      return;
    }
    setMessage(null);
    onAsked(null);
    startTransition(async () => {
      try {
        const outcome = await ask(checked.question);
        if ("answer" in outcome) onAsked({ question: checked.question, answer: outcome.answer });
        else setMessage(outcome.error);
      } catch (error) {
        // A redirect (signed out, or no accounts) arrives as an error.
        unstable_rethrow(error);
        setMessage(text.errors.failed);
      }
    });
  }

  const lit = linking.lit.includes(index);

  return (
    <section className="question" aria-labelledby="question-title">
      <h2 className="draft__section-title" id="question-title">
        {text.title}
      </h2>
      <p className="draft__section-intro">{text.intro}</p>

      <form className="question__form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="question-field">{text.label}</label>
          <div className="question__ask">
            <input
              id="question-field"
              type="text"
              autoComplete="off"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              readOnly={pending}
              aria-describedby={message ? "question-hint question-message" : "question-hint"}
              aria-invalid={message ? true : undefined}
            />
            <button className="button-secondary" type="submit" disabled={pending}>
              {pending ? text.pending : text.submit}
            </button>
          </div>
          <p className="field__hint" id="question-hint">
            {text.hint(QUESTION_MAX_LENGTH)}
          </p>
        </div>
        {message && (
          <p className="form-message" id="question-message" role="alert">
            {message}
          </p>
        )}
        <p className="analysis__status" role="status">
          {pending ? text.pendingNote : ""}
        </p>
      </form>

      {asked && (
        <section
          ref={answerRegion}
          id="answer"
          className={`answer${lit ? " is-lit" : ""}`}
          aria-labelledby="answer-name"
          tabIndex={-1}
          onMouseEnter={() => linking.light(index)}
          onMouseLeave={() => linking.light(null)}
          onFocus={() => linking.light(index)}
          onBlur={() => linking.light(null)}
        >
          <h3 className="answer__title" id="answer-name">
            {text.answerTitle}
          </h3>
          <p className="answer__asked">
            <span className="answer__asked-label">{text.asked}</span> {asked.question}
          </p>
          <p className="answer__text">{asked.answer.text}</p>
          {asked.answer.kind === "answered" && (
            <div className="answer__sources">
              <h4 className="flag__part-title">{text.sourcesTitle}</h4>
              {asked.answer.sourceSentences.map((sentence, sentenceIndex) => (
                <Quoted
                  key={sentenceIndex}
                  sentence={sentence}
                  target={linking.targets[index]?.[sentenceIndex] ?? null}
                  linking={linking}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </section>
  );
}
