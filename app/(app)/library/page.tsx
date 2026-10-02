import type { Metadata } from "next";
import Link from "next/link";
import { supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AccountsUnavailable } from "../../_accounts-unavailable/notice";
import { copy } from "../copy";
import { draftDate } from "../drafts/draft-date";

export const metadata: Metadata = { title: copy.library.title };

type DraftRow = { id: string; title: string; created_at: string };

// The signed-in Signer's Drafts, newest first. Row-level security limits the
// rows to their own.
async function listDrafts(): Promise<DraftRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("id, title, created_at")
    .order("created_at", { ascending: false })
    .returns<DraftRow[]>();
  if (error) console.error("Could not list Drafts", error.code, error.message);
  return data ?? [];
}

export default async function LibraryPage() {
  // With no Supabase there are no accounts, so there is no library.
  if (!supabaseConfig()) return <AccountsUnavailable />;
  const drafts = await listDrafts();

  return (
    <section className="pane" aria-labelledby="library-title">
      <header className="pane__head">
        <h1 className="pane__title" id="library-title">
          {copy.library.title}
        </h1>
      </header>
      {drafts.length === 0 ? (
        <div className="empty">
          <p className="empty__title">{copy.library.emptyTitle}</p>
          <p className="empty__body">{copy.library.emptyBody}</p>
          <p>
            <Link className="link" href="/drafts/new">
              {copy.library.addDraft}
            </Link>
          </p>
        </div>
      ) : (
        <ul className="library" aria-label={copy.library.listLabel}>
          {drafts.map((draft) => (
            <li className="library__item" key={draft.id}>
              <Link className="library__link" href={`/drafts/${draft.id}`}>
                <span className="library__title">{draft.title}</span>
                <time className="library__date" dateTime={draft.created_at}>
                  {draftDate(draft.created_at)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
