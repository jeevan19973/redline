import { FREE_TEXT_MAX_LENGTH } from "@/lib/analysis/index.ts";
import { copy } from "../copy";

// The one check on a free-text Red line, shared by the screen (so the Signer
// hears about a problem before anything is sent) and the server actions
// (which never trust the browser). Leading and trailing spaces are dropped;
// the rest is kept as typed. Length counts characters as a reader would,
// not UTF-16 code units.

export type FreeTextCheck = { ok: true; text: string } | { ok: false; error: string };

const errors = copy.redLines.freeText.errors;

export function checkFreeText(value: unknown): FreeTextCheck {
  if (typeof value !== "string") return { ok: false, error: errors.empty };
  const text = value.trim();
  if (!text) return { ok: false, error: errors.empty };
  if (freeTextLength(text) > FREE_TEXT_MAX_LENGTH) return { ok: false, error: errors.tooLong(FREE_TEXT_MAX_LENGTH) };
  return { ok: true, text };
}

export function freeTextLength(text: string): number {
  return [...text].length;
}
