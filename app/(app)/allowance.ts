import { allowanceFrom, isSignerLimitRow, type Allowance } from "@/lib/signer-limits";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// The signed-in Signer's one-time limit (ADR 0007), read and spent with
// their own session. Row-level security returns only their own row, and they
// can never write it: the counts move only through record_analysis() and
// record_question(), which can only add one to the caller's own count.

// What the signed-in Signer has left, or null when it cannot be read. Every
// caller treats null as "no model call", so a missing table or row never
// lets an analysis or question through unlimited.
export async function readAllowance(supabase: Supabase): Promise<Allowance | null> {
  const { data, error } = await supabase
    .from("signer_limits")
    .select("analyses_used, questions_used, analysis_limit, question_limit")
    .maybeSingle();
  if (error || !isSignerLimitRow(data)) {
    console.error("Could not read a Signer's limit", error?.code, error?.message ?? "no row");
    return null;
  }
  return allowanceFrom(data);
}

// Counts one completed analysis or answered question. Called only after the
// model has returned, so a call that fails before then is never counted.
//
// The check before the model call and this record are two steps, so two
// requests sent at the same moment can both pass the check and both reach
// the model, overrunning the limit by one. That is accepted: closing the gap
// needs a reservation that is handed back when the model fails, and handing
// one back means either a client-callable function that lowers a count or
// the secret key in the app. The stored count itself never passes the
// limit, since the function refuses once it is there.
//
// A failure here is logged, not shown: the model call has already been made
// and its result is the Signer's.
export async function recordUse(supabase: Supabase, use: "analysis" | "question"): Promise<void> {
  const { error } = await supabase.rpc(use === "analysis" ? "record_analysis" : "record_question");
  if (error) console.error(`Could not record a Signer's ${use}`, error.code, error.message);
}
