# 18: One-time limit per Signer

**What to build:** Each Signer can run 5 analyses (re-runs included) and ask 25 questions, once, with no reset. They can see how many they have left. At the limit, Underline says so plainly and makes no model call, and their Drafts and reports stay where they are. The owner can raise one Signer's limit by hand in the database (ADR 0007).

**Blocked by:** 03 (First report: summary and scope stamp), 10 (Question box answered only from the document)

**Status:** done

- [x] A `signer_limits` table is added by a migration (owner, analyses used, questions used, analysis limit default 5, question limit default 25), with row-level security: a Signer can read their own row and never write it
- [x] Before every analysis, whether creating a Draft or re-running one, the server checks the remaining analyses; at the limit it refuses with a plain message and makes no model call
- [x] Before every question, the server checks the remaining questions in the same way
- [x] A completed analysis or answered question counts; one that fails before the model returns does not
- [x] Creating a Draft runs analysis, so at the analysis limit an upload is refused before any text is stored, with the same plain message
- [x] The Signer sees their remaining analyses and questions in the app
- [x] Raising one Signer's limit by editing their row takes effect on their next request; the README documents how
- [x] All copy is US English and has been run through the humanizer skill before it is committed

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 199 tests and build pass. Defaults, the 6th analysis and 26th question raising, refused client writes, row isolation, a hand-raised limit taking effect, and the backfill checked in a rolled-back transaction. The rail was not seen on screen. Decisions: fails closed (no allowance row or table means no model call); an analysis counts once the model returns even if saving fails; a 'does not say' answer counts as a question; two simultaneous requests can overrun by one; the Add a Draft page does not warn in advance at zero analyses, it refuses on Save before storing anything.
