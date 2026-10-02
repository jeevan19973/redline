-- The one-time limit per Signer (ADR 0007): 5 analyses, re-runs included,
-- and 25 questions. It never resets. The limits live on each Signer's row so
-- the owner can raise one Signer's limit by hand, in Studio's SQL editor:
--
--   update signer_limits set analysis_limit = 10 where owner = '<their id>';
--
-- A Signer can read their own row and never write it. The counts only move
-- through record_analysis() and record_question() below, which act only on
-- the caller's own row and only ever add one, so a Signer calling them
-- directly can spend their own allowance but never restore it. No function a
-- client can call lowers or resets a count.

create table public.signer_limits (
  owner uuid primary key references auth.users (id) on delete cascade,
  analyses_used int not null default 0 check (analyses_used >= 0),
  questions_used int not null default 0 check (questions_used >= 0),
  analysis_limit int not null default 5 check (analysis_limit >= 0),
  question_limit int not null default 25 check (question_limit >= 0)
);

comment on table public.signer_limits is
  'Each Signer''s one-time limit and what they have used. Signers read their own row; only the owner raises a limit.';

alter table public.signer_limits enable row level security;

create policy "Signers read their own limit"
  on public.signer_limits for select
  to authenticated
  using ((select auth.uid()) = owner);

-- No insert, update or delete policy, and no privilege to try: a Signer
-- editing their own row is refused outright rather than matching no rows.
revoke insert, update, delete, truncate on table public.signer_limits from anon, authenticated;
revoke all on table public.signer_limits from anon;

-- Every new Signer gets a row with the default limits, in the same
-- transaction that creates the account. It runs after the row is written,
-- so after spend_invite_code has already accepted or refused the sign-up.
create function public.create_signer_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.signer_limits (owner) values (new.id)
    on conflict (owner) do nothing;
  return null;
end;
$$;

comment on function public.create_signer_limits() is
  'Gives each new account its signer_limits row with the default limits.';

revoke all on function public.create_signer_limits() from public, anon, authenticated;

create trigger create_signer_limits
  after insert on auth.users
  for each row execute function public.create_signer_limits();

-- Signers who signed up before this migration get their row now, with
-- nothing used.
insert into public.signer_limits (owner)
  select id from auth.users
  on conflict (owner) do nothing;

-- Records one use of the caller's allowance, or raises when it is already
-- at the limit. The server calls these after the model returns. The update
-- locks the row, so two calls at once count one after the other and the
-- second sees the first one's count.
--
-- The row is created first if it is somehow missing, so a Signer is never
-- left without one. That insert only ever adds a row with nothing used.
create function public.record_analysis()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  signer uuid := auth.uid();
begin
  if signer is null then
    raise exception 'Only a signed-in Signer has an analysis limit.'
      using errcode = 'insufficient_privilege';
  end if;

  insert into public.signer_limits (owner) values (signer)
    on conflict (owner) do nothing;

  update public.signer_limits
    set analyses_used = analyses_used + 1
    where owner = signer and analyses_used < analysis_limit;

  if not found then
    raise exception 'This Signer has used every analysis in their limit.'
      using errcode = 'check_violation';
  end if;
end;
$$;

comment on function public.record_analysis() is
  'Adds one analysis to the caller''s count, or raises at the limit. Never lowers it.';

create function public.record_question()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  signer uuid := auth.uid();
begin
  if signer is null then
    raise exception 'Only a signed-in Signer has a question limit.'
      using errcode = 'insufficient_privilege';
  end if;

  insert into public.signer_limits (owner) values (signer)
    on conflict (owner) do nothing;

  update public.signer_limits
    set questions_used = questions_used + 1
    where owner = signer and questions_used < question_limit;

  if not found then
    raise exception 'This Signer has used every question in their limit.'
      using errcode = 'check_violation';
  end if;
end;
$$;

comment on function public.record_question() is
  'Adds one question to the caller''s count, or raises at the limit. Never lowers it.';

revoke all on function public.record_analysis() from public, anon;
revoke all on function public.record_question() from public, anon;
grant execute on function public.record_analysis() to authenticated;
grant execute on function public.record_question() to authenticated;
