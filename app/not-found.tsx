import type { Metadata } from "next";
import { copy } from "./_not-found/copy";
import "./globals.css";

export const metadata: Metadata = { title: copy.title };

// Shown for any address Underline has no page for. The root layout loads no
// styles (the landing page brings its own), so this page loads the app's.
export default function NotFound() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <div className="wrap topbar__inner">
          <a className="wordmark" href="/" aria-label="Underline, home">
            Underline
          </a>
        </div>
      </header>
      <main id="main" className="auth">
        <section className="auth__panel notice" aria-labelledby="not-found-title">
          <h1 className="auth__title" id="not-found-title">
            {copy.title}
          </h1>
          <p className="notice__body">{copy.unknown.body}</p>
          <p>
            <a className="link" href="/">
              {copy.unknown.link}
            </a>
          </p>
        </section>
      </main>
    </>
  );
}
