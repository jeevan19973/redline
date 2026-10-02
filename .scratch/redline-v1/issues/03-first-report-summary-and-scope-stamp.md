# 03: First report: summary and scope stamp

**What to build:** When a Draft is created, Underline analyzes it and shows a report with a plain-English summary and the scope stamp. This ticket builds the Analysis module as the single test seam (`analyzeDraft(extractedText, redLines, modelClient) -> Report`), the model client port with an OpenRouter adapter and a fake for tests, and the stored Report. Later tickets add rules behind the same interface.

**Blocked by:** 02 (Upload a plain-text file or paste text as a Draft)

**Status:** done

**Dependencies approved for this ticket (2026-09-30):** `vitest` as the test runner. The OpenRouter adapter uses the platform `fetch`, with no SDK. Anything beyond this still waits for approval.

- [x] Callers can only obtain a Report through the Analysis module
- [x] The OpenRouter adapter reads the model id and key from environment variables; no model id is hardcoded anywhere
- [x] Analysis runs server-side; the OpenRouter key never reaches the browser
- [x] A `reports` table is added by a migration (id, draft id, Report as structured JSON, model id, created at), with one current Report per Draft and row-level security by owner
- [x] The Report carries a summary, the scope stamp, the model id and a timestamp
- [x] The scope stamp is fixed template text: the report covers only this exact text, any revision must be uploaded again, and documents not uploaded (such as a separate guaranty) were not checked
- [x] The summary prompt instructs the model to state only what the text supports
- [x] The Draft page shows an in-progress state while analysis runs
- [x] A failed analysis shows a clear message and a retry that reuses the stored Draft, with no re-upload
- [x] Deterministic test through the public interface with the fake client: the scope stamp is on every Report
- [x] A deterministic banned-claims test reads every piece of fixed copy and fails if any says a document is safe to sign or compares Underline to a lawyer. It starts with the scope stamp; tickets 07, 10 and 16 add their fixed copy to it

## Comments

2026-10-01 (unattended build run): Built. Typecheck, `npm test` (26 tests) and build pass. The reports migration and its RLS were checked with the drafts migration against the local database inside a rolled-back transaction (each Signer sees and changes only reports on their own Drafts; upsert replaces; cascade on Draft delete; anon refused). The OpenRouter adapter was exercised with a stubbed `fetch`; the real model was not called. The no-account analyze action was called over HTTP with no key and returned the plain failure. Not run end to end in a browser with a saved Draft, because the migrations are not applied.

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 26 tests and build pass. reports migration and RLS checked in a rolled-back transaction. The Draft page's analyze, in-progress, retry and re-run flow was not run in a browser (migrations not applied) and the real model was not called in this ticket.
