# 17: Invite-only sign-up with single-use codes

**What to build:** Only people the owner invites can create an account. The owner creates single-use invite codes with a server-side script and hands them out. A Signer signs up with a code; a valid, unused code creates exactly one account and is then spent. A wrong or used code gets a plain message. Signing in is unchanged (ADR 0007).

**Blocked by:** 01 (Sign in to an empty library)

**Status:** ready-for-agent

- [ ] An `invite_codes` table is added by a migration (code, created at, used by, used at); no client can read or write it
- [ ] The owner can create one or more codes with a server-side script, documented in the README; there is no admin UI
- [ ] Sign-up requires a code, checked server-side; without a valid unused code no account is created
- [ ] The code is marked used by the new Signer in the same step that creates the account, so two sign-ups racing on one code produce one account
- [ ] A wrong code and an already-used code each get a plain message telling the Signer to ask the owner for another
- [ ] Signing in for an existing Signer does not ask for a code
- [ ] All copy is US English and has been run through the humanizer skill before it is committed
