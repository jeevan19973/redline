"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { RiskFlag, StoredReport } from "@/lib/analysis/index.ts";
import { copy } from "../copy";
import { citedText } from "./cited-ranges";
import { ReportView } from "./report-view";

const text = copy.reading;

type Pane = "report" | "text";

const NO_FLAGS: readonly RiskFlag[] = [];

// A Draft's text and its report side by side (app shell brief): the text on
// the left with every cited sentence underlined in place, the report on the
// right. A flag and its sentences light each other on hover or focus, and
// each links to the other. On narrow screens one pane shows at a time, with
// a toggle between them.
//
// With no report yet, `pending` takes the report's place (the analysis in
// progress, or a way to run it).
export function DraftReading({
  documentText,
  textTitle,
  textIntro,
  report,
  actions,
  pending,
}: {
  documentText: string;
  textTitle: string;
  textIntro: string;
  report: StoredReport | null;
  actions?: React.ReactNode;
  pending?: React.ReactNode;
}) {
  const [pane, setPane] = useState<Pane>("report");
  // The flags lit by whatever the Signer is hovering or focusing.
  const [lit, setLit] = useState<readonly number[]>([]);
  // An element to scroll to and focus once the pane holding it is showing.
  const [jump, setJump] = useState<string | null>(null);

  const flags = report?.riskFlags ?? NO_FLAGS;
  const cited = useMemo(() => citedText(documentText, flags), [documentText, flags]);

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

  const isLit = (indexes: readonly number[]) => indexes.some((index) => lit.includes(index));

  const pieces: React.ReactNode[] = [];
  let cursor = 0;
  for (const range of cited.ranges) {
    if (range.start > cursor) {
      pieces.push(<Fragment key={`text-${cursor}`}>{documentText.slice(cursor, range.start)}</Fragment>);
    }
    const first = range.flags[0];
    pieces.push(
      <a
        key={range.id}
        id={range.id}
        className={`cited${isLit(range.flags) ? " is-lit" : ""}`}
        href={`#flag-${first + 1}`}
        aria-describedby={range.flags.map((index) => `flag-${index + 1}-name`).join(" ")}
        onClick={(event) => {
          event.preventDefault();
          go("report", `flag-${first + 1}`);
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
            linking={{
              lit,
              light: (index) => setLit(index === null ? [] : [index]),
              targets: cited.targets,
              showInText: (id) => go("text", id),
            }}
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
      </div>
    </div>
  );
}
