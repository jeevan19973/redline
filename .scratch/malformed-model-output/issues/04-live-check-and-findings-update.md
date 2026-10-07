# 04: Live check on a preview, and FINDINGS.md updated

**What to build:** Confirm on a real deployment that long-lease analyses and questions no longer fail on a malformed reply, then record the outcome in FINDINGS.md. This needs the owner: a preview only loads reports and runs analyses with the Supabase secret key added to preview settings (added only for the test, after asking, and removed afterwards), and the owner signs in on the preview. See the spec: `.scratch/malformed-model-output/spec.md`.

**Blocked by:** 01 (An analysis recovers from one malformed reply), 02 (A question recovers from one malformed reply), 03 (The model's schema states the one-or-two Readings rule)

**Status:** ready-for-human

- [x] On a preview with the full set of settings, "california-commercial-lease.docx" is re-run at least five times and each run produces a report
- [x] The long-lease guaranty question is asked at least three times and each gets an answer or the fixed reply, never "couldn't finish"
- [x] The preview's logs show no "readings must hold one or two Readings" errors for those runs
- [x] The Signer's analysis and question counts went up by exactly one per run and per question
- [x] FINDINGS.md marks finding 6 resolved and notes that the "A question failed once" item is covered by the same retry
- [ ] After testing, the preview links are deleted and the secret key is removed from preview settings

## Comments

2026-10-06: Ran on the preview of branch fix-malformed-model-output, with SUPABASE_SECRET_KEY added for that branch only. Five re-runs of "california-commercial-lease.docx" each gave a report (analyses left 8 to 3). The guaranty question on "QA long lease" was asked 3 times and got the fixed "doesn't say" reply each time (questions left 13 to 10). The preview's logs held no error entries. A retry that recovers is not logged, so this cannot show whether any run needed one. Cleanup is still open.
