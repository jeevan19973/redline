# 05: Confidence label behind a switch

**What to build:** Every Risk flag carries a high, medium or low Confidence. It is stored on every flag but stays hidden from Signers until the calibration eval passes (ADR 0004). When the switch is on, the Signer can see Confidence beside severity and understands they answer different questions.

**Blocked by:** 04 (Risk flags with verified Source sentences)

**Status:** ready-for-agent

- [ ] Every Risk flag in the Report has a Confidence of high, medium or low
- [ ] Confidence is never an input to severity or to whether a flag is shown
- [ ] A configuration switch controls display, and it defaults off
- [ ] With the switch on, the UI makes clear that severity is how bad the clause is if the Reading is right, and Confidence is how sure Underline is of the Reading
- [ ] Deterministic test with the fake client: a low-Confidence Dangerous flag stays Dangerous and visible
