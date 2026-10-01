# What Goes Wrong: Recurring Clause Types That Burn People

Research for Redline, an AI tool that reads a contract, lease, freelance agreement, or terms of service and ranks risky clauses by severity.

## Method

Searches run: 10 (of a 12 maximum). Pages fetched: 3 (of a 15 maximum). Stopped once nine distinct, sourced findings were collected, per the guardrail to stop early rather than pad the list.

Search areas covered: CFPB/FTC auto-renewal and negative-option enforcement, FTC click-to-cancel rule, Freelancers Union nonpayment surveys, tenant/legal-aid security deposit complaint data, CFPB arbitration and class-action-waiver study, law-firm "most litigated clauses" analysis, FTC non-compete rule record, CFPB junk-fee/late-fee data, unilateral terms-of-service amendment case law, and freelancer IP-assignment/work-for-hire disputes.

## Ranked Table

Ranking is by strength and directness of the frequency/harm evidence found, not by an independent count of raw complaints across sources (no single database covers all clause types). Where evidence is thin, that is stated explicitly rather than papered over.

| Rank | Clause type | Who it hits hardest | Evidence strength | Key number |
|---|---|---|---|---|
| 1 | Auto-renewal / negative option | Consumers (subscriptions, gyms, credit monitoring) | Strong: direct FTC rule + multiple CFPB/FTC enforcement actions | FTC rulemaking, ongoing enforcement waves (Uber, LA Fitness, ed-tech cases) |
| 2 | Non-compete clauses | Employees and small-business/solo entrepreneurs | Strong: FTC rulemaking record with worker testimony at scale | ~30 million workers (1 in 5 Americans) bound by non-competes; 26,000+ public comments |
| 3 | Late fees / penalty fees | Consumers, especially credit card holders | Strong: CFPB quantified national cost and proposed cap | $12 billion/year in credit card late fees; CFPB rule would have cut fees from $32 to $8 |
| 4 | Non-payment / late payment terms | Freelancers and independent contractors | Strong: large-scale union survey data, repeated across years | 60-62% of NY freelancers report never being paid for work performed; ~$15 billion/year lost industry-wide |
| 5 | Mandatory arbitration + class-action waivers | Consumers of financial products, broadly analogous elsewhere | Strong: dedicated 700-page CFPB empirical study | 160 million+ class members eligible for relief over 5 years studied; $2.7 billion in settlements consumers would have forfeited to arbitration |
| 6 | Security deposit / repair clauses in leases | Renters | Moderate: state-level complaint tallies, not national | 2,525 landlord-tenant complaints in Wisconsin alone in 2024 (largest single complaint category); ~$850,000 returned to tenants in one Milwaukee case |
| 7 | Indemnification and limitation-of-liability clauses | Small businesses and contractors in commercial agreements | Moderate: named by law firms as among the most litigated provisions, but no frequency counts found | Cited as top-5 litigated contract provisions category; drivers are drafting ambiguity and unclear interplay between the two clause types |
| 8 | Unilateral amendment ("we may change these terms") | Consumers and platform users | Moderate: settled case law shows courts routinely strike these, implying frequent disputes, but no complaint-volume data found | Ninth Circuit (Douglas v. Talk America, 2007) held unilateral changes unenforceable without direct notice and consent; described as "ubiquitous" across major platforms |
| 9 | IP assignment / work-for-hire clauses | Freelancers and independent contractors | Thin: one detailed anecdote plus general legal-guidance commentary, no aggregate statistics found | Single case example: $15,000 in legal fees to resolve an IP-ownership dispute after a "work for hire" clause was misapplied to a non-qualifying deliverable |

Fee escalators, kill fees, exclusivity, personal guarantees, and payment-terms clauses (beyond late payment, already covered under freelancer non-payment) were searched but did not turn up sourceable frequency or harm data distinct from the findings above; see "What I could not find."

## Findings in Detail

### 1. Auto-renewal / negative-option clauses
What it does: locks the customer into a recurring charge unless they take affirmative action to cancel, often with a cancellation process deliberately harder than sign-up.
Evidence: the FTC's 2024 "Click-to-Cancel" amended Negative Option Rule targeted exactly this pattern; even after the rule was vacated by the Eighth Circuit in July 2025 on procedural grounds, the FTC continued enforcement under ROSCA and the FTC Act, with recent actions against Uber, LA Fitness, and an education-technology provider for subscription cancellation practices. The CFPB separately brought actions against TransUnion (dark patterns causing consumers to unknowingly enrol in recurring credit-monitoring charges) and ACTIVE Network (undisclosed annual subscription enrollment).
Who it hits: consumers, especially in subscription services, gym memberships, and credit-monitoring products.
Sources: https://www.ftc.gov/business-guidance/blog/2024/10/click-cancel-ftcs-amended-negative-option-rule-what-it-means-your-business ; https://www.hklaw.com/en/insights/publications/2025/09/ftc-steps-up-subscription-enforcement-after-click-to-cancel-rule ; https://www.zwillgen.com/auto-renewal/cfpb-seeking-to-make-its-mark-on-subscription-and-auto-renewal-practices/

