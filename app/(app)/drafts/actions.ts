"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  analyzeDraft,
  askDraft,
  checkQuestion,
  displayAnswer,
  displayReport,
  QUESTION_MAX_LENGTH,
  type Answer,
  type Report,
  type ShownAnswer,
  type StoredReport,
} from "@/lib/analysis/index.ts";
import { fitsInOneSave } from "@/lib/draft-limits";
import { showConfidence, supabaseConfig } from "@/lib/env";
import { openRouterClient } from "@/lib/model/openrouter.ts";
import { createClient } from "@/lib/supabase/server";
import { readAllowance, releaseUse, reserveUse } from "../allowance";
import { copy } from "../copy";
import { listRedLines } from "../red-lines/store";
import { isDraftId } from "./draft-id";
import { claimAnalysis, clearAnalysisClaim, readReport, reportStorageReady, saveReport } from "./report-store";

export type CreateDraftState = { error?: string };

// Stores a new Draft for the signed-in Signer and opens it. Takes the title
// and text as plain string arguments, not form data: a native form post
// rewrites a textarea's line breaks to CRLF, and the stored text must be
// exactly what was read or pasted, because every Source sentence is checked
// against it (ADR 0001). The text is never trimmed or normalized.
//
// The Draft's page then runs the analysis with runAnalysis, so the Signer
// sees it in progress there, against their Red lines as they stand then.
// Saving a Draft always leads to an analysis, so at the analysis limit
// (ADR 0007) nothing is stored: the Signer gets the plain refusal instead.
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

  const allowance = await readAllowance(supabase);
  if (!allowance) return { error: copy.addDraft.errors.unexpected };
  if (allowance.analysesLeft === 0) return { error: copy.limit.analysisReached(allowance.analysisLimit) };

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

export type DeleteDraftResult = { ok: true } | { ok: false; error: string };

// Deletes one of the signed-in Signer's Drafts by id. The query does not
// filter by owner and uses the Signer's own session, never a privileged key:
// row-level security matches no row for another Signer's Draft, which then
// reads as not found. The Draft's report goes with it (on delete cascade), so
// Underline keeps nothing of it.
//
// From the library the page re-renders without the row. From the Draft's own
// page (`then` is "library") it goes to the library with a confirmation line
// instead, since the Draft's page no longer exists.
export async function deleteDraft(draftId: unknown, then: unknown): Promise<DeleteDraftResult> {
  const errors = copy.deleteDraft.errors;
  if (!supabaseConfig()) redirect("/library");
  if (!isDraftId(draftId)) return { ok: false, error: errors.notFound };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/sign-in");

  const { data, error } = await supabase.from("drafts").delete().eq("id", draftId).select("id");
  if (error) {
    console.error("Could not delete a Draft", error.code, error.message);
    return { ok: false, error: errors.unexpected };
  }
  if (!data || data.length === 0) return { ok: false, error: errors.notFound };

  revalidatePath("/library");
  revalidatePath(`/drafts/${draftId}`);
  if (then === "library") redirect("/library?deleted=1");
  return { ok: true };
}

// `refusal` is a plain message for a run that was refused (the analysis
// limit, or reports that can't be stored), so the page shows it instead of
// offering to try again. `analyzing` means another run on this Draft is in
// progress, from another tab say, so this one made no model call and the
// page waits for that run instead.
export type RunAnalysisResult = { ok: true } | { ok: false; refusal?: string; analyzing?: true };

// "first" is the automatic analysis of a Draft with no report yet; "rerun"
// is the Signer's explicit "Run analysis again".
export type RunMode = "first" | "rerun";

// Analyzes a stored Draft and stores its Report, replacing any earlier one.
// Called from the Draft's page, both for the first analysis and for a re-run;
// either way it reads the text already stored, so nothing is sent again, and
// reads the Signer's current Red lines here on the server. The Report keeps
// a snapshot of them, so later changes to the list never rewrite it.
// Runs on the server, so the OpenRouter key never reaches the browser.
//
// A failure leaves any earlier Report in place. The page shows its own
// message, so the result only says whether it worked, or why it was refused.
//
// Only one run at a time per Draft reaches the model: the run claims the
// Draft first and clears the claim when it ends, success or failure. A
// "first" run only analyzes a Draft that still has no report. If one exists
// by the time it holds the claim (another tab finished first), the page is
// re-rendered with that report and no model call is made. If the report
// can't be read, it does not analyze either.
//
// Every analysis, first or re-run, counts against the Signer's one-time
// limit (ADR 0007). The use is reserved here, in one atomic step, after the
// claim and right before the model call, and handed back if the call fails
// before the model returns, so a failed call costs nothing and two requests
// at once cannot overrun the limit.
//
// The Report is stored with the secret key (report-store.ts). When that key
// is missing, nothing runs: no model call is made for a Report that could
// not be stored.
export async function runAnalysis(draftId: unknown, mode: unknown): Promise<RunAnalysisResult> {
  if (!supabaseConfig()) redirect("/drafts/new");
  if (!isDraftId(draftId) || (mode !== "first" && mode !== "rerun")) return { ok: false };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/sign-in");
  // The verified session's subject, never anything the request sent.
  const owner = auth.claims.sub;

  if (!reportStorageReady()) return { ok: false, refusal: copy.analysis.storageUnavailable };

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

  const claim = await claimAnalysis(supabase, draft.id);
  if (claim.kind === "held") return { ok: false, analyzing: true };
  if (claim.kind === "error") return { ok: false };
  try {
    return await analyzeClaimed(supabase, owner, draft, mode);
  } finally {
    await clearAnalysisClaim(draft.id, claim);
  }
}

