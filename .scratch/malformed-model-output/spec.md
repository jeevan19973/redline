# Spec: one malformed model reply no longer fails an analysis or a question

**Status:** done

**Source:** FINDINGS.md finding 6, and the "A question failed once" item under "Seen once".

## Problem Statement

A Signer adds a long lease as a Draft and waits for the report. Sometimes,
instead of a report, they see "Underline couldn't finish analyzing this Draft."
Nothing is wrong with their document. On Oct 4 the California lease failed 2 of
5 runs this way, and the next run worked each time. The Signer is not charged
for the failed run, but they have to notice the failure, click Try again, and
wait through a second analysis, and they are left wondering whether Underline
can be trusted with their document at all.

The cause is one malformed reply from the model. The model is asked for one or
two Readings per Risk flag, but the request only says so in words; nothing in
the structured-output schema enforces it. When the model returns a flag with no
Reading or with three, the Analysis module rejects the whole analysis, even
though every other flag in the reply may be fine.

The question box has the same weakness. On Oct 3 a question about the long
lease showed "Underline couldn't finish answering. Try again." once, and the
retry worked. That failure could not be reproduced in five later tries, and its
log is gone, but a malformed reply to the question call would fail in exactly
the same way.

## Solution

Two changes, both inside the Analysis module, invisible to the Signer when they
work:

1. The structured-output schema for a Risk flag states the limit the parser
   already enforces: at least one Reading and at most two. A model that honors
   the schema can no longer produce the malformed flag.
2. When the reply to the main analysis call, or to the main question call, is
   still malformed, Underline asks the model once more with the same request.
   If the second reply is well formed, the Signer gets their report or answer
   as if nothing had happened. If it is malformed too, the Signer sees the same
   failure message as today and is not charged.

A retry is still one analysis, or one question, against the Signer's one-time
limit. Every rule that protects the report stays as it is: Source sentences are
still verified word for word, severity is still decided in code, and nothing a
malformed reply contained is ever shown.

## User Stories

