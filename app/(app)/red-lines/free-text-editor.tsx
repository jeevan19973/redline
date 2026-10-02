"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { FREE_TEXT_MAX_LENGTH } from "@/lib/analysis/index.ts";
import { copy } from "../copy";
import { addFreeTextRedLine, editFreeTextRedLine, removeRedLine, type RedLineResult } from "./actions";
import { checkFreeText } from "./free-text";

const text = copy.redLines.freeText;
const unexpected = copy.redLines.own.errors.unexpected;

type FreeText = { id: string; text: string };

type Message = { kind: "status" | "error"; text: string } | null;

// Which field a refused entry came from ("add", or the id of the Red line
// being edited), so its error sits beside it.
type FieldError = { field: string; text: string } | null;

// The Signer's free-text Red lines: the list, each with Edit and Remove, and
// a short text field to add one. The entry is checked here before anything
// is sent, and again by the Server Action. As in RedLinesEditor, focus moves
// to the section heading after an edit or removal, and the outcome is
// announced in the status line.
export function FreeTextEditor({ redLines, headingId }: { redLines: FreeText[]; headingId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message>(null);
  const [fieldError, setFieldError] = useState<FieldError>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addValue, setAddValue] = useState("");
  // The Red line being saved or removed, so only its button says so.
  const [acting, setActing] = useState<string | null>(null);

  function run(
    change: () => Promise<RedLineResult>,
    success: string,
    field: string | null,
    id: string | null,
  ) {
    setActing(id);
    startTransition(async () => {
      try {
        const result = await change();
        if (!result.ok) {
          if (field) setFieldError({ field, text: result.error });
          else setMessage({ kind: "error", text: result.error });
          return;
        }
        setMessage({ kind: "status", text: success });
        setFieldError(null);
        setEditing(null);
        if (field === "add") setAddValue("");
        else document.getElementById(headingId)?.focus();
      } catch (error) {
        // A redirect (signed out, or no accounts) arrives as an error.
        unstable_rethrow(error);
        setMessage({ kind: "error", text: unexpected });
      }
    });
  }

  function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const checked = checkFreeText(addValue);
    if (!checked.ok) {
      setFieldError({ field: "add", text: checked.error });
      return;
    }
    run(() => addFreeTextRedLine(checked.text), text.added(checked.text), "add", null);
  }

  function save(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setMessage(null);
    const checked = checkFreeText(editValue);
    if (!checked.ok) {
      setFieldError({ field: id, text: checked.error });
      return;
    }
    run(() => editFreeTextRedLine(id, checked.text), text.changed(checked.text), id, id);
  }

  return (
    <div className="red-lines__own">
      <p className="analysis__status" role="status">
        {message?.kind === "status" ? message.text : ""}
      </p>
      {message?.kind === "error" && (
        <p className="form-message" role="alert">
          {message.text}
        </p>
      )}

      {redLines.length === 0 ? (
        <p className="flags__note">{text.empty}</p>
      ) : (
        <ul className="red-lines__list" aria-labelledby={headingId}>
          {redLines.map((redLine) => {
            const inputId = `edit-${redLine.id}`;
            const error = fieldError?.field === redLine.id ? fieldError.text : null;
            return (
              <li className="red-lines__item" key={redLine.id}>
                {editing === redLine.id ? (
                  <form className="red-lines__edit" onSubmit={(event) => save(event, redLine.id)} noValidate>
                    <div className="field">
                      <label htmlFor={inputId}>{text.editLabel}</label>
                      <p className="field__hint" id={`${inputId}-hint`}>
                        {text.hint(FREE_TEXT_MAX_LENGTH)}
                      </p>
                      <input
                        id={inputId}
                        type="text"
                        value={editValue}
                        onChange={(event) => setEditValue(event.target.value)}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={`${inputId}-hint${error ? ` ${inputId}-error` : ""}`}
                        autoComplete="off"
                        autoFocus
                      />
                      {error && (
                        <p className="form-message" id={`${inputId}-error`} role="alert">
                          {error}
                        </p>
                      )}
                    </div>
                    <div className="red-lines__buttons">
                      <button className="button-secondary" type="submit" disabled={pending}>
                        {pending && acting === redLine.id ? text.saving : text.save}
                      </button>
                      <button
                        className="button-secondary"
                        type="button"
                        onClick={() => {
                          setEditing(null);
                          setFieldError(null);
                          document.getElementById(headingId)?.focus();
                        }}
                      >
                        {text.cancel}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <span className="red-lines__label red-lines__label--words" id={`label-${redLine.id}`}>
                      {redLine.text}
                    </span>
                    <div className="red-lines__buttons">
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={pending}
                        aria-describedby={`label-${redLine.id}`}
                        onClick={() => {
                          setMessage(null);
                          setFieldError(null);
                          setEditValue(redLine.text);
                          setEditing(redLine.id);
                        }}
                      >
                        {text.edit}
                      </button>
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={pending}
                        aria-describedby={`label-${redLine.id}`}
                        onClick={() => {
                          setMessage(null);
                          run(() => removeRedLine(redLine.id), text.removed(redLine.text), null, redLine.id);
                        }}
                      >
                        {pending && acting === redLine.id ? text.removing : text.remove}
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <form className="red-lines__add" onSubmit={add} noValidate>
        <div className="field">
          <label htmlFor="add-free-text">{text.addLabel}</label>
          <p className="field__hint" id="add-free-text-hint">
            {text.hint(FREE_TEXT_MAX_LENGTH)}
          </p>
          <input
            id="add-free-text"
            type="text"
            value={addValue}
            onChange={(event) => setAddValue(event.target.value)}
            aria-invalid={fieldError?.field === "add" ? true : undefined}
            aria-describedby={`add-free-text-hint${fieldError?.field === "add" ? " add-free-text-error" : ""}`}
            autoComplete="off"
          />
        </div>
        <button className="action" type="submit" disabled={pending}>
          {pending && acting === null ? text.adding : text.add}
        </button>
        {fieldError?.field === "add" && (
          <p className="form-message red-lines__field-error" id="add-free-text-error" role="alert">
            {fieldError.text}
          </p>
        )}
      </form>
    </div>
  );
}
