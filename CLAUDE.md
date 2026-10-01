# Underline

Upload a contract, commercial lease, freelance agreement or terms of service; get back
what it says and what it costs you.

## Settled decisions

Do not reopen these.

- The product is called Underline (ADR 0006). Red is reserved for the
  Dangerous severity, never for the brand. Earlier documents, including
  PRD.md and research/, still say Redline.
- Next.js, Supabase for auth and database, deployed on Vercel.
- The uploaded file is parsed in the browser. Only the extracted text is
  stored, never the original file.
- Every risk flag cites the exact sentence it came from. A flag that cannot
  show its source is a bug, not a weaker result.
- Model calls go through OpenRouter. The model id comes from an env var.
  Do not hardcode one.
- Supabase runs locally through the CLI. Schema changes are migration files,
  never dashboard clicks.

## Scope

Build these and stop:

1. Upload and browser-side parse
2. Plain-English summary
3. Risk flags ranked by severity, each showing its source sentence
4. A drafted counter-offer for each flagged clause, except a Non-negotiable
   clause, which is flagged at its true severity and labeled
   take-it-or-leave-it (ADR 0003)
5. A question box answered only from the document
6. An editable list of the user's own red lines, which drives the analysis
7. A saved library of past documents
8. One public landing page (ADR 0007)
9. Invite-only sign-up with single-use invite codes, and a one-time limit
   of 5 analyses and 25 questions per Signer (ADR 0007)

Excluded on purpose: payments, billing, OCR for scanned documents, and
sharing a document between users. This version exists to prove the analysis
can be trusted. None of those make it more trustworthy, and OCR actively
undermines it, because a citation is worthless when the text it points at
was misread.

Items 8 and 9 are the one exception. They do not make the analysis more
trustworthy either, but invited owners need a page that states the claim
honestly, and with no billing the spend has to stay bounded (ADR 0007).

## Working while I am away

For anything this file does not settle, take the most reversible option,
keep building, and list every such choice in your summary when I return.

Two exceptions wait for me instead:

- Adding a dependency.
- Building something outside the scope list, however obvious a next step
  it looks.

## Standing rules

- Credentials live in .env.local, which is gitignored. Never commit a
  secret. A key is public the moment it is pushed and has to be rotated.
- State only what the document says. Where the text does not support a
  claim, the product does not make it.
- All copy a user reads in this product, meaning the landing page, UI
  labels, error messages and empty states, has to be run through the
  humanizer skill before it is committed. Copy that reads as though a model
  wrote it is a defect, not a matter of taste.
- Write US English in this project: the website and all product copy,
  docs, code comments and commit messages. v1 is for the US market. This
  overrides the global Canadian English rule. Quotations stay exactly as
  their source wrote them.

## Read these when they matter

- research/summary.md holds the user research. Read it before deciding
  what the product should do.
- PRD.md holds the brief for v1, and PRODUCT.md the current product record.
  Read both before building. Where they differ from this file, this file
  holds the current scope.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
