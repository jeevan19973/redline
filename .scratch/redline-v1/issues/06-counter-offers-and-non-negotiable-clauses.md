# 06: Counter-offers and Non-negotiable clauses

**What to build:** Each flagged clause the Signer can negotiate comes with a Counter-offer they can copy and send as written. A Non-negotiable clause is still flagged at its true severity, labeled take-it-or-leave-it, and gets no Counter-offer (ADR 0003).

**Blocked by:** 04 (Risk flags with verified Source sentences)

**Status:** done

- [x] Each Risk flag has a negotiability: negotiable, or Non-negotiable with its basis in the text (for example "standard terms", or no signature block for the Signer)
- [x] The prompt requires the Non-negotiable call to rest on the document, not on assumptions about the Counterparty
- [x] A negotiable flag carries Counter-offer wording; a Non-negotiable flag never does, enforced in code by stripping any Counter-offer the model returns
- [x] Negotiability never changes severity
- [x] The Signer can copy a Counter-offer in one action
- [x] A Non-negotiable flag shows a take-it-or-leave-it label rendered as an ink outline with no fill (ADR 0006)
- [x] Deterministic test with the fake client: a Non-negotiable flag has no Counter-offer even when the model supplies one, and keeps its severity

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 149 tests and build pass. Screen screenshotted through a temporary route (removed); the Copy button was not clicked in a real browser. Decisions: the Non-negotiable basis is a quoted, verified sentence; if it fails twice the take-it-or-leave-it label is dropped, the flag stays at its severity as negotiable, and the failure is recorded; a negotiable flag with no Counter-offer after one regeneration is shown without one and recorded in maintainer-only counterOfferGaps; code never writes Counter-offer wording. Open: a real model may mark every flag in the take-it-or-leave-it lease fixture Non-negotiable; check in the smoke run.
