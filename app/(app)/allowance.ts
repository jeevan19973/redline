import { allowanceFrom, isSignerLimitRow, type Allowance } from "@/lib/signer-limits";
import { createAdminClient } from "@/lib/supabase/admin";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// The signed-in Signer's one-time limit (ADR 0007). It is read with their
// own session, and row-level security returns only their own row. No client
// can change a count: the server reserves a use before each model call and
// hands it back if the call fails, through functions only the secret key can
// execute (20261002160000_reserve_uses.sql).

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

export type Use = "analysis" | "question";

// Takes one use from a Signer's limit before a model call, or says they are
// at it. One conditional update in the database, so two requests at once can
// never both take the last one. Uses the secret key, since no client may
// change a count. `owner` must come from the Signer's verified session
// claims, never from the request. "error" means no model call either: a
// count that cannot be reserved never lets a call through unlimited.
export async function reserveUse(owner: string, use: Use): Promise<"reserved" | "limit" | "error"> {
  const admin = createAdminClient();
  if (!admin) {
    console.error(`SUPABASE_SECRET_KEY is not set, so a Signer's ${use} can't be reserved and no model call runs. See .env.example.`);
    return "error";
  }
  const { data, error } = await admin.rpc(use === "analysis" ? "reserve_analysis" : "reserve_question", {
    p_owner: owner,
  });
  if (error || typeof data !== "boolean") {
    console.error(`Could not reserve a Signer's ${use}`, error?.code, error?.message ?? "no result");
    return "error";
  }
  return data ? "reserved" : "limit";
}

// Hands back a reserved use when the model call failed before the model
// returned, so a failed call costs nothing. A use whose model call returned
// is never handed back, even if saving its result fails. A failure here is
// logged: the Signer has lost one use.
export async function releaseUse(owner: string, use: Use): Promise<void> {
  const admin = createAdminClient();
  if (!admin) {
    console.error(`Could not hand back a Signer's ${use}: SUPABASE_SECRET_KEY is not set.`);
    return;
  }
  const { error } = await admin.rpc(use === "analysis" ? "release_analysis" : "release_question", {
    p_owner: owner,
  });
  if (error) console.error(`Could not hand back a Signer's ${use}`, error.code, error.message);
}