1. As a Signer, I want my report to arrive even when the model's first reply is malformed, so that I don't have to notice a failure and click Try again.
2. As a Signer, I want a malformed reply to cost me nothing extra, so that a problem on Underline's side never uses up my one-time limit.
3. As a Signer, I want a recovered analysis to be charged as exactly one analysis, so that my "analyses left" count matches the reports I got.
4. As a Signer, I want a failed analysis to still be free when both tries are malformed, so that I am never charged for a report I didn't get.
5. As a Signer, I want the same failure message and Try again button when both tries fail, so that the screen behaves the way I already know.
6. As a Signer, I want my question answered even when the model's first reply is malformed, so that I am not told Underline "couldn't finish" a question it can answer.
7. As a Signer, I want a recovered question to be charged as exactly one question, so that my "questions left" count stays honest.
8. As a Signer, I want a question that fails on both tries to stay uncharged, so that I can ask again without losing one of my 25.
9. As a Signer, I want every Risk flag in a recovered report to show its exact Source sentence, so that a retry never weakens the rule that I can check every flag against my own copy (ADR 0001).
10. As a Signer, I want every Risk flag to have one Reading, or two when the sentence honestly supports two, so that I am never shown a flag with no plain-English statement of what it does.
11. As a Signer, I want nothing from a malformed reply to reach my report, so that a half-broken reply can't slip a wrong or unverified flag in front of me.
12. As a Signer, I want severity in a recovered report decided the same way as in any report, so that a retry can't change whether a clause is Dangerous or Caution (ADR 0003).
13. As a Signer, I want my Red lines applied to a recovered report exactly as they would be to any report, so that a retry never drops a flag a Red line raised.
14. As a Signer, I want a re-run that recovers from a malformed reply to keep every flag an earlier report showed as Dangerous because of a Red line, so that the Severity floor still holds.
15. As a Signer, I want a recovered analysis to take only the extra time one more model call needs, so that the wait stays close to a normal analysis.
16. As a Signer, I want a report that came back well formed the first time to cost no extra model call, so that the fix doesn't slow down the common case.
17. As a Signer reading a long lease, I want long documents to fail no more often than short ones, so that I can trust Underline with the documents that matter most.
18. As the owner, I want the model's schema to state the one-or-two Readings rule, so that a model that honors the schema can't produce the malformed flag in the first place.
19. As the owner, I want at most one retry per call, so that a model that keeps returning malformed output costs at most twice and fails quickly.
20. As the owner, I want the retry to resend the identical request, so that the second reply answers the same question as the first and nothing about the Draft or Red lines changes between tries.
21. As the owner, I want a report's model id to be the one from the reply that was actually used, so that the stored report records where it came from.
22. As the owner, I want transport failures (timeouts, provider errors) to behave as they do today, so that a slow provider doesn't double an already long wait.
23. As the owner, I want the regeneration calls that already exist (re-quoting a Source sentence, a Non-negotiable basis, a Counter-offer, a guaranty sentence, an answer's quotes) to keep their current behavior, so that this change stays small and their own fallbacks stay intact.
24. As the owner, I want a malformed reply on both tries to still be logged as "Analysis failed" or "A question failed" with the parser's reason, so that I can see in the logs when the retry wasn't enough.
25. As the owner, I want the server actions, the limit reservation and the release on failure left unchanged, so that the fix can't open a new way to overrun a Signer's limit.
26. As a maintainer, I want the retry to live in the Analysis module, so that the app, the smoke script and the tests all get it through the same functions.
27. As a maintainer, I want tests that script a malformed reply followed by a good one, so that the recovery is proven without a live model.
28. As a maintainer, I want tests that script two malformed replies, so that the rejection after one retry is proven and can't silently become an endless loop.
29. As a maintainer, I want the existing "malformed flags" tests to keep asserting that a reply malformed on both tries rejects the analysis, so that the parser's rules stay pinned.
30. As a maintainer, I want a test that the request schema carries the one-or-two Readings limit, so that a later edit can't quietly drop it.

## Implementation Decisions

- **Where the change lives.** Only the Analysis module changes: its request building (the analysis schema) and its two public entry points, analyzeDraft and askDraft. The model client port, the OpenRouter adapter, the server actions, the limit reservation and the UI do not change.
- **Schema limit.** The Risk flag's `readings` array in the analysis request's JSON schema gets `minItems: 1` and `maxItems: 2`, matching the parser's existing rule. The description text stays.
- **Provider compatibility check.** The request goes to one provider with strict structured output and `require_parameters`. Before merging, a live smoke run must confirm the provider accepts the two keywords. If the provider rejects them (an error rather than a reply), drop the keywords and rely on the retry alone; the retry is the part that fixes the finding.
- **What triggers a retry.** Only the parser's malformed-output error on the reply to the main analysis call (in analyzeDraft) or the main question call (in askDraft). Errors from the model client itself (timeouts, HTTP errors, a provider error inside a 200, content that is not JSON) are not retried; they fail as today.
- **How the retry works.** The same request object is sent once more through the same model client. At most one retry per call. If the second reply parses, processing continues exactly as if it had been the first reply. If it is malformed too, the second error propagates, as a malformed reply does today.
- **Nothing from the first reply is kept.** The malformed reply is discarded whole. No flag, summary, guaranty reference or answer from it is merged into the result.
- **Model id.** The report's model id comes from the reply that parsed.
- **Charging.** The server actions reserve one analysis or one question before calling the Analysis module and release it if the call throws. Because the retry happens inside one analyzeDraft or askDraft call, a recovered run is charged once and a run that fails twice is released, with no change to the actions.
- **Later calls unchanged.** Flag verification, re-quoting, Non-negotiable basis, Counter-offers, guaranty verification and answer re-quoting keep their current behavior and fallbacks. They run after the retried call, on the reply that parsed.
- **Domain rules unchanged.** Source sentences are still verified word for word (ADR 0001); severity is still decided in code from the catalog and personal reach (ADR 0003); the Severity floor and kept flags still apply on re-runs; the Clean verdict rules (ADR 0004) are unchanged.
- **Logging.** The server actions already log the error when a call throws. No new logging is required. Logging a recovered retry is optional and, if added, must not include document text.

## Testing Decisions

- **What a good test does.** It drives the public functions with the scripted fake model client and asserts on what the Signer would get: the Report or Answer returned, or the rejection, and how many model calls were made. It does not assert on internal helpers or on the order of private steps.
- **One seam.** analyzeDraft and askDraft with the scripted fake client. No UI, database or live model in these tests. The fake already fails any unscripted call, which makes call counts exact.
- **New analysis tests.**
  - A reply with a flag that has no Reading, followed by a well-formed reply, gives a Report with the second reply's flags, and exactly two analysis calls were made before any regeneration calls.
  - The same with a flag that has three Readings.
  - The Report's model id is the second reply's.
  - Two malformed replies reject the analysis, and no third analysis call is made.
  - A well-formed first reply makes no extra call.
- **New question tests.** The same four cases for askDraft: malformed then well formed gives the answer; two malformed replies reject; a well-formed first reply makes one call; nothing from the malformed reply shows.
- **Existing tests to update.** The "analyzeDraft: malformed flags" table currently scripts one malformed reply and expects rejection. Each case should script the malformed reply twice, so the test still proves the parser rejects that shape after the one retry, rather than passing only because the fake refuses an unscripted call.
- **Schema test.** Assert that the analysis request's schema limits `readings` to at least one and at most two items. Prior art: the test that checks the analysis prompt carries the personal-pledge rule.
- **Prior art.** The "analyzeDraft: malformed flags" and "analyzeDraft: citation verification" describes in the Risk flags tests (scripted replies, call counting, rejection), and the question box tests for askDraft.
- **Live check.** After merge to a preview with the full set of settings, re-run the California lease several times. Failures from the Readings rule should stop, and the logs should show no "readings must hold one or two Readings" errors.

## Out of Scope

- Retrying on timeouts, provider errors or network failures.
- Retrying the regeneration calls (re-quote, basis, Counter-offer, guaranty, answer re-quote); they keep their own fallbacks.
- Trimming or repairing a malformed reply (for example keeping the first two of three Readings). A malformed reply is discarded whole.
- Showing the Signer that a retry happened.
- Changing the limit, the reservation or the release logic in the server actions.
- Finding 4 (payment terms) and any other prompt or catalog wording change.
- Reconciling CONTEXT.md, which says every Risk flag has one Reading, with the spec and code, which allow two. Worth a separate glossary fix.

## Further Notes

- The retry adds one model call only when the first reply is malformed. On Oct 4 that was 2 of 5 runs of a long lease, so the expected cost is small, and each recovered run saves the Signer a manual Try again.
- With a 120-second timeout per model call and no retry on timeouts, the worst case for a malformed-then-slow sequence stays within the platform's function limit.
- If the schema keywords are accepted and the malformed rate drops to zero in the live check, the retry still stays as protection against other malformed shapes the parser rejects.
- When this ships, update FINDINGS.md: finding 6 resolved, and the "A question failed once" item noted as covered by the same retry.

## Comments
