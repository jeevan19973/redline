"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { copy } from "../copy";
import { DeleteDraft } from "../drafts/delete-draft";
import { DraftDate } from "../drafts/draft-date-view";

export type LibraryDraft = { id: string; title: string; createdAt: string };

// The Signer's Drafts, newest first, each with a way to open it and to
// delete it. After a deletion here the row is gone, so focus moves to the
// page heading and the status line says what was deleted. `justDeleted` is
// set when the Signer arrives from deleting a Draft on its own page.
export function LibraryList({
  drafts,
  headingId,
  justDeleted,
}: {
  drafts: LibraryDraft[];
  headingId: string;
  justDeleted: boolean;
}) {
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!justDeleted) return;
    // Set after the first paint so it is announced, and dropped from the
    // address so a reload does not say it again.
    setStatus(copy.deleteDraft.deletedOne);
    window.history.replaceState(null, "", "/library");
  }, [justDeleted]);

  function deleted(title: string) {
    setStatus(copy.deleteDraft.deleted(title));
    document.getElementById(headingId)?.focus();
  }

  return (
    <>
      <p className="analysis__status library__status" role="status">
        {status}
      </p>
      {drafts.length === 0 ? (
        <div className="empty">
          <p className="empty__title">{copy.library.emptyTitle}</p>
          <p className="empty__body">{copy.library.emptyBody}</p>
          <p>
            <Link className="link" href="/drafts/new">
              {copy.library.addDraft}
            </Link>
          </p>
        </div>
      ) : (
        <ul className="library" aria-label={copy.library.listLabel}>
          {drafts.map((draft) => {
            const titleId = `draft-title-${draft.id}`;
            return (
              <li className="library__item" key={draft.id}>
                <Link className="library__link" href={`/drafts/${draft.id}`}>
                  <span className="library__title" id={titleId}>
                    {draft.title}
                  </span>
                  <DraftDate className="library__date" dateTime={draft.createdAt} />
                </Link>
                <DeleteDraft
                  draftId={draft.id}
                  title={draft.title}
                  from="library"
                  describedBy={titleId}
                  onDeleted={deleted}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
