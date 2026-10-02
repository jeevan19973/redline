import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { readStoredReport, type StoredReport } from "@/lib/analysis/index.ts";
import { showConfidence, supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AccountsUnavailable } from "../../../_accounts-unavailable/notice";
import { copy as notFoundCopy } from "../../../_not-found/copy";
import { copy } from "../../copy";
import { askAboutDraft } from "../actions";
import { DeleteDraft } from "../delete-draft";
import { draftDate } from "../draft-date";
import { isDraftId } from "../draft-id";
import { DraftReading } from "../draft-reading";
import { readReport } from "../report-store";
import { AnalysisRunner } from "./analysis-runner";

type Draft = { id: string; title: string; extracted_text: string; created_at: string };

// The Draft's stored Report: none yet, one that reads back cleanly, or a row
// whose JSON is not a well-formed Report.
type StoredState = { kind: "none" } | { kind: "report"; report: StoredReport } | { kind: "unreadable" };

// One Draft by id, or null. The query does not filter by owner: row-level
// security returns nothing for another Signer's Draft, which then reads as
// not found.
const getDraft = cache(async (id: string): Promise<Draft | null> => {
  if (!supabaseConfig() || !isDraftId(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("id, title, extracted_text, created_at")
    .eq("id", id)
    .maybeSingle<Draft>();
  if (error) console.error("Could not load a Draft", error.code, error.message);
  return data ?? null;
});

// The Draft's current Report, read only for the Draft's owner (report-store.ts).
async function getReport(draftId: string): Promise<StoredState> {
  const read = await readReport(await createClient(), draftId);
  if (read.kind !== "found") return { kind: "none" };
  const report = readStoredReport(read.report, { showConfidence: showConfidence() });
  return report ? { kind: "report", report } : { kind: "unreadable" };
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const draft = await getDraft((await params).id);
  return { title: draft ? draft.title : notFoundCopy.title };
}

export default async function DraftPage({ params }: Props) {
  // With no Supabase there are no accounts, so there are no saved Drafts.
  if (!supabaseConfig()) return <AccountsUnavailable />;
  const draft = await getDraft((await params).id);
  if (!draft) notFound();
  const stored = await getReport(draft.id);

  return (
    <article className="pane pane--reading" aria-labelledby="draft-title">
      <header className="pane__head">
        <h1 className="pane__title draft__title" id="draft-title">
          {draft.title}
        </h1>
        <div className="draft__bar">
          <p className="draft__meta">
            {copy.draft.added} <time dateTime={draft.created_at}>{draftDate(draft.created_at)}</time>
          </p>
          <DeleteDraft draftId={draft.id} title={draft.title} from="draft" describedBy="draft-title" />
        </div>
      </header>

      <DraftReading
        documentText={draft.extracted_text}
        textTitle={copy.draft.textTitle}
        textIntro={copy.draft.textIntro}
        report={stored.kind === "report" ? stored.report : null}
        actions={<AnalysisRunner draftId={draft.id} mode="rerun" />}
        showRedLines
        // Only the Draft's id is bound: the action loads the stored text.
        ask={askAboutDraft.bind(null, draft.id)}
        pending={<AnalysisRunner draftId={draft.id} mode={stored.kind === "none" ? "first" : "unreadable"} />}
      />
    </article>
  );
}
