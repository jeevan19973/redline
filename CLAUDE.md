# Redline

Upload a contract, lease, freelance agreement or terms of service; get back
what it says and what it costs you.

## Settled decisions

Do not reopen these.

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
4. A drafted counter-offer for each flagged clause
5. A question box answered only from the document
6. An editable list of the user's own red lines, which drives the analysis
7. A saved library of past documents

Excluded on purpose: payments, billing, OCR for scanned documents, and
sharing a document between users. This version exists to prove the analysis
can be trusted. None of those make it more trustworthy, and OCR actively
undermines it, because a citation is worthless when the text it points at
was misread.

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

## Read these when they matter

- research/summary.md holds the user research. Read it before deciding
  what the product should do.
- PRD.md will hold the brief once it exists. Read it before building.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
