# 14: Fixture eval run

**What to build:** One command runs the Analysis module through the OpenRouter client over the labeled fixture set and reports the result. The pass/fail checks from PRD section 4 fail the run; the measured targets are reported per run but not enforced until they are agreed.

**Blocked by:** 05 (Confidence label behind a switch), 06 (Counter-offers and Non-negotiable clauses), 07 (Clean verdict and guaranty gap), 09 (Free-text Red lines add flags), 10 (Question box answered only from the document), 13 (Labeled fixture set)

**Status:** blocked

- [ ] The eval uses the same `analyzeDraft` and `askDraft` interface as the deterministic tests, with the OpenRouter client
- [ ] The run fails on any pass/fail check: citation integrity, Dangerous recall, Severity floor, Non-negotiable handling, question box, Clean verdict wording, guaranty gap, scope stamp
- [ ] The run reports Clean verdict rate, Caution precision, Confidence calibration and Counter-offer usefulness against the labels
- [ ] Each run records the model id it ran against
- [ ] `citationFailures` from every Report are included in the run output
- [ ] The run is kept separate from the deterministic tests, since it needs a key and costs money

## Comments

2026-10-01 (unattended build run): Not attempted. Blocked by ticket 13 (ready-for-human): the eval must run over a labeled fixture set from a qualified labeller, and the measured targets must be agreed first. Every other dependency (05, 06, 07, 09, 10) is done. The synthetic fixtures in tests/fixtures/ and npm run smoke are not a substitute, so no eval harness was built over them.
