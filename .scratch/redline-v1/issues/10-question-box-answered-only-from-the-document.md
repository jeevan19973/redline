# 10: Question box answered only from the document

**What to build:** On an open Draft, the Signer asks a question in their own words and gets an answer that quotes the sentences it relies on, or a plain statement that the document does not say. Underline never fills the gap with a guess.

**Blocked by:** 04 (Risk flags with verified Source sentences)

**Status:** done

- [x] `askDraft(extractedText, question, modelClient) -> Answer` is added to the Analysis module and runs server-side against the stored text
- [x] An answer carries Source sentences checked by the same exact-match verification as Risk flags, rendered the same underlined way
- [x] When the model finds no support, the reply is a fixed "the document does not say" template
- [x] When an answer's Source sentences fail verification, it is replaced by the same fixed reply
- [x] Questions and answers are not persisted
- [x] Deterministic tests with the fake client: the fixed reply is returned when the model finds no support, and when its citations fail verification
- [x] The "does not say" template is added to the banned-claims test from ticket 03

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 189 tests and build pass. Screen checked in headless Chrome through a temporary route (removed) at 1440px and 390px. Decisions: 500-character question limit; no regeneration for questions, a failed citation gives the fixed reply at once; the box sits under the report; Ask uses the secondary style so each view keeps one primary action; for saved Drafts the server loads the stored text by id and never trusts text from the browser. Not run against a live Supabase or the real model.
