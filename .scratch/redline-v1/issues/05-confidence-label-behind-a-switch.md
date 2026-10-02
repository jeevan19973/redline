# 05: Confidence label behind a switch

**What to build:** Every Risk flag carries a high, medium or low Confidence. It is stored on every flag but stays hidden from Signers until the calibration eval passes (ADR 0004). When the switch is on, the Signer can see Confidence beside severity and understands they answer different questions.

**Blocked by:** 04 (Risk flags with verified Source sentences)

**Status:** done

- [x] Every Risk flag in the Report has a Confidence of high, medium or low
- [x] Confidence is never an input to severity or to whether a flag is shown
- [x] A configuration switch controls display, and it defaults off
- [x] With the switch on, the UI makes clear that severity is how bad the clause is if the Reading is right, and Confidence is how sure Underline is of the Reading
- [x] Deterministic test with the fake client: a low-Confidence Dangerous flag stays Dangerous and visible

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 163 tests and build pass; edits to earlier tests only add the new display argument. Decisions: the switch is UNDERLINE_SHOW_CONFIDENCE, on only for the exact value true; severity, raising, the floor, ordering and the Clean verdict take a flag type with no Confidence field, so reading it there would not compile; with the switch off, Confidence is stripped before anything reaches the browser. Open: the stored reports row keeps Confidence, so a Signer could read their own via Supabase directly.
