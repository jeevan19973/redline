import { describe, expect, it } from "vitest";
import { FIXED_COPY } from "../lib/analysis/index.ts";
import { bannedClaimsIn } from "./support/banned-claims.ts";

// The one test outside the Analysis module's behavior (spec, Testing
// Decisions): no fixed copy may say a document is safe to sign, or compare
// Underline to a lawyer. It reads the Analysis module's registry of fixed
// copy, so copy added there is checked without touching this file. The
// patterns live in tests/support/banned-claims.ts, which the Clean verdict
// tests also use on the verdicts analyzeDraft returns.

describe("banned claims", () => {
  it("has fixed copy to check", () => {
    expect(Object.keys(FIXED_COPY).length).toBeGreaterThan(0);
    for (const text of Object.values(FIXED_COPY)) expect(text.trim()).not.toBe("");
  });

  it.each(Object.entries(FIXED_COPY))("%s says nothing banned", (_name, text) => {
    expect(bannedClaimsIn(text)).toEqual([]);
  });

  // Guards against a matcher that can never fail.
  it.each([
    "This document is safe to sign.",
    "It looks okay to sign as written.",
    "You're fine to sign this one.",
    "Good to sign.",
    "Underline approved this lease.",
    "All clear: no issues found.",
    "As thorough as a lawyer, for a fraction of the price.",
    "Like having an attorney read it for you.",
  ])("catches a known-bad line: %s", (bad) => {
    expect(bannedClaimsIn(bad)).not.toEqual([]);
  });

  it("lets ordinary report wording through", () => {
    expect(bannedClaimsIn("This report covers only this exact text.")).toEqual([]);
  });
});
