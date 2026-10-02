import type { Report } from "@/lib/analysis/index.ts";
import { createAdminClient } from "@/lib/supabase/admin";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// The one way the app reads or writes a Draft's Report. No client may touch
// the reports table (20261002150000_reports_server_only.sql), so a Signer can
// neither forge a Report nor read the fields kept from them, such as
// citationFailures. Every read and write here goes through the secret-key
// client, and only after the Signer's own session, under row-level security,
// has shown that they own the Draft. The check and the access sit together
// so that no caller can skip the check.

const MISSING_KEY =
  "SUPABASE_SECRET_KEY is not set, so reports can't be read or stored and no analysis runs. Set it in the app server's environment (never with a NEXT_PUBLIC_ prefix). See .env.example.";

// The secret-key client, or null (logged) when the key is missing, so report
// storage fails closed.
function adminClient() {
  const admin = createAdminClient();
  if (!admin) console.error(MISSING_KEY);
  return admin;
}

// Whether reports can be stored at all. runAnalysis checks this before any
// model call, so an analysis whose Report could not be saved never runs.
export function reportStorageReady(): boolean {
  return adminClient() !== null;
}

// Whether the signed-in Signer owns this Draft, asked with their own session:
// row-level security returns no row for another Signer's Draft.
async function ownsDraft(supabase: Supabase, draftId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("drafts")
    .select("id")
    .eq("id", draftId)
    .maybeSingle<{ id: string }>();
  if (error) console.error("Could not check who owns a Draft", error.code, error.message);
  return !error && data !== null;
}

// The stored Report's JSON, not yet checked as a Report: "none" when the
// Draft has no report, "error" when it could not be read, or the Signer does
// not own the Draft.
export type ReportRead = { kind: "none" } | { kind: "found"; report: unknown } | { kind: "error" };

export async function readReport(supabase: Supabase, draftId: string): Promise<ReportRead> {
  const admin = adminClient();
  if (!admin || !(await ownsDraft(supabase, draftId))) return { kind: "error" };
  const { data, error } = await admin
    .from("reports")
    .select("report")
    .eq("draft_id", draftId)
    .maybeSingle<{ report: unknown }>();
  if (error) {
    console.error("Could not load a Report", error.code, error.message);
    return { kind: "error" };
  }
  return data ? { kind: "found", report: data.report } : { kind: "none" };
}

// Stores the Report as the Draft's current one, replacing any earlier one.
// Returns whether it was stored.
export async function saveReport(supabase: Supabase, draftId: string, report: Report): Promise<boolean> {
  const admin = adminClient();
  if (!admin || !(await ownsDraft(supabase, draftId))) return false;
  const { error } = await admin.from("reports").upsert(
    {
      draft_id: draftId,
      report,
      model_id: report.modelId,
      created_at: report.createdAt,
    },
    { onConflict: "draft_id" },
  );
  if (error) console.error("Could not save a Report", error.code, error.message);
  return !error;
}
