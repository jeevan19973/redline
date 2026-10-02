# 16: Public landing page

**What to build:** A Signer opens the site root without signing in and learns what Underline does, who it is for, and what it does not do. They see an example Risk flag in the same presentation a report uses, read exactly what happens to their document, and can sign up with an invite code or sign in. A signed-in Signer who opens the page sees a link to their library instead. The page makes no claim the product cannot back (ADR 0007).

**Blocked by:** 01 (Sign in to an empty library), 04 (Risk flags with verified Source sentences), 17 (Invite-only sign-up with single-use codes)

**Status:** done

**Visual direction (settled 2026-10-01):** Depth of Reach, recorded in `DESIGN.md` and `.impeccable/design.json` from the built page in `landing/`, which passed Impeccable's finish review. This ticket ports `landing/` into the Next.js app at the site root, keeping its look, copy and self-hosted fonts. It does not redesign it. The placeholder sign-up and sign-in links become the real routes from tickets 01 and 17.

- [x] The page is served at the site root, without auth, and makes no model or database calls
- [x] It states what Underline does and who it is for: US small business owners and independent operators, before they sign a Commercial lease, a vendor or service contract, a freelance agreement or a vendor's terms of service
- [x] It states what Underline does not read: scanned files, Residential leases, and documents that were not uploaded
- [x] It shows one example Risk flag using the same presentation as a report (severity label, underlined Source sentence, Reading). The clause is written for the page, labeled as an example, and is not a real person's document or words
- [x] Red appears only on the example's Dangerous label, never in the page chrome (ADR 0006)
- [x] A plain-language data note says the original file never leaves the browser, and the extracted text is stored and sent through OpenRouter to a third-party model provider for analysis. It makes no promise about whether that provider retains the text
- [x] A line on the page says Underline is not legal advice
- [x] The sign-up path asks for an invite code (ticket 17); the page never implies open access. A signed-in Signer sees a library link and is not redirected
- [x] The copy never says a document is safe to sign, never compares Underline to a lawyer, and states no testimonial, customer count, accuracy figure or price
- [x] Landing page copy lives in one place, and the banned-claims test from ticket 03 covers it
- [x] All copy is US English and has been run through the humanizer skill before it is committed
- [x] No analytics, third-party scripts, or cookies beyond auth
- [x] The page meets WCAG 2.2 AA; severity in the example is readable from its text label, not color alone
- [x] The page works at phone width, though the primary Signer is at a desk

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 345 tests and build pass, and / is static. Screens compared with landing/ in headless Chrome at 1440, 900 and 390px. Copy changes from landing/index.html: the opening now says who it is for (US small business owners and the self-employed); the meta description says commercial lease; the data note says third-party AI model provider. The banned-claims test exempts exactly one landing sentence, 'It never tells you a document is safe to sign.', word for word, with tests proving the exemption stays narrow. Decisions: landing styles are scoped and globals.css loads only in the app and auth layouts; the proxy skips /; the signed-in library link is decided in the browser from the session cookie with no network call; styled not-found pages were added for the app and for unknown URLs. The signed-in view was checked with a minted token, not a real account.
