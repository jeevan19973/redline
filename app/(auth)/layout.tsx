import { supabaseConfig } from "@/lib/env";
import { AccountsUnavailable } from "../_accounts-unavailable/notice";
import "../globals.css";
import { SkipLink } from "../skip-link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // With no Supabase there is no account to sign in to or create.
  if (!supabaseConfig()) {
    return (
      <>
        <SkipLink />
        <AccountsUnavailable />
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <header className="topbar">
        <div className="wrap topbar__inner">
          {/* A plain anchor: the landing page has its own stylesheet, so going
              there is a full page load rather than a client-side navigation. */}
          <a className="wordmark" href="/" aria-label="Underline, home">
            Underline
          </a>
        </div>
      </header>
      <main id="main" className="auth">
        {children}
      </main>
    </>
  );
}
