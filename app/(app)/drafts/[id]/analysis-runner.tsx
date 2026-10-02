"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { copy } from "../../copy";
import { runAnalysis } from "../actions";

const text = copy.analysis;

type Mode =
  // A Draft with no Report yet: the analysis starts as soon as the page opens.
  | "first"
  // A Draft that has a Report: a button runs it again and replaces it.
  | "rerun"
  // A Draft whose stored Report cannot be read: a button replaces it.
  | "unreadable";

// Runs the analysis on a stored Draft through the runAnalysis Server Action
// and shows it in progress. On success the action re-renders the page with
// the stored Report; on failure this shows a message and a way to try again,
// which reuses the stored text.
export function AnalysisRunner({ draftId, mode }: { draftId: string; mode: Mode }) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const started = useRef(false);

  const run = useCallback(() => {
    setFailed(false);
    startTransition(async () => {
      try {
        const { ok } = await runAnalysis(draftId);
        if (!ok) setFailed(true);
      } catch (error) {
        // A redirect (signed out, or no accounts) arrives as an error.
        unstable_rethrow(error);
        setFailed(true);
      }
    });
  }, [draftId]);

  useEffect(() => {
    // The ref keeps a development double render from starting it twice.
    if (mode !== "first" || started.current) return;
    started.current = true;
    run();
  }, [mode, run]);

  if (mode === "first") {
    // Before the effect starts it, the analysis is about to run, so it reads
    // as in progress from the first paint.
    const running = pending || !failed;
    return (
      <div className="analysis">
        <p className="analysis__status" role="status">
          {running ? text.pending : ""}
        </p>
        {failed && (
          <>
            <p className="form-message" role="alert">
              {text.failed}
            </p>
            <div>
              <button className="action" type="button" onClick={run}>
                {text.retry}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="analysis analysis--rerun">
      {mode === "unreadable" && <p className="form-message">{text.unreadable}</p>}
      <div className="analysis__rerun">
        <button
          className="button-secondary"
          type="button"
          onClick={run}
          disabled={pending}
          aria-describedby="rerun-hint"
        >
          {pending ? text.pendingButton : text.rerun}
        </button>
        <p className="field__hint" id="rerun-hint">
          {text.rerunHint}
        </p>
      </div>
      <p className="analysis__status" role="status">
        {pending ? text.pending : ""}
      </p>
      {failed && !pending && (
        <p className="form-message" role="alert">
          {mode === "unreadable" ? text.failed : text.rerunFailed}
        </p>
      )}
    </div>
  );
}
