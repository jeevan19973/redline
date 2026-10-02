# 03: First report: summary and scope stamp

**What to build:** When a Draft is created, Underline analyzes it and shows a report with a plain-English summary and the scope stamp. This ticket builds the Analysis module as the single test seam (`analyzeDraft(extractedText, redLines, modelClient) -> Report`), the model client port with an OpenRouter adapter and a fake for tests, and the stored Report. Later tickets add rules behind the same interface.

**Blocked by:** 02 (Upload a plain-text file or paste text as a Draft)

**Status:** ready-for-agent

**Dependencies approved for this ticket (2026-09-30):** `vitest` as the test runner. The OpenRouter adapter uses the platform `fetch`, with no SDK. Anything beyond this still waits for approval.

- [ ] Callers can only obtain a Report through the Analysis module
- [ ] The OpenRouter adapter reads the model id and key from environment variables; no model id is hardcoded anywhere
- [ ] Analysis runs server-side; the OpenRouter key never reaches the browser
- [ ] A `reports` table is added by a migration (id, draft id, Report as structured JSON, model id, created at), with one current Report per Draft and row-level security by owner
- [ ] The Report carries a summary, the scope stamp, the model id and a timestamp
- [ ] The scope stamp is fixed template text: the report covers only this exact text, any revision must be uploaded again, and documents not uploaded (such as a separate guaranty) were not checked
- [ ] The summary prompt instructs the model to state only what the text supports
- [ ] The Draft page shows an in-progress state while analysis runs
- [ ] A failed analysis shows a clear message and a retry that reuses the stored Draft, with no re-upload
- [ ] Deterministic test through the public interface with the fake client: the scope stamp is on every Report
- [ ] A deterministic banned-claims test reads every piece of fixed copy and fails if any says a document is safe to sign or compares Underline to a lawyer. It starts with the scope stamp; tickets 07, 10 and 16 add their fixed copy to it
