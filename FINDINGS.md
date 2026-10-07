# Findings: skeptical-reader test of Underline

Tested on https://redline-nine-iota.vercel.app, signed in, on the evening of
2026-10-02 (US Eastern). Promises are quoted from PRD.md. Every finding below
happened at least twice. Things seen only once are under "Seen once".

Budget used: 4 analyses (the account now shows 0 of 5 left) and 6 questions (19
of 25 left). Documents were pasted as text. The three QA Drafts I created are
still in the library as evidence ("QA injection lease", "QA long lease", "QA
contrato español"). I deleted "QA few words" to test Delete. I removed the
three Red lines I added, so the list is empty again, as I found it.

A second pass ran on 2026-10-04, on production after PRs #4 and #5, to test
what the first pass left untested. The analysis limit had been raised to 20.
It used 7 analyses (12 of 20 used after it, plus two failed runs that were
not charged) and 5 questions (14 of 25 left). Its Drafts are still in the library:
"QA severity floor", the HTML-looking title, the long "QA long title AAAA..."
and "california-commercial-lease.docx". The arbitration Red line it added was
removed again.

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

### 2. Library and report dates are a day ahead for a US evening user (Resolved)

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

**Resolved.** Dates in the library, on "Added" and on "Analyzed" are now
shown in the reader's own time zone, which the browser supplies. The server
still renders the UTC date, and the browser replaces it as the page loads.

### 3. Caution clauses are marked Dangerous when the text doesn't say who the Tenant is (Resolved, no change)

Steps:

1. Make sure you have no Red lines.
2. Add a Draft by pasting a lease that names no parties, for example: "Tenant
   shall pay a late charge of 10 percent of any rent not paid within five days
   of its due date. This Lease renews automatically for successive one-year
   terms unless Tenant gives notice at least 180 days before the end of the
   term."
3. Wait for the report.

PRD.md and ADR 0003 promise that late fees and automatic renewal are Caution
unless the clause reaches past the business to the Signer personally. The
report's own legend says "Caution means the cost stays with the business."

What happened: both times, every flag was DANGEROUS, with no Red line raising
it.

- The HTML-looking title Draft (late fee only): "Late fees and penalties",
  DANGEROUS.
- "QA long title AAAA..." (late fee and renewal): "Late fees and penalties"
  and "Automatic renewal", both DANGEROUS.

The stored reports show the model set reachesSignerPersonally to true for each
flag, so the code made them Dangerous. Nothing in the text says the Tenant is
an individual. When the parties were named as companies ("QA severity floor",
"Northwind Bakery LLC"), the same kind of clause stayed Caution, and in the
California lease the late fee was Caution too. The Readings also address the
reader as the Tenant ("If you do not pay the rent...").

Severity: misleads a reader. A short excerpt, or a lease where the Tenant is
not named, shows every cost clause as reaching the reader personally.

Open question for the owner: when the Signer is an individual Tenant, such as
a sole proprietor, every clause arguably reaches them personally. The fix
depends on whether an unnamed or individual Tenant should count.

**Resolved, no change (owner, Oct 4).** The current approach stands: when the
text doesn't show that only a business is bound, the model may treat the
Tenant as an individual, and a clause that binds an individual reaches the
Signer personally. This fits the error bias in ADR 0004, which prefers a false
alarm to a missed Dangerous clause.

### 4. "Payment terms against you" is applied to payments the Signer makes

Steps:

1. Add the California lease (samples/california-commercial-lease.docx) as a
   Draft, by file or by pasting its text.
2. Find the "Payment terms against you" flag.

PRD.md promises (section 5, Caution table, "Payment terms against the
Signer"): "Long payment windows, or pay-when-paid terms, when the Signer is the
one being paid."

What happened: both times, the flag quoted payments the Signer makes, not
payments made to the Signer.

- "California Bakery" (first pass): the flag quotes the rent-payment clauses.
- "california-commercial-lease.docx" (second pass): the flag quotes 5.4, the
  monthly estimate of Operating Expenses the Tenant pays and the year-end
  shortfall.

Severity: misleads a reader in a small way. The flag is Caution, but it names
a risk the PRD defines for the opposite side of the payment.

**Under review, no change yet (owner, Oct 4).** The owner's view is that the
risk runs both ways: terms that favor the payer when the Signer is paid, and
serious constraints on the Signer when the Signer pays. The catalog already
covers both directions; the PRD covers only the first. Read that way, both
quoted clauses may be fair flags (5.4 lets the Landlord revise its estimate at
any time; the Bakery rent clause bars deduction and offset). The plan is to
align the PRD with the two-way definition and to tell the model that an
ordinary duty to pay on a schedule is not a flag by itself. See the plan in
the PR for this branch.

### 5. At 0 analyses left, the buttons stay enabled and the message offers no way to get more

Steps:

1. Use up your analyses, so the rail says "0 of 5 analyses left".
2. Add a Draft and click Save Draft. Or open a Draft and click "Run analysis
   again".

PRD.md promises (via ADR 0007) a one-time limit per Signer. It makes no
promise about how the limit is shown.

What happened: both buttons stay enabled. Clicking either shows an inline box:
"You've reached your limit of 5 analyses, so Underline can't run another. Your
Drafts and reports are still here. The person who invited you can raise your
limit." Nothing was stored or charged, and the existing report stayed. The
message doesn't say how to reach the person who invited you.

Severity: cosmetic, but a dead end for a reader who wants more analyses.

Decision (owner, Oct 4): when a Signer at the limit clicks either button, show
a toast that says their analyses are used up and that they can email Jeevan
Surya at jeevansuryamaddu@gmail.com for more. Paying for more comes later.

**Resolved.** At the limit, Save Draft and "Run analysis again" now show a
toast: "You've used all 5 analyses. To get more, email Jeevan Surya at
jeevansuryamaddu@gmail.com. Your Drafts and reports are still here." It stays
until closed (Close or Escape) and replaces the inline message. The question
limit message is unchanged.

### 6. An analysis fails when the model returns a flag with no Reading or more than two

Steps:

1. Open "california-commercial-lease.docx" in the library.
2. Click "Run analysis again" several times, waiting for each to finish.

PRD.md promises (section 4) that the analysis can be trusted, and the app
promises a report for every saved Draft.

What happened: 2 of 5 runs on Oct 4 showed "Underline couldn't finish
analyzing this Draft." Both logs say "The model's output was malformed:
riskFlags[N].readings must hold one or two Readings" (once flag 7, once flag
0). Neither was charged, and the next run worked. The other 3 runs gave 9, 10
and 11 flags.

Cause: the JSON schema sent to the model (lib/analysis/prompt.ts, `readings`)
asks for one or two Readings only in its description, with no `minItems` or
`maxItems`. The parser (lib/analysis/parse.ts) requires one or two and rejects
the whole analysis when one flag breaks the rule.

Severity: a failed run. Nothing wrong is shown and nothing is charged, but a
long lease fails often enough that a Signer will see it.

**Resolved.** The schema sent to the model now limits `readings` to one or
two items, and when the reply to an analysis or a question is still
malformed, Underline sends the same request once more and discards the
first reply whole. A run that recovers is charged once; a run malformed on
both tries fails as before and is not charged. Timeouts and provider errors
are not retried. Checked on a preview of this fix on Oct 6:
"california-commercial-lease.docx" was run again 5 times and gave a report
every time, in 28 to 42 seconds, with analyses left going from 8 to 3. The
preview's logs held no errors, so no "readings must hold one or two
Readings". A retry that recovers is not logged, so the check cannot say
whether any of the 5 runs needed one.

## Seen once

These happened once and I could not repeat them within the budget.

- **A shopping list gets a Clean verdict and uses up an analysis. (Resolved)** I pasted
  "Remember to buy milk, eggs and bread." as a Draft. Saving started an
  analysis right away, with no warning, and used one of the five one-time
  analyses. The report said "No Dangerous clause found in this text ...
  Whether to sign is still your decision" and marked all 11 clause types
  "CHECKED". To be fair, the summary did say it was "a three-item shopping list"
  with no parties or agreement. PRD.md section 1 says the document is one of
  four kinds. Repeating this would have cost another analysis. If it repeats,
  it misleads a reader in a small way and costs them one of five analyses.
  **Resolved, no change needed.** This is a free beta, and the Signer chose to save
  the text, which runs the analysis. The summary says plainly what the text
  is.
- **A personal security interest goes unflagged. (Resolved)** In the existing "California
  Bakery" report, section 17.6 ("Principal grants Landlord a security interest
  in all of Principal's personal property, including vehicles, deposit accounts
  and investment accounts...") is not quoted in any flag. It meets the
  Dangerous test in PRD.md section 5: "the clause's exposure reaches past the
  business to the Signer personally". In my own lease, a similar clause (4.2)
  was quoted inside the Personal guarantee flag, so I could not make the miss
  happen again. If it repeats, it misleads a reader.
  **Resolved.** No clause type covered an individual pledging their own
  property. "Personal guarantee" is now "Personal guarantee or pledge" and
  covers a security interest, lien or mortgage an individual gives on their
  own property. The personal-reach rule names pledges too. Check on the
  preview by re-running "California Bakery": 17.6 should be quoted in a
  Dangerous flag.
- **"Payment terms against you" is applied to rent the Signer pays.** This
  repeated on the second pass, so it is now finding 4.
- **A question failed once.** On "QA long lease" (118,620 characters), the first
  attempt at "How much am I personally on the hook for under the guaranty, and
  is there a cap?" showed "Underline couldn't finish answering. Try again." It
  was not charged. The retry worked. On the second pass the same question got
  "This document doesn't say." (the guaranty is a separate document), and a
  rent question was answered with quotes, so it did not repeat. Vercel no
  longer holds the log from Oct 3, so the reason is unknown. Asked 3 more times
  on Oct 4, it was answered each time in 6 to 10 seconds and charged once each.
  **Not reproduced** in 5 tries since. It may have been the same kind of
  malformed reply as finding 6.
  **Covered by the fix for finding 6.** A malformed reply to a question is
  now asked for once more too. On the Oct 6 preview, the question was asked
  3 times on "QA long lease" and got "This document doesn't say." each time,
  charged once each (questions left went from 13 to 10).
- **An analysis failed on malformed model output.** This repeated, so it is now
  finding 6. The first analysis of
  "california-commercial-lease.docx" showed "Underline couldn't finish
  analyzing this Draft." The log says "The model's output was malformed:
  riskFlags[7].readings must hold one or two Readings". It was not charged, and
  Try again worked. This is likely the same kind of failure as the question
  above: one bad model reply ends the whole run.

## Tested on the second pass

- **What happens at 0 analyses left.** See finding 5. The limit held: nothing
  was stored or charged.
- **Long Draft titles.** There is no length limit. A 344-character title saved
  and analyzed. It wraps on the Draft page (seven lines of heading) and in the
  library, which pushes the date below it. No horizontal scroll at 375px.
- **HTML-looking Draft titles.** The title
  `<img src=x onerror="console.log('QAXSS')"><b>QA html title</b>` shows as
  plain text on the Draft page, in the library and in the tab title. Nothing
  ran.
- **The Severity floor** held. With "Arbitration and class-action waiver" as a
  Red line, the arbitration flag on "QA severity floor" was Dangerous, marked
  "Raised by your Red line... Without it, this flag would be Caution." After
  removing the Red line and running the analysis again, it stayed Dangerous,
  with a note saying why and how to check against only the current Red lines.
- **File upload.** samples/california-commercial-lease.docx was read in the
  browser, its text filled the box (26,524 characters) and the file name
  filled the title. It saved and, on the second try, analyzed.
- **Signed-out pages.** With no session, the landing page, Sign in and Sign up
  load, and Library, Red lines, Add a Draft, a Draft's page and an unknown
  address all redirect to Sign in. After Sign out, Back shows Sign in, not the
  Draft.
- **Sign-up.** The form needs an invite code, an email and a password of at
  least 8 characters, and an empty submit says "Enter your email and
  password." A real sign-up was not run, because it means entering a password
  on production. Test it with a fresh invite code by hand.
- **True phone width.** No horizontal scroll at 375px on the landing page,
  Library, Red lines, Add a Draft, the California lease report and the
  long-title Draft. This was still checked through a same-site frame, not a
  resized window.
- **The message after a refresh mid-analysis.** Still to test with one browser
  open.

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
- **Fixes from PRs #4 and #5 hold on production.** Library, "Added" and
  "Analyzed" dates show the local date (Oct 2, not Oct 3). In the California
  lease, 17.6 is now quoted in a Dangerous "Personal guarantee or pledge" flag.
- **Basic screen-reader check.** I found no unnamed links or buttons, no
  unlabeled fields, and no images without alt text, and `lang` is set on those
  five pages. This is not a full audit.
