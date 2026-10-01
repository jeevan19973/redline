# 09: Free-text Red lines add flags

**What to build:** A Signer can write a Red line in their own words for a term that is not in the catalog. When the document contains that term, the report adds a Risk flag for it, held to the same citation rule as every other flag (ADR 0001).

**Blocked by:** 08 (The Signer's Red lines raise severity, with the Severity floor)

**Status:** ready-for-agent

- [ ] The Signer can add, edit and remove free-text Red lines alongside catalog ones
- [ ] A free-text Red line adds a flag only where the document contains the term, with clause type `redLine` and a reference to the Red line that produced it
- [ ] The added flag requires a verified Source sentence; one that fails verification is withheld and recorded like any other
- [ ] A free-text Red line only adds flags; it never raises or lowers an existing flag
- [ ] An added flag crosses a Red line, so it prevents the Clean verdict
- [ ] Deterministic test with the fake client: a free-text Red line adds a flag only with a verified Source sentence
