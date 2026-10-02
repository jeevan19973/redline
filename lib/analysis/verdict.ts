import { CATALOG, severityFor } from "./catalog.ts";
import type { VerifiedGuaranty } from "./guaranty.ts";
import { catalogRedLineFor, type RedLine } from "./red-lines.ts";
import type { CleanVerdict, FlagCitationFailure, RiskFlag } from "./report.ts";
import { CLEAN_VERDICT } from "./templates.ts";

// The Clean verdict (ADR 0004): fixed template wording, never model output,
// listing the whole catalog as checked. Personal guarantee is not checked
// whenever the model reported a separate guaranty, verified or not, because
// a Clean verdict must never imply that guaranty was checked (ADR 0003).
// A flag crossing one of the Signer's Red lines rules it out, as a Dangerous
// flag does.

export function cleanVerdictFor(
  riskFlags: readonly RiskFlag[],
  withheldFlags: readonly FlagCitationFailure[],
  guaranty: VerifiedGuaranty,
  redLines: readonly RedLine[],
): CleanVerdict | undefined {
  if (!qualifies(riskFlags, withheldFlags, redLines)) return undefined;

  const guarantyReported = guaranty.kind !== "none";
  const notes: string[] = [];
  if (riskFlags.some((flag) => flag.severity === "Caution")) notes.push(CLEAN_VERDICT.cautionNote);
  if (guaranty.kind === "gap") notes.push(CLEAN_VERDICT.guarantyGapNote);
  if (guaranty.kind === "withheld") notes.push(CLEAN_VERDICT.guarantyUnverifiedNote);

  return {
    title: CLEAN_VERDICT.title,
    statement: CLEAN_VERDICT.statement,
    notes,
    checked: CATALOG.map((entry) => ({
      clauseType: entry.clauseType,
      checked: !(entry.clauseType === "personalGuarantee" && guarantyReported),
    })),
  };
}

// When a Report gets a Clean verdict. Caution flags may sit alongside it.
function qualifies(
  riskFlags: readonly RiskFlag[],
  withheldFlags: readonly FlagCitationFailure[],
  redLines: readonly RedLine[],
): boolean {
  // No shown flag is Dangerous.
  if (riskFlags.some((flag) => flag.severity === "Dangerous")) return false;
  // No withheld flag would have been Dangerous either: the model found a
  // clause that reaches the Signer personally, and only its quotation
  // failed, so "no Dangerous clause found" would be untrue.
  const withheldDangerous = withheldFlags.some(
    ({ flag }) => severityFor(flag.clauseType, flag.reachesSignerPersonally) === "Dangerous",
  );
  if (withheldDangerous) return false;
  // No flag crosses a Red line: none was raised by one, and none is of a
  // clause type the Signer marked as one they will not accept. That covers
  // a withheld flag too, for the same reason as above.
  if (riskFlags.some((flag) => flag.raisedByRedLine || catalogRedLineFor(flag.clauseType, redLines))) return false;
  if (withheldFlags.some(({ flag }) => catalogRedLineFor(flag.clauseType, redLines))) return false;
  return true;
}
