# Spec: Redline v1

Status: ready-for-agent

Source: `PRD.md` (2026-09-16), `CONTEXT.md`, `docs/adr/0001` to `0005`. Terms in **bold** are defined in `CONTEXT.md`.

Amended 2026-09-30: adds the public landing page, invite-only sign-up and the one-time per-Signer limit (CLAUDE.md scope items 8 and 9), drawing on `PRODUCT.md`, `docs/adr/0006` and `docs/adr/0007`. The product is now called Underline (ADR 0006). The original text below keeps the name Redline as written; amended sections use Underline. The whole spec is in US English.

## Problem Statement

A **Signer** (a small business owner or independent operator) is about to sign a **Commercial lease**, a vendor or service contract, a freelance agreement or a vendor's terms of service. Somewhere in the boilerplate is a clause whose exposure reaches past the business to the Signer personally: a personal guarantee, an assignment of work they owned before the deal, an uncapped indemnity they sign as an individual, a non-compete that binds them rather than the business. Nobody points it out.

A lawyer's review costs $1,000 to $3,000, so most Signers skip it and either sign as-is or paste the document into a free chatbot. The chatbot paraphrases, cannot show where its claims come from, hedges everything or nothing, and gives the Signer no way to check whether it is right. The Signer has no cheap way to learn what the document actually says, which parts of it cost them, how badly, and what to ask for instead, while they can still negotiate.

## Solution

The Signer uploads the document. It is parsed in their browser, and only the extracted text is kept. Redline returns a report on that exact **Draft**:

- a plain-English summary containing only claims the text supports;
- **Risk flags** ranked **Dangerous** then **Caution**, each quoting its **Source sentence** verbatim, with a confident **Reading** and a **Confidence** label;
- a **Counter-offer** for every flagged clause except a **Non-negotiable clause**, which is labeled take-it-or-leave-it;
- a **Clean verdict** when nothing is Dangerous and nothing crosses a **Red line**, listing exactly which clause types were checked and never saying the document is safe to sign;
- a scope stamp saying the report covers only this exact text, that any revision must be uploaded again, and that documents not uploaded (such as a separate guaranty) were not checked.

The Signer can ask questions answered only from the document, keep their own list of Red lines that add flags or raise severity (but never lower a Dangerous flag), and come back to every past Draft in a saved library.

Every claim in the report can be checked by the Signer against their own copy of the document without trusting Redline.

A single public landing page tells a Signer what Underline does, who it is for and what it does not do, shows an example Risk flag with its underlined Source sentence, and sends them to sign up with an invite code or sign in. It makes no claim the product cannot back.

v1 is an invite-only beta (ADR 0007). Each sign-up consumes a single-use invite code, and each Signer has a one-time limit of 5 analyses (re-runs included) and 25 questions.

## User Stories

### Uploading

1. As a Signer, I want to upload a contract file from my computer, so that I can get it reviewed before I sign.
2. As a Signer, I want the file to be read in my browser and only its text sent onward, so that the original document never leaves my machine.
3. As a Signer, I want to see the text Redline extracted before or alongside the report, so that I can confirm it read the document I meant to upload.
4. As a Signer, I want to be told plainly when a file is a scanned image with no readable text, so that I don't receive a report built on text that was never there.
5. As a Signer, I want to be told when a file type is not supported, so that I know to export it in a supported format.
6. As a Signer, I want to name the Draft (defaulting to the file name), so that I can find it in my library later.
7. As a Signer, I want to see that analysis is in progress, so that I don't upload the same document twice.
8. As a Signer, I want a clear message if analysis fails, with the option to retry, so that a model error does not lose my upload.

### Summary

9. As a Signer, I want a plain-English summary of what the document says, so that I understand the deal without reading every clause.
10. As a Signer, I want the summary to contain only what the text supports, so that I am never told something the document does not say.

### Risk flags

