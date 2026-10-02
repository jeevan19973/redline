import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseConfig } from "@/lib/env";

// A Supabase client for Server Components, Server Actions and Route Handlers,
// acting as the signed-in Signer through their auth cookies. Throws when
// Supabase is not configured: check supabaseConfig() first on any page that
// should still render without it.
export async function createClient() {
  const { url, key } = requireSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot set cookies. The proxy refreshes the
          // session on every request, so this is safe to ignore.
        }
      },
    },
  });
}
