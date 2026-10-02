import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig, supabaseSecretKey } from "@/lib/env";

// A Supabase client acting with the secret key (service_role), which bypasses
// row-level security. Server-only: never import it from a client component.
// It exists for the tables no client may touch, such as reports, and only
// app/(app)/drafts/report-store.ts uses it, after confirming through the
// Signer's own session that they own the Draft.
//
// Returns null when Supabase is not configured or the secret key is not set,
// so a caller can fail closed instead of throwing.
export function createAdminClient(): SupabaseClient | null {
  const config = supabaseConfig();
  const secretKey = supabaseSecretKey();
  if (!config || !secretKey) return null;
  return createClient(config.url, secretKey, {
    // Never a Signer's session: no cookies, nothing stored, nothing refreshed.
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
