# 0004. Over-flag only what is Dangerous, label confidence separately, and say when a document is clean

Status: Accepted. Date: 2026-09-16.

## Decision

1. **Error bias splits at Dangerous.** In the Dangerous tier, Redline prefers a false alarm to a miss. Below it, Redline prefers a miss to a false alarm.
2. **Confidence is a separate label.** Every Risk flag states its reading of the Source sentence plainly and confidently, then carries a high, medium or low Confidence label. Confidence never lowers severity, and it never takes a flag out of the Dangerous tier (ADR 0003's floor).
3. **Clean verdict.** When there is no Dangerous flag and nothing crosses a Red line, Redline says so in plain words and lists the clause types it checked. It does not manufacture minor flags to look useful.

## Alternatives

- Over-flag everywhere. This was rejected because the noise destroys the believability that a Clean verdict depends on.
- Prefer misses everywhere. This was rejected because an unflagged personal guarantee is the worst outcome the product can have.
- Hedged language ("this may potentially..."). This was rejected as safe and useless.
- Always confident with no label. This was rejected because a wrong reading of a guarantee would read as fact.
- Hide uncertain flags. This was rejected because ambiguity is often written on purpose, and those are the clauses worth seeing.
- Always show at least minor notes on a clean document. This was rejected because a tool that always finds problems stops being believed.

## Consequences

- Confidence is what the model says about itself, and that is poorly calibrated by default. The labels need an eval against fixture documents with known readings before they are shown, or they are decoration.
- The Signer will see high-severity flags with low Confidence. The UI must make clear the two labels answer different questions: how bad the clause is if the reading is right, and how sure Redline is of the reading.
- A Clean verdict is a claim about the uploaded text only. It must never say "safe to sign", and it must not imply a guaranty in a separate document was checked (ADR 0003).
- The list of what was checked needs a fixed set of clause types, so "we checked for personal guarantees" is a real statement and not a paraphrase.
