# 11: Delete a Draft

**What to build:** A Signer can delete a Draft from their library, and Underline keeps nothing of it afterwards.

**Blocked by:** 03 (First report: summary and scope stamp)

**Status:** done

- [x] The Signer can delete a Draft from the library or the Draft page, after a confirmation that is not a browser dialog
- [x] Deleting a Draft deletes its Report
- [x] Only the owner can delete a Draft; row-level security enforces this, not only the UI
- [x] The deleted Draft no longer appears in the library and cannot be opened by its old link

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 189 tests and build pass. Delete, cross-owner refusal and report cascade checked in a rolled-back transaction; dialog look and keyboard behavior checked in headless Chrome through a temporary route (removed). Decisions: focus starts on Cancel; the post-delete line from the Draft page does not name the Draft, so the title never lands in a URL; deleting a Draft does not give back an analysis.
