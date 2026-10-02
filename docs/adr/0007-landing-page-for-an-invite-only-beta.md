# 0007. v1 adds a public landing page for an invite-only beta, with a one-time limit per Signer

Status: Accepted. Date: 2026-09-30.

## Decision

1. v1 has one public landing page at the site root.
2. Sign-up is invite-only. The owner hands out single-use invite codes, and each code creates one account.
3. Each Signer has a one-time limit of 5 analyses and 25 questions. Re-running analysis on a Draft counts as an analysis. The limit does not reset.
4. The page discloses that the extracted text is stored and sent through OpenRouter to a third-party model provider. It makes no promise about whether that provider retains the text.
5. The page carries a plain-language note on data handling and a line saying Underline is not legal advice. A formal privacy policy and terms of service come before any open sign-up.
6. v1 has no analytics.

## Alternatives

- **No landing page, sign-in only.** Cheapest, and consistent with the original scope list. Rejected because an invited owner would arrive at a login form with no statement of what the product claims or what happens to their contract.
- **Open public sign-up.** Widest feedback. Rejected because there is no billing, so every analysis anyone runs is paid for by the owner with no ceiling.
- **A waitlist that collects emails.** Rejected because it adds an email table and consent copy while letting nobody use the product.
- **An email allowlist instead of invite codes.** Rejected in favor of codes, which are easier to hand out during interviews. Codes can be forwarded; single use limits the damage to one account each.
- **A daily per-Signer limit, or only a credit limit on the OpenRouter key.** Rejected because a daily limit has no total ceiling, and a key limit fails for everyone at once when it runs out.
- **Route only to providers that promise no retention, and say so.** Rejected for v1 because Underline cannot verify that promise on each call, and the product's standing rule is to state only what it can back.
- **A formal privacy policy and terms before the page goes live.** Rejected for the invite-only beta because it likely needs a lawyer and the audience is small and known. Required before open sign-up.

## Why

CLAUDE.md excludes anything that does not make the analysis more trustworthy, and a landing page does not. It is added anyway because v1's purpose, proving the analysis can be trusted, needs real owners using it, and the research recommends starting with about twenty of them. Those owners need a page that states the claim honestly and tells them what happens to their document. Invite-only sign-up and a one-time limit keep model spend bounded while there is no billing.

## Consequences

- CLAUDE.md scope gains item 8 (the landing page) and item 9 (invite codes and the per-Signer limit), and its "excluded on purpose" paragraph names this exception.
- Tickets 16 (landing page), 17 (invite codes) and 18 (per-Signer limit) carry the work. Ticket 15 verifies all three after deploy.
- The landing page must not imply open access. Its sign-up path asks for an invite code.
- A Signer negotiating one deal through several Drafts can reach 5 analyses. In v1, raising a Signer's limit is a manual change in the database by the owner.
- The page's data note says the text goes to a third-party model provider and stops there. It never says the text is private from that provider.
- Opening sign-up later reopens this decision: it needs billing or a new spend control, and a formal privacy policy and terms.
- Without analytics, the beta learns from conversations with invited owners, not from traffic.
