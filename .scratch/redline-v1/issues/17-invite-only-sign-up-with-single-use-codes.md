# 17: Invite-only sign-up with single-use codes

**What to build:** Only people the owner invites can create an account. The owner creates single-use invite codes with a server-side script and hands them out. A Signer signs up with a code; a valid, unused code creates exactly one account and is then spent. A wrong or used code gets a plain message. Signing in is unchanged (ADR 0007).

**Blocked by:** 01 (Sign in to an empty library)

**Status:** done

- [x] An `invite_codes` table is added by a migration (code, created at, used by, used at); no client can read or write it
- [x] The owner can create one or more codes with a server-side script, documented in the README; there is no admin UI
- [x] Sign-up requires a code, checked server-side; without a valid unused code no account is created
- [x] The code is marked used by the new Signer in the same step that creates the account, so two sign-ups racing on one code produce one account
- [x] A wrong code and an already-used code each get a plain message telling the Signer to ask the owner for another
- [x] Signing in for an existing Signer does not ask for a code
- [x] All copy is US English and has been run through the humanizer skill before it is committed

## Comments

2026-10-01 (unattended build run): Verified by the orchestrator: typecheck, 193 tests and build pass; the app never reads the secret key. Spending, refusal of unknown, used and missing codes, and the closed table checked in a rolled-back transaction. Not run: a real sign-up through Supabase Auth (migration not applied), two truly simultaneous sign-ups (rests on the row lock), and the owner script's real insert. Decisions: a BEFORE INSERT trigger on auth.users spends the code and strips it from the stored metadata; a code stays spent if its account is deleted; every new auth.users row needs a code, including accounts made by hand in Studio; error copy says 'the person who invited you'; codes are 16 characters from an unambiguous alphabet.
