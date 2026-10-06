"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { unstable_rethrow, useRouter } from "next/navigation";
import { copy } from "../../copy";
import { AnalysisLimitToast } from "../../limit-toast";
import { runAnalysis } from "../actions";

const text = copy.analysis;

// How often the page checks again while another run on this Draft is in
// progress, and for how long a re-run waits on one: the server treats a
// claim as stale after five minutes.
const CHECK_EVERY_MS = 5_000;
const WAIT_AT_MOST_MS = 5 * 60_000;

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
// which reuses the stored text. At the analysis limit (ADR 0007) it shows
// the limit toast instead, with no way to try again.
//
// When another run on this Draft is already in progress (another tab, say),
// the action makes no model call and says so. The first analysis then shows
// as in progress and asks again every few seconds: once the other run has
// stored its report, the action re-renders the page with it. A re-run stops
// and refreshes the page every few seconds until the new report arrives.
// The page keys this component on the report it shows, so a new report
// resets it.
export function AnalysisRunner({ draftId, mode }: { draftId: string; mode: Mode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const [refusal, setRefusal] = useState<string | null>(null);
  // Set when the run was refused at the analysis limit; the toast shows
  // until the Signer closes it.
  const [limit, setLimit] = useState<number | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const closeToast = useCallback(() => setToastOpen(false), []);
  const [elsewhere, setElsewhere] = useState(false);
  // Counts a re-run's reloads while it waits, so each schedules the next.
  const [checks, setChecks] = useState(0);
  const started = useRef(false);
  const waitingSince = useRef<number | null>(null);

  const run = useCallback(() => {
    setFailed(false);
    setRefusal(null);
    setLimit(null);
    // `elsewhere` stays as it is while asking again, so the status line does
    // not flip back and forth on every check.
    startTransition(async () => {
      try {
        const result = await runAnalysis(draftId, mode === "first" ? "first" : "rerun");
        if (!result.ok && result.analyzing) {
          waitingSince.current ??= Date.now();
          setElsewhere(true);
          return;
        }
        setElsewhere(false);
        waitingSince.current = null;
        if (result.ok) return;
        setFailed(true);
        setRefusal(result.refusal ?? null);
        if (result.analysisLimit !== undefined) {
          setLimit(result.analysisLimit);
          setToastOpen(true);
        }
      } catch (error) {
        // A redirect (signed out, or no accounts) arrives as an error.
        unstable_rethrow(error);
        setElsewhere(false);
        setFailed(true);
      }
    });
  }, [draftId, mode]);

  useEffect(() => {
    // The ref keeps a development double render from starting it twice.
    if (mode !== "first" || started.current) return;
    started.current = true;
    run();
  }, [mode, run]);

  useEffect(() => {
    if (!elsewhere || pending) return;
    // The first analysis asks the action again: it shows the other run's
    // report once there is one, and never starts a second run alongside it.
    if (mode === "first") {
      const timer = setTimeout(run, CHECK_EVERY_MS);
      return () => clearTimeout(timer);
    }
    // A re-run never starts on its own: it only reloads the page, and stops
    // waiting once the other run's claim would be stale.
    const timer = setTimeout(() => {
      if (Date.now() - (waitingSince.current ?? Date.now()) > WAIT_AT_MOST_MS) {
        waitingSince.current = null;
        setElsewhere(false);
      } else {
        router.refresh();
        setChecks((n) => n + 1);
      }
    }, CHECK_EVERY_MS);
    return () => clearTimeout(timer);
  }, [elsewhere, pending, checks, mode, run, router]);

  if (mode === "first") {
    // Before the effect starts it, the analysis is about to run, so it reads
    // as in progress from the first paint.
    const running = pending || elsewhere || !failed;
    return (
      <div className="analysis">
        <p className="analysis__status" role="status">
          {running ? (elsewhere ? text.elsewhere : text.pending) : ""}
        </p>
        {failed && refusal && (
          <p className="form-message" role="alert">
            {refusal}
          </p>
        )}
        {failed && !refusal && limit === null && (
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
        {limit !== null && toastOpen && <AnalysisLimitToast limit={limit} onClose={closeToast} />}
      </div>
    );
  }

  const busy = pending || elsewhere;
  return (
    <div className="analysis analysis--rerun">
      {mode === "unreadable" && <p className="form-message">{text.unreadable}</p>}
      <div className="analysis__rerun">
        <button
          className="button-secondary"
          type="button"
          onClick={run}
          disabled={busy}
          aria-describedby="rerun-hint"
        >
          {busy ? text.pendingButton : text.rerun}
        </button>
        <p className="field__hint" id="rerun-hint">
          {text.rerunHint}
        </p>
      </div>
      <p className="analysis__status" role="status">
        {elsewhere ? text.elsewhere : pending ? text.pending : ""}
      </p>
      {failed && !pending && limit === null && (
        <p className="form-message" role="alert">
          {refusal ?? (mode === "unreadable" ? text.failed : text.rerunFailed)}
        </p>
      )}
      {limit !== null && toastOpen && <AnalysisLimitToast limit={limit} onClose={closeToast} />}
    </div>
  );
}

// Shown in place of the report when it could not be read. It never starts an
// analysis: the Draft may well have a report, and a new run would spend one
// of the Signer's analyses to replace it. "Try again" reloads the page.
export function ReportReadError() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="analysis">
      <p className="form-message" role="alert">
        {text.readError}
      </p>
      <div>
        <button
          className="action"
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => router.refresh())}
        >
          {pending ? text.reloading : text.retry}
        </button>
      </div>
    </div>
  );
}
