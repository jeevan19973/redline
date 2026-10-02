"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { StoredReport } from "@/lib/analysis/index.ts";
import { fitsInOneSave } from "@/lib/draft-limits";
import { copy } from "../../copy";
import { analyzeWithoutAccount, askWithoutAccount } from "../actions";
import { isPlainText } from "../plain-text";
import { DraftReading } from "../draft-reading";

const text = copy.analyze;

// What the form refuses before sending anything, or null when it can send.
function refusalFor(body: string): string | null {
  if (!/\S/.test(body)) return text.errors.emptyText;
  if (!fitsInOneSave("", body)) return text.errors.tooLarge;
  return null;
}

// Paste or choose a .txt file and analyze it, with no account and nothing
// stored. Only rendered when this copy of Underline has no Supabase. The
// report is for the exact text in the box, so changing the text clears it.
export function AnalyzeForm() {
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // The report and the exact text it was made from.
  const [result, setResult] = useState<{ report: StoredReport; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const reportRegion = useRef<HTMLDivElement>(null);

  // Move focus to a new report so a screen reader announces it.
  useEffect(() => {
    if (result) reportRegion.current?.focus();
  }, [result]);

  function changeText(next: string) {
    setBody(next);
    setResult(null);
  }

  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isPlainText(file)) {
      setMessage(text.errors.notText);
      event.target.value = "";
      return;
    }
    try {
      // Read here, in the browser, exactly as the file holds it.
      changeText(await file.text());
      setFileName(file.name);
      setMessage(null);
    } catch {
      setMessage(text.errors.readFailed);
      event.target.value = "";
    }
  }

  function removeFile() {
    changeText("");
    setFileName(null);
    if (fileInput.current) fileInput.current.value = "";
    fileInput.current?.focus();
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    // Send the text as a plain string rather than posting the form, which
    // would rewrite the textarea's line breaks.
    event.preventDefault();
    const refused = refusalFor(body);
    setMessage(refused);
    if (refused) return;
    setResult(null);
    const sent = body;
    startTransition(async () => {
      try {
        const outcome = await analyzeWithoutAccount(sent);
        if ("report" in outcome) setResult({ report: outcome.report, text: sent });
        else setMessage(outcome.error);
      } catch {
        setMessage(text.errors.failed);
      }
    });
  }

  return (
    <>
      <form className="draft-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="analyze-file">{text.file.label}</label>
          <div className="draft-form__file">
            <input
              ref={fileInput}
              id="analyze-file"
              type="file"
              accept=".txt,text/plain"
              onChange={chooseFile}
              disabled={pending}
              aria-describedby="analyze-file-hint"
            />
            {fileName && (
              <button className="button-secondary" type="button" onClick={removeFile} disabled={pending}>
                {text.file.remove}
              </button>
            )}
          </div>
          <p className="field__hint" id="analyze-file-hint">
            {text.file.hint}
          </p>
        </div>

        <div className="field">
          <label htmlFor="analyze-text">{text.text.label}</label>
          <p className="field__hint" id="analyze-text-hint">
            {fileName ? text.text.fromFile(fileName) : text.text.pasteHint}
          </p>
          <textarea
            id="analyze-text"
            className="draft-form__text"
            value={body}
            readOnly={fileName !== null || pending}
            onChange={(event) => changeText(event.target.value)}
            aria-describedby="analyze-text-hint"
            spellCheck={false}
            rows={18}
          />
        </div>

        {message && (
          <p className="form-message" role="alert">
            {message}
          </p>
        )}

        <div className="analysis">
          <div>
            <button className="action" type="submit" disabled={pending}>
              {pending ? text.pending : text.submit}
            </button>
          </div>
          <p className="analysis__status" role="status">
            {pending ? text.pendingNote : ""}
          </p>
        </div>
      </form>

      {result && (
        <div className="analyze__result" ref={reportRegion} tabIndex={-1}>
          <DraftReading
            documentText={result.text}
            textTitle={text.textTitle}
            textIntro={text.textIntro}
            report={result.report}
            // Nothing is stored here, so the question goes with the exact
            // text this report was made from.
            ask={(question) => askWithoutAccount(result.text, question)}
          />
          <p className="analyze__note">{text.notSaved}</p>
        </div>
      )}
    </>
  );
}