11. As a Signer, I want every Risk flag to quote the exact sentence it is based on, so that I can find it in my own copy and judge it myself.
12. As a Signer, I want a flag that depends on several clauses to quote each of them, so that I can see the whole basis for it.
13. As a Signer, I want Redline to never show me a flag whose quoted sentence is not in my document, so that I can trust every quotation I see.
14. As a Signer, I want Dangerous flags shown above Caution flags, so that the clauses that reach my home, savings or prior work come first.
15. As a Signer, I want flags within the same severity shown in the order they appear in the document, so that I can follow along with the document.
16. As a Signer, I want each flag to state plainly what the sentence does to me, so that I am not left decoding hedged language.
17. As a Signer, I want a sentence that can honestly be read two ways to have both readings stated, so that deliberate ambiguity is visible rather than resolved for me.
18. As a Signer, I want each flag to carry a high, medium or low Confidence label, so that I know how sure Redline is of its reading.
19. As a Signer, I want it made clear that Confidence and severity answer different questions, so that a low-Confidence Dangerous flag is not mistaken for a minor one.
20. As a Signer, I want a personal guarantee flagged as Dangerous, so that I know the business's obligations are backed by my own assets.
21. As a Signer, I want an assignment of pre-existing IP flagged as Dangerous, so that I don't sign away tools and work I owned before the deal.
22. As a Signer, I want an uncapped indemnity flagged as Dangerous when I am indemnifying personally or have also guaranteed the business, and as Caution otherwise, so that the severity matches who is actually exposed.
23. As a Signer, I want a non-compete that binds me as an individual flagged as Dangerous, so that I know it restricts me and not just this business.
24. As a Signer, I want auto-renewal, payment terms against me, late fees and penalties, mandatory arbitration and class waivers, limitation of liability capping the Counterparty, unilateral amendment, and security deposit and repair obligations flagged as Caution where present, so that I see the terms that cost the business.
25. As a Signer, I want Redline not to invent minor flags on a document that has none, so that a flag always means something.

### Counter-offers and Non-negotiable clauses

26. As a Signer, I want replacement wording for each flagged clause I can negotiate, so that I can send the Counterparty something concrete.
27. As a Signer, I want a Counter-offer I can copy as written, so that I don't have to rewrite it into contract language myself.
28. As a Signer, I want a clause the Counterparty will not change labeled take-it-or-leave-it, with no Counter-offer, so that I know my real choice is to sign or walk away.
29. As a Signer, I want a Non-negotiable clause still flagged at its true severity, so that being unable to change it does not make it look less harmful.
30. As a Signer, I want the Non-negotiable label to rest on what the document says, so that it is not a guess about the Counterparty.

### Clean verdict, scope stamp and guaranty gap

31. As a Signer, I want to be told plainly when a document has no Dangerous flag and nothing crossing my Red lines, so that a clean result is stated rather than implied.
32. As a Signer, I want a Clean verdict to list every clause type that was checked, so that I know exactly what "clean" covers.
33. As a Signer, I want Redline to never tell me a document is safe to sign, so that a description of the text is not mistaken for legal advice.
34. As a Signer, I want every report to say it covers only this exact text, so that I know a revised version must be uploaded again.
35. As a Signer, I want every report to say that documents I did not upload were not checked, so that I don't assume a separate guaranty was reviewed.
36. As a Signer reviewing a Commercial lease that refers to a separate guaranty, I want the report to say my personal exposure under that guaranty was not checked, quoting the sentence that refers to it, so that a Clean verdict does not reassure me about a document Redline never saw.

### Questions

37. As a Signer, I want to ask a question about the document in my own words, so that I can check something the report did not cover.
38. As a Signer, I want answers to quote the sentences they rely on, so that I can verify them the same way as flags.
39. As a Signer, I want to be told plainly when the document does not answer my question, so that Redline never fills the gap with a guess.

### Red lines

40. As a Signer, I want to see Redline's default Red lines, so that I know what every document is checked against.
41. As a Signer, I want to add my own Red line, such as a clause type I will not accept, so that the analysis reflects terms that matter to my business.
42. As a Signer, I want a Red line to raise a matching Caution flag to Dangerous, so that my own deal-breakers rank at the top.
43. As a Signer, I want a Red line to add a flag where the document contains a term I said I will not accept, so that it is caught even when it is not on the default list.
44. As a Signer, I want to edit or remove my own Red lines, so that the list stays current as my business changes.
45. As a Signer, I want Dangerous flags to keep showing even if I remove or change a Red line, so that I cannot accidentally delete the one warning I needed.
46. As a Signer, I want to know which Red lines a stored report was run against, and to re-run analysis after changing them, so that an old report is not mistaken for one reflecting my current list.

### Library

