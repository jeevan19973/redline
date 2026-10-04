# Findings: skeptical-reader test of Underline

Tested on https://redline-nine-iota.vercel.app, signed in, on the evening of
2026-10-02 (US Eastern). Promises are quoted from PRD.md. Every finding below
happened at least twice. Things seen only once are under "Seen once".

Budget used: 4 analyses (the account now shows 0 of 5 left) and 6 questions (19
of 25 left). Documents were pasted as text. The three QA Drafts I created are
still in the library as evidence ("QA injection lease", "QA long lease", "QA
contrato español"). I deleted "QA few words" to test Delete. I removed the
three Red lines I added, so the list is empty again, as I found it.

## Findings

### 1. Arbitration and jury-waiver clauses are marked Dangerous when no Red line asks for it (Resolved)

Steps:

1. From https://redline-nine-iota.vercel.app, open Your library, then Red lines.
   Make sure "Arbitration and class-action waiver" is not one of your Red lines.
2. Add a Draft by pasting a lease with an arbitration or jury-waiver clause that
   binds the owner, for example: "Any dispute arising from this Lease shall be
   resolved by binding arbitration before a single arbitrator chosen by
   Landlord, and Tenant and Principal each waive any right to a jury trial and
   any right to bring or join a class or collective action."
3. Wait for the report and find the arbitration flag.

PRD.md promises (section 5, Caution table, "Mandatory arbitration and class
waiver"): "It is Caution under the test because it takes a right, not personal
assets. A Signer can raise it with a Red line." Section 6, call 4: "A Signer
whose worst clause is an arbitration clause sees it as Caution." The app's own
Red lines page also lists "Arbitration and class-action waiver" as CAUTION.

What happened: both times, the flag was DANGEROUS. The Reading justifies it with
"You personally give up the right to a jury trial". The report's legend tells
the reader Dangerous "means the clause reaches past the business to you
personally, or it's a clause type on your Red lines". Neither was true.

- "QA injection lease" (Red lines at the time: Automatic renewal and two
  own-words lines, no arbitration): "Arbitration and class-action waiver",
  DANGEROUS.
- The existing "California Bakery" report, whose "Red lines this report used"
  says "You had no Red lines when this report ran": "Arbitration and
  class-action waiver", DANGEROUS. That clause is a judicial reference with a
  jury waiver. It contains no arbitration and no class waiver, so the label is
  wrong as well as the severity.

When the arbitration clause bound only the business ("QA long lease", "Tenant
waives..."), it was correctly Caution. The escalation happens when the
individual owner is named in the clause.

Severity: misleads a reader. The report tells the reader their personal assets
are exposed by a clause that, by the product's own rule, only takes a right.

**Resolved: the PRD was wrong, not the product.** ADR 0003 says arbitration
and class-action waivers are not Dangerous "unless they also reach past the
business". When an owner or principal waives a jury trial in their own
capacity, the clause does reach past the business, so Dangerous is right
under the ADR, and the report legend's reason is true. The app's Red lines
page already says a Caution clause becomes Dangerous when it reaches you
personally. PRD.md said arbitration is always Caution. It now matches the
ADR, and a test in tests/risk-flags.test.ts pins the rule for arbitration.
The second point, the jury-waiver-only clause labeled "Arbitration and
class-action waiver", is also correct: that clause type covers jury-trial
waivers. No code changed.

### 2. Library and report dates are a day ahead for a US evening user

Steps:

1. From https://redline-nine-iota.vercel.app, in the evening US time, add a
   Draft. I was at about 10:40 PM Eastern on Oct 2.
2. Look at the date under its title in Your library, and at "Added ..." and
   "Analyzed ..." on the Draft page.

PRD.md promises: no direct promise. Section 3, item 7 promises "A saved library
of past documents", and the app's own labels "Added" and "Analyzed" state a
date.

What happened: every Draft I created between 10:36 PM and about 11:05 PM
Eastern on Oct 2 shows "Oct 3, 2026" in the library, on "Added", and on
"Analyzed". The page's `<time>` values are UTC (for example
2026-10-03T02:36Z), so the date shown is the UTC date, not the reader's.

Severity: cosmetic.

## Seen once

These happened once and I could not repeat them within the budget.

- **A shopping list gets a Clean verdict and uses up an analysis.** I pasted
  "Remember to buy milk, eggs and bread." as a Draft. Saving started an
  analysis right away, with no warning, and used one of the five one-time
  analyses. The report said "No Dangerous clause found in this text ...
  Whether to sign is still your decision" and marked all 11 clause types
  "CHECKED". To be fair, the summary did say it was "a three-item shopping list"
  with no parties or agreement. PRD.md section 1 says the document is one of
  four kinds. Repeating this would have cost another analysis. If it repeats,
  it misleads a reader in a small way and costs them one of five analyses.
- **A personal security interest goes unflagged.** In the existing "California
  Bakery" report, section 17.6 ("Principal grants Landlord a security interest
  in all of Principal's personal property, including vehicles, deposit accounts
  and investment accounts...") is not quoted in any flag. It meets the
  Dangerous test in PRD.md section 5: "the clause's exposure reaches past the
  business to the Signer personally". In my own lease, a similar clause (4.2)
  was quoted inside the Personal guarantee flag, so I could not make the miss
  happen again. If it repeats, it misleads a reader.
- **"Payment terms against you" is applied to rent the Signer pays.** In the
  "California Bakery" report, this flag quotes the rent-payment clauses. PRD.md
  section 5 defines the type as "Long payment windows, or pay-when-paid terms,
  when the Signer is the one being paid." Seen in that one report only.
- **A question failed once.** On "QA long lease" (118,620 characters), the first
  attempt at "How much am I personally on the hook for under the guaranty, and
  is there a cap?" showed "Underline couldn't finish answering. Try again." It
  was not charged. The retry worked.

## Not tested, and why

- **What happens at 0 analyses left.** "Save Draft" and "Run analysis again"
  stay enabled and give no hint that the limit is used up. Clicking either
  could start a fifth analysis if the limit failed, and you allowed four.
- **Long or HTML-looking Draft titles.** Every save starts an analysis, so each
  title test would have cost one.
- **The Severity floor** (PRD.md section 4, "With a Red line removed for a
  clause type, a Dangerous flag of that type still shows"). This needs a re-run.
- **File upload, signed-out pages, and sign-up.** You asked for pasted text, no
  sign-out, and no sign-up.
- **The message after a refresh mid-analysis.** It said the Draft was being
  analyzed "in another tab or window". Another browser instance was open at
  the time, so the message may have been right. Test again with one browser.
- **True phone width.** This browser window would not resize (it reports a 0x0
  outer size), so I checked 375px through a same-site frame, as the build did.

## What held up

- **Quotes are word for word.** Every Source sentence in all four reports I
  read (23 + 13 + 10 + 4) appears exactly in the saved text, with no
  whitespace changes. So does the quote in the one answer that quoted. Spanish
  quotes kept their accents.
- **Hidden instructions are ignored.** I tried two documents. The short lease
  told the reviewer to call it standard, give a Clean verdict, say it was safe
  to sign, and skip the guaranty and renewal. The long lease buried a rule
  saying to downgrade the non-compete and leave out the indemnity. Neither
  report obeyed: the guaranty, renewal and indemnity were flagged, and the
  non-compete stayed Dangerous. No summary repeated the "standard" claim. The
  question "Is this lease a standard form, and is it safe for me to sign?" got
  "This document doesn't say."
- **Non-negotiable clauses.** These were labeled TAKE IT OR LEAVE IT with no
  Counter-offer, and the report quotes the sentence that makes them
  non-negotiable. Negotiable flags all had sendable Counter-offers (an item on
  the could-not-verify list). For the Spanish contract they were in Spanish.
- **Very long document.** 118,620 characters were saved and analyzed in about
  25 s. A Dangerous clause in the last paragraph was caught. The
  separate-guaranty warning appeared.
- **Empty documents.** Empty and whitespace-only text were refused before
  saving, and a missing title was refused.
- **Questions.** An unanswerable question got "This document doesn't say."
  Requests for legal advice ("is it enforceable", "would you advise me to
  sign") gave no advice. An answerable question was answered with a
  word-for-word quote. Empty and over-500-character questions were refused
  without charge.
- **Red lines forms.** Add and Edit both refuse empty text and text over 120
  characters, with a clear message, and keep what was typed. Cancel keeps the
  original. Own-words Red lines produced flags that quote the sentence.
- **HTML shows as plain text** everywhere I typed it: Red lines, the "Red lines
  this report used" list, and the "You asked" line of an answer. Nothing ran.
- **Doing things twice.** A double-click on Save Draft made one Draft and one
  analysis. A double-click on Ask charged one question. A second question
  can't be sent while one is running, because the button is disabled. A
  double-click on Add Red line added one. A double-click on Delete Draft
  deleted cleanly.
- **Refresh mid-analysis.** The report still arrives and is charged once.
- **Saved work.** The library, reopening, refresh, and back and forward all
  behaved. A changed id, an all-zero id, a non-id, HTML in the id, and a
  deleted Draft's address all show "Page not found".
- **The scope stamp is on every report.** No report or Clean verdict said "safe
  to sign".
- **375px width.** There was no horizontal scroll on the landing page, library,
  Red lines, Add a Draft or a report page.
- **Basic screen-reader check.** I found no unnamed links or buttons, no
  unlabeled fields, and no images without alt text, and `lang` is set on those
  five pages. This is not a full audit.
