"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { fitsInOneSave } from "@/lib/draft-limits";
import { copy } from "../../copy";
import { createDraft, type CreateDraftState } from "../actions";

const text = copy.addDraft;

type Draft = { title: string; text: string };

// A file is accepted when it says it is plain text or is named .txt.
function isPlainText(file: File) {
  return file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
}

// What the form refuses before sending anything, or null when it can send.
function refusalFor({ title, text: body }: Draft): string | null {
  if (!title.trim()) return text.errors.missingTitle;
  if (!/\S/.test(body)) return text.errors.emptyText;
  if (!fitsInOneSave(title, body)) return text.errors.tooLarge;
  return null;
}

async function save(_prev: CreateDraftState, draft: Draft): Promise<CreateDraftState> {
  try {
    return await createDraft(draft.title, draft.text);
  } catch (error) {
    // The action's redirect to the new Draft arrives here as an error, and
    // Next has to handle it to navigate.
    unstable_rethrow(error);
    return { error: text.errors.unexpected };
  }
}

export function AddDraftForm() {
  const [state, dispatch, pending] = useActionState(save, {});
  const [body, setBody] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [titleEdited, setTitleEdited] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const message = refusal ?? state.error;

  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isPlainText(file)) {
      setRefusal(text.errors.notText);
      event.target.value = "";
      return;
    }
    try {
      // The file is read here, in the browser, and only this text is sent.
      // The textarea shows it read-only, and `body` keeps it exactly as
      // read, line endings included.
      const read = await file.text();
      setBody(read);
      setFileName(file.name);
      if (!titleEdited || !title.trim()) setTitle(file.name);
      setRefusal(null);
    } catch {
      setRefusal(text.errors.readFailed);
      event.target.value = "";
    }
  }

  function removeFile() {
    setBody("");
    setFileName(null);
    if (!titleEdited) setTitle("");
    if (fileInput.current) fileInput.current.value = "";
    fileInput.current?.focus();
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    // Send the title and text as plain strings rather than posting the form,
    // which would rewrite the textarea's line breaks.
    event.preventDefault();
    const draft = { title, text: body };
    const refused = refusalFor(draft);
    setRefusal(refused);
    if (refused) return;
    startTransition(() => dispatch(draft));
  }

  return (
    <form className="draft-form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="draft-file">{text.file.label}</label>
        <div className="draft-form__file">
          <input
            ref={fileInput}
            id="draft-file"
            type="file"
            accept=".txt,text/plain"
            onChange={chooseFile}
            aria-describedby="draft-file-hint"
          />
          {fileName && (
            <button className="button-secondary" type="button" onClick={removeFile}>
              {text.file.remove}
            </button>
          )}
        </div>
        <p className="field__hint" id="draft-file-hint">
          {text.file.hint}
        </p>
      </div>

      <div className="field">
        <label htmlFor="draft-text">{text.text.label}</label>
        <p className="field__hint" id="draft-text-hint">
          {fileName ? text.text.fromFile(fileName) : text.text.pasteHint}
        </p>
        <textarea
          id="draft-text"
          className="draft-form__text"
          value={body}
          readOnly={fileName !== null}
          onChange={(event) => setBody(event.target.value)}
          aria-describedby="draft-text-hint"
          spellCheck={false}
          rows={18}
        />
      </div>

      <div className="field">
        <label htmlFor="draft-title">{text.titleField.label}</label>
        <input
          id="draft-title"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            setTitleEdited(true);
          }}
          required
          aria-describedby="draft-title-hint"
        />
        <p className="field__hint" id="draft-title-hint">
          {text.titleField.hint}
        </p>
      </div>

      {message && (
        <p className="form-message" role="alert">
          {message}
        </p>
      )}

      <div>
        <button className="action" type="submit" disabled={pending}>
          {pending ? text.pending : text.save}
        </button>
      </div>
    </form>
  );
}
