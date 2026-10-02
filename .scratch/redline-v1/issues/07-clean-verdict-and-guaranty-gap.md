# 07: Clean verdict and guaranty gap

**What to build:** When a Draft has no Dangerous flag, the report says so plainly and lists every clause type that was checked, without ever saying the document is safe to sign (ADR 0004). When a Commercial lease refers to a separate guaranty, the report says the Signer's personal exposure under it was not checked, quoting the sentence that refers to it (ADR 0003).

**Blocked by:** 04 (Risk flags with verified Source sentences)

**Status:** done

- [x] A Clean verdict appears only when no flag is Dangerous; Caution flags may still be present alongside it
- [x] Clean verdict wording comes from a fixed template, never from the model, and contains no "safe to sign" or equivalent
- [x] The Clean verdict lists the full fixed clause catalog, each marked checked
- [x] When the text refers to a separate guaranty, the Report has a guaranty gap with its Source sentence, verified by the same exact-match rule as flags
- [x] Under a guaranty gap, the Clean verdict marks personal guarantee as not checked
- [x] The Clean verdict renders in a calm neutral, never success green, never with a checkmark (ADR 0006)
- [x] Deterministic tests with the fake client: the Clean verdict appears only under its condition, lists the full catalog and never contains "safe to sign"; a lease referring to a separate guaranty produces the gap and marks personal guarantee not checked
- [x] The Clean verdict template is added to the banned-claims test from ticket 03

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 103 tests and build pass. Screen checked in headless Chrome through a temporary scripted route (removed). Decisions: no Clean verdict when a withheld flag would have been Dangerous; when the guaranty sentence fails verification twice, the verdict says personal guarantee was not checked because a separate guaranty could not be ruled out, without claiming the text refers to one; with Caution flags present the verdict adds that they still cost the business.
