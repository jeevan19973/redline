# 0003. Severity is about personal reach, it has a floor, and non-negotiable clauses get no counter-offer

Status: Accepted. Date: 2026-09-16.

## Decision

1. A Risk flag is **Dangerous** when the clause's exposure reaches past the business to the Signer personally, or to property they owned before the deal. Examples: personal guarantees, uncapped indemnity, assignment of pre-existing IP. How unusual a clause is does not make it Dangerous.
2. **Severity floor.** Red lines can add flags or raise their severity. They cannot suppress or lower a Dangerous flag.
3. A **Non-negotiable clause** is flagged at its true severity, labelled take-it-or-leave-it, and gets no Counter-offer. The choice it presents is sign or walk away.

## Alternatives

- Rank the top tier by "a right you cannot get back" (arbitration, waivers). This was rejected because it puts a jury waiver above a guarantee that can cost someone their house.
- Rank by estimated dollar exposure. This was rejected because the amount is often unknowable, and the model would invent figures, which conflicts with the standing rule to state only what the document says.
- Rank by deviation from market standard. This was rejected because it measures what is unusual, not what is harmful.
- Let Red lines fully override. This was rejected because a Signer who doesn't understand a clause could delete the one warning they needed.
- Write a Counter-offer for every flag. This was rejected because a counter-offer on a clause nobody will change is theatre, and it teaches the Signer to ignore every counter-offer.

## Consequences

- This amends scope item 4 in CLAUDE.md: a Counter-offer is drafted for each flagged clause **except Non-negotiable clauses**.
- Mandatory arbitration and class-action waivers are not Dangerous under this test unless they also reach past the business. The research's car arbitration story would rank below the top tier.
- In a Commercial lease, the personal guarantee often lives in a separate guaranty document. If only the lease is uploaded, Redline cannot flag the guarantee, and the report must not imply that the Signer's personal exposure has been checked.
- Deciding whether a clause is negotiable is itself a judgment the model makes. It must rest on the document (for example, "standard terms", or no signature block for the Signer), not on assumptions about the Counterparty.
