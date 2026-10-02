# Underline

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
   prints the API URL and the publishable key.

   ```sh
   cp .env.example .env.local
   npx supabase status -o env
   ```

   Copy `API_URL` into `NEXT_PUBLIC_SUPABASE_URL` and `PUBLISHABLE_KEY` into
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

4. Start the app and open http://localhost:3000:

   ```sh
   npm run dev
   ```

Locally, sign-up needs no email confirmation, so a new account is signed in
straight away. Supabase Studio runs at http://127.0.0.1:54323 and the local
mail catcher at http://127.0.0.1:54324.

Stop Supabase with `npm run db:stop`.

## Checks

```sh
npm run typecheck
npm run build
```
