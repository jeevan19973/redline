import type { Metadata } from "next";
import { CATALOG, type CatalogRedLine } from "@/lib/analysis/index.ts";
import { supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AccountsUnavailable } from "../../_accounts-unavailable/notice";
import { copy } from "../copy";
import { RedLinesEditor } from "./red-lines-editor";
import { listRedLines } from "./store";

export const metadata: Metadata = { title: copy.redLines.title };

const text = copy.redLines;

// The Signer's Red lines: their own, which they can add, edit and remove,
// then the default catalog every document is checked for, read-only.
export default async function RedLinesPage() {
  // With no Supabase there are no accounts, so there are no Red lines.
  if (!supabaseConfig()) return <AccountsUnavailable />;
  const supabase = await createClient();
  const redLines = await listRedLines(supabase);
  const catalogKind = (redLines ?? []).filter((redLine): redLine is CatalogRedLine => redLine.kind === "catalog");

  return (
    <section className="pane" aria-labelledby="red-lines-title">
      <header className="pane__head">
        <h1 className="pane__title" id="red-lines-title">
          {text.title}
        </h1>
        <p className="pane__intro">{text.intro}</p>
      </header>

      <div className="red-lines">
        <section className="red-lines__part" aria-labelledby="own-red-lines-title">
          <h2 className="draft__section-title" id="own-red-lines-title" tabIndex={-1}>
            {text.own.title}
          </h2>
          <p className="draft__section-intro">{text.own.intro}</p>
          {redLines === null ? (
            <p className="form-message" role="alert">
              {text.own.errors.unexpected}
            </p>
          ) : (
            <RedLinesEditor
              redLines={catalogKind.map(({ id, clauseType }) => ({ id, clauseType }))}
              headingId="own-red-lines-title"
            />
          )}
          <div className="red-lines__notes">
            <p>{text.own.floor}</p>
            <p>{text.own.reports}</p>
          </div>
        </section>

        {/* Ticket 09 adds the Signer's free-text Red lines as a section here. */}

        <section className="red-lines__part" aria-labelledby="catalog-title">
          <h2 className="draft__section-title" id="catalog-title">
            {text.catalog.title}
          </h2>
          <p className="draft__section-intro">{text.catalog.intro}</p>
          <table className="catalog">
            <thead>
              <tr>
                <th scope="col">{text.catalog.clauseType}</th>
                <th scope="col">{text.catalog.severity}</th>
              </tr>
            </thead>
            <tbody>
              {CATALOG.map((entry) => {
                const dangerous = entry.defaultSeverity === "Dangerous";
                return (
                  <tr key={entry.clauseType}>
                    <th scope="row">{entry.label}</th>
                    <td>
                      <span className={`sev ${dangerous ? "sev--dangerous" : "sev--caution"}`}>
                        {copy.report.severity[entry.defaultSeverity]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="draft__section-intro">{text.catalog.severityNote}</p>
        </section>
      </div>
    </section>
  );
}
