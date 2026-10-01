# 10: Question box answered only from the document

**What to build:** On an open Draft, the Signer asks a question in their own words and gets an answer that quotes the sentences it relies on, or a plain statement that the document does not say. Underline never fills the gap with a guess.

**Blocked by:** 04 (Risk flags with verified Source sentences)

**Status:** ready-for-agent

- [ ] `askDraft(extractedText, question, modelClient) -> Answer` is added to the Analysis module and runs server-side against the stored text
- [ ] An answer carries Source sentences checked by the same exact-match verification as Risk flags, rendered the same underlined way
- [ ] When the model finds no support, the reply is a fixed "the document does not say" template
- [ ] When an answer's Source sentences fail verification, it is replaced by the same fixed reply
- [ ] Questions and answers are not persisted
- [ ] Deterministic tests with the fake client: the fixed reply is returned when the model finds no support, and when its citations fail verification
