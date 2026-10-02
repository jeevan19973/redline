import type { Metadata } from "next";
import { copy } from "../copy";

export const metadata: Metadata = { title: copy.library.title };

export default function LibraryPage() {
  return (
    <section className="pane" aria-labelledby="library-title">
      <header className="pane__head">
        <h1 className="pane__title" id="library-title">
          {copy.library.title}
        </h1>
      </header>
      <div className="empty">
        <p className="empty__title">{copy.library.emptyTitle}</p>
        <p className="empty__body">{copy.library.emptyBody}</p>
      </div>
    </section>
  );
}
