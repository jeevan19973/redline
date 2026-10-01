# 0001. Every flag cites its source

Status: Accepted. Date: 2026-09-16.

## Decision

Every risk flag Redline produces shows the exact sentence from the uploaded document that it came from, quoted verbatim from the extracted text. A flag that cannot show its source sentence is a bug to be fixed, not a weaker result to be displayed.

## Alternatives

- Let the model describe risks in its own words with no quotation. Cheapest to build, and indistinguishable from pasting the contract into a free chatbot.
- Cite a location (clause number, page, section heading) instead of the sentence. Breaks on documents with no numbering, and still makes the reader go hunting.
- Cite where possible, and show uncited flags with a lower-confidence label. Keeps more flags, but teaches the reader that some flags are unverifiable and lets the model's paraphrase pass as fact.

## Why

A reader can check every flag without trusting us. They can find the quoted sentence in their own copy of the document, read it in context, and decide whether the flag is fair. If the sentence is not there, or does not say what the flag claims, they have caught an error themselves. The product's claim shrinks from "trust our judgment" to "here is the sentence, judge it yourself", which is the only claim this version is trying to prove.

## Consequences

- Risks that live in what the document omits (no late-payment fee, no scope cap) have no sentence to cite. They cannot be risk flags under this rule and would need a separate, clearly labeled treatment.
- Anything that corrupts the extracted text breaks citations, which is why OCR for scanned documents stays out of scope.
- Flags that depend on several clauses together must cite each sentence they rely on, or be split.
- Generation must return the source sentence alongside each flag, and the app must check that it appears in the stored text before showing the flag. Near-matches are failures, not fuzzy passes.
- Tests assert on citations: every flag in a fixture document has a source that exists verbatim in that document. An eval that only scores flag wording is incomplete.
