# 02: A question recovers from one malformed reply

**What to build:** When the model's first reply to a question in the question box is malformed, Underline sends the same request once more and the Signer gets their answer, or the fixed "This document doesn't say" reply when that is the honest answer. A recovered question is charged as one question. When both replies are malformed, the Signer sees today's "Underline couldn't finish answering. Try again." and is not charged. This covers the Oct 3 question failure under "Seen once" in FINDINGS.md, which may have been the same kind of failure. See the spec: `.scratch/malformed-model-output/spec.md`.

**Blocked by:** 01 (An analysis recovers from one malformed reply), whose retry this reuses

**Status:** ready-for-agent

- [x] Only the parser's malformed-output error on the main question reply triggers a retry; model client errors fail as today
- [x] The retry resends the identical request, at most once, and discards the malformed reply whole
- [x] The answer re-quote call keeps its current behavior and fallback to the fixed reply
- [x] The server action, the question reservation and its release are unchanged
- [x] New tests through askDraft with the scripted fake client: malformed then good gives the answer with verified Source sentences; two malformed replies reject with no third question call; a good first reply makes one call; nothing from the malformed reply shows
- [x] `npm run typecheck`, `npm test` and `npm run build` pass

## Comments
