# 0002. v1 serves small business owners before they sign, and not renters

Status: Accepted. Date: 2026-09-16.

## Decision

The primary Signer for v1 is a small business owner or independent operator reviewing a document **before signing it**. The brief names renters, meaning anyone reviewing a Residential lease, as the segment v1 does not serve.

## Alternatives

- Freelancers as primary. Has the most Redline-shaped story, but only 28% of freelancers use a contract. Their harm is mostly clauses that are missing, which ADR 0001 cannot flag.
- Consumers or renters as primary. Largest reach and the most emotional evidence, but a Counter-offer means nothing on a contract nobody negotiates.
- Job seekers and creators. The documents are negotiable, but the evidence is thinner and the need comes up only once in a while.
- Excluding terms of service and consumer adhesion contracts instead of renters. This was the research's recommendation, and it was not taken.
- Serving people after a dispute, as well as or instead of before signing. That is where every harm story in the research sits, but a Counter-offer is worthless once the document is signed.

## Why

Small business owners have money at stake and a known substitute price ($1,000 to $3,000 for a commercial lease review), and 50% name contract review as their main legal need. Reviewing before signing is the only moment when a Counter-offer can change anything.

## Consequences

- Residential leases are out, while Commercial leases are the core. Live/work units and home-based businesses sit on that line, and the product has to decide which side of it they fall on.
- Terms of service and other adhesion contracts remain in the product line. Some clauses Redline flags will be ones the Signer cannot negotiate. The brief must say what Redline does with those (see the round-two decision).
- The emotional, after-the-fact stories in the research (the arbitration clause, the wedding-venue deposit) are not what v1 is built around. Marketing should not lead with them.
- The product line in CLAUDE.md ("contract, lease, freelance agreement or terms of service") should say "commercial lease" once the brief exists.
