# Build report: Underline v1

Unattended build run started 2026-10-01 on branch `v1-build`, cut from
`env-example-openrouter` (which matched `main` plus the uncommitted
`.env.example` change, committed first as `8e79ee2`).

**Result:** 15 of 18 tickets are done. The other three need you: 13 needs a
qualified labeller, 15 needs your accounts, and 14 depends on 13. `npm run
build` and `npm test` (345 tests) pass. `npm run smoke` ran once against the
real model, and all 8 proposed flags survived citation verification (details
below). The whole signed-in product was then run end to end on a throwaway
Supabase stack, and all 11 checks passed. The last section lists what to run
first.

## Tickets

| Ticket | Status | Notes |
|---|---|---|
| 01 Sign in to an empty library | done | Built before this run (`b02c404`). Follow-up: the app now starts with no Supabase variables, and the anon key name is read first |
| 02 Upload a plain-text file or paste text as a Draft | done | RLS checked in a rolled-back transaction; save flow not run in a browser (migration not applied). Body limit 2 MB; dates in UTC |
| 03 First report: summary and scope stamp | done | 26 tests. reports RLS checked in a rolled-back transaction; Draft-page flow not run in a browser |
| 04 Risk flags with verified Source sentences | done | 60 tests. Screen checked in headless Chrome via a temporary route. Clause labels want your read |
| 05 Confidence label behind a switch | done | 163 tests. Switch is UNDERLINE_SHOW_CONFIDENCE=true, off by default |
| 06 Counter-offers and Non-negotiable clauses | done | 149 tests. Non-negotiable basis must be a verified quote; Copy button not clicked in a real browser |
| 07 Clean verdict and guaranty gap | done | 103 tests. No Clean verdict when a withheld flag would have been Dangerous |
| 08 The Signer's Red lines raise severity, with the Severity floor | done | 119 tests. red_lines RLS checked in a rolled-back transaction; screen not run against a live database |
| 09 Free-text Red lines add flags | done | 130 tests. Added flags use the personal-reach severity rule; 120-character limit |
| 10 Question box answered only from the document | done | 189 tests. One model call per question, no regeneration; 500-character limit |
| 11 Delete a Draft | done | Delete and cascade checked in a rolled-back transaction; dialog checked in headless Chrome |
| 12 PDF and DOCX upload, with scanned-file refusal | done | Real pdfjs/mammoth exercised in headless Chrome; signed-in form not run |
| 13 Labeled fixture set | ready-for-human | Not attempted: needs a labeller qualified to read a commercial lease |
| 14 Fixture eval run | blocked | Blocked by 13 (needs a qualified labeller). Its other dependencies are done |
| 15 Deploy to Vercel with a hosted Supabase | ready-for-human | Not attempted: needs your Vercel and Supabase accounts |
| 16 Public landing page | done | 345 tests. Static at /. One exact-sentence exemption in the banned-claims test |
| 17 Invite-only sign-up with single-use codes | done | Trigger checked in a rolled-back transaction; real sign-up not run. Every new account, even one made in Studio, needs a code |
| 18 One-time limit per Signer | done | Limits checked in a rolled-back transaction; rail not seen on screen. Fails closed |

## Decisions made in your absence

1. **Worked on a branch.** All work is on `v1-build`, pushed as its own
   branch. Nothing was pushed to `main`, so you can review it as one PR.
2. **CLAUDE.md's two "wait for me" items are not the two the prompt
   answered.** CLAUDE.md waits on new dependencies and out-of-scope work; the
   prompt answered the model and Supabase questions. I kept both rules. The
   only packages installed are the ones a ticket file already approves
   (`vitest` in 03, `pdfjs-dist` and `mammoth` in 12). `npm run smoke` runs on
   Node 24's built-in TypeScript type stripping, so it needs no `tsx`.
3. **Supabase key name.** The prompt names `NEXT_PUBLIC_SUPABASE_ANON_KEY`; the
   existing code and your `.env.local` use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   `lib/env.ts` reads the anon key first and falls back to the publishable key,
   so your current `.env.local` keeps working.
4. **Migrations are written, never applied.** Your local Supabase stack was
   running. No agent ran `db reset`, `migration up` or `db push`. Agents were
   allowed to check SQL and row-level security against the local database only
   inside one transaction that ends in `ROLLBACK`, so nothing persisted.
5. **Ticket 01 was already built** (commit `b02c404`, every criterion ticked
   in its file) but its Status line still said `ready-for-agent`. I verified it
   rather than rebuilding it.
6. **Tickets 13 and 15 are `ready-for-human`**, and 14 depends on 13. They were
   not attempted. The fixtures under `tests/fixtures/` are synthetic test
   documents for the deterministic suite and the smoke run. They are not
   ticket 13's labeled set and do not satisfy it.
7. **"Done" status.** The tracker's label vocabulary has no done state, so a
   finished ticket gets `Status: done` and a dated comment.
8. **With no Supabase configured**, `/`, `/library`, `/sign-in` and `/sign-up`
   render a plain "Accounts aren't set up" notice (200, no redirect) and the
   proxy skips the session refresh. No fake user or session exists.
