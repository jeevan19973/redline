import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/env";

// Pages a signed-out visitor may open. Everything else needs a session.
const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up"];
// Pages a signed-in Signer has no reason to see.
const SIGNED_OUT_ONLY_PATHS = ["/sign-in", "/sign-up"];

// Refreshes the Signer's session cookies on every request and keeps
// signed-out visitors away from signed-in pages.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not run code between createServerClient and getClaims: a session
  // that is not refreshed here can sign the Signer out at random.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  if (!signedIn && !PUBLIC_PATHS.includes(pathname)) {
    return redirectKeepingCookies(request, response, "/sign-in");
  }
  if (signedIn && SIGNED_OUT_ONLY_PATHS.includes(pathname)) {
    return redirectKeepingCookies(request, response, "/library");
  }

  return response;
}

// A redirect that carries over any session cookies the refresh just set.
function redirectKeepingCookies(request: NextRequest, from: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
