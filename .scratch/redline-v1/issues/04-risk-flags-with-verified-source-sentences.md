# 04: Risk flags with verified Source sentences

**What to build:** The report shows Risk flags ranked Dangerous then Caution. Each flag quotes its Source sentences verbatim, states a confident Reading, and is shown only after every Source sentence has been checked against the stored text (ADR 0001). Severity follows the personal-reach test (ADR 0003), and the fixed clause catalog lives as data inside the Analysis module.

**Blocked by:** 03 (First report: summary and scope stamp)

**Status:** done

- [x] The fixed clause catalog from the spec is data in the Analysis module, not prompt prose, with its default severities
- [x] Each Risk flag has a clause type, a severity (Dangerous or Caution), one or more Source sentences with character offsets, and a Reading
- [x] A Reading is one confident statement, or two when the sentence honestly supports two readings; no hedging language
- [x] Uncapped indemnity is Dangerous when the Signer indemnifies personally or has also guaranteed the business, Caution otherwise
- [x] The prompt instructs the model to over-flag in the Dangerous tier and prefer misses below it (ADR 0004)
- [x] Every Source sentence must be an exact substring of the stored text, with no whitespace, case or punctuation normalization
- [x] A flag with any failing Source sentence gets one regeneration; if it still fails it is withheld and recorded in `citationFailures`, which is never shown to the Signer
- [x] Flags are ordered Dangerous first, then by the offset of the first Source sentence
- [x] The UI renders each Source sentence as ink on paper with an underline, never a colored fill; severity color sits only on the severity label beside it (ADR 0006)
- [x] The severity label carries its meaning in text, not color alone
- [x] Deterministic tests with the fake client: an exact sentence is accepted; one differing by a space, a curly quote or case is rejected, regenerated once, then withheld and recorded; a multi-sentence flag with one bad sentence is withheld; ordering is Dangerous first, then by offset

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 60 tests and build pass; smoke starts on plain Node. The report screen was rendered through a temporary scripted route in headless Chrome at 1440px and 600px (the route was removed); the real Draft page was not run (migrations not applied). Decisions: readings stored as an array of one or two; a failing regeneration call fails the whole analysis rather than dropping a possibly Dangerous flag; offsets are first occurrences; the depth gauge is aria-hidden decoration. Open: hedging in Readings is prompt-only, not checked in code; the eleven clause labels are the agent's wording and want an owner read.
