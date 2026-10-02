# 01: Sign in to an empty library

**What to build:** A Signer can open Underline, sign in, and land on their Draft library, which is empty. This is the walking skeleton: Next.js app, Supabase running locally through the CLI, Supabase auth, and a library page that later tickets fill. The brand follows ADR 0006 from the first screen: ink on paper, no red anywhere in the chrome.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Dependencies approved for this ticket (2026-09-30):** `next`, `react`, `react-dom`, `typescript`, `@supabase/supabase-js`, `@supabase/ssr`, and the `supabase` CLI as a dev dependency. Anything beyond this list still waits for approval.

**Also approved (2026-10-01):** `@types/react`, `@types/react-dom` and `@types/node` as dev dependencies, which a TypeScript Next.js app needs.

- [x] The app runs locally against a local Supabase started through the CLI, with setup steps in the README
- [x] A Signer can sign up, sign in and sign out
- [x] A signed-out Signer who opens the library is sent to sign in
- [x] A signed-in Signer sees an empty library with a plain empty state
- [x] Credentials live only in `.env.local`; an `.env.example` lists every variable with no values
- [x] Colors come from the ADR 0006 starting tokens; red appears nowhere in this ticket's UI

## Comments

2026-10-01: Built and checked in a browser against local Supabase. Sign-up, sign-in, sign-out, the signed-out redirect and the empty library all work at desktop and phone widths, and no red renders anywhere. Sign-up is open for now; ticket 17 puts it behind an invite code. Not committed yet.
