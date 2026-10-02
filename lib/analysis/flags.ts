import type { ModelClient } from "../model/port.ts";
import { severityFor, type Severity } from "./catalog.ts";
import { ATTEMPTS, locateAll } from "./citations.ts";
import { parseRequote } from "./parse.ts";
import { requoteRequest } from "./prompt.ts";
import { raiseByRedLines, type RedLine } from "./red-lines.ts";
import type { FlagCitationFailure, ProposedFlag, RiskFlag } from "./report.ts";

// Turns the model's proposed flags into the Risk flags a Report shows:
// citation verification with one regeneration (ADR 0001), severity from the
// catalog and the personal-reach test (ADR 0003), raising by the Signer's
// Red lines under the Severity floor, then ordering.

export type VerifiedFlags = {
  riskFlags: RiskFlag[];
  citationFailures: FlagCitationFailure[];
};

export async function verifyFlags(
  extractedText: string,
  proposed: readonly ProposedFlag[],
  redLines: readonly RedLine[],
  modelClient: ModelClient,
): Promise<VerifiedFlags> {
  // Each flag that fails gets its own focused regeneration call. The calls
  // run together; each starts in flag order.
  const outcomes = await Promise.all(proposed.map((flag) => verifyOne(extractedText, flag, modelClient)));

  const riskFlags: RiskFlag[] = [];
  const citationFailures: FlagCitationFailure[] = [];
  for (const outcome of outcomes) {
    if ("flag" in outcome) citationFailures.push(outcome);
    else riskFlags.push(outcome);
  }
  const raised = raiseByRedLines(riskFlags, redLines);
  assertSeverityFloor(riskFlags, raised);
  return { riskFlags: rank(raised), citationFailures };
}

// The Severity floor's last guard (ADR 0003). Red line raising can only
// raise by construction; this checks the result anyway, so a later change
// that broke it would fail the analysis instead of quietly showing a lower
// severity. Every flag must still be there, none below its severity from
// the catalog and the personal-reach test or below where it started, and
// only a flag that started below Dangerous can say a Red line raised it.
function assertSeverityFloor(before: readonly RiskFlag[], after: readonly RiskFlag[]): void {
  const rankOf = (severity: Severity) => (severity === "Dangerous" ? 1 : 0);
  if (after.length !== before.length) throw new Error("Severity floor: Red lines removed a Risk flag.");
  after.forEach((flag, index) => {
    const floor = severityFor(flag.clauseType, flag.reachesSignerPersonally);
    const start = before[index].severity;
    if (rankOf(flag.severity) < rankOf(floor) || rankOf(flag.severity) < rankOf(start)) {
      throw new Error(`Severity floor: a ${flag.clauseType} flag was lowered.`);
    }
    if (flag.raisedByRedLine && (start === "Dangerous" || flag.severity !== "Dangerous")) {
      throw new Error(`Severity floor: a ${flag.clauseType} flag is marked raised but was not.`);
    }
  });
}

async function verifyOne(
  extractedText: string,
  proposed: ProposedFlag,
  modelClient: ModelClient,
): Promise<RiskFlag | FlagCitationFailure> {
  let sentences = proposed.sourceSentences;
  let located = locateAll(extractedText, sentences);

  if (!located.ok) {
    // A failure of the regeneration call itself rejects the whole analysis,
    // like any other model failure, rather than silently dropping a flag
    // that may be Dangerous.
    const { data } = await modelClient.complete(requoteRequest(extractedText, proposed, located.failed));
    sentences = parseRequote(data);
    located = locateAll(extractedText, sentences);
    if (!located.ok) return { flag: proposed, failedSentences: located.failed, attempts: ATTEMPTS };
  }

  return {
    clauseType: proposed.clauseType,
    severity: severityFor(proposed.clauseType, proposed.reachesSignerPersonally),
    sourceSentences: located.sentences,
    readings: proposed.readings,
    reachesSignerPersonally: proposed.reachesSignerPersonally,
  };
}

// Dangerous first, then by the offset of the first Source sentence. The sort
// is stable, so flags that start at the same place keep the model's order.
function rank(flags: RiskFlag[]): RiskFlag[] {
  const tier = (flag: RiskFlag) => (flag.severity === "Dangerous" ? 0 : 1);
  return flags.sort(
    (a, b) => tier(a) - tier(b) || a.sourceSentences[0].offset - b.sourceSentences[0].offset,
  );
}
