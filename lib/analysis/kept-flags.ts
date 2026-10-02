import { locateAll } from "./citations.ts";
import type { RedLine } from "./red-lines.ts";
import type { KeptFlag, Negotiability, OlderRiskFlag, RiskFlag, ShownRiskFlag, StoredReport } from "./report.ts";

// The Severity floor across re-runs (spec, "Severity floor"; user story 45):
// a re-run of a Draft never lowers or drops a flag that the report it
// replaces showed as Dangerous because of a Red line, so removing or editing
// a Red line cannot delete the one warning the Signer needed. Only a re-run
// of the same Draft passes the earlier report; a new Draft follows the
// current Red lines alone.
//
// It runs after the new run's own severity and raising. For each earlier
// flag that was Dangerous because of a Red line (raised by one, or a
// Dangerous flag a free-text Red line added, or one kept this way before):
//
// - If the new run flags the same clause (same clause type, the same
//   free-text Red line for an added flag, and at least one identical Source
//   sentence), that flag stays Dangerous. A new flag that is Dangerous on its
//   own is left as it is; a Caution one is made Dangerous and marked kept,
//   carrying the earlier Red line.
// - If the new run does not flag it at all, the earlier flag is carried
//   forward, marked kept, once its Source sentences verify against the text
//   again. One that no longer verifies is not carried: a flag that cannot
//   show its source is never shown.

type EarlierFlag = ShownRiskFlag | OlderRiskFlag;

// The Red line that made an earlier flag Dangerous, or undefined when none
// did.
function redLineBehind(flag: EarlierFlag): RedLine | undefined {
  if (flag.severity !== "Dangerous") return undefined;
  if (flag.keptFromEarlierReport) return flag.keptFromEarlierReport.redLine;
  if (flag.clauseType === "redLine") return flag.crossesRedLine;
  return flag.raisedByRedLine;
}

// Whether a Red line is in the current list exactly as it was.
function inList(redLine: RedLine, redLines: readonly RedLine[]): boolean {
  return redLines.some((current) =>
    current.kind === "catalog" && redLine.kind === "catalog"
      ? current.id === redLine.id && current.clauseType === redLine.clauseType
      : current.kind === "freeText" && redLine.kind === "freeText" && current.id === redLine.id && current.text === redLine.text,
  );
}

function sameClause(earlier: EarlierFlag, flag: RiskFlag): boolean {
  if (earlier.clauseType !== flag.clauseType) return false;
  if (earlier.clauseType === "redLine" && flag.clauseType === "redLine") {
    if (earlier.crossesRedLine.id !== flag.crossesRedLine.id) return false;
  }
  const texts = new Set(flag.sourceSentences.map((sentence) => sentence.text));
  return earlier.sourceSentences.some((sentence) => texts.has(sentence.text));
}

export function keepEarlierRaisedFlags(
  extractedText: string,
  riskFlags: readonly RiskFlag[],
  redLines: readonly RedLine[],
  previousReport: StoredReport | undefined,
): RiskFlag[] {
  const flags = [...riskFlags];
  for (const earlier of previousReport?.riskFlags ?? []) {
    const redLine = redLineBehind(earlier);
    if (!redLine) continue;
    const redLineChanged = !inList(redLine, redLines);

    const index = flags.findIndex((flag) => sameClause(earlier, flag));
    if (index !== -1) {
      const flag = flags[index];
      if (flag.severity === "Dangerous") continue;
      const keptFromEarlierReport: KeptFlag = { redLine, redLineChanged, carriedForward: false };
      flags[index] =
        flag.clauseType === "redLine"
          ? { ...flag, severity: "Dangerous", keptFromEarlierReport }
          : {
              ...flag,
              severity: "Dangerous",
              // Only a catalog Red line raises a catalog flag.
              raisedByRedLine: redLine.kind === "catalog" ? redLine : flag.raisedByRedLine,
              keptFromEarlierReport,
            };
      continue;
    }

    const carried = carryForward(extractedText, earlier, { redLine, redLineChanged, carriedForward: true });
    if (carried) flags.push(carried);
  }
  return flags;
}

// The earlier flag as this report shows it, with its Source sentences and
// any Non-negotiable basis verified again, or null when a Source sentence
// is no longer in the text.
function carryForward(extractedText: string, earlier: EarlierFlag, kept: KeptFlag): RiskFlag | null {
  const located = locateAll(
    extractedText,
    earlier.sourceSentences.map((sentence) => sentence.text),
  );
  if (!located.ok) return null;

  const {
    negotiability: _negotiability,
    counterOffer: _counterOffer,
    nonNegotiableBasis: _basis,
    confidence,
    keptFromEarlierReport: _kept,
    ...flag
  } = earlier;
  const carried = {
    ...flag,
    sourceSentences: located.sentences,
    ...negotiabilityOf(extractedText, earlier),
    // A flag stored before Confidence existed was never rated, so it is
    // carried at the most cautious rating rather than a made-up sure one.
    confidence: confidence ?? "low",
    keptFromEarlierReport: kept,
  };
  return carried as RiskFlag;
}

// The earlier flag's negotiability, kept as it was. A Non-negotiable basis
// that no longer verifies leaves it unconfirmed, and a flag stored before
// negotiability existed is carried as negotiable with no Counter-offer,
// which shows nothing extra.
function negotiabilityOf(extractedText: string, earlier: EarlierFlag): Negotiability {
  if (earlier.negotiability === "nonNegotiable") {
    const located = locateAll(extractedText, [earlier.nonNegotiableBasis.text]);
    return located.ok
      ? { negotiability: "nonNegotiable", nonNegotiableBasis: located.sentences[0] }
      : { negotiability: "unconfirmedNonNegotiable" };
  }
  if (earlier.negotiability === "unconfirmedNonNegotiable") return { negotiability: "unconfirmedNonNegotiable" };
  if (earlier.negotiability === "negotiable" && earlier.counterOffer) {
    return { negotiability: "negotiable", counterOffer: earlier.counterOffer };
  }
  return { negotiability: "negotiable" };
}