// The part of runAnalysis that runs while it holds the Draft's claim.
async function analyzeClaimed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  owner: string,
  draft: { id: string; extracted_text: string },
  mode: RunMode,
): Promise<RunAnalysisResult> {
  if (mode === "first") {
    const existing = await readReport(supabase, draft.id);
    if (existing.kind === "error") return { ok: false };
    if (existing.kind === "found") {
      // Another run stored it first: show that one.
      refresh();
      return { ok: true };
    }
  }

  const allowance = await readAllowance(supabase);
  if (!allowance) return { ok: false };
  if (allowance.analysesLeft === 0) {
    return { ok: false, refusal: copy.limit.analysisReached(allowance.analysisLimit) };
  }

  // An analysis never runs as if the Signer had no Red lines when the list
  // could not be read.
  const redLines = await listRedLines(supabase);
  if (!redLines) return { ok: false };

  // The early check above gives the limit for the message; this is the guard.
  const reserved = await reserveUse(owner, "analysis");
  if (reserved === "limit") {
    return { ok: false, refusal: copy.limit.analysisReached(allowance.analysisLimit) };
  }
  if (reserved === "error") return { ok: false };

  let report: Report;
  try {
    report = await analyzeDraft(draft.extracted_text, redLines, openRouterClient());
  } catch (error) {
    console.error("Analysis failed", error instanceof Error ? error.message : error);
    await releaseUse(owner, "analysis");
    return { ok: false };
  }
  // The model has returned, so this analysis stays counted, even if saving
  // the Report fails below.

  // One current Report per Draft: a re-run replaces the row.
  if (!(await saveReport(supabase, draft.id, report))) {
    // The analysis still counted, so the rail's count changes.
    refresh();
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
          "Showed a Risk flag with no take-it-or-leave-it label or Counter-offer because its Non-negotiable basis failed verification",
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

export type AskResult = { answer: ShownAnswer } | { error: string };

// The plain message for a question refused before any model call, or null
// when the question can be asked.
function questionRefusal(question: unknown): string | null {
  const checked = checkQuestion(question);
  if (checked.ok) return null;
  const errors = copy.question.errors;
  return checked.problem === "empty" ? errors.empty : errors.tooLong(QUESTION_MAX_LENGTH);
}

// Runs askDraft and prepares the Answer for the browser. Why a fixed reply
// was given stays on the server, in the log.
async function answerFrom(text: string, question: string): Promise<AskResult> {
  let answer: Answer;
  try {
    answer = await askDraft(text, question, openRouterClient());
  } catch (error) {
    console.error("A question failed", error instanceof Error ? error.message : error);
    return { error: copy.question.errors.failed };
  }
  if (answer.kind === "doesNotSay" && answer.reason !== "noSupport") {
    console.error("Gave the fixed reply to a question", answer.reason);
  }
  return { answer: displayAnswer(answer) };
}

// Answers a question about a stored Draft from its stored text, which is
// loaded here by the Draft's id: the browser sends only the id and the
// question, never the text. Nothing about the question or the answer is
// stored. This is the one place a Signer's question reaches the model for a
// saved Draft, so a question is reserved against the limit (ADR 0007) here,
// in one atomic step, right before askDraft. An answered question stays
// counted, including the fixed "does not say" reply, since the model was
// asked, and one whose Source sentences took a regeneration call: it is
// still one question. A question that fails is handed back. Runs on the server, so the OpenRouter key never
// reaches the browser.
export async function askAboutDraft(draftId: unknown, question: unknown): Promise<AskResult> {
  if (!supabaseConfig()) redirect("/drafts/new");
  const refused = questionRefusal(question);
  if (refused) return { error: refused };
  if (!isDraftId(draftId)) return { error: copy.question.errors.failed };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) redirect("/sign-in");
  // The verified session's subject, never anything the request sent.
  const owner = auth.claims.sub;

  const allowance = await readAllowance(supabase);
  if (!allowance) return { error: copy.question.errors.failed };
  if (allowance.questionsLeft === 0) return { error: copy.limit.questionReached(allowance.questionLimit) };

  // Row-level security returns nothing for another Signer's Draft.
  const { data: draft, error } = await supabase
    .from("drafts")
    .select("extracted_text")
    .eq("id", draftId)
    .maybeSingle<{ extracted_text: string }>();
  if (error || !draft) {
    console.error("Could not load a Draft to ask about", error?.code, error?.message);
    return { error: copy.question.errors.failed };
  }

  // The early check above gives the limit for the message; this is the guard.
  const reserved = await reserveUse(owner, "question");
  if (reserved === "limit") return { error: copy.limit.questionReached(allowance.questionLimit) };
  if (reserved === "error") return { error: copy.question.errors.failed };

  const result = await answerFrom(draft.extracted_text, question as string);
  if ("answer" in result) {
    // Re-render the rail's count. The answer lives in the page's own state,
    // which a refresh keeps.
    refresh();
  } else {
    // askDraft failed before the model returned an answer.
    await releaseUse(owner, "question");
  }
  return result;
}

// Answers a question about text analyzed without an account. Only for a
// copy of Underline with no Supabase, where nothing is stored, so the text
// the report was made from comes from the browser; with accounts set up,
// questions are asked about a saved Draft by its id instead.
export async function askWithoutAccount(text: unknown, question: unknown): Promise<AskResult> {
  const errors = copy.question.errors;
  if (supabaseConfig()) return { error: errors.signIn };
  const refused = questionRefusal(question);
  if (refused) return { error: refused };
  if (typeof text !== "string" || !/\S/.test(text) || !fitsInOneSave(question as string, text)) {
    return { error: errors.failed };
  }
  return answerFrom(text, question as string);
}
