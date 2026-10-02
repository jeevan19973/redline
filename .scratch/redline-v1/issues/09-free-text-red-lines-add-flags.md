# 09: Free-text Red lines add flags

**What to build:** A Signer can write a Red line in their own words for a term that is not in the catalog. When the document contains that term, the report adds a Risk flag for it, held to the same citation rule as every other flag (ADR 0001).

**Blocked by:** 08 (The Signer's Red lines raise severity, with the Severity floor)

**Status:** done

- [x] The Signer can add, edit and remove free-text Red lines alongside catalog ones
- [x] A free-text Red line adds a flag only where the document contains the term, with clause type `redLine` and a reference to the Red line that produced it
- [x] The added flag requires a verified Source sentence; one that fails verification is withheld and recorded like any other
- [x] A free-text Red line only adds flags; it never raises or lowers an existing flag
- [x] An added flag crosses a Red line, so it prevents the Clean verdict
- [x] Deterministic test with the fake client: a free-text Red line adds a flag only with a verified Source sentence

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 130 tests and build pass. Free-text rows and RLS checked in a rolled-back transaction. Decisions: an added flag's severity follows the personal-reach test; redLine flags referencing an unknown id are dropped into a maintainer-only unmatchedRedLineFlags list; a withheld redLine flag still blocks the Clean verdict; the code does not require the Signer's words to appear literally in the quote (the exact-quote rule is what is enforced); free-text Red lines are capped at 120 characters.
