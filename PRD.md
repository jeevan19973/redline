# Redline: brief for v1

Status: Draft. Date: 2026-09-16. Decisions behind this brief: `docs/adr/0001` to `0005`. Terms in **bold** are defined in `CONTEXT.md`.

Amended 2026-09-30. The product is now called Underline (ADR 0006). v1 also has a public landing page for an invite-only beta, with single-use invite codes and a one-time limit of 5 analyses and 25 questions per Signer (ADR 0007). Section 3 below still lists the original seven items; CLAUDE.md holds the current scope.

## 1. Who this is for

**A small business owner or independent operator, before they sign.** The document is one of four kinds: a **Commercial lease**, a vendor or service contract, a freelance agreement they are signing as the contractor, or a vendor's terms of service. They are the **Signer**. The other side is the **Counterparty**.

Not the primary user: renters, consumers, employees and people already in a dispute. See section 6.

### What they do today instead

- **Pay a lawyer, or skip help.** Flat-fee review of a commercial lease costs $1,000 to $3,000 ([inkvex.app](https://inkvex.app/blog/how-much-does-a-lawyer-cost-to-review-a-contract)). 67% of small business owners who did not seek legal help named worry about the cost as the reason ([California Bar justice gap study](https://publications.calbar.ca.gov/justice-gap-study/small-businesses-owners)).
- **Handle it themselves or do nothing.** Among small businesses with a legal issue, only a quarter used professional help. Roughly half resolved it themselves or took no action ([Legal Services Board](https://legalservicesboard.org.uk/news/new-research-reveals-the-legal-struggles-facing-small-businesses-lsb-calls-on-the-government-for-a-legal-support-strategy)). This is a UK study.
- **Paste the contract into a general chatbot.** 58% of surveyed in-house lawyers already use AI for a first-pass review. The research has no figure for small business owners doing the same. The chatbot is Redline's real substitute, and it costs nothing.

So Redline competes with doing nothing and with a free chatbot, not with the lawyer. The research's evidence that cost leads people to skip help rather than look for something cheaper applies to Redline too.

## 2. The problem

A clause in a document the Signer can still negotiate reaches past this deal and takes something that belongs to the Signer personally. It sits in boilerplate, and nobody points it out.

The clearest case in the research is a freelance software contractor who found this in a client contract before signing:

> "anything I brought into the project including tools, libraries, and code I'd written before the engagement would become the exclusive property of the client upon completion."
>
> Varun Krishnan, [dev.to](https://dev.to/not_varunkv/the-contract-clause-that-almost-cost-me-my-entire-codebase-j9d)

He pushed back, and walked away when the client treated the objection as unreasonable. It was a near-miss, caught only because he read carefully.

**Where the evidence stops.** The research has **no first-person account from a small business owner** about any clause. It searched for owners who lost a home or savings to a personal guarantee in a commercial lease and found only law firm explainers. The segment this brief chose, and the clause it ranks most dangerous, are both unsupported by direct evidence. What does exist is aggregate: 85% of small business owners with an unmet legal need took a financial hit, and nearly one in five lost over $5,000 to preventable legal issues in a year ([California Bar](https://publications.calbar.ca.gov/justice-gap-study/small-businesses-owners), [LegalShield](https://www.legalshield.com/press-releases/legal-pitfalls-dent-small-business-owners-bottom-line)).

## 3. What v1 does

1. **Upload and parse in the browser.** Only the extracted text is stored, never the original file. Scanned documents are not supported.
2. **Plain-English summary** of what the document says, containing only claims the text supports.
3. **Risk flags ranked by severity.** Each **Risk flag** has:
   - one or more **Source sentences**, quoted verbatim and checked against the stored text before the flag is shown;
   - a **Reading**: a plain, confident statement of what the sentence does to the Signer, with no hedging language. If a sentence can honestly be read two ways, the Reading gives both;
   - a severity, either **Dangerous** or **Caution** (section 5);
   - a **Confidence** of high, medium or low. Confidence never changes severity.
4. **A Counter-offer for each flagged clause, except Non-negotiable clauses.** A **Non-negotiable clause** is flagged at its true severity and labeled take-it-or-leave-it: sign or walk away. Whether a clause is negotiable must rest on the document's text, not on guesses about the Counterparty.
5. **A question box answered only from the document.** If the document does not answer the question, the reply says so.
6. **The Signer's Red lines.** An editable list that can add flags or raise a Caution flag to Dangerous. It cannot suppress or lower a Dangerous flag (the **Severity floor**).
7. **A saved library of past documents.** Every upload is its own **Draft**, and Drafts are not linked to each other.

Every report also carries these two things:

- **A scope stamp.** It says the report covers only this exact text, that any revision from the Counterparty must be uploaded again, and that documents not uploaded, such as a separate guaranty, were not checked.
- **A Clean verdict** when there is no Dangerous flag and nothing crosses a Red line. The verdict says so plainly and lists every clause type from section 5 that was checked. It never says "safe to sign", and it never adds minor flags to look useful.

## 4. What good looks like

These are measured on a labeled fixture set of real documents covering all four document types. The fixture set includes:

- documents with no Dangerous clause;
- documents with known Dangerous clauses;
- at least one commercial lease that refers to a separate guaranty;
- at least one vendor terms of service containing Non-negotiable clauses.

**Not yet decided: who labels the fixtures.** Every target below depends on those labels. They must come from someone qualified to read a commercial lease, not from the model and not from this brief's author alone.

The pass/fail checks run on every change. The measured targets are my proposals: agree them before the first eval run, not after.

### Pass/fail

| Check | Pass |
|---|---|
| Citation integrity | 100% of displayed Risk flags have every Source sentence present verbatim in the stored text. A near-match fails. |
| Dangerous recall | Zero Dangerous clauses in the fixtures missed or ranked below Dangerous. |
| Severity floor | With a Red line removed for a clause type, a Dangerous flag of that type still shows. |
| Non-negotiable handling | Zero Counter-offers attached to a flag labeled Non-negotiable. |
| Question box | For fixture questions the document cannot answer, 100% of replies say the document does not say. None invent an answer. |
| Clean verdict wording | No report contains "safe to sign" or an equivalent. Every Clean verdict lists what was checked. |
| Guaranty gap | No report on a lease that refers to a separate guaranty implies that the Signer's personal exposure was checked. |
| Scope stamp | Present on every report. |

### Measured (targets proposed)

| Measure | Proposed target | Why it matters |
|---|---|---|
| Clean verdict rate on clean fixtures | At least 8 in 10 get a Clean verdict | Over-flagging in the Dangerous tier is allowed, but not to the point where clean documents never come back clean. |
| Caution precision | At least 80% of Caution flags judged fair by the labeller | Below Dangerous, a miss is preferred to a false alarm. |
| Confidence calibration | High Readings correct at least 90% of the time, and accuracy falls from high to medium to low | If this fails, Confidence labels are not shown. A miscalibrated label is decoration. |
| Counter-offer usefulness | At least 80% judged by the labeller to address the flagged risk and be sendable as written | A Counter-offer that can't be sent teaches the Signer to ignore all of them. |

## 5. My red lines

These are Redline's default Red lines and the fixed list a Clean verdict reports as checked. A Signer's own Red lines add to this list or raise severity. They never lower a Dangerous flag.

**The test for Dangerous:** the clause's exposure reaches past the business to the Signer personally, or to property they owned before the deal. Being unusual does not make a clause Dangerous. Everything else flagged is **Caution**.

Any clause below gets a Counter-offer unless it is a Non-negotiable clause.

### Dangerous

| Clause | Why it matters | Evidence |
|---|---|---|
| **Personal guarantee** | The owner's home and savings back the business's obligations for the life of the lease. This is the purest case of the test. | **None in the research.** Searched for and dropped for lack of on-point evidence. Flagged because of the test, not because of data. |
| **Assignment of pre-existing IP** | Tools, code or work the Signer owned before the deal pass to the Counterparty with one signature. | Krishnan (section 2), plus one $15,000 legal-fee anecdote ([clauseshield.app](https://clauseshield.app/blog/ip-ownership-clauses-freelancers)). Thin; the research marks it low confidence. |
| **Uncapped indemnity signed personally** | Unlimited liability for the Counterparty's losses. Dangerous when the indemnifying party is the individual, or when the individual has also guaranteed the business. Otherwise it is Caution. | Named among the most-litigated contract provisions ([Gleam Law](https://www.gleamlaw.com/blog/business-law/exploring-the-5-most-litigated-contract-provisions/)). No frequency data. |
| **Non-compete binding the individual** | Stops the person, not just this business, from working or starting a business in their field. | FTC record: about 30 million workers bound, with testimony that it blocked people starting businesses ([FTC](https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-announces-rule-banning-noncompetes)). The evidence is about employees; applying it to owners is an analogy. |

### Caution

| Clause | Why it matters | Evidence |
|---|---|---|
| **Auto-renewal** | Locks the business into another term unless it cancels within a window it will likely miss. | FTC and CFPB enforcement ([FTC](https://www.ftc.gov/business-guidance/blog/2024/10/click-cancel-ftcs-amended-negative-option-rule-what-it-means-your-business)). Consumer evidence. |
| **Payment terms against the Signer** | Long payment windows, or pay-when-paid terms, when the Signer is the one being paid. | 60 to 62% of New York freelancers report not being paid at some point ([Freelancers Union](https://blog.freelancersunion.org/2022/05/12/over-60-of-ny-freelancers-report-not-being-paid-for-work-performed/)). |
| **Late fees and penalties charged to the Signer** | Penalties set far above the Counterparty's real cost. | Card issuers' late-fee income is about five times their collection cost ([CFPB](https://www.consumerfinance.gov/about-us/newsroom/cfpb-initiates-review-of-credit-card-company-penalty-policies-costing-consumers-12-billion-each-year/)). Consumer evidence. |
| **Mandatory arbitration and class waiver** | Gives up court, and the ability to join others with the same claim. It is Caution under the test because it takes a right, not personal assets. A Signer can raise it with a Red line. | CFPB study: $2.7B in relief would have been blocked ([CFPB](https://www.consumerfinance.gov/about-us/newsroom/cfpb-study-finds-that-arbitration-agreements-limit-relief-for-consumers/)). Consumer finance evidence. |
| **Limitation of liability capping the Counterparty** | The Counterparty's failure can cost the Signer more than they can recover. | Same as indemnity, and often inconsistent with the indemnity clause in the same document. |
| **Unilateral amendment** | The Counterparty can change terms after signing. | Described as ubiquitous and repeatedly limited by courts, e.g. *Douglas v. Talk America* (9th Cir. 2007). No volume data. |
| **Security deposit and repair obligations** | The business pays for repairs or loses the deposit on terms the landlord controls. | Wisconsin complaint data ([source](https://www.yahoo.com/news/did-wisconsin-consumers-complain-most-205903017.html)). Residential evidence, applied to commercial leases by analogy. |

**Within a severity level**, flags appear in document order. This ordering is a placeholder and can change.

## 6. The calls I made and what I gave up

| # | Chose | Chose against | Who is worse off |
|---|---|---|---|
| 1 | Small business owners as the primary Signer | Freelancers, consumers, renters, job seekers | Freelancers, whose harm is mostly missing clauses that v1 cannot flag. Consumers, who have the most vivid stories in the research. |
| 2 | Renters named as not served. Terms of service kept. | Dropping terms of service, as the research recommended | Renters, including a home-based business on a residential lease. Signers of vendor terms of service get flags they cannot act on. |
| 3 | Before signing | After a dispute, or both | People already hurt and searching for help, who are every harm story in the research (Perz, the wedding-venue families). |
| 4 | Dangerous means reach past the business | Rights you can't get back, dollar exposure, deviation from market | A Signer whose worst clause is an arbitration clause sees it as Caution. |
| 5 | Severity floor | Red lines fully override, or override but show muted | An experienced owner who knowingly accepts a guarantee sees it flagged Dangerous on every lease. |
| 6 | Non-negotiable clauses flagged, no Counter-offer | Counter-offer anyway, lower the severity, drop terms of service | A Signer reviewing vendor terms gets only "sign or walk". The promise of a Counter-offer for every flag is gone. |
| 7 | Over-flag in the Dangerous tier, prefer misses below it | Over-flag everywhere, or prefer misses everywhere | A Signer with a harmful Caution clause Redline missed. A Signer who hits a false Dangerous alarm and worries unnecessarily. |
| 8 | Confident Reading, separate Confidence, separate severity | Hedged language, Confidence that lowers severity, always confident, hiding uncertain flags | The Signer, who has to hold two labels at once. The build, which cannot show Confidence until it passes calibration. |
| 9 | A Clean verdict with a list of what was checked | Always surface minor notes, summary with no verdict | A Signer who uploads and gets "nothing Dangerous found", and may lean on it harder than the scope stamp allows. |
| 10 | Draft comparison is a named gap | Linking Drafts and showing which flags changed | A Signer who signs a revised Draft without uploading it again, after the Counterparty quietly changed another clause. |

## 7. What we are not building, and why

| Not building | Why |
|---|---|
| OCR for scanned documents | A citation is worthless if the text it points at was misread (ADR 0001). |
| Payments and billing | They don't make the analysis more trustworthy, which is what v1 exists to prove. The research has no willingness-to-pay figure to price against anyway. |
| Sharing a document between users | Does not make the analysis more trustworthy. |
| Omission detection (flagging protections that are missing) | A Risk flag must cite a sentence, and a missing clause has none (ADR 0001). This is the research's main freelancer finding, and the research recommended making it a headline feature. Freelancers bear the cost. |
| Draft comparison | Outside scope. The scope stamp is the only defense (ADR 0005). |
| Analyzing documents that were not uploaded, such as a separate guaranty | Redline states only what the uploaded text says. The scope stamp and the guaranty-gap check cover this. |
| Handling for residential leases | Renters are not served. v1 does not detect or refuse residential leases, and is neither designed nor tested for them. |
| Help after a dispute | v1 is for before signing. Explaining what someone has already agreed to, mid-dispute, is closer to legal advice. |
| Any statement that a document is safe to sign | A Clean verdict describes the text, and is not advice. DoNotPay took an FTC order in February 2025 over claims that it performed like a lawyer. |

## 8. What the research could not tell us

- **Whether personal guarantees actually hurt small business owners, and how often.** The Dangerous tier's flagship clause has no evidence behind it.
- **Whether small business owners will stop to review a document before signing.** The only behavioral evidence is about consumers: 91% accept terms without reading them. Nothing covers business documents, where the stakes are higher.
- **What anyone would pay.** Every price in the research is on the supply side. The demand-side evidence points the other way: cost pushes owners toward doing nothing, not toward cheaper help.
- **What real commercial leases and vendor contracts contain,** or how often each clause type in section 5 appears. The ranking mixes federal rulemaking, union surveys, one state's complaints and legal commentary. Most of that evidence is about consumers or employees, applied to owners by analogy.
- **Whether competitors already show the exact source sentence.** This was inferred from marketing copy, so it is unverified that citations set Redline apart.
- **Anything first-person from online communities.** Reddit was unreachable, so the pain evidence leans on news coverage and vendor blogs.

The research's own recommendation would answer the first three before any build: twenty conversations with small business owners who signed a commercial lease in the last year, covering what they did, what it cost, and what they would have paid to do it differently.
