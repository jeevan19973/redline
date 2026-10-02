import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "../_not-found/copy";

export const metadata: Metadata = { title: copy.title };

// Shown inside the app shell when a page calls notFound(), such as a deleted
// Draft's old link or another Signer's Draft.
export default function AppNotFound() {
  return (
    <section className="pane" aria-labelledby="not-found-title">
      <header className="pane__head">
        <h1 className="pane__title" id="not-found-title">
          {copy.title}
        </h1>
        <p className="pane__intro">{copy.inApp.body}</p>
      </header>
      <p className="not-found__link">
        <Link className="link" href="/library">
          {copy.inApp.link}
        </Link>
      </p>
    </section>
  );
}
