import type { Metadata } from "next";
import { supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AccountsUnavailable } from "../../_accounts-unavailable/notice";
import { copy } from "../copy";
import { draftDate } from "../drafts/draft-date";
import { LibraryList, type LibraryDraft } from "./library-list";

export const metadata: Metadata = { title: copy.library.title };

type DraftRow = { id: string; title: string; created_at: string };

// The signed-in Signer's Drafts, newest first. Row-level security limits the
// rows to their own.
async function listDrafts(): Promise<LibraryDraft[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .returns<DraftRow[]>();
  if (error) console.error("Could not list Drafts", error.code, error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    // Formatted here so the server and the browser show the same date.
    date: draftDate(row.created_at),
  }));
}

type Props = { searchParams: Promise<{ deleted?: string | string[] }> };

export default async function LibraryPage({ searchParams }: Props) {
  // With no Supabase there are no accounts, so there is no library.
  if (!supabaseConfig()) return <AccountsUnavailable />;
  const drafts = await listDrafts();
  // Set by deleteDraft after a deletion from the Draft's own page.
  const justDeleted = (await searchParams).deleted === "1";

  return (
    <section className="pane" aria-labelledby="library-title">
      <header className="pane__head">
        <h1 className="pane__title" id="library-title" tabIndex={-1}>
          {copy.library.title}
        </h1>
      </header>
      <LibraryList drafts={drafts} headingId="library-title" justDeleted={justDeleted} />
    </section>
  );
}
