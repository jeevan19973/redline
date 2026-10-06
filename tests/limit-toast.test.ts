import { describe, expect, it } from "vitest";
import { copy } from "../app/(app)/copy.ts";

// FINDINGS.md finding 5: at the analysis limit, the message sent the Signer
// to "the person who invited you" with no way to reach them. The owner's
// decision (Oct 4): a toast that names who to email for more analyses.
describe("the analysis limit toast", () => {
  const toast = copy.limit.analysisToast;

  it("says the analyses are used up", () => {
    expect(toast.title(5)).toBe("You've used all 5 analyses");
    expect(toast.title(1)).toBe("You've used your one analysis");
  });

  it("names who to email for more, and the address", () => {
    expect(toast.contact).toContain("Jeevan Surya");
    expect(toast.email).toBe("jeevansuryamaddu@gmail.com");
  });
});
