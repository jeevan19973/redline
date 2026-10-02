-- Reserving a use before the model call, so two requests at once cannot
-- overrun a Signer's one-time limit (ADR 0007). Until now the server checked
-- the count, called the model, then recorded the use with record_analysis()
-- or record_question(), so two requests sent together could both pass the
-- check.
--
-- Now the app server reserves the use first, in one conditional update that
-- only succeeds below the limit, and hands it back if the model call fails
-- before the model returns. A use whose model call returned stays counted.
--
-- Handing a use back lowers a count, so no client may call any of these.
-- The app server calls them with the secret key (service_role), passing the
-- owner from the Signer's verified session, never from the request. The old
-- client-callable record functions are closed too, so no client path changes
-- a count at all.

-- Takes one analysis from the Signer's limit. Returns true when it was
-- reserved and false when the Signer is at the limit. The update locks the
-- row, so two calls at once count one after the other and the second sees
-- the first one's count.
--
-- The row is created first if it is somehow missing, so a Signer is never
-- left without one. That insert only ever adds a row with nothing used.
create function public.reserve_analysis(p_owner uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.signer_limits (owner) values (p_owner)
    on conflict (owner) do nothing;

  update public.signer_limits
    set analyses_used = analyses_used + 1
    where owner = p_owner and analyses_used < analysis_limit;

  return found;
end;
$$;

comment on function public.reserve_analysis(uuid) is
  'Takes one analysis from a Signer''s limit: true when reserved, false at the limit. Server-only.';

create function public.reserve_question(p_owner uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.signer_limits (owner) values (p_owner)
    on conflict (owner) do nothing;

  update public.signer_limits
    set questions_used = questions_used + 1
    where owner = p_owner and questions_used < question_limit;

  return found;
end;
$$;

comment on function public.reserve_question(uuid) is
  'Takes one question from a Signer''s limit: true when reserved, false at the limit. Server-only.';

-- Hands back one reserved use when the model call failed before the model
-- returned. Never takes a count below zero.
create function public.release_analysis(p_owner uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.signer_limits
    set analyses_used = analyses_used - 1
    where owner = p_owner and analyses_used > 0;
$$;

comment on function public.release_analysis(uuid) is
  'Hands back one reserved analysis, never below zero. Server-only.';

create function public.release_question(p_owner uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.signer_limits
    set questions_used = questions_used - 1
    where owner = p_owner and questions_used > 0;
$$;

comment on function public.release_question(uuid) is
  'Hands back one reserved question, never below zero. Server-only.';

-- Supabase grants execute on new functions to the client roles by default,
-- so take it away and give it to service_role alone.
revoke all on function public.reserve_analysis(uuid) from public, anon, authenticated;
revoke all on function public.reserve_question(uuid) from public, anon, authenticated;
revoke all on function public.release_analysis(uuid) from public, anon, authenticated;
revoke all on function public.release_question(uuid) from public, anon, authenticated;
grant execute on function public.reserve_analysis(uuid) to service_role;
grant execute on function public.reserve_question(uuid) to service_role;
grant execute on function public.release_analysis(uuid) to service_role;
grant execute on function public.release_question(uuid) to service_role;

-- The app no longer calls these, and a client calling them directly would
-- change a count outside the server's reserve and release.
revoke all on function public.record_analysis() from public, anon, authenticated;
revoke all on function public.record_question() from public, anon, authenticated;
