-- One analysis at a time per Draft. Two tabs open on a new Draft each start
-- the first analysis, so without this both reach the model and both spend
-- one of the Signer's analyses. A run now claims its Draft first, before it
-- reserves a use or calls the model, and clears the claim when it ends,
-- success or failure. While a claim is live, any other run on that Draft is
-- told the Draft is already being analyzed and makes no model call.
--
-- A claim older than five minutes is stale (its run died without clearing
-- it, say), and the next run takes it over. An analysis normally takes a
-- minute or two.
--
-- No client can read or write this table, like reports. The app server
-- claims and clears with the secret key (service_role), after confirming
-- through the Signer's own session that they own the Draft
-- (app/(app)/drafts/report-store.ts).

create table public.analysis_claims (
  draft_id uuid primary key references public.drafts (id) on delete cascade,
  -- Identifies one run's claim, so a run whose claim was taken over as stale
  -- cannot clear the claim of the run that took it.
  token uuid not null default gen_random_uuid(),
  claimed_at timestamptz not null default now()
);

comment on table public.analysis_claims is
  'The analysis run in progress on a Draft, if any. Server-only: no client may read or write it.';

-- Row-level security with no policies matches no rows for any client role,
-- and revoking the privileges makes an attempt fail loudly.
alter table public.analysis_claims enable row level security;
revoke all on table public.analysis_claims from anon, authenticated;

-- Claims a Draft for one analysis run, in one statement: a new claim, or a
-- takeover of a stale one. Returns the claim's token, or null when another
-- run holds a live claim. Two calls at once on one Draft cannot both get a
-- token: the second waits on the first's row, then finds it live.
create function public.claim_analysis(p_draft uuid)
returns uuid
language sql
security definer
set search_path = ''
as $$
  insert into public.analysis_claims as claim (draft_id, token, claimed_at)
    values (p_draft, gen_random_uuid(), now())
    on conflict (draft_id) do update
      set token = excluded.token, claimed_at = excluded.claimed_at
      where claim.claimed_at < now() - interval '5 minutes'
    returning token;
$$;

comment on function public.claim_analysis(uuid) is
  'Claims a Draft for one analysis run: its token, or null while another run holds it. Server-only.';

-- Clears a run's own claim when it ends. A claim since taken over by another
-- run carries a different token and is left alone.
create function public.clear_analysis_claim(p_draft uuid, p_token uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.analysis_claims where draft_id = p_draft and token = p_token;
$$;

comment on function public.clear_analysis_claim(uuid, uuid) is
  'Clears one run''s claim on a Draft. Server-only.';

-- Supabase grants execute on new functions to the client roles by default,
-- so take it away and give it to service_role alone.
revoke all on function public.claim_analysis(uuid) from public, anon, authenticated;
revoke all on function public.clear_analysis_claim(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_analysis(uuid) to service_role;
grant execute on function public.clear_analysis_claim(uuid, uuid) to service_role;
