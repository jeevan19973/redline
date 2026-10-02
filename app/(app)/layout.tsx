import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AccountsUnavailable } from "../_accounts-unavailable/notice";
import { signOut } from "../(auth)/actions";
import { copy } from "./copy";
import { RailLink } from "./rail-link";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // With no Supabase there are no accounts, so no Signer is ever signed in
  // here. Say so instead of sending them to a sign-in that cannot work.
  if (!supabaseConfig()) return <AccountsUnavailable />;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // The proxy already sends signed-out visitors to sign in; this guards the
  // layout if the proxy's matcher ever misses a path.
  if (!data?.claims) redirect("/sign-in");
  const email = typeof data.claims.email === "string" ? data.claims.email : undefined;

  return (
    <div className="shell">
      <nav className="rail water" aria-label={copy.rail.label}>
        <Link className="wordmark wordmark--water" href="/library" aria-label="Underline, library">
          Underline
        </Link>
        <ul className="rail__list">
          <li>
            <RailLink href="/library">{copy.rail.library}</RailLink>
          </li>
          <li>
            <RailLink href="/drafts/new">{copy.rail.addDraft}</RailLink>
          </li>
        </ul>
        <div className="rail__foot">
          {email && (
            <p className="rail__who">
              <span className="rail__who-label">{copy.rail.signedInAs}</span>
              <span className="rail__who-email">{email}</span>
            </p>
          )}
          <form action={signOut}>
            <button className="rail__signout" type="submit">
              {copy.rail.signOut}
            </button>
          </form>
        </div>
      </nav>
      <main id="main" className="shell__main">
        {children}
      </main>
    </div>
  );
}
