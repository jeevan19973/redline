# 07: Clean verdict and guaranty gap

**What to build:** When a Draft has no Dangerous flag, the report says so plainly and lists every clause type that was checked, without ever saying the document is safe to sign (ADR 0004). When a Commercial lease refers to a separate guaranty, the report says the Signer's personal exposure under it was not checked, quoting the sentence that refers to it (ADR 0003).

**Blocked by:** 04 (Risk flags with verified Source sentences)

**Status:** ready-for-agent

- [ ] A Clean verdict appears only when no flag is Dangerous; Caution flags may still be present alongside it
- [ ] Clean verdict wording comes from a fixed template, never from the model, and contains no "safe to sign" or equivalent
- [ ] The Clean verdict lists the full fixed clause catalogue, each marked checked
- [ ] When the text refers to a separate guaranty, the Report has a guaranty gap with its Source sentence, verified by the same exact-match rule as flags
- [ ] Under a guaranty gap, the Clean verdict marks personal guarantee as not checked
- [ ] The Clean verdict renders in a calm neutral, never success green, never with a checkmark (ADR 0006)
- [ ] Deterministic tests with the fake client: the Clean verdict appears only under its condition, lists the full catalogue and never contains "safe to sign"; a lease referring to a separate guaranty produces the gap and marks personal guarantee not checked
