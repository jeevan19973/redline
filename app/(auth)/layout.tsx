import Link from "next/link";
import { supabaseConfig } from "@/lib/env";
import { AccountsUnavailable } from "../_accounts-unavailable/notice";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // With no Supabase there is no account to sign in to or create.
  if (!supabaseConfig()) return <AccountsUnavailable />;

  return (
    <>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <Link className="wordmark" href="/" aria-label="Underline, home">
            Underline
          </Link>
        </div>
      </header>
      <main id="main" className="auth">
        {children}
      </main>
    </>
  );
}
