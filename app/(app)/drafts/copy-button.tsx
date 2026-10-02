"use client";

import { useEffect, useRef, useState } from "react";
import { copy } from "../copy";

const text = copy.report.counterOffer;

// How long the button says "Copied" before it goes back (DESIGN.md).
const DONE_MS = 1800;

type State = "idle" | "done" | "failed";

// Copies one Counter-offer in a single action with the Clipboard API. The
// button says "Copied" for a moment, and a status line announces it to
// screen readers. Where the clipboard is unavailable or refuses, the wording
// is selected on the page instead and the status line says how to copy it.
export function CopyButton({
  wording,
  sourceId,
  describedBy,
}: {
  wording: string;
  // The element holding the wording, selected when the clipboard fails.
  sourceId: string;
  // The flag's name, so each button says which flag it copies from.
  describedBy: string;
}) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copyWording() {
    window.clearTimeout(timer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("No clipboard");
      await navigator.clipboard.writeText(wording);
      setState("done");
      timer.current = window.setTimeout(() => setState("idle"), DONE_MS);
    } catch {
      const source = document.getElementById(sourceId);
      const selection = window.getSelection();
      if (source && selection) selection.selectAllChildren(source);
      setState("failed");
    }
  }

  return (
    <div className="counter__actions">
      <button
        type="button"
        className="button-secondary"
        data-state={state === "done" ? "done" : undefined}
        aria-describedby={describedBy}
        onClick={copyWording}
      >
        {state === "done" ? text.copied : text.copy}
      </button>
      <p className={state === "failed" ? "counter__note" : "visually-hidden"} role="status">
        {state === "done" ? text.copied : state === "failed" ? text.copyFailed : ""}
      </p>
    </div>
  );
}
