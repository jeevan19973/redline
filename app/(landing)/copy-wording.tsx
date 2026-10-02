"use client";

import { useEffect, useRef, useState } from "react";

// The example Counter-offer's copy button, as landing/script.js wrote it:
// copies the wording, says so for a moment, then goes back to its label.
export function CopyWording({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function copyText() {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text.trim()).then(() => {
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 1800);
    }, () => {});
  }

  return (
    <button className="copy" type="button" data-state={done ? "done" : undefined} onClick={copyText}>
      <span>{done ? doneLabel : label}</span>
    </button>
  );
}
