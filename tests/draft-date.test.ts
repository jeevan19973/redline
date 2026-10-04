import { describe, expect, it } from "vitest";
import { draftDate } from "../app/(app)/drafts/draft-date.ts";

// FINDINGS.md finding 2: a Draft added at 10:36 PM Eastern on Oct 2 is
// stored as 02:36 UTC on Oct 3. The reader should see the date where they
// are, not the UTC date.
describe("draftDate", () => {
  const lateEveningEastern = "2026-10-03T02:36:00Z";

  it("shows the date in the reader's time zone", () => {
    expect(draftDate(lateEveningEastern, "America/New_York")).toBe("Oct 2, 2026");
    expect(draftDate(lateEveningEastern, "America/Los_Angeles")).toBe("Oct 2, 2026");
  });

  it("shows the UTC date when no time zone is known yet", () => {
    expect(draftDate(lateEveningEastern)).toBe("Oct 3, 2026");
  });
});