### 2. Non-compete clauses
What it does: restricts a worker's ability to take a new job or start a business in the same field for a period after leaving an employer.
Evidence: the FTC's 2024 rulemaking record (rule later blocked by a district court injunction) drew more than 26,000 public comments, over 25,000 in support of a ban, including "thousands" of individual worker accounts of being blocked from better jobs, better pay, or starting their own business. The FTC estimated roughly 30 million Americans, about one in five, were subject to non-competes, and projected the ban would have added $400-488 billion in worker earnings over a decade and enabled 8,500+ new businesses per year.
Who it hits: employees broadly, but the record also specifically documents harm to entrepreneurs and small businesses unable to hire knowledgeable workers or start new ventures.
Source: https://www.ftc.gov/news-events/news/press-releases/2024/04/ftc-announces-rule-banning-noncompetes

### 3. Late fees / penalty fee clauses
What it does: charges a fixed or escalating penalty for late payment, often far exceeding the issuer's actual cost of the delay.
Evidence: CFPB analysis found credit card companies charged approximately $12 billion in late fees in 2020, over 10% of all credit card interest and fees charged that year, and found issuer late-fee income ran roughly five times their actual collection costs. The CFPB's proposed rule would have cut the safe-harbor late fee from $32 to $8, an estimated $9-10 billion annual reduction in fees charged to consumers (the rule was later vacated by a Texas district court).
Who it hits: consumers, particularly revolving credit card holders.
Source: https://www.consumerfinance.gov/about-us/newsroom/cfpb-bans-excessive-credit-card-late-fees-lowers-typical-fee-from-32-to-8/ ; https://www.consumerfinance.gov/about-us/newsroom/cfpb-initiates-review-of-credit-card-company-penalty-policies-costing-consumers-12-billion-each-year/

### 4. Non-payment and late-payment terms (freelance contracts)
What it does: covers what happens (or does not happen) when a client fails to pay on time or at all; weak or absent payment-enforcement terms leave freelancers with little recourse.
Evidence: Freelancers Union survey data (with the Authors Guild and National Writers Union) found 60-62% of surveyed New York freelancers reported never being paid for work performed at some point. A separate, earlier Freelancers Union report found 71% of freelancers struggle to collect payment for work at least once in their career, with an estimated $15 billion lost annually to late and non-payment across the US freelance economy. Another 2022 report found 59% of freelancers were owed $50,000 or more by late-paying clients cumulatively.
Who it hits: freelancers and independent contractors.
Sources: https://blog.freelancersunion.org/2022/05/12/over-60-of-ny-freelancers-report-not-being-paid-for-work-performed/ ; https://authorsguild.org/news/survey-finds-62-percent-of-ny-freelance-workers-have-lost-wages-due-to-nonpayment/ ; https://blog.freelancersunion.org/2015/12/10/costs-nonpayment/ ; https://www.globenewswire.com/en/news-release/2022/02/17/2387268/0/en/New-Report-Finds-59-of-Freelancers-Are-Owed-50-000-or-More-by-Late-Paying-Clients.html

### 5. Mandatory arbitration and class-action waivers
What it does: forces disputes into individual, private arbitration and bars consumers from joining or bringing class actions, which are typically the only economically viable way to pursue small-dollar claims.
Evidence: the CFPB's dedicated study (mandated under Dodd-Frank Section 1028(a)) found very few consumers ever bring individual claims in court or arbitration, while class actions delivered relief to at least 160 million class members over the five-year period studied, with settlements totalling $2.7 billion in cash, in-kind relief, and fees, relief that arbitration clauses would have blocked class members from accessing. This evidence base led the CFPB to issue (later Congressionally overturned) a rule banning class-action waivers in consumer financial arbitration clauses.
Who it hits: consumers of financial products and services; the mechanism (blocking aggregation of small claims) generalizes to other consumer and gig-worker contracts, though the CFPB study itself is financial-services specific.
Source: https://www.consumerfinance.gov/about-us/newsroom/cfpb-study-finds-that-arbitration-agreements-limit-relief-for-consumers/

### 6. Security deposit and repair clauses in leases
What it does: governs when and how much of a tenant's deposit is withheld, and who is responsible for repairs and maintenance during the tenancy.
Evidence: Wisconsin's DATCP recorded 2,525 landlord-tenant complaints in 2024, the single largest consumer complaint category in the state that year (ahead of telemarketing, home improvement, and identity theft), explicitly citing "failure to maintain the premises, security deposit returns, unauthorized entry, mold and infestation" as the primary disputes. One enforcement action against a single Milwaukee landlord (Berrada Properties Management) returned roughly $850,000 to tenants for landlord-tenant law violations. This is state-level, not national, data; it is the best hard count found in the time available.
Who it hits: renters.
Source: https://www.yahoo.com/news/did-wisconsin-consumers-complain-most-205903017.html

