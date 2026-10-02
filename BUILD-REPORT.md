# Build report: Underline v1

Unattended build run started 2026-10-01 on branch `v1-build`, cut from
`env-example-openrouter` (which matched `main` plus the uncommitted
`.env.example` change, committed first as `8e79ee2`).

This file is updated as each ticket lands, so it is accurate even if the run
stops early. The final section lists what to run first.

## Tickets

| Ticket | Status | Notes |
|---|---|---|
| 01 Sign in to an empty library | done | Built before this run (`b02c404`). Follow-up: the app now starts with no Supabase variables, and the anon key name is read first |
| 02 Upload a plain-text file or paste text as a Draft | done | RLS checked in a rolled-back transaction; save flow not run in a browser (migration not applied). Body limit 2 MB; dates in UTC |
| 03 First report: summary and scope stamp | done | 26 tests. reports RLS checked in a rolled-back transaction; Draft-page flow not run in a browser |
| 04 Risk flags with verified Source sentences | done | 60 tests. Screen checked in headless Chrome via a temporary route. Clause labels want your read |
| 07 Clean verdict and guaranty gap | done | 103 tests. No Clean verdict when a withheld flag would have been Dangerous |

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
