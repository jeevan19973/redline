"use client";

import { useEffect } from "react";
import { copy } from "./copy";

const text = copy.limit.analysisToast;

// Shown when a Signer at their analysis limit asks for an analysis (ADR 0007,
// FINDINGS.md finding 5). It stays until closed, because it holds the address
// to write to, and Escape closes it. It sits in the page right after the
// button that raised it, so Tab reaches its link next.
export function AnalysisLimitToast({ limit, onClose }: { limit: number; onClose: () => void }) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="toast" role="alert" aria-labelledby="limit-toast-title">
      <p className="toast__title" id="limit-toast-title">
        {text.title(limit)}
      </p>
      <p className="toast__body">
        {text.contact}{" "}
        <a className="link" href={`mailto:${text.email}`}>
          {text.email}
        </a>
        .
      </p>
      <p className="toast__body toast__body--quiet">{text.kept}</p>
      <button className="button-secondary toast__close" type="button" onClick={onClose}>
        {text.close}
      </button>
    </div>
  );
}
