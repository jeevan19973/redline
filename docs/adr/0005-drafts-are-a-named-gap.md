# 0005. Comparing drafts is a named gap in v1, and every report is tied to its exact text

Status: Accepted. Date: 2026-09-16.

## Decision

v1 does not link or compare Drafts. Each upload is analyzed on its own, and every report states that it covers only this exact text and that any revision from the Counterparty must be uploaded again. The brief names this as a known gap.

## Why

Redline is used before signing and produces Counter-offers, so it causes revised Drafts. A Counterparty can accept a Counter-offer in one clause and tighten another. The Signer then signs a Draft that was never analyzed, believing it was. Linking Drafts and showing which flags changed would fix this, but that is outside the scope list in CLAUDE.md, so it waits for a deliberate scope decision rather than being built by default.

## Consequences

- The quiet change in another clause is not caught in v1. The only defence is the stamp on the report and the Signer re-uploading.
- The saved library will contain several Drafts of the same deal as unrelated documents. That is expected in v1, not a bug.
- If Draft comparison is added later, the library's data model will need a way to group Drafts of one deal. Nothing in v1 should make that grouping hard to add.