### 7. Indemnification and limitation-of-liability clauses
What it does: indemnification shifts responsibility for third-party claims or losses onto one party; limitation-of-liability caps the maximum damages a party can be forced to pay, regardless of actual harm.
Evidence: legal-industry commentary (Gleam Law) names indemnification and liability-limitation clauses among the most litigated contract provisions generally, alongside ambiguous/vague terms, force majeure, and non-compete/non-disclosure clauses. The recurring driver identified is poor drafting: caps and indemnification obligations that are not clearly reconciled with each other, so the two clauses contradict one another and disputes end up turning on close textual interpretation rather than on the underlying facts. No source found quantifies litigation frequency or dollar exposure; this finding rests on legal-practice commentary rather than a complaint database or study.
Who it hits: small businesses and contractors in commercial/service agreements, and professional-services firms pushed to accept one-sided indemnification in engagement letters.
Source: https://www.gleamlaw.com/blog/business-law/exploring-the-5-most-litigated-contract-provisions/

### 8. Unilateral amendment clauses ("we may change these terms at any time")
What it does: lets one party (almost always the drafting company) change the contract's terms after signing, sometimes retroactively and without direct notice.
Evidence: legal commentary describes these clauses as "ubiquitous," appearing in the terms of major platforms including Facebook, Twitter/X, Instagram, and Google. Case law has repeatedly curtailed them: in Douglas v. Talk America (9th Cir. 2007), the court held a company cannot unilaterally modify terms and enforce the change against existing users without direct notice and consent; other courts have held that a clause letting a company change terms "at any time" for any reason is an illusory promise unenforceable under contract law in some states. Commentary also notes that while these changes generate frequent consumer complaints, actual litigation over them remains comparatively rare, likely because individual stakes are small and arbitration/class-waiver clauses (finding 5) often sit alongside them, blocking aggregation.
Who it hits: consumers and platform/service users broadly.
Sources: https://ccbjournal.com/articles/unilaterally-amended-terms-of-service-agreements-put-customers-in-a-bind ; https://www.lexology.com/library/detail.aspx?g=e79c3c06-ec1e-4040-934f-b0fb21d54eb0

### 9. IP assignment / work-for-hire clauses (thin evidence, flagged as low confidence)
What it does: assigns ownership of work product, and sometimes pre-existing tools or frameworks used on the job, to the hiring party.
Evidence: this is the weakest-sourced finding in this report. Practitioner commentary notes that most freelance deliverables (custom websites, marketing strategy, software, design) do not legally qualify as statutory "work made for hire," so a "work for hire" clause in these contracts may be unenforceable, yet signing it still creates disputes because clients act as though it is binding. One detailed but singular anecdote describes a developer whose IP-assignment clause was read to cover a pre-existing proprietary framework, costing $15,000 in legal fees to resolve. No aggregate complaint counts, survey data, or enforcement statistics were found for this clause type in the time available. It is included because the mechanism (scope creep from a boilerplate assignment clause into pre-existing IP) recurs across the freelancer-contract commentary reviewed, not because frequency is established.
Who it hits: freelancers and independent contractors, particularly in software and creative work.
Source: https://clauseshield.app/blog/ip-ownership-clauses-freelancers

## What I Could Not Find

- No single cross-clause-type complaint database (CFPB Consumer Complaint Database, BBB, state AG dashboards) was queried in a way that produced a directly comparable count across all 14+ candidate clause types; the ranking above is a synthesis across differently-shaped evidence (federal rulemaking records, union surveys, one state's complaint tallies, legal commentary), not a single apples-to-apples count. This is a real limitation of the ranking, not just a caveat.
- Fee escalator clauses (contracts that let a vendor raise recurring fees over time) turned up no dedicated complaint or study data distinct from the general late-fee/junk-fee findings above.
- Kill fee clauses (freelance/creative industry cancellation fees) turned up no aggregate complaint or dispute-frequency data in the searches run.
- Exclusivity clauses turned up no aggregate consumer or small-business complaint data in the searches run.
- Personal guarantee clauses in commercial leases: search results returned individual BBB complaints against lease-guaranty insurance companies (e.g., TheGuarantors, Anchor Your Assets), which are a different product (third-party guaranty insurance) from a personal guarantee clause inside a lease itself, and do not establish frequency of personal-guarantee disputes generally. Dropped from the ranked table for lack of on-point evidence.
- Payment terms clauses (beyond the freelancer non-payment angle already covered) were not separately evidenced.
- No BBB-specific aggregate complaint-category breakdown (national, by clause type) was fetched; BBB summaries found were company-specific rather than clause-type-specific.
- State AG consumer alerts were not directly queried beyond the Wisconsin DATCP result; a multi-state comparison was out of scope given the search budget.
- Academic studies specifically quantifying "which clause type causes the most contract disputes" (as opposed to studies of a single clause type, like the CFPB arbitration study) were not located.
