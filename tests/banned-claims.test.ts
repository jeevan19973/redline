import { describe, expect, it } from "vitest";
import { copy as landingCopy, landingCopyStrings } from "../app/(landing)/copy.ts";
import { FIXED_COPY } from "../lib/analysis/index.ts";
import { bannedClaimsIn } from "./support/banned-claims.ts";

// The one test outside the Analysis module's behavior (spec, Testing
// Decisions): no fixed copy may say a document is safe to sign, or compare
// Underline to a lawyer. It reads the Analysis module's registry of report
// templates and every string on the landing page, so copy added to either is
// checked without touching this file. The patterns live in
// tests/support/banned-claims.ts, which the Clean verdict tests also use on
// the verdicts analyzeDraft returns.

// Every fixed string checked here: report templates by their own names,
// landing copy under "landing." and its path in app/(landing)/copy.ts.
const ALL_COPY: Readonly<Record<string, string>> = {
  ...FIXED_COPY,
  ...Object.fromEntries(Object.entries(landingCopyStrings()).map(([name, text]) => [`landing.${name}`, text])),
};

// Sentences that name a banned claim only to deny it, pinned word for word to
// the one entry allowed to carry each. Only that exact sentence is set aside;
// the rest of the entry is still checked, and any edit to the sentence puts
// it back under the patterns.
const DENIALS: Readonly<Record<string, string>> = {
  "landing.clean.body.1": "It never tells you a document is safe to sign.",
};

function checkedText(name: string, text: string): string {
  const denial = DENIALS[name];
  return denial ? text.replace(denial, "") : text;
}

describe("banned claims", () => {
  it("has fixed copy to check", () => {
    expect(Object.keys(FIXED_COPY).length).toBeGreaterThan(0);
    for (const text of Object.values(FIXED_COPY)) expect(text.trim()).not.toBe("");
  });

  it.each(["scopeStamp", "doesNotSay"])("includes the %s template", (name) => {
    expect(FIXED_COPY).toHaveProperty(name);
  });

  it.each(Object.entries(ALL_COPY))("%s says nothing banned", (name, text) => {
    expect(bannedClaimsIn(checkedText(name, text))).toEqual([]);
  });

  it("includes the landing page copy", () => {
    expect(ALL_COPY["landing.hero.title"]).toBe(landingCopy.hero.title);
    expect(ALL_COPY["landing.close.legal"]).toBe(landingCopy.close.legal);
    expect(ALL_COPY["landing.data.body.0"]).toBe(landingCopy.data.body[0]);
    for (const text of Object.values(ALL_COPY)) expect(text.trim()).not.toBe("");
  });

  it.each(Object.entries(DENIALS))("%s still carries its denial word for word", (name, denial) => {
    expect(ALL_COPY[name]).toContain(denial);
  });

  // A claim planted in a real landing string is caught, so the landing check
  // cannot pass by reading nothing.
  it("catches a claim planted in landing copy", () => {
    const planted = `${landingCopy.close.legal} This lease is safe to sign.`;
    expect(bannedClaimsIn(checkedText("landing.close.legal", planted))).not.toEqual([]);
  });

  it("sets aside only the pinned denial, not a claim beside it", () => {
    const name = "landing.clean.body.1";
    expect(bannedClaimsIn(checkedText(name, `${DENIALS[name]} This one is safe to sign.`))).not.toEqual([]);
    expect(bannedClaimsIn(checkedText(name, "It tells you a document is safe to sign."))).not.toEqual([]);
    expect(bannedClaimsIn(checkedText("landing.hero.lede", DENIALS[name]))).not.toEqual([]);
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
