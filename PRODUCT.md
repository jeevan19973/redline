# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js, Supabase for auth and database (run locally through the CLI, schema changes as migration files), deployed on Vercel. Model calls go through OpenRouter, with the model id read from an environment variable. Decided by the owner in CLAUDE.md.

## Users

The **Signer**: a small business owner or independent operator in the US, about to sign a document they can still negotiate. The document is one of four kinds: a Commercial lease, a vendor or service contract, a freelance agreement they sign as the contractor, or a vendor's terms of service. The other side is the **Counterparty**.

They work at a desk. The document usually arrives by email as a PDF or Word file, and they read the report on a laptop alongside their own copy. The app must work on a phone, but the phone is not the primary device.

Today they pay a lawyer $1,000 to $3,000 for a lease review, skip help entirely, or paste the document into a free chatbot. The real substitutes are doing nothing and the free chatbot, not the lawyer.

Not served in v1: renters (Residential leases), consumers, employees, and anyone already in a dispute.

v1 is an invite-only beta. Signers reach it with a single-use invite code from the owner, typically after a conversation about a document they recently signed or are about to sign (ADR 0007). A Signer reading the landing page is still a Signer (CONTEXT.md).

## Product Purpose

Underline reads a contract before someone signs it and tells them what it says and what it costs them, while they can still negotiate. It exists to catch the clause whose exposure reaches past the business to the Signer personally: a personal guarantee, an assignment of work they owned before the deal, an uncapped indemnity signed as an individual, a non-compete that binds them rather than the business.

v1 exists to prove the analysis can be trusted. Success is measured on a labeled fixture set: every displayed Source sentence is present verbatim in the document, no Dangerous clause is missed, and clean documents come back clean (PRD section 4).

## Positioning

Every Risk flag shows the exact sentence it rests on, checked against the stored text before it is displayed (ADR 0001). The Signer can judge every flag against their own copy without trusting Underline. The claim is "here is the sentence, judge it yourself", not "trust our judgment".

Competitors and the free chatbot paraphrase. None was verified to show the exact source sentence; that was inferred from marketing copy only, so it is a believed difference, not a confirmed one.

## Operating Context

- The Signer uploads one Draft at a time. The file is parsed in their browser and only the extracted text is stored, never the original.
- A report covers only that Draft's exact text. Any revision from the Counterparty must be uploaded again as a new Draft (ADR 0005).
- A commercial lease often has its personal guarantee in a separate guaranty document. If only the lease is uploaded, the report must not imply the Signer's personal exposure was checked.
- The Signer keeps their own list of Red lines, which add flags or raise severity but never lower a Dangerous flag.
- The Signer may send a Counter-offer to the Counterparty as written.
- The extracted text is stored in Underline's database and sent through OpenRouter to a third-party model provider for analysis. Underline discloses this and makes no promise about whether that provider retains the text (ADR 0007).

## Capabilities and Constraints

v1 scope (CLAUDE.md): upload and browser-side parse, or pasted text; plain-English summary; Risk flags ranked Dangerous then Caution, each with its Source sentences, a Reading and a Confidence; a Counter-offer for each flagged clause except a Non-negotiable clause; a question box answered only from the document; an editable list of the Signer's Red lines; a saved library of Drafts; one public landing page; invite-only sign-up with single-use codes; a one-time limit of 5 analyses (re-runs included) and 25 questions per Signer.

The landing page carries a plain-language data note and a line saying Underline is not legal advice. A formal privacy policy and terms of service are required before any open sign-up. v1 has no analytics.

Every report also carries a scope stamp, and a Clean verdict when nothing is Dangerous and nothing crosses a Red line.

Excluded on purpose: payments and billing, OCR for scanned documents, sharing between users, omission detection, Draft comparison, residential leases, help after a dispute, and any statement that a document is safe to sign.

Supported input: text-based PDF, DOCX and plain-text files, or text pasted in.

Terminology is fixed in CONTEXT.md. Use Signer, Counterparty, Risk flag, Source sentence, Reading, Confidence, Dangerous, Caution, Clean verdict, Draft, Counter-offer, Red line, Non-negotiable clause, and avoid the synonyms it lists.

Undecided:
- Who labels the fixture set, and the measured eval targets.
- Pricing. The research has no willingness-to-pay figure.
- Whether Confidence labels are ever shown. They stay hidden until calibration passes.
- The domain. The repository and GitHub remote keep the name `redline` (ADR 0006).
- The visual direction. No DESIGN.md exists; the landing page is shaped before it is built.

## Brand Commitments

- The product is named **Underline** (ADR 0006). Some dated documents still say Redline; anything new uses Underline. "Redline" and "redlining" are not used in product copy.
- Red is reserved for the Dangerous severity and never used for the brand or chrome. A Clean verdict is never shown as success or approval. A quoted Source sentence is underlined, never filled. ADR 0006 holds the details and starting tokens.
- Voice: plain and confident. A Reading states what a sentence does without hedging. The product states only what the document says.
- Never claim a document is safe to sign, and never claim to perform like a lawyer. DoNotPay took an FTC order in February 2025 over that claim.
- All product copy is US English and is run through the humanizer skill before it is committed (CLAUDE.md).

## Evidence on Hand

- Market and user research: `research/summary.md` and the four agent reports in `research/`.
- The brief and its evidence tables: `PRD.md`.
- One first-person near-miss usable as an illustration: Varun Krishnan's pre-existing IP assignment clause (dev.to), quoted in the PRD.

Absent, and not to be fabricated:
- No customers, users, testimonials, reviews or case studies.
- No first-person account from a small business owner about any clause, including personal guarantees.
- No pricing and no demand-side willingness-to-pay figure.
- No benchmark or accuracy figure. The eval has not run.
- No verified competitor comparison.

## Product Principles

1. **Show the sentence.** Every claim the product makes can be checked against the Signer's own copy. A flag that cannot show its source is a bug, not a weaker result.
2. **Say only what the text says.** No guesses about the Counterparty, no invented dollar figures, nothing about documents that were not uploaded.
3. **Rank by personal reach.** Dangerous means exposure past the business to the Signer personally. Being unusual is not the same thing.
4. **A clean result is a real result.** When nothing is wrong, say so plainly and list what was checked. Never manufacture minor findings to look useful.
5. **Scarce alarms stay believable.** Over-flag only in the Dangerous tier, and keep its signal rare everywhere else, in copy and in color.

## Accessibility & Inclusion

The target is WCAG 2.2 AA for every surface, including the public landing page. Severity must never be conveyed by color alone; the severity label carries its meaning in text (ADR 0006).
