import { clauseTypeLabel, type RiskFlag, type StoredReport } from "@/lib/analysis/index.ts";
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

// One Report on paper: the summary, the ranked Risk flags, then the scope
// stamp. Holds no state of its own; DraftReading passes in the linking to
// the Draft text. `actions` sits under the heading, for the re-run control.
export function ReportView({
  report,
  actions,
  linking,
}: {
  report: StoredReport;
  actions?: React.ReactNode;
  linking: FlagLinking;
}) {
  const paragraphs = report.summary.split(/\n\s*\n/).filter((paragraph) => paragraph.trim());

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

      <section className="report__part" aria-labelledby="report-flags-title">
        <h3 className="report__part-title" id="report-flags-title">
          {text.flags.title}
        </h3>
        {report.riskFlags === undefined ? (
          // A Report stored before Risk flags existed was never checked for them.
          <p className="flags__note">{text.flags.olderReport}</p>
        ) : report.riskFlags.length === 0 ? (
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

      <section className="report__part report__scope" aria-labelledby="report-scope-title">
        <h3 className="report__part-title" id="report-scope-title">
          {text.scopeTitle}
        </h3>
        <p>{report.scopeStamp}</p>
      </section>
    </section>
  );
}

// One Risk flag on paper: the severity label (its meaning in the word, color
// only on the label) with its depth gauge, the clause type, each Source
// sentence underlined in ink with a link to it in the text, then the Reading.
function FlagSlate({ flag, index, linking }: { flag: RiskFlag; index: number; linking: FlagLinking }) {
  const id = `flag-${index + 1}`;
  const dangerous = flag.severity === "Dangerous";
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
          <span className={`gauge ${dangerous ? "gauge--deep" : "gauge--shallow"}`} aria-hidden="true" />
          <span className="flag__type">{clauseTypeLabel(flag.clauseType)}</span>
        </h4>
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
