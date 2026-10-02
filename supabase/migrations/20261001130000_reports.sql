-- Reports: the current Report on each Draft, as the Analysis module returned
-- it. One per Draft: re-running analysis replaces the row (an upsert on
-- draft_id), and deleting a Draft deletes its report.
--
-- A report is keyed only on its Draft (ADR 0005), and it belongs to whoever
-- owns that Draft, so row-level security checks the Draft's owner rather than
-- keeping an owner column of its own.

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null unique references public.drafts (id) on delete cascade,
  report jsonb not null check (jsonb_typeof(report) = 'object'),
  model_id text not null check (length(btrim(model_id)) > 0),
  created_at timestamptz not null default now()
);

comment on table public.reports is
  'The current Report on a Draft. Re-running analysis replaces it.';

alter table public.reports enable row level security;

create policy "Signers read reports on their own Drafts"
  on public.reports for select
  to authenticated
  using (
    exists (
      select 1 from public.drafts
      where drafts.id = reports.draft_id and drafts.owner = (select auth.uid())
    )
  );

create policy "Signers add reports to their own Drafts"
  on public.reports for insert
  to authenticated
  with check (
    exists (
      select 1 from public.drafts
      where drafts.id = reports.draft_id and drafts.owner = (select auth.uid())
    )
  );

-- Both clauses: the row being replaced and the row it becomes must sit on one
-- of the Signer's own Drafts, so a report cannot be moved onto another's.
create policy "Signers replace reports on their own Drafts"
  on public.reports for update
  to authenticated
  using (
    exists (
      select 1 from public.drafts
      where drafts.id = reports.draft_id and drafts.owner = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.drafts
      where drafts.id = reports.draft_id and drafts.owner = (select auth.uid())
    )
  );

create policy "Signers delete reports on their own Drafts"
  on public.reports for delete
  to authenticated
  using (
    exists (
      select 1 from public.drafts
      where drafts.id = reports.draft_id and drafts.owner = (select auth.uid())
    )
  );

-- Signed-out visitors have no business with this table at all.
revoke truncate on table public.reports from authenticated;
revoke all on table public.reports from anon;
