-- Reports become server-only. Only the Analysis module may produce a Report,
-- and its citation failures are never shown to the Signer (spec), but the
-- policies in 20261001130000_reports.sql let a signed-in Signer select,
-- insert, update and delete their own report rows with the public anon key,
-- so anyone could forge a Report or read the maintainer-only fields straight
-- from the REST API.
--
-- Now no client can read or write this table, like invite_codes. The app
-- server reads and writes it with the secret key (service_role, which
-- bypasses row-level security), and only after confirming through the
-- Signer's own session that they own the Draft (app/(app)/drafts/report-store.ts).
--
-- Deleting a Draft still deletes its report: the foreign key's on delete
-- cascade runs with the table owner's rights, not the client's.

drop policy "Signers read reports on their own Drafts" on public.reports;
drop policy "Signers add reports to their own Drafts" on public.reports;
drop policy "Signers replace reports on their own Drafts" on public.reports;
drop policy "Signers delete reports on their own Drafts" on public.reports;

-- Row-level security stays on with no policies, so it matches no rows for
-- any client role, and revoking the privileges makes an attempt fail loudly.
alter table public.reports enable row level security;
revoke all on table public.reports from anon, authenticated;

comment on table public.reports is
  'The current Report on a Draft. Re-running analysis replaces it. Server-only: no client may read or write it.';
