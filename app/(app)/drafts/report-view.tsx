import {
  clauseTypeLabel,
  type CleanVerdict,
  type GuarantyGap,
  type RedLine,
  type RiskFlag,
  type StoredReport,
} from "@/lib/analysis/index.ts";
import { copy } from "../copy";
import { draftDate } from "./draft-date";

const text = copy.report;

// How the flags connect to the Draft text beside them (DraftReading).
export type FlagLinking = {
  // Indexes of the flags lit right now.
  lit: readonly number[];
  // Light one flag, or none.
  light: (index: number | null) => void;
  // For each flag and Source sentence, the id of its underline in the text,
  // or null when it cannot be placed there.
  targets: readonly (readonly (string | null)[])[];
  // Show the text pane and move to one underlined sentence.
  showInText: (id: string) => void;
};

// One Report on paper: the guaranty gap and the Clean verdict when there are
// any, the summary, the ranked Risk flags, the Red lines it ran against
// (with `showRedLines`, for a Signer's saved Draft), then the scope stamp.
// Holds no state of its own; DraftReading passes in the linking to the Draft
// text. `actions` sits under the heading, for the re-run control.
export function ReportView({
  report,
  actions,
  linking,
  showRedLines = false,
}: {
  report: StoredReport;
  actions?: React.ReactNode;
  linking: FlagLinking;
  showRedLines?: boolean;
}) {
  const paragraphs = report.summary.split(/\n\s*\n/).filter((paragraph) => paragraph.trim());
  // The guaranty gap's place in the linking, after the flags.
  const gapIndex = report.riskFlags?.length ?? 0;
  // With a Clean verdict and nothing flagged, the verdict says it all.
  const showFlags = !(report.cleanVerdict && report.riskFlags?.length === 0);

  return (
    <section className="report" aria-labelledby="report-title">
      <header className="report__head">
        <h2 className="draft__section-title" id="report-title">
          {text.title}
        </h2>
        <p className="draft__meta">
          {text.analyzed} <time dateTime={report.createdAt}>{draftDate(report.createdAt)}</time>
        </p>
        {/* Its own element, so a control passed in from a Server Component
            is a single child rather than an unkeyed list item. */}
        {actions && <div className="report__actions">{actions}</div>}
      </header>

      {report.guarantyGap && <GuarantyGapNotice gap={report.guarantyGap} index={gapIndex} linking={linking} />}

      {report.cleanVerdict && <CleanVerdictCard verdict={report.cleanVerdict} />}

      <section className="report__part" aria-labelledby="report-summary-title">
        <h3 className="report__part-title" id="report-summary-title">
          {text.summaryTitle}
        </h3>
        <div className="report__summary">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>

      {showFlags && (
        <section className="report__part" aria-labelledby="report-flags-title">
          <h3 className="report__part-title" id="report-flags-title">
            {text.flags.title}
          </h3>
          {report.riskFlags === undefined ? (
            // A Report stored before Risk flags existed was never checked for them.
            <p className="flags__note">{text.flags.olderReport}</p>
          ) : report.riskFlags.length === 0 ? (
            // A Report stored before the Clean verdict existed.
            <p className="flags__note">{text.flags.none}</p>
          ) : (
            <>
              <p className="flags__legend">{text.flags.legend}</p>
              <ol className="flags">
                {report.riskFlags.map((flag, index) => (
                  <li key={index}>
                    <FlagSlate flag={flag} index={index} linking={linking} />
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      )}

      {showRedLines && <RedLinesUsed redLines={report.redLinesSnapshot} />}

      <section className="report__part report__scope" aria-labelledby="report-scope-title">
        <h3 className="report__part-title" id="report-scope-title">
          {text.scopeTitle}
        </h3>
        <p>{report.scopeStamp}</p>
      </section>
    </section>
  );
}

// The Red lines this report ran against, from its snapshot, and a note that
// changing them does not change this report until the analysis runs again.
function RedLinesUsed({ redLines }: { redLines: readonly RedLine[] }) {
  return (
    <section className="report__part" aria-labelledby="report-red-lines-title">
      <h3 className="report__part-title" id="report-red-lines-title">
        {text.redLines.title}
      </h3>
      {redLines.length === 0 ? (
        <p className="flags__note">{text.redLines.none}</p>
      ) : (
        <ul className="report__red-lines" aria-labelledby="report-red-lines-title">
          {redLines.map((redLine) => (
            <li key={redLine.id}>{redLine.kind === "catalog" ? clauseTypeLabel(redLine.clauseType) : redLine.text}</li>
          ))}
        </ul>
      )}
      <p className="flags__legend">{text.redLines.stale}</p>
    </section>
  );
}

// The guaranty gap, on paper near the top: the fixed statement that the
// Signer's personal exposure under the separate guaranty was not checked,
// then the sentence that refers to it, underlined in ink like any Source
// sentence. No severity color: it is not a Risk flag.
function GuarantyGapNotice({ gap, index, linking }: { gap: GuarantyGap; index: number; linking: FlagLinking }) {
  const target = linking.targets[index]?.[0] ?? null;
  const lit = linking.lit.includes(index);
  return (
    <section
      id="guaranty-gap"
      className={`gap${lit ? " is-lit" : ""}`}
      aria-labelledby="guaranty-gap-name"
      tabIndex={-1}
      onMouseEnter={() => linking.light(index)}
      onMouseLeave={() => linking.light(null)}
      onFocus={() => linking.light(index)}
      onBlur={() => linking.light(null)}
    >
      <h3 className="gap__title" id="guaranty-gap-name">
        {text.guarantyGap.title}
      </h3>
      <p className="gap__statement">{gap.statement}</p>
      <div className="flag__source">
        <blockquote className="flag__quote">
          <p>{gap.sourceSentence.text}</p>
        </blockquote>
        {target && (
          <a
            className="flag__cite"
            href={`#${target}`}
            onClick={(event) => {
              event.preventDefault();
              linking.showInText(target);
            }}
          >
            {text.flags.showInText}
          </a>
        )}
      </div>
    </section>
  );
}

// The Clean verdict: calm gray on pale gray, never green, no checkmark (ADR
// 0006). Its wording is the Analysis module's fixed template; each catalog
// clause type is listed with "Checked" or "Not checked" in words.
function CleanVerdictCard({ verdict }: { verdict: CleanVerdict }) {
  return (
    <section className="verdict" aria-labelledby="verdict-title">
      <h3 className="verdict__title" id="verdict-title">
        {verdict.title}
      </h3>
      <p className="verdict__text">{verdict.statement}</p>
      {verdict.notes.map((note, index) => (
        <p className="verdict__text" key={index}>
          {note}
        </p>
      ))}
      <h4 className="verdict__label" id="verdict-list-title">
        {text.verdict.listTitle}
      </h4>
      <ul className="verdict__list" aria-labelledby="verdict-list-title">
        {verdict.checked.map((line) => (
          <li key={line.clauseType} className={line.checked ? undefined : "is-unchecked"}>
            <span className="verdict__clause">{clauseTypeLabel(line.clauseType)}</span>
            <span className="visually-hidden">: </span>
            <span className="verdict__status">{line.checked ? text.verdict.checked : text.verdict.notChecked}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// One Risk flag on paper: the severity label (its meaning in the word, color
// only on the label) with its depth gauge, the clause type, the Red line
// that raised it if one did, or the free-text Red line it crosses, each Source sentence underlined in ink with a
// link to it in the text, then the Reading. The gauge shows reach, not rank:
// a flag a Red line raised still reaches only the business, so it stays
// shallow while its label says Dangerous.
function FlagSlate({ flag, index, linking }: { flag: RiskFlag; index: number; linking: FlagLinking }) {
  const id = `flag-${index + 1}`;
  const dangerous = flag.severity === "Dangerous";
  const deep = dangerous && !flag.raisedByRedLine;
  const lit = linking.lit.includes(index);

  return (
    <article
      id={id}
      className={`flag${lit ? " is-lit" : ""}`}
      aria-labelledby={`${id}-name`}
      tabIndex={-1}
      onMouseEnter={() => linking.light(index)}
      onMouseLeave={() => linking.light(null)}
      onFocus={() => linking.light(index)}
      onBlur={() => linking.light(null)}
    >
      <header className="flag__head">
        <h4 className="flag__name" id={`${id}-name`}>
          <span className={`sev ${dangerous ? "sev--dangerous" : "sev--caution"}`}>{text.severity[flag.severity]}</span>
          <span className={`gauge ${deep ? "gauge--deep" : "gauge--shallow"}`} aria-hidden="true" />
          <span className="flag__type">
            {flag.clauseType === "redLine" ? text.flags.redLineType : clauseTypeLabel(flag.clauseType)}
          </span>
        </h4>
        {flag.raisedByRedLine && (
          <p className="flag__raised">{text.flags.raisedBy(clauseTypeLabel(flag.raisedByRedLine.clauseType))}</p>
        )}
        {flag.crossesRedLine && <p className="flag__raised">{text.flags.crosses(flag.crossesRedLine.text)}</p>}
      </header>

      {flag.sourceSentences.map((sentence, sentenceIndex) => {
        const target = linking.targets[index]?.[sentenceIndex] ?? null;
        return (
          <div className="flag__source" key={sentenceIndex}>
            <blockquote className="flag__quote">
              <p>{sentence.text}</p>
            </blockquote>
            {target && (
              <a
                className="flag__cite"
                href={`#${target}`}
                onClick={(event) => {
                  event.preventDefault();
                  linking.showInText(target);
                }}
              >
                {text.flags.showInText}
              </a>
            )}
          </div>
        );
      })}

      <div className="flag__reading">
        {flag.readings.length === 1 ? (
          <p>{flag.readings[0]}</p>
        ) : (
          <>
            <p>{text.flags.twoReadings}</p>
            <ol className="flag__readings">
              {flag.readings.map((reading, readingIndex) => (
                <li key={readingIndex}>{reading}</li>
              ))}
            </ol>
          </>
        )}
      </div>
    </article>
  );
}
