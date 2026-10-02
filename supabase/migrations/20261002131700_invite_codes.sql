-- Invite codes: v1 is an invite-only beta (ADR 0007). The owner creates
-- single-use codes with scripts/create-invite-codes.ts and hands them out;
-- each one creates exactly one account and is then spent.
--
-- No client can read or write this table. The owner script writes it with
-- the secret key (service_role, which bypasses row-level security). A code is
-- spent by a trigger on auth.users, in the same transaction that creates the
-- account, so a wrong or used code creates no account, and two sign-ups
-- racing on one code produce one account.
--
-- A code is spent once used_at is set. used_by goes null if that Signer's
-- account is later deleted, but used_at stays, so the code stays spent.

create table public.invite_codes (
  -- The canonical form: uppercase letters and digits only. The sign-up form
  -- tolerates lowercase, spaces and hyphens and strips them before checking.
  code text primary key check (code ~ '^[A-Z0-9]{12,}$'),
  created_at timestamptz not null default now(),
  -- Deferred so the trigger below can record the new Signer before their
  -- auth.users row exists. The check runs at commit, when it does.
  used_by uuid references auth.users (id) on delete set null deferrable initially deferred,
  used_at timestamptz,
  check (used_by is null or used_at is not null)
);

comment on table public.invite_codes is
  'Single-use invite codes. Spent by the auth.users trigger; no client may read or write them.';

-- Row-level security with no policies matches no rows for any client role,
-- and revoking the privileges makes an attempt fail loudly.
alter table public.invite_codes enable row level security;
revoke all on table public.invite_codes from anon, authenticated;

-- Spends the invite code a sign-up carries, before the account row is
-- written. The sign-up server action passes the code as user metadata
-- (options.data.invite_code). The code is removed from the stored metadata,
-- since it means nothing once spent.
--
-- The update takes a row lock on the code. A second sign-up racing on the
-- same code waits for the first to commit, then finds used_at set, matches
-- nothing and is refused, so its account is never created.
--
-- Every new auth.users row needs a code, including one the owner adds by hand
-- in Studio or through the admin API: put invite_code in its user metadata.
create function public.spend_invite_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_code text := new.raw_user_meta_data ->> 'invite_code';
begin
  if invite_code is null or invite_code = '' then
    raise exception 'Sign-up needs an invite code.'
      using errcode = 'check_violation';
  end if;

  update public.invite_codes
    set used_by = new.id, used_at = now()
    where code = invite_code and used_at is null;

  if not found then
    raise exception 'That invite code is unknown or already used.'
      using errcode = 'check_violation';
  end if;

  new.raw_user_meta_data := new.raw_user_meta_data - 'invite_code';
  return new;
end;
$$;

comment on function public.spend_invite_code() is
  'Spends the invite code a new account carries, or refuses the account.';

-- Trigger functions cannot be called directly, but Supabase grants execute
-- on new functions to client roles by default, so take it away.
revoke all on function public.spend_invite_code() from public, anon, authenticated;

create trigger spend_invite_code
  before insert on auth.users
  for each row execute function public.spend_invite_code();

-- Whether a code is 'unknown', 'used' or 'available', so the sign-up form
-- can tell a wrong code from a spent one in plain words. GoTrue reports the
-- trigger's refusal only as a generic database error. The trigger stays the
-- real guard: a code this calls available can still be spent by someone else
-- a moment later.
--
-- Signed-out visitors may call this. It reveals only whether one exact code
-- exists, and codes are 16 random characters from a 31-character alphabet
-- (about 79 bits), so guessing one this way is not practical.
create function public.invite_code_status(code text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when ic.code is null then 'unknown'
    when ic.used_at is null then 'available'
    else 'used'
  end
  from (select 1) as one
  left join public.invite_codes as ic on ic.code = invite_code_status.code;
$$;

comment on function public.invite_code_status(text) is
  'unknown, used or available, for the sign-up form. Never the guard itself.';

revoke all on function public.invite_code_status(text) from public;
grant execute on function public.invite_code_status(text) to anon, authenticated;
