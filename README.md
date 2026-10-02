# Underline

Production: https://redline-nine-iota.vercel.app

Underline reads a contract before a small business owner signs it and shows
ranked risk flags, each quoting the exact sentence it came from. The repository
and its GitHub remote are still named `redline` (ADR 0006).

Start with `CLAUDE.md`, then `PRODUCT.md`, `CONTEXT.md` and `docs/adr/`.

## Layout

- `app/`, `lib/`, `proxy.ts`: the Next.js app.
- `supabase/`: local Supabase config and, from ticket 02 on, the migrations.
- `landing/`: the static landing page. Ticket 16 moves it into the app.
- `.scratch/redline-v1/`: the spec and tickets.

## Run it locally

You need Node 24, npm and Docker (Docker Desktop must be running).

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start Supabase. The first start downloads its Docker images and takes a
   few minutes.

   ```sh
   npm run db:start
   ```

3. Create `.env.local` from the template and fill it in. `npm run db:status`
   prints the API URL and the keys.

   ```sh
   cp .env.example .env.local
   npx supabase status -o env
   ```

   Copy `API_URL` into `NEXT_PUBLIC_SUPABASE_URL` and `ANON_KEY` into
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The app falls back to
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`PUBLISHABLE_KEY`) when the anon key
   is unset. With no Supabase variables at all, the app still runs, without
   accounts, the library or Red lines, and you can skip step 2.

4. Start the app and open http://localhost:3000:

   ```sh
   npm run dev
   ```

Locally, sign-up needs no email confirmation, so a new account is signed in
straight away. Supabase Studio runs at http://127.0.0.1:54323 and the local
mail catcher at http://127.0.0.1:54324.

Every Risk flag stores a Confidence that Signers do not see until you set `UNDERLINE_SHOW_CONFIDENCE=true` in `.env.local` and restart the app (ADR 0004).

Stop Supabase with `npm run db:stop`.

## Production settings

Production needs these four settings. Each one is set on Vercel, for the
production environment, and in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

## Invite codes

Sign-up is invite-only (ADR 0007): each account needs a single-use invite
code, and signing in never asks for one. There is no admin screen. Create
codes with:

```sh
npm run invite:create -- 5
```

It prints the new codes, one per line. It needs `NEXT_PUBLIC_SUPABASE_URL`
and `SUPABASE_SECRET_KEY` in `.env.local` (`npx supabase status -o env` prints
the key as `SECRET_KEY`). The secret key bypasses row-level security. Besides
owner scripts, the app server reads it to store and read reports, which no
client may touch; without it, a signed-in Signer can't run an analysis. It
never reaches the browser and never gets a `NEXT_PUBLIC_` prefix.

To see which codes are spent, run this in Studio's SQL editor:

```sql
select code, created_at, used_at, used_by from invite_codes order by created_at desc;
```

A code with `used_at` set is spent. `used_by` is the Signer's id in
`auth.users`, or empty if that account was deleted. A user added by hand
through Studio or the admin API also needs an unused code, as `invite_code`
in its user metadata.

## Raising a Signer's limit

Each Signer can run 5 analyses (re-runs included) and ask 25 questions,
once (ADR 0007). The limits live on the Signer's row in `signer_limits`, so
raising one Signer's limit is a manual change in Studio's SQL editor. Find
their id by email:

```sql
select id, email from auth.users where email = 'signer@example.com';
```

Then raise their limit:

```sql
update signer_limits set analysis_limit = 10 where owner = '<their id>';
update signer_limits set question_limit = 50 where owner = '<their id>';
```

Or both in one step by email:

```sql
update signer_limits set analysis_limit = 10, question_limit = 50
  where owner = (select id from auth.users where email = 'signer@example.com');
```

The new limit takes effect on their next request; the rail shows it the next
time a page loads. To see what everyone has used:

```sql
select u.email, l.analyses_used, l.analysis_limit, l.questions_used, l.question_limit
  from signer_limits l join auth.users u on u.id = l.owner order by u.email;
```

Signers can read their own row but never write it, and no function they can
call lowers a count. With no Supabase configured there are no accounts, so
there is no limit either.

## Checks

```sh
npm run typecheck
npm run build
```
