-- Drafts: one row per document a Signer adds, holding only its extracted
-- text. The original file is never stored (CLAUDE.md), and there is no deal
-- or grouping column (ADR 0005): every later table keys on the Draft id, so a
-- grouping table can be added without reshaping these rows.
--
-- extracted_text is stored exactly as read or pasted. It is what every
-- Source sentence is checked against (ADR 0001), so it never changes after it
-- is stored: there is no update policy, and update is revoked outright.

create table public.drafts (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  extracted_text text not null check (extracted_text ~ '\S'),
  created_at timestamptz not null default now()
);

comment on table public.drafts is
  'One version of a document, as the text read from it. Never updated after insert.';

-- The library lists a Signer's Drafts newest first.
create index drafts_owner_created_at_idx on public.drafts (owner, created_at desc);

alter table public.drafts enable row level security;

create policy "Signers read their own Drafts"
  on public.drafts for select
  to authenticated
  using ((select auth.uid()) = owner);

create policy "Signers add Drafts as themselves"
  on public.drafts for insert
  to authenticated
  with check ((select auth.uid()) = owner);

create policy "Signers delete their own Drafts"
  on public.drafts for delete
  to authenticated
  using ((select auth.uid()) = owner);

-- A Draft's text never changes, so no client may update a row. Without an
-- update policy RLS already matches no rows; revoking the privilege makes an
-- attempt fail loudly instead of silently updating nothing. Signed-out
-- visitors have no business with this table at all.
revoke update, truncate on table public.drafts from authenticated;
revoke all on table public.drafts from anon;
