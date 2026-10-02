export type SupabaseConfig = { url: string; key: string };

// The Supabase URL and key, or null when this copy of Underline has no
// Supabase configured. Without it there are no accounts, but the app still
// starts and pasted text can still be analyzed, so nothing that runs on every
// request may throw here.
//
// NEXT_PUBLIC_ variables are inlined at build time, so each is read by its
// literal name. The anon key comes first; the publishable key is its fallback.
export function supabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

// The Supabase config for code that cannot run without it, failing loudly
// when it is missing. Callers check supabaseConfig() first wherever an
// unconfigured copy should still render.
export function requireSupabaseConfig(): SupabaseConfig {
  const config = supabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY). See .env.example.",
    );
  }
  return config;
}

// Whether Signers see each Risk flag's Confidence (ADR 0004). Off unless
// UNDERLINE_SHOW_CONFIDENCE is exactly "true": the labels stay hidden until
// the calibration eval passes. Server-only and read at request time, so it
// is never inlined into the browser bundle; this is the one place it is read.
export function showConfidence(): boolean {
  return process.env.UNDERLINE_SHOW_CONFIDENCE === "true";
}
