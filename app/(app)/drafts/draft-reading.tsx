"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { StoredReport } from "@/lib/analysis/index.ts";
import { copy } from "../copy";
import type { AskResult } from "./actions";
import { citedText, type Citing } from "./cited-ranges";
import { QuestionBox, type Asked } from "./question-box";
import { ReportView, type FlagLinking } from "./report-view";

const text = copy.reading;

type Pane = "report" | "text";

const NOTHING_CITED: readonly Citing[] = [];

// The element id of what quotes the text, by its index in `citing`: a Risk
// flag (flag-1, flag-2, ...), then the guaranty gap when there is one, then
// the question box's answer.
export function citingId(index: number, flagCount: number, hasGap: boolean): string {
  if (index < flagCount) return `flag-${index + 1}`;
  return hasGap && index === flagCount ? "guaranty-gap" : "answer";
}

// A Draft's text and its report side by side (app shell brief): the text on
// the left with every cited sentence underlined in place, the report on the
// right. A flag and its sentences light each other on hover or focus, and
// each links to the other. On narrow screens one pane shows at a time, with
// a toggle between them.
//
// With no report yet, `pending` takes the report's place (the analysis in
// progress, or a way to run it). With `ask`, the question box sits under
// the report, and an answer's Source sentences are underlined in the text
// and linked like a flag's. The answer lives only in this component's state.
export function DraftReading({
  documentText,
  textTitle,
  textIntro,
  report,
  actions,
  pending,
  showRedLines = false,
  ask,
}: {
  documentText: string;
  textTitle: string;
  textIntro: string;
  report: StoredReport | null;
  actions?: React.ReactNode;
  pending?: React.ReactNode;
  // Whether the report lists the Red lines it ran against: only on a
  // Signer's saved Draft, since without accounts there are none.
  showRedLines?: boolean;
  // Runs a question about this text on the server.
  ask?: (question: string) => Promise<AskResult>;
}) {
  const [pane, setPane] = useState<Pane>("report");
  // The flags lit by whatever the Signer is hovering or focusing.
  const [lit, setLit] = useState<readonly number[]>([]);
  // An element to scroll to and focus once the pane holding it is showing.
  const [jump, setJump] = useState<string | null>(null);
  // The last question asked and its answer, never stored.
  const [asked, setAsked] = useState<Asked | null>(null);

  // The flags, then the guaranty gap's sentence when there is one. A
  // Non-negotiable flag's basis sentence is placed after its Source
  // sentences, so it is underlined in the text and linked to its flag too.
  // An answer's Source sentences come last.
  const flagCount = report?.riskFlags?.length ?? 0;
  const hasGap = report?.guarantyGap !== undefined;
  const answerIndex = flagCount + (hasGap ? 1 : 0);
  const citing = useMemo(() => {
    const flags: readonly Citing[] = (report?.riskFlags ?? []).map((flag) => ({
      sourceSentences: flag.nonNegotiableBasis
        ? [...flag.sourceSentences, flag.nonNegotiableBasis]
        : flag.sourceSentences,
    }));
    const fromReport = report?.guarantyGap
      ? [...flags, { sourceSentences: [report.guarantyGap.sourceSentence] }]
      : flags;
    if (asked?.answer.kind !== "answered") return fromReport.length > 0 ? fromReport : NOTHING_CITED;
    return [...fromReport, { sourceSentences: asked.answer.sourceSentences }];
  }, [report, asked]);
  const cited = useMemo(() => citedText(documentText, citing), [documentText, citing]);

  useEffect(() => {
    if (!jump) return;
    const target = document.getElementById(jump);
    setJump(null);
    if (!target) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ block: "center", behavior: still ? "auto" : "smooth" });
    target.focus({ preventScroll: true });
  }, [jump]);

  function go(to: Pane, id: string) {
    setPane(to);
    setJump(id);
  }

  const linking: FlagLinking = {
    lit,
    light: (index) => setLit(index === null ? [] : [index]),
    targets: cited.targets,
    showInText: (id) => go("text", id),
  };

  const isLit = (indexes: readonly number[]) => indexes.some((index) => lit.includes(index));

  const pieces: React.ReactNode[] = [];
  let cursor = 0;
  for (const range of cited.ranges) {
    if (range.start > cursor) {
      pieces.push(<Fragment key={`text-${cursor}`}>{documentText.slice(cursor, range.start)}</Fragment>);
    }
    const first = citingId(range.flags[0], flagCount, hasGap);
    pieces.push(
      <a
        key={range.id}
        id={range.id}
        className={`cited${isLit(range.flags) ? " is-lit" : ""}`}
        href={`#${first}`}
        aria-describedby={range.flags.map((index) => `${citingId(index, flagCount, hasGap)}-name`).join(" ")}
        onClick={(event) => {
          event.preventDefault();
          go("report", first);
        }}
        onMouseEnter={() => setLit(range.flags)}
        onMouseLeave={() => setLit([])}
        onFocus={() => setLit(range.flags)}
        onBlur={() => setLit([])}
      >
        {documentText.slice(range.start, range.end)}
      </a>,
    );
    cursor = range.end;
  }
  if (cursor < documentText.length) {
    pieces.push(<Fragment key={`text-${cursor}`}>{documentText.slice(cursor)}</Fragment>);
  }

  return (
    <div className="reading" data-pane={pane}>
      <div className="reading__toggle" role="group" aria-label={text.toggleLabel}>
        <button type="button" aria-pressed={pane === "report"} onClick={() => setPane("report")}>
          {text.report}
        </button>
        <button type="button" aria-pressed={pane === "text"} onClick={() => setPane("text")}>
          {text.text}
        </button>
      </div>

      <section className="reading__pane reading__text" aria-labelledby="draft-text-title">
        <h2 className="draft__section-title" id="draft-text-title">
          {textTitle}
        </h2>
        <p className="draft__section-intro">{textIntro}</p>
        {cited.ranges.length > 0 && <p className="draft__section-intro">{text.textNote}</p>}
        <div className="document">{pieces}</div>
      </section>

      <div className="reading__pane reading__report">
        {report ? (
          <ReportView
            report={report}
            actions={actions}
            showRedLines={showRedLines}
            linking={linking}
          />
        ) : (
          <section className="report" aria-labelledby="report-title">
            <header className="report__head">
              <h2 className="draft__section-title" id="report-title">
                {copy.report.title}
              </h2>
            </header>
            <div>{pending}</div>
          </section>
        )}
        {ask && <QuestionBox ask={ask} asked={asked} onAsked={setAsked} index={answerIndex} linking={linking} />}
      </div>
    </div>
  );
}