9. **The no-account analyze path is a spend risk if deployed without
   Supabase.** You asked for the app to analyze pasted text with no Supabase
   variables. That path runs only when Supabase is unconfigured; with Supabase
   set, analysis needs a signed-in Signer and the per-Signer limit applies. But
   a public deploy that forgot the Supabase variables would let anyone run paid
   model calls with no limit. Ticket 15's checklist already requires every
   variable, so I left it as is. A one-line guard (refuse the no-account path
   when `NODE_ENV=production` or on Vercel) is easy to add if you want it.
10. **Analysis module shape (ticket 03).** `lib/analysis/` is the only way to
    get a Report (the type is branded). Reports read back from the database are
    a separate, validated `StoredReport`. Everything under `lib/analysis/` and
    `lib/model/` uses relative `.ts` imports and erasable TypeScript, so
    `npm run smoke` runs on plain Node 24 with no `tsx`. `tsconfig.json` gained
    `allowImportingTsExtensions`. Model calls time out after 120 seconds. A
    stored report that fails validation shows a "run again" button instead of
    re-running by itself, since each run is a paid call.
11. **vitest 5.0.3**, exact-pinned, is the only package added in ticket 03.
12. **Risk flags (ticket 04).** Severity is decided in code: Dangerous for a
    Dangerous catalog type, or for any flag the model says reaches the Signer
    personally; Caution otherwise. A severity the model writes itself is
    ignored. If the regeneration call itself errors, the whole analysis fails
    instead of dropping a flag that might be Dangerous. Readings are stored as
    an array of one or two (the spec says `reading`). The eleven Signer-facing
    clause labels in `lib/analysis/catalog.ts` (for example "Cap on what they
    owe you") are agent wording that went through the humanizer; they deserve
    your read. Hedging in Readings is asked for in the prompt but not checked
    in code.
13. **Clean verdict (ticket 07).** Beyond the spec: no Clean verdict appears
    when a flag that would have been Dangerous was withheld for a failed
    citation, so a personal guarantee whose quotation failed can never produce
    "no Dangerous clause found". When the guaranty-reference sentence fails
    verification twice, nothing unverified is shown and the verdict marks
    personal guarantee not checked, saying Underline couldn't rule out a
    separate guaranty. The banned-claims matcher rejects any "safe" and any
    "lawyer" or "attorney" in fixed copy, which is deliberately broad.
14. **Invite codes (ticket 17).** A `BEFORE INSERT` trigger on `auth.users`
    spends the code in the same transaction that creates the account, so a bad
    code creates nothing and two racing sign-ups on one code make one account.
    Side effect: every new `auth.users` row needs a code, including accounts
    you create by hand in Studio or through the admin API (the README says
    so). Accounts that already exist in your local database are untouched. The
    owner script `npm run invite:create -- 5` needs `SUPABASE_SECRET_KEY` in
    `.env.local`. Since the review fixes, the app server reads that key too,
    to store and read reports (never in the browser), so it is required
    wherever Supabase is set up.

## Real-model smoke run

`npm run smoke` ran once against the real model on 2026-10-02, using the key
in `.env.local`. Model reported: `z-ai/glm-5.3-flash`, through Fireworks with
fallbacks off.

- **Flags proposed: 8. Survived citation verification: 8. Citation failures: 0.**
- All 8 planted sentences in `tests/fixtures/adhesion-contract.txt` were
  quoted verbatim at the expected severity: uncapped indemnity and the
  individual non-compete as Dangerous; auto-renewal, late fees, unilateral
  amendment, arbitration with class waiver, and deposit and repairs as Caution.
  The model merged the two deposit-and-repairs sentences into one flag that
  cites both.
- One extra flag: **personal guarantee, Dangerous**, citing the Principal
  joinder sentence and the sentence that refers to the separate Guaranty of
  Lease. ADR 0004 allows over-flagging in the Dangerous tier, but its Reading
  ("your own assets stand behind everything the business owes") describes a
  guaranty document Underline never saw. Worth a prompt look: the guaranty gap
  already covers this case.
- Every flag came back **Non-negotiable**, citing the lease's "not subject to
  negotiation or modification" sentence, so no Counter-offer was produced. This
  follows the rule, but it means Counter-offer wording was not exercised
  against the real model.
- The guaranty gap appeared with its verified sentence. No Clean verdict, as
  expected. The scope stamp was present. Confidence was "high" on all 8, which
  is why it stays hidden until calibration.
- The summary stayed within the text.
15. **Landing page (ticket 16).** Ported from `landing/` without a redesign.
    Three copy changes, each one required by the ticket: the opening says who
    it is for, the meta description says "commercial lease", and the data note
    says "third-party AI model provider". The page says "It never tells you a
    document is safe to sign." The banned-claims test exempts that one
    sentence, word for word, and tests prove that any edit to it, or a claim
    added beside it, still fails. `landing/` is left in place as the reference
    original; delete it when you're satisfied with the port.

## End-to-end check on a throwaway Supabase stack

The per-ticket notes above say "not run in a browser" because no migration was
applied to any database. After the last ticket, one agent copied `supabase/`
into a scratch folder as a separate project (`underline-e2e`, ports 553xx),
applied every migration there, and drove a production build with headless
Chrome. `OPENROUTER_API_KEY` was blanked, so no model call was made. Your
`underline` stack was never targeted: same containers, still no tables.
Afterwards the e2e stack was stopped and its volumes removed.

All 11 checks passed, with no fixes needed:

1. The landing page signed out, with sign-up and sign-in links.
2. Invite codes: a wrong code creates no account; the right code creates one
   and is spent; reusing it from a fresh session gives the used-code message.
3. An empty library, and the rail showing 5 of 5 analyses and 25 of 25 questions.
4. Pasted text with line breaks, tabs, curly quotes and section signs is stored
   byte for byte (matching SHA-256). Analysis fails with a plain message and
   Try again (no key), and the failure is not counted.
5. `.txt` and text-PDF uploads are stored exactly as extracted.
6. A Report built by the real `analyzeDraft` with the fake client renders
   correctly: Dangerous first, underlined quotes, guaranty gap, take-it-or-leave-it
   label, no Confidence, scope stamp.
7. Catalog and free-text Red lines can be added, edited and removed, and they
   persist.
8. At the limit, upload and re-run are refused with nothing stored. Raising the
   limit by SQL takes effect on the next request.
9. Delete from the library and from the Draft page removes the report too; the
   old link gives not-found.
10. A second Signer sees nothing of the first and gets not-found on their URL.
11. After sign out, the library redirects to sign-in.

Two small observations: after a Red line edit, the other editor keeps its last
status line (cosmetic), and the question box appears only once a Draft has a
report.

## What I could not verify

- **The hosted Supabase project.** It doesn't exist yet. Every migration was
  checked on local Postgres (rolled-back transactions, plus the throwaway
  stack), not on a hosted project. Hosted Auth settings such as email
  confirmation and redirect URLs are ticket 15's job.
- **A successful analysis or question inside the running app.** The end-to-end
  run kept the key blank to avoid spend. The real model was exercised only
  through `npm run smoke`, which runs the same `analyzeDraft` the app calls,
  without the browser or the database. A real question (`askDraft`) has not
  been asked of the real model at all.
- **Counter-offers from the real model.** The only real run was on a
  take-it-or-leave-it lease, so every flag was correctly Non-negotiable.
- **Two truly simultaneous sign-ups on one code.** That rests on the row lock
  inside the trigger, and was checked only one transaction at a time.
- **True phone width below about 500px.** Headless Chrome won't lay out that
  narrow; agents checked 390px through an iframe.
- **Contrast and screen-reader audits.** None were run formally; the landing
  page relies on its earlier finish review.
- **Confidence calibration and every measured eval target.** These wait on
  tickets 13 and 14.

## Run these first

```sh
cd aipmcohort4-redline
git fetch && git switch v1-build
npm install                      # adds vitest, pdfjs-dist, mammoth
npm run typecheck && npm test && npm run build
```

To use it locally with accounts (Docker running):

```sh
npm run db:start
npx supabase db reset            # applies the migrations in supabase/migrations/ to your LOCAL database
# add SUPABASE_SECRET_KEY to .env.local (npx supabase status -o env prints it as SECRET_KEY)
npm run invite:create -- 1       # prints one invite code
npm run dev                      # http://localhost:3000, then sign up with that code
```

`db reset` wipes your local database, including the one test account from
ticket 01. If you would rather apply the migrations by hand, as you planned,
run the files in `supabase/migrations/` in filename order.

To see the model on the fixture lease again (one paid run):

```sh
npm run smoke
```

Then read, in this order: decision 9 (the no-account spend risk), decision 12
(clause labels for your review), the real-model smoke notes on the extra
personal-guarantee flag, and decision 14 (every new account needs an invite
code).

## Review fixes

- Fix 2: no client can read or write `reports` any more
  (`20261002150000_reports_server_only.sql`). The app server stores and reads
  them with `SUPABASE_SECRET_KEY`, after checking through the Signer's own
  session that they own the Draft (`app/(app)/drafts/report-store.ts`).
- Fix 3: the server reserves each analysis or question before the model
  call, in one atomic update, and hands it back if the call fails
  (`20261002160000_reserve_uses.sql`), so two requests at once can no longer
  overrun the limit. Only the secret key can change a count.
- Fix 5: a failed report read shows an error and a "Try again" that reloads,
  and never starts an analysis. A per-Draft claim
  (`20261002170000_analysis_claims.sql`) lets only one run at a time reach
  the model, so two tabs on a new Draft spend one analysis.
- Fix 1: an answer whose Source sentences fail verification now gets one
  regeneration call, through the same `locateWithRequote` loop flags use. If
  it still fails, or that call fails, the Signer gets the fixed "does not
  say" reply. It still counts as one question.
