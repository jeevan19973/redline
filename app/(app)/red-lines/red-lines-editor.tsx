"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { CATALOG, clauseTypeLabel, type ClauseType } from "@/lib/analysis/index.ts";
import { copy } from "../copy";
import { addRedLine, editRedLine, removeRedLine, type RedLineResult } from "./actions";

const text = copy.redLines.own;

type OwnRedLine = { id: string; clauseType: ClauseType };

type Message = { kind: "status" | "error"; text: string } | null;

// The Signer's catalog Red lines: the list, each with Edit and Remove, and a
// way to add one. Each change goes to a Server Action, which re-renders the
// page with the stored list. After an edit or removal the control that was
// used is gone, so focus moves to the section heading and the outcome is
// announced in the status line.
export function RedLinesEditor({ redLines, headingId }: { redLines: OwnRedLine[]; headingId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<Message>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<ClauseType | "">("");
  // The Red line being saved or removed, so only its button says so.
  const [acting, setActing] = useState<string | null>(null);

  const used = new Set(redLines.map((redLine) => redLine.clauseType));
  const available = CATALOG.filter((entry) => !used.has(entry.clauseType));
  const [addValue, setAddValue] = useState<ClauseType | "">("");
  // The chosen type, or the first still free when it was just used.
  const toAdd = addValue && !used.has(addValue) ? addValue : (available[0]?.clauseType ?? "");

  function run(change: () => Promise<RedLineResult>, success: string, moveFocus: boolean, id: string | null) {
    setActing(id);
    startTransition(async () => {
      try {
        const result = await change();
        if (!result.ok) {
          setMessage({ kind: "error", text: result.error });
          return;
        }
        setMessage({ kind: "status", text: success });
        setEditing(null);
        setAddValue("");
        if (moveFocus) document.getElementById(headingId)?.focus();
      } catch (error) {
        // A redirect (signed out, or no accounts) arrives as an error.
        unstable_rethrow(error);
        setMessage({ kind: "error", text: text.errors.unexpected });
      }
    });
  }

  function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!toAdd) return;
    run(() => addRedLine(toAdd), text.added(clauseTypeLabel(toAdd)), false, null);
  }

  function save(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (!editValue) return;
    run(() => editRedLine(id, editValue), text.changed(clauseTypeLabel(editValue)), true, id);
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
            const label = clauseTypeLabel(redLine.clauseType);
            const selectId = `edit-${redLine.id}`;
            return (
              <li className="red-lines__item" key={redLine.id}>
                {editing === redLine.id ? (
                  <form className="red-lines__edit" onSubmit={(event) => save(event, redLine.id)}>
                    <div className="field">
                      <label htmlFor={selectId}>{text.clauseType}</label>
                      <select
                        id={selectId}
                        value={editValue}
                        onChange={(event) => setEditValue(event.target.value as ClauseType)}
                        autoFocus
                      >
                        {CATALOG.filter(
                          (entry) => entry.clauseType === redLine.clauseType || !used.has(entry.clauseType),
                        ).map((entry) => (
                          <option key={entry.clauseType} value={entry.clauseType}>
                            {entry.label}
                          </option>
                        ))}
                      </select>
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
                          document.getElementById(headingId)?.focus();
                        }}
                      >
                        {text.cancel}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <span className="red-lines__label" id={`label-${redLine.id}`}>
                      {label}
                    </span>
                    <div className="red-lines__buttons">
                      <button
                        className="button-secondary"
                        type="button"
                        disabled={pending}
                        aria-describedby={`label-${redLine.id}`}
                        onClick={() => {
                          setMessage(null);
                          setEditValue(redLine.clauseType);
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
                        onClick={() => run(() => removeRedLine(redLine.id), text.removed(label), true, redLine.id)}
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

      {available.length === 0 ? (
        <p className="flags__note">{text.allUsed}</p>
      ) : (
        <form className="red-lines__add" onSubmit={add}>
          <div className="field">
            <label htmlFor="add-red-line">{text.addLabel}</label>
            <select
              id="add-red-line"
              value={toAdd}
              onChange={(event) => setAddValue(event.target.value as ClauseType)}
            >
              {available.map((entry) => (
                <option key={entry.clauseType} value={entry.clauseType}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <button className="action" type="submit" disabled={pending}>
            {pending && acting === null ? text.adding : text.add}
          </button>
        </form>
      )}
    </div>
  );
}
