"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { analyzeDraft, displayReport, type Report, type StoredReport } from "@/lib/analysis/index.ts";
import { fitsInOneSave } from "@/lib/draft-limits";
import { showConfidence, supabaseConfig } from "@/lib/env";
import { openRouterClient } from "@/lib/model/openrouter.ts";
import { createClient } from "@/lib/supabase/server";
import { copy } from "../copy";
import { listRedLines } from "../red-lines/store";
import { isDraftId } from "./draft-id";

export type CreateDraftState = { error?: string };

// Stores a new Draft for the signed-in Signer and opens it. Takes the title
// and text as plain string arguments, not form data: a native form post
// rewrites a textarea's line breaks to CRLF, and the stored text must be
// exactly what was read or pasted, because every Source sentence is checked
// against it (ADR 0001). The text is never trimmed or normalized.
//
// The Draft's page then runs the analysis with runAnalysis, so the Signer
// sees it in progress there, against their Red lines as they stand then.
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

export type RunAnalysisResult = { ok: boolean };

// Analyzes a stored Draft and stores its Report, replacing any earlier one.
// Called from the Draft's page, both for the first analysis and for a re-run;
// either way it reads the text already stored, so nothing is sent again, and
// reads the Signer's current Red lines here on the server. The Report keeps
// a snapshot of them, so later changes to the list never rewrite it.
// Runs on the server, so the OpenRouter key never reaches the browser.
//
// A failure leaves any earlier Report in place. The page shows its own
// message, so the result only says whether it worked.
export async function runAnalysis(draftId: unknown): Promise<RunAnalysisResult> {
  if (!supabaseConfig()) redirect("/drafts/new");
  if (!isDraftId(draftId)) return { ok: false };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/sign-in");

  // Row-level security returns nothing for another Signer's Draft.
  const { data: draft, error: loadError } = await supabase
    .from("drafts")
    .select("id, extracted_text")
    .eq("id", draftId)
    .maybeSingle<{ id: string; extracted_text: string }>();
  if (loadError || !draft) {
    console.error("Could not load a Draft to analyze", loadError?.code, loadError?.message);
    return { ok: false };
  }

  // An analysis never runs as if the Signer had no Red lines when the list
  // could not be read.
  const redLines = await listRedLines(supabase);
  if (!redLines) return { ok: false };

  let report: Report;
  try {
    report = await analyzeDraft(draft.extracted_text, redLines, openRouterClient());
  } catch (error) {
    console.error("Analysis failed", error instanceof Error ? error.message : error);
    return { ok: false };
  }

  // One current Report per Draft: a re-run replaces the row.
  const { error: saveError } = await supabase.from("reports").upsert(
    {
      draft_id: draft.id,
      report,
      model_id: report.modelId,
      created_at: report.createdAt,
    },
    { onConflict: "draft_id" },
  );
  if (saveError) {
    console.error("Could not save a Report", saveError.code, saveError.message);
    return { ok: false };
  }

  // Re-render the Draft's page, which now reads the stored Report.
  refresh();
  return { ok: true };
}

export type AnalyzeWithoutAccountResult = { report: StoredReport } | { error: string };

// Analyzes pasted text and returns the Report without storing anything. Only
// for a copy of Underline with no Supabase, where no account exists, so
// there are no Red lines either; with accounts set up, analysis needs a
// signed-in Signer and a saved Draft.
export async function analyzeWithoutAccount(text: unknown): Promise<AnalyzeWithoutAccountResult> {
  const errors = copy.analyze.errors;
  if (supabaseConfig()) return { error: errors.signIn };
  if (typeof text !== "string") return { error: errors.failed };
  if (!/\S/.test(text)) return { error: errors.emptyText };
  if (!fitsInOneSave("", text)) return { error: errors.tooLarge };

  try {
    const report = await analyzeDraft(text, [], openRouterClient());
    // Citation failures and Counter-offer gaps stay on the server: they are
    // never shown to the Signer.
    for (const failure of report.citationFailures) {
      if ("flag" in failure) {
        console.error("Withheld a Risk flag whose Source sentences failed verification", failure.flag.clauseType);
      } else if ("nonNegotiableBasis" in failure) {
        console.error(
          "Showed a Risk flag as negotiable because its Non-negotiable basis failed verification",
          failure.nonNegotiableBasis.flag.clauseType,
        );
      } else {
        console.error("Withheld the guaranty gap, whose Source sentence failed verification");
      }
    }
    for (const gap of report.counterOfferGaps) {
      console.error("Showed a negotiable Risk flag with no Counter-offer", gap.flag.clauseType);
    }
    return { report: displayReport(report, { showConfidence: showConfidence() }) };
  } catch (error) {
    console.error("Analysis failed", error instanceof Error ? error.message : error);
    return { error: errors.failed };
  }
}
