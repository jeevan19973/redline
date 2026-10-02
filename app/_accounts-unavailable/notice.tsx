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
          {/* A plain anchor: the landing page has its own stylesheet, so going
              there is a full page load rather than a client-side navigation. */}
          <a className="wordmark" href="/" aria-label="Underline, home">
            Underline
          </a>
        </div>
      </header>
      <main id="main" className="auth">
        <section className="auth__panel notice" aria-labelledby="notice-title">
          <h1 className="auth__title" id="notice-title">
            {copy.title}
          </h1>
          <p className="notice__body">{copy.body}</p>
          <p className="notice__body">{copy.analyze.text}</p>
          <p>
            <Link className="link" href="/drafts/new">
              {copy.analyze.link}
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
