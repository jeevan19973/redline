import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { copy } from "../../copy";
import { draftDate } from "../draft-date";

type Draft = { id: string; title: string; extracted_text: string; created_at: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// One Draft by id, or null. The query does not filter by owner: row-level
// security returns nothing for another Signer's Draft, which then reads as
// not found.
const getDraft = cache(async (id: string): Promise<Draft | null> => {
  // The app layout shows the "accounts aren't set up" notice without Supabase.
  if (!supabaseConfig() || !UUID.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("drafts")
    .select("id, title, extracted_text, created_at")
    .eq("id", id)
    .maybeSingle<Draft>();
  if (error) console.error("Could not load a Draft", error.code, error.message);
  return data ?? null;
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const draft = await getDraft((await params).id);
  return draft ? { title: draft.title } : {};
}

export default async function DraftPage({ params }: Props) {
  if (!supabaseConfig()) return null;
  const draft = await getDraft((await params).id);
  if (!draft) notFound();

  return (
    <article className="pane" aria-labelledby="draft-title">
      <header className="pane__head">
        <h1 className="pane__title draft__title" id="draft-title">
          {draft.title}
        </h1>
        <p className="draft__meta">
          {copy.draft.added} <time dateTime={draft.created_at}>{draftDate(draft.created_at)}</time>
        </p>
      </header>
      <section className="draft__text" aria-labelledby="draft-text-title">
        <h2 className="draft__section-title" id="draft-text-title">
          {copy.draft.textTitle}
        </h2>
        <p className="draft__section-intro">{copy.draft.textIntro}</p>
        <div className="document">{draft.extracted_text}</div>
      </section>
    </article>
  );
}
