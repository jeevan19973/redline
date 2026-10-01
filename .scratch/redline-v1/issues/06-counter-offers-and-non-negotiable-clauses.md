# 06: Counter-offers and Non-negotiable clauses

**What to build:** Each flagged clause the Signer can negotiate comes with a Counter-offer they can copy and send as written. A Non-negotiable clause is still flagged at its true severity, labeled take-it-or-leave-it, and gets no Counter-offer (ADR 0003).

**Blocked by:** 04 (Risk flags with verified Source sentences)

**Status:** ready-for-agent

- [ ] Each Risk flag has a negotiability: negotiable, or Non-negotiable with its basis in the text (for example "standard terms", or no signature block for the Signer)
- [ ] The prompt requires the Non-negotiable call to rest on the document, not on assumptions about the Counterparty
- [ ] A negotiable flag carries Counter-offer wording; a Non-negotiable flag never does, enforced in code by stripping any Counter-offer the model returns
- [ ] Negotiability never changes severity
- [ ] The Signer can copy a Counter-offer in one action
- [ ] A Non-negotiable flag shows a take-it-or-leave-it label rendered as an ink outline with no fill (ADR 0006)
- [ ] Deterministic test with the fake client: a Non-negotiable flag has no Counter-offer even when the model supplies one, and keeps its severity
