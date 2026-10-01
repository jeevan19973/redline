# 01: Sign in to an empty library

**What to build:** A Signer can open Underline, sign in, and land on their Draft library, which is empty. This is the walking skeleton: Next.js app, Supabase running locally through the CLI, Supabase auth, and a library page that later tickets fill. The brand follows ADR 0006 from the first screen: ink on paper, no red anywhere in the chrome.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Dependencies approved for this ticket (2026-09-30):** `next`, `react`, `react-dom`, `typescript`, `@supabase/supabase-js`, `@supabase/ssr`, and the `supabase` CLI as a dev dependency. Anything beyond this list still waits for approval.

- [ ] The app runs locally against a local Supabase started through the CLI, with setup steps in the README
- [ ] A Signer can sign up, sign in and sign out
- [ ] A signed-out visitor who opens the library is sent to sign in
- [ ] A signed-in Signer sees an empty library with a plain empty state
- [ ] Credentials live only in `.env.local`; an `.env.example` lists every variable with no values
- [ ] Colours come from the ADR 0006 starting tokens; red appears nowhere in this ticket's UI
