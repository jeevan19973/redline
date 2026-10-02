-- Red lines: terms a Signer has said they will not accept. They belong to
-- the Signer, not to a Draft, and drive every analysis they run. A Report
-- keeps its own snapshot of the Red lines it ran against, so changing this
-- table never rewrites a past Report.
--
-- Two kinds, both allowed now so free-text Red lines need no schema change:
--   catalog:  value is a catalog clause type id, such as 'autoRenewal'. The
--             catalog lives in the Analysis module, so the server checks the
--             value against it before writing; SQL does not repeat the list.
--   freeText: value is the term in the Signer's own words.

create table public.red_lines (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('catalog', 'freeText')),
  value text not null check (length(btrim(value)) > 0),
  created_at timestamptz not null default now(),
  -- One of each per Signer. Also serves the per-Signer listing.
  unique (owner, kind, value)
);

comment on table public.red_lines is
  'A Signer''s own Red lines. Reports snapshot them, so edits never change a past Report.';

alter table public.red_lines enable row level security;

create policy "Signers read their own Red lines"
  on public.red_lines for select
  to authenticated
  using ((select auth.uid()) = owner);

create policy "Signers add Red lines as themselves"
  on public.red_lines for insert
  to authenticated
  with check ((select auth.uid()) = owner);

-- Both clauses: the row being edited and the row it becomes must be the
-- Signer's own, so a Red line cannot be handed to another Signer.
create policy "Signers edit their own Red lines"
  on public.red_lines for update
  to authenticated
  using ((select auth.uid()) = owner)
  with check ((select auth.uid()) = owner);

create policy "Signers remove their own Red lines"
  on public.red_lines for delete
  to authenticated
  using ((select auth.uid()) = owner);

-- Signed-out visitors have no business with this table at all.
revoke truncate on table public.red_lines from authenticated;
revoke all on table public.red_lines from anon;
