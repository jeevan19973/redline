# 15: Deploy to Vercel with a hosted Supabase

**What to build:** Underline runs on Vercel against a hosted Supabase project, with the same migrations as local. This needs account access, so a human does it.

**Blocked by:** 03 (First report: summary and scope stamp)

**Status:** ready-for-human

- [ ] A hosted Supabase project exists, and every migration is applied to it from the migration files, never by dashboard clicks
- [ ] The Vercel project has every variable from `.env.example` set, including the OpenRouter key and model id
- [ ] The deployed app supports sign in, upload, and a report on a plain-text Draft
- [ ] No secret is committed to the repo
