"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { copy } from "../copy";

export type CreateDraftState = { error?: string };

// Stores a new Draft for the signed-in Signer and opens it. Takes the title
// and text as plain string arguments, not form data: a native form post
// rewrites a textarea's line breaks to CRLF, and the stored text must be
// exactly what was read or pasted, because every Source sentence is checked
// against it (ADR 0001). The text is never trimmed or normalized.
//
// Ticket 03 adds the analysis to this step.
export async function createDraft(title: unknown, text: unknown): Promise<CreateDraftState> {
  // With no Supabase there is no account to save to; the page says so.
  if (!supabaseConfig()) redirect("/drafts/new");

  // A Server Action can be called with anything, so check what arrived.
  if (typeof title !== "string" || typeof text !== "string") {
    return { error: copy.addDraft.errors.unexpected };
  }
  const name = title.trim();
  if (!name) return { error: copy.addDraft.errors.missingTitle };
  if (!/\S/.test(text)) return { error: copy.addDraft.errors.emptyText };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/sign-in");

  // The owner defaults to auth.uid(), and row-level security refuses any
  // other owner.
  const { data, error } = await supabase
    .from("drafts")
    .insert({ title: name, extracted_text: text })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) {
    console.error("Could not save a Draft", error?.code, error?.message);
    return { error: copy.addDraft.errors.unexpected };
  }

  revalidatePath("/library");
  redirect(`/drafts/${data.id}`);
}
