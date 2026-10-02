import Link from "next/link";
import { copy } from "./copy";

// The whole page shown in place of sign-in, sign-up and the signed-in app
// when Supabase is not configured: no account exists, so there is no session
// to show and nothing to sign in to.
export function AccountsUnavailable() {
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
        <section className="auth__panel notice" aria-labelledby="notice-title">
          <h1 className="auth__title" id="notice-title">
            {copy.title}
          </h1>
          <p className="notice__body">{copy.body}</p>
          <p className="notice__body">{copy.analyze.text}</p>
        </section>
      </main>
    </>
  );
}
