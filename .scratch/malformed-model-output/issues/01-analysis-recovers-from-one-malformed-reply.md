# 01: An analysis recovers from one malformed reply

**What to build:** When the model's first reply to an analysis is malformed (for example a Risk flag with no Reading, or with three), Underline sends the same request once more and the Signer gets their report as if nothing had happened. A recovered analysis is charged as one analysis. When both replies are malformed, the Signer sees today's "Underline couldn't finish analyzing this Draft" message with Try again, and is not charged. Nothing from a malformed reply ever reaches the report. See the spec: `.scratch/malformed-model-output/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Only the parser's malformed-output error on the main analysis reply triggers a retry; errors from the model client itself (timeouts, HTTP or provider errors, content that is not JSON) fail as today
- [x] The retry resends the identical request through the same model client, at most once
- [x] The malformed reply is discarded whole: no flag, summary or guaranty reference from it is kept
- [x] A recovered report goes through the same verification, severity, Red line, Severity floor and Clean verdict rules as any report
- [x] The report's model id is the one from the reply that parsed
- [x] The server actions, the limit reservation and its release are unchanged, so a recovered run is charged once and a run that fails twice is released
- [x] The existing "malformed flags" tests script the malformed reply twice and still expect rejection
- [x] New tests through analyzeDraft with the scripted fake client: malformed (no Reading) then good gives the second reply's flags with exactly two analysis calls; the same for three Readings; the model id comes from the second reply; two malformed replies reject with no third analysis call; a good first reply makes no extra call
- [x] `npm run typecheck`, `npm test` and `npm run build` pass

## Comments
