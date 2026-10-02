# 04: Risk flags with verified Source sentences

**What to build:** The report shows Risk flags ranked Dangerous then Caution. Each flag quotes its Source sentences verbatim, states a confident Reading, and is shown only after every Source sentence has been checked against the stored text (ADR 0001). Severity follows the personal-reach test (ADR 0003), and the fixed clause catalog lives as data inside the Analysis module.

**Blocked by:** 03 (First report: summary and scope stamp)

**Status:** ready-for-agent

- [ ] The fixed clause catalog from the spec is data in the Analysis module, not prompt prose, with its default severities
- [ ] Each Risk flag has a clause type, a severity (Dangerous or Caution), one or more Source sentences with character offsets, and a Reading
- [ ] A Reading is one confident statement, or two when the sentence honestly supports two readings; no hedging language
- [ ] Uncapped indemnity is Dangerous when the Signer indemnifies personally or has also guaranteed the business, Caution otherwise
- [ ] The prompt instructs the model to over-flag in the Dangerous tier and prefer misses below it (ADR 0004)
- [ ] Every Source sentence must be an exact substring of the stored text, with no whitespace, case or punctuation normalization
- [ ] A flag with any failing Source sentence gets one regeneration; if it still fails it is withheld and recorded in `citationFailures`, which is never shown to the Signer
- [ ] Flags are ordered Dangerous first, then by the offset of the first Source sentence
- [ ] The UI renders each Source sentence as ink on paper with an underline, never a colored fill; severity color sits only on the severity label beside it (ADR 0006)
- [ ] The severity label carries its meaning in text, not color alone
- [ ] Deterministic tests with the fake client: an exact sentence is accepted; one differing by a space, a curly quote or case is rejected, regenerated once, then withheld and recorded; a multi-sentence flag with one bad sentence is withheld; ordering is Dangerous first, then by offset
