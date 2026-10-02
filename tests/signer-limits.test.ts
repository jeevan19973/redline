import { describe, expect, it } from "vitest";
import { allowanceFrom, isSignerLimitRow } from "../lib/signer-limits.ts";

// The signer_limits migration's defaults.
const fresh = { analyses_used: 0, questions_used: 0, analysis_limit: 5, question_limit: 25 };

describe("what a Signer has left of their one-time limit", () => {
  it("starts a new Signer at 5 analyses and 25 questions", () => {
    expect(allowanceFrom(fresh)).toEqual({ analysesLeft: 5, analysisLimit: 5, questionsLeft: 25, questionLimit: 25 });
  });

  it("counts down each kind of use on its own", () => {
    const allowance = allowanceFrom({ ...fresh, analyses_used: 2, questions_used: 24 });
    expect(allowance.analysesLeft).toBe(3);
    expect(allowance.questionsLeft).toBe(1);
  });

  it("leaves none at the limit", () => {
    const allowance = allowanceFrom({ ...fresh, analyses_used: 5, questions_used: 25 });
    expect(allowance.analysesLeft).toBe(0);
    expect(allowance.questionsLeft).toBe(0);
  });

  it("gives more as soon as the owner raises a limit on the row", () => {
    const allowance = allowanceFrom({ ...fresh, analyses_used: 5, analysis_limit: 8 });
    expect(allowance.analysesLeft).toBe(3);
    expect(allowance.analysisLimit).toBe(8);
  });

  it("never goes below none when a limit is lowered under what was used", () => {
    const allowance = allowanceFrom({ ...fresh, analyses_used: 5, analysis_limit: 3, questions_used: 10, question_limit: 4 });
    expect(allowance.analysesLeft).toBe(0);
    expect(allowance.questionsLeft).toBe(0);
  });

  it("accepts only a whole row of whole numbers", () => {
    expect(isSignerLimitRow(fresh)).toBe(true);
    expect(isSignerLimitRow(null)).toBe(false);
    expect(isSignerLimitRow({ ...fresh, analysis_limit: undefined })).toBe(false);
    expect(isSignerLimitRow({ ...fresh, questions_used: "3" })).toBe(false);
    expect(isSignerLimitRow({ ...fresh, analyses_used: 1.5 })).toBe(false);
  });
});
