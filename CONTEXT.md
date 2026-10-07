# Underline

Underline reads a contract before someone signs it and tells them what it says and what it costs them. This glossary fixes the words the brief, the code and the prompts use for that.

## People

**Signer**:
A person about to sign a document who uses Underline to review it, from reading the landing page through uploading and acting on the report. In v1, a small business owner or independent operator in the US.
_Avoid_: User (too broad), customer, client, consumer

**Counterparty**:
The other side of the document: the landlord, vendor or client who wrote it or sent it.
_Avoid_: Other party, drafter, them

## Documents

**Commercial lease**:
A lease for premises the Signer occupies to run a business. In scope for v1.
_Avoid_: Lease (ambiguous), business lease

**Residential lease**:
A lease for a home. Out of scope for v1, even when the tenant also works from it.
_Avoid_: Lease, rental agreement

## Analysis

**Risk flag**:
A single finding about the document, ranked by severity and tied to at least one Source sentence.
_Avoid_: Issue, warning, red flag, finding

**Source sentence**:
The exact sentence, quoted verbatim from the extracted text, that a Risk flag rests on.
_Avoid_: Citation (acceptable in prose), quote, reference, excerpt

**Dangerous**:
The top severity tier. A clause is Dangerous when its exposure reaches past the business to the Signer personally, or to property they owned before the deal.
_Avoid_: Critical, high risk, severe, unusual (unusual is not the same thing)

**Caution**:
The severity for every Risk flag that is not Dangerous.
_Avoid_: Warning, medium, low risk, minor

**Severity floor**:
The rule that a Dangerous Risk flag always shows, whatever the Signer's Red lines say.
_Avoid_: Override, minimum severity

**Non-negotiable clause**:
A clause the Counterparty will not change, typically in standard terms of service. It is flagged at its true severity but gets no Counter-offer.
_Avoid_: Boilerplate (boilerplate is often negotiable), fixed term

**Reading**:
Underline's plain, confident statement of what a Source sentence does to the Signer. Every Risk flag has one Reading, or two when the sentence honestly supports two different readings, such as deliberately ambiguous wording. A flag also has one severity and one Confidence, whatever its number of Readings.
_Avoid_: Interpretation, explanation, analysis

**Confidence**:
A high, medium or low label on a Risk flag saying how sure Underline is that its Readings are what the Source sentence means. Separate from severity, and it never lowers it.
_Avoid_: Certainty, probability, score

**Clean verdict**:
The result for a document with no Dangerous flag and nothing crossing a Red line. It states that plainly and lists what was checked.
_Avoid_: Safe, approved, all clear, no issues

**Draft**:
One version of a document during negotiation. Each upload is analyzed as its own Draft, and a report covers only that Draft's exact text.
_Avoid_: Version, revision, copy

**Counter-offer**:
Replacement wording for a flagged clause that the Signer can send to the Counterparty.
_Avoid_: Redline, redlining (the industry verb for marking up a contract; this project does not use it), suggestion, rewrite

**Red line**:
A term the Signer has said they will not accept. Red lines are the Signer's own and drive the analysis.
_Avoid_: Dealbreaker, preference, rule
