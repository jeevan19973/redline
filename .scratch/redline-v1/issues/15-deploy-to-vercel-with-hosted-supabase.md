# 15: Deploy to Vercel with a hosted Supabase

**What to build:** Underline runs on Vercel against a hosted Supabase project, with the same migrations as local. This needs account access, so a human does it. It waits for invite-only sign-up and the per-Signer limit, so the public deploy never runs with open sign-up and unbounded model spend (ADR 0007).

**Blocked by:** 16 (Public landing page), 17 (Invite-only sign-up with single-use codes), 18 (One-time limit per Signer)

**Status:** ready-for-human

- [ ] A hosted Supabase project exists, and every migration is applied to it from the migration files, never by dashboard clicks
- [ ] The Vercel project has every variable from `.env.example` set, including the OpenRouter key and model id
- [ ] The deployed app supports sign in, upload, and a report on a plain-text Draft
- [ ] The landing page is served at the site root of the deployed app, on the Vercel URL until a domain is chosen
- [ ] Sign-up on the deployed app requires an unused invite code, and a code created against the hosted database works once
- [ ] A Signer at their limit on the deployed app is refused with no model call
- [ ] The Supabase auth redirect URLs match the deployed URL
- [ ] No secret is committed to the repo
