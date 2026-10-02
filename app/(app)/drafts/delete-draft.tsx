"use client";

import { useId, useRef, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { copy } from "../copy";
import { deleteDraft } from "./actions";

const text = copy.deleteDraft;

// A Delete button and the in-page dialog that confirms it. The dialog is a
// native <dialog> opened with showModal(), so the rest of the page is inert,
// Escape cancels, and closing returns focus to the button. It names the
// Draft and says what goes with it before anything is deleted.
//
// From the library (`from` is "library") the page re-renders without the
// row and `onDeleted` reports the outcome; from the Draft's page the action
// goes to the library instead.
export function DeleteDraft({
  draftId,
  title,
  from,
  describedBy,
  onDeleted,
}: {
  draftId: string;
  title: string;
  from: "library" | "draft";
  // The id of the element naming the Draft, so the button reads as
  // "Delete" plus the Draft's title.
  describedBy: string;
  onDeleted?: (title: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  // Set once the Draft is gone, when the button it would return focus to is
  // about to go too.
  const deleted = useRef(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const headingId = useId();
  const bodyId = useId();

  function open() {
    setError(null);
    dialogRef.current?.showModal();
    // Cancel takes focus first, so Enter on arrival never deletes.
    cancelRef.current?.focus();
  }

  function cancel() {
    if (!pending) dialogRef.current?.close();
  }

  function confirm() {
    if (pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteDraft(draftId, from === "draft" ? "library" : "stay");
        if (!result.ok) {
          setError(result.error);
          return;
        }
        deleted.current = true;
        dialogRef.current?.close();
        onDeleted?.(title);
      } catch (caught) {
        // The redirect to the library (or to sign in) arrives as an error.
        unstable_rethrow(caught);
        setError(text.errors.unexpected);
      }
    });
  }

  return (
    <>
      <button
        ref={triggerRef}
        className="button-secondary"
        type="button"
        aria-haspopup="dialog"
        aria-describedby={describedBy}
        onClick={open}
      >
        {text.trigger}
      </button>
      <dialog
        ref={dialogRef}
        className="confirm"
        aria-labelledby={headingId}
        aria-describedby={bodyId}
        // Escape cancels, except while the deletion is under way.
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
        onClose={() => {
          if (!deleted.current) triggerRef.current?.focus();
        }}
      >
        <h2 className="confirm__title" id={headingId}>
          {text.title(title)}
        </h2>
        <p className="confirm__body" id={bodyId}>
          {text.body}
        </p>
        {error && (
          <p className="form-message" role="alert">
            {error}
          </p>
        )}
        <div className="confirm__buttons">
          <button className="button-ink" type="button" onClick={confirm} aria-disabled={pending || undefined}>
            {pending ? text.pending : text.confirm}
          </button>
          <button
            ref={cancelRef}
            className="button-secondary"
            type="button"
            onClick={cancel}
            aria-disabled={pending || undefined}
          >
            {text.cancel}
          </button>
        </div>
      </dialog>
    </>
  );
}
