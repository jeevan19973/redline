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