47. As a Signer, I want to sign in, so that my documents and Red lines are kept for me.
48. As a Signer, I want a library of every Draft I have uploaded, newest first, so that I can return to a past report.
49. As a Signer, I want each upload of a revised document to appear as its own Draft, so that every report is tied to exactly the text it analyzed.
50. As a Signer, I want to open a past Draft and see its report, extracted text and question box, so that I don't need to upload it again.
51. As a Signer, I want to delete a Draft, so that I control what Redline keeps.
52. As a Signer, I want only me to be able to see my Drafts, so that my contracts stay private.

### Landing page

53. As a Signer, I want to see in plain words what Underline does and who it is for, so that I can tell quickly whether it fits the document in front of me.
54. As a Signer, I want to see an example Risk flag with its underlined Source sentence, so that I can judge the product's central claim before I upload anything.
55. As a Signer, I want to know which documents Underline reads and which it does not (scanned files, residential leases, documents I don't upload), so that I don't sign up for something it cannot do.
56. As a Signer, I want to be told plainly that my file is read in my browser, and that only its text is stored and sent to a third-party model provider for analysis, so that I can decide whether to upload a confidential contract.
57. As a Signer, I want to be told that Underline is not legal advice, so that I don't mistake a description of the text for a lawyer's opinion.
58. As a Signer, I want the page to make no claim the product cannot back (no "safe to sign", no comparison to a lawyer, no testimonials, accuracy figures or prices), so that the first thing I read is as trustworthy as the report.
59. As a Signer, I want to sign up with my invite code or sign in from the page, so that I can go straight to uploading.

### Invites and limits

60. As a Signer holding an invite code, I want to sign up with it, so that I can use the beta I was invited to.
61. As a Signer whose code is wrong or already used, I want to be told plainly, so that I know to ask the owner for another.
62. As the owner, I want to create single-use invite codes, so that I control who joins the beta.
63. As a Signer, I want to see how many analyses and questions I have left, so that I can spend them on the documents that matter.
64. As a Signer who has used my limit, I want to be told plainly, with no model call made, so that I know why nothing happened and that my Drafts and reports are still there.

### Building and evaluating Redline

65. As the maintainer, I want the analysis to run through one module with the model client passed in, so that its rules can be tested without a model and evaluated with a real one through the same interface.
66. As the maintainer, I want the model id read from an environment variable, so that switching models needs no code change.
67. As the maintainer, I want every pass/fail check in the PRD run on every change, so that a regression in citations, the Severity floor or Clean verdict wording is caught before it ships.
68. As the maintainer, I want the measured targets reported per run against the labeled fixture set, so that Confidence calibration and Counter-offer usefulness can be judged over time.
69. As the maintainer, I want Confidence labels hidden from Signers until calibration passes, so that a miscalibrated label is never shown as meaningful.
70. As the maintainer, I want citation failures recorded on the report rather than shown to the Signer, so that they are visible as bugs without degrading what the Signer sees.
71. As the maintainer, I want a test that fails if any fixed copy (report templates and the landing page) says a document is safe to sign or compares Underline to a lawyer, so that a banned claim cannot ship by accident.

## Implementation Decisions

### Modules

- **Text extraction (browser).** Takes a file, returns extracted plain text or a typed refusal (unsupported type, no text layer). Runs only in the browser. The original file is never uploaded or stored. Supported types are text-based PDF, DOCX and plain text. A PDF with no extractable text is refused as scanned; there is no OCR fallback.
- **Analysis module (the deep module, and the single test seam).** Two operations:
  - `analyzeDraft(extractedText, redLines, modelClient) -> Report`
  - `askDraft(extractedText, question, modelClient) -> Answer`

  Everything that makes a report trustworthy lives behind this interface: prompt construction, parsing structured model output, citation verification, severity policy (including the Severity floor and Red line raising), Non-negotiable handling, ordering, the guaranty gap, the Clean verdict and the scope stamp. Callers cannot produce a Report any other way.
- **Model client (port).** A narrow interface the Analysis module calls to get structured output. Two implementations: an OpenRouter adapter that reads the model id and key from environment variables (no hardcoded model id), and a fake used in tests that returns scripted responses.
- **Persistence.** Supabase, running locally through the CLI. All schema changes are migration files. Row-level security restricts every row to its owning Signer.
- **App shell.** Next.js on Vercel with Supabase auth. Analysis and questions run server-side so the OpenRouter key never reaches the browser. The browser sends only extracted text.

### Report shape

The Report is the contract between the Analysis module and everything else (storage, UI, evals). Its decision-relevant shape:

- `summary`: plain-English text.
- `riskFlags[]`, each with:
  - `clauseType`: one of the fixed catalog below, or `redLine` with a reference to the Signer's Red line that produced it;
  - `severity`: `Dangerous` or `Caution`;
  - `sourceSentences[]`: one or more strings, each an exact substring of the extracted text, plus its character offset;
  - `reading`: one confident statement, or two when the sentence honestly supports two readings;
  - `confidence`: `high`, `medium` or `low`;
  - `negotiability`: `negotiable`, or `nonNegotiable` with the basis in the text;
  - `counterOffer`: replacement wording, present if and only if `negotiability` is `negotiable`;
  - `raisedByRedLine`: set when a Red line raised the severity.
- `cleanVerdict`: present only when no flag is Dangerous and no flag crosses a Red line. Contains a fixed statement and the list of clause types checked, each marked checked or, for personal guarantee under the guaranty gap, not checked.
- `guarantyGap`: present when the text refers to a separate guaranty, with the Source sentence that refers to it.
- `scopeStamp`: always present.
- `redLinesSnapshot`: the Red lines the analysis ran against.
- `citationFailures[]`: flags withheld because a Source sentence failed verification (for the maintainer and evals, never shown to the Signer).
- `modelId` and a timestamp.

### Rules enforced inside the Analysis module

- **Citation verification (ADR 0001).** Every Source sentence must appear as an exact substring of the stored extracted text. No whitespace, case or punctuation normalization; a near-match fails. A flag with any failing Source sentence gets one regeneration attempt. If it still fails, it is withheld and recorded in `citationFailures`. The same rule applies to Source sentences in question answers and to the guaranty-gap sentence.
- **Severity (ADR 0003).** Dangerous means the exposure reaches past the business to the Signer personally, or to property they owned before the deal. Unusualness is not a criterion. Everything else flagged is Caution.
- **Severity floor.** Red lines can add flags and raise Caution to Dangerous. Nothing (Red lines, Confidence, negotiability) can remove a Dangerous flag or lower it. This is enforced in code after model output is parsed, not left to the prompt.
- **Confidence (ADR 0004).** Stored on every flag. Never used as an input to severity or to whether a flag is shown. Displayed only when a configuration switch is on; it defaults off until the calibration eval passes.
- **Error bias (ADR 0004).** The prompt instructs the model to over-flag in the Dangerous tier and prefer misses below it.
- **Non-negotiable clauses.** Determined from the text (for example "standard terms", or no signature block for the Signer). A Non-negotiable flag never carries a Counter-offer; this is enforced in code by stripping any Counter-offer the model returns for it.
- **Ordering.** Dangerous before Caution. Within a severity, by the offset of the flag's first Source sentence. This ordering is a placeholder per the PRD.
- **Clean verdict.** Condition: no Dangerous flag and no flag crossing a Red line. Caution flags may still be present alongside it. Its wording comes from a fixed template, not from the model, so it can never say "safe to sign" or an equivalent. It lists the fixed clause catalog as checked.
- **Guaranty gap.** When the text refers to a separate guaranty, the report says personal exposure under that document was not checked, and the Clean verdict (if any) marks personal guarantee as not checked rather than checked.
- **Scope stamp.** Fixed template text on every report.
- **Question box.** `askDraft` returns either an answer with verified Source sentences, or a fixed "the document does not say" reply. An answer whose Source sentences fail verification is replaced by the fixed reply.

### Fixed clause catalog

The default Red lines and the list a Clean verdict reports as checked, from PRD section 5:

- Dangerous: personal guarantee; assignment of pre-existing IP; uncapped indemnity signed personally (Caution when not personal); non-compete binding the individual.
- Caution: auto-renewal; payment terms against the Signer; late fees and penalties charged to the Signer; mandatory arbitration and class waiver; limitation of liability capping the Counterparty; unilateral amendment; security deposit and repair obligations.

The catalog is data in the Analysis module, not prompt prose, so the checked list is a real statement.

### Red lines

- Two kinds: the default catalog (read-only for the Signer) and the Signer's own Red lines. A Signer's own Red line is either a catalog clause type marked as "will not accept" (raises matching flags to Dangerous) or a free-text term (adds flags where the document contains it, each still requiring a verified Source sentence).
- Removing or editing a Signer's Red line never lowers or hides a Dangerous flag.
- Red lines belong to the Signer, not to a Draft. A report snapshots the Red lines it ran against. Changing Red lines does not rewrite past reports; the Signer can re-run analysis on a Draft, which replaces its report.

### Schema (migrations)

- `drafts`: id, owner, title, extracted text, created at. No original file column. No deal or grouping column in v1, but nothing keys reports or questions on anything other than the Draft id, so a grouping table can be added later without reshaping existing rows (ADR 0005).
- `reports`: id, draft id, the Report as structured JSON, model id, created at. One current report per Draft.
- `red_lines`: id, owner, kind (catalog clause type or free text), value, created at.
- `invite_codes`: code, created at, used by, used at. No client can read or write it; codes are checked and consumed server-side only.
- `signer_limits`: owner, analyses used, questions used, analysis limit (default 5), question limit (default 25). The limits live on the row so the owner can raise one Signer's limit by hand.
- Questions and answers are not persisted in v1.
- Row-level security on `drafts`, `reports`, `red_lines` and `signer_limits` limits access to the owner; Signers can read their own `signer_limits` row but never write it. Deleting a Draft deletes its report.

### Server operations

- Create Draft: receives title and extracted text, stores the Draft, runs `analyzeDraft` with the Signer's current Red lines, stores the Report.
- Re-run analysis on a Draft.
- Ask a question about a Draft: runs `askDraft` against the stored text.
- List, open and delete Drafts.
- List, add, edit and remove the Signer's Red lines.
- Sign up with an invite code: the code must exist and be unused; it is marked used by the new Signer in the same step that creates the account, so one code makes one account.
- Before every analysis (create or re-run) and every question, the server checks the Signer's remaining limit. At the limit, it returns a plain refusal and makes no model call. A completed analysis or answered question counts; one that fails before the model returns does not.

### Invites and limits

- v1 is invite-only (ADR 0007). The owner creates single-use codes with a server-side script; there is no admin UI.
- Each Signer has a one-time limit of 5 analyses (re-runs included) and 25 questions. It never resets. Raising it is a manual database change by the owner.
- The Signer sees their remaining analyses and questions in the app.

### Landing page

- One public page at the site root, rendered without auth and without model or database calls.
- A signed-in Signer who opens it sees a link to their library in place of sign-up. It does not redirect.
- The example Risk flag uses the same presentation as a flag in a report: severity label, underlined Source sentence, Reading. Its clause is written for the page and labeled as an example. It is not a real person's document or words.
- Brand follows ADR 0006: ink on paper, red only on the example's Dangerous label.
- The sign-up path asks for an invite code. The page never implies open access.
- A plain-language data note describes the implementation exactly: the original file never leaves the browser; the extracted text is stored in Underline's database and sent through OpenRouter to a third-party model provider for analysis. It makes no promise about whether that provider retains the text (ADR 0007).
- A line on the page says Underline is not legal advice.
- No analytics, cookies beyond auth, or third-party scripts.
- The page meets WCAG 2.2 AA (PRODUCT.md).
- Copy is US English and goes through the humanizer skill before it is committed (CLAUDE.md). It never says a document is safe to sign, never compares Underline to a lawyer, and states no testimonial, customer count, accuracy figure or price (PRODUCT.md, Evidence on Hand).

## Testing Decisions

- **What a good test is.** It exercises external behavior through the Analysis module's public interface (`analyzeDraft`, `askDraft`) and asserts on the returned Report or Answer. It does not assert on prompt text, internal helper functions or the order of internal calls. It would still pass after a rewrite of the internals that kept behavior the same.
- **One seam.** The Analysis module with an injected model client is the only test seam in v1. Upload, UI and persistence are thin enough to be verified by running the app, and get no automated tests in v1.
- **One exception: banned claims.** A deterministic test reads every piece of fixed copy (the Clean verdict, scope stamp and "does not say" templates, and the landing page copy) and fails if any says a document is safe to sign or compares Underline to a lawyer. For this, landing page copy lives in one place the test can read.
- **Deterministic tests (fake model client).** Scripted model output drives each rule. Required cases:
  - a Source sentence that is present verbatim is accepted; one that differs by a space, a curly quote or case is rejected, regenerated once, then withheld and recorded;
  - a multi-sentence flag with one bad Source sentence is withheld;
  - a Dangerous flag still appears when the matching Red line is removed (Severity floor);
  - a Signer's Red line raises a Caution flag to Dangerous and marks it raised;
  - a free-text Red line adds a flag only with a verified Source sentence;
  - low Confidence never changes severity or visibility;
  - a Non-negotiable flag has no Counter-offer even when the model supplies one;
  - ordering is Dangerous first, then by document offset;
  - a Clean verdict appears only under its condition, lists the full catalog, and never contains "safe to sign" or an equivalent;
  - a lease referring to a separate guaranty produces the guaranty gap, and its Clean verdict marks personal guarantee not checked;
  - the scope stamp is on every Report;
  - `askDraft` returns the fixed "does not say" reply when the model finds no support, and when its citations fail verification.
- **Fixture evals (OpenRouter client).** The same interface, run over the labeled fixture set covering all four document types, including clean documents, documents with known Dangerous clauses, a lease referring to a separate guaranty, and vendor terms of service with Non-negotiable clauses. Pass/fail checks from PRD section 4 fail the run. Measured targets (Clean verdict rate, Caution precision, Confidence calibration, Counter-offer usefulness) are reported, not enforced, until the targets are agreed.
- **Prior art.** None; the repo has no code. These tests set the pattern.

## Out of Scope

- OCR for scanned documents (ADR 0001).
- Payments and billing.
- Sharing a document between Signers.
- Omission detection: flagging protections that are missing has no Source sentence to cite (ADR 0001).
- Draft comparison or linking Drafts of one deal (ADR 0005).
- Analyzing documents that were not uploaded, such as a separate guaranty.
- Detecting, refusing or tailoring for Residential leases. v1 is not designed or tested for them.
- Help after a dispute.
- Any statement that a document is safe to sign.
- Persisting question history.
- Automated tests for upload, UI (including the landing page) or persistence, apart from the banned-claims test.
- Any public surface beyond the one landing page: a pricing page, blog, help center or comparison pages.
- Open sign-up, a waitlist, and an admin UI for invite codes (ADR 0007).
- Analytics of any kind (ADR 0007).
- A formal privacy policy and terms of service. Required before any open sign-up.

## Further Notes

- **Blocked on a human.** Who labels the fixtures is undecided, and every eval target depends on those labels. The measured targets in PRD section 4 are proposals to agree before the first eval run.
- **Needs approval before building (CLAUDE.md).** New dependencies: a PDF text extractor, a DOCX text extractor, a test runner, and the Supabase and OpenRouter client libraries if used.
- **Choices this spec made that the PRD did not settle,** each picked as the most reversible option:
  - citation failures get one regeneration, then are withheld and recorded, not shown;
  - Caution flags can coexist with a Clean verdict;
  - removing a default catalog entry is not possible; the Signer edits only their own Red lines;
  - a free-text Red line adds flags only; raising applies to catalog clause types;
  - Red lines are per Signer and snapshotted per report, with a manual re-run;
  - Clean verdict, scope stamp and "does not say" wording are fixed templates, not model output;
  - Confidence display defaults off behind a switch;
  - question history is not persisted;
  - supported file types are text-based PDF, DOCX and plain text;
  - the landing page lives at the site root, and a signed-in Signer sees a library link rather than a redirect;
  - the landing page's example flag uses a clause written for the page, labeled as an example;
  - invite codes are created with a server-side script, not an admin UI;
  - a failed analysis or question does not count against the limit;
  - at the analysis limit, an upload is refused before any text is stored;
  - limits are stored per Signer so one Signer's limit can be raised by hand.
- **Housekeeping.** Both edits this note used to list are now made: CLAUDE.md scope item 4 carries the ADR 0003 amendment, and the CLAUDE.md product line says "commercial lease".
- **Not a build blocker, but open.** The PRD's section 8 gaps (no evidence on personal guarantees, willingness to pay, or whether owners stop to review). The name collision with redlineapp.net is closed by ADR 0006.
- **Settled for the landing page (ADR 0007).** Invite-only sign-up with single-use codes; a one-time limit of 5 analyses and 25 questions; disclose third-party processing without a retention promise; a plain data note and a "not legal advice" line now, a formal policy before open sign-up; no analytics; WCAG 2.2 AA.
- **Still open, needing the owner.** The domain. The visual direction: no DESIGN.md exists, so run `/impeccable shape` on the landing page before ticket 16 is built.
