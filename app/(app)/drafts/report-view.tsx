import type { StoredReport } from "@/lib/analysis/index.ts";
import { copy } from "../copy";
import { draftDate } from "./draft-date";

const text = copy.report;

// One Report on paper: the summary, then the scope stamp. Holds no state, so
// the Draft page renders it on the server and the no-account analyze form
// renders it in the browser. `actions` sits under the heading, for the
// re-run control.
export function ReportView({ report, actions }: { report: StoredReport; actions?: React.ReactNode }) {
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
        {actions}
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

      <section className="report__part report__scope" aria-labelledby="report-scope-title">
        <h3 className="report__part-title" id="report-scope-title">
          {text.scopeTitle}
        </h3>
        <p>{report.scopeStamp}</p>
      </section>
    </section>
  );
}
