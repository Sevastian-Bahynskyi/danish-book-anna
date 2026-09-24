-- DANSK PÅ ARBEJDE: schema, access rules, one-session enforcement, admin API.
--
-- Access model
--   * Accounts are phone + password. Supabase Auth stores them as synthetic
--     e-mails (p<digits>@phone.dansk-paa-arbejde.app); the register Edge
--     Function creates them, so no SMS or e-mail provider is needed.
--   * The very first account becomes admin. Everyone after that must have
--     their phone number on allowed_phones.
--   * One active session per account: every request carries x-session-id,
--     and content is only readable while it matches profiles.active_session.

-- New objects are opt-in for the Data API.
alter default privileges for role postgres in schema public revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated, service_role, public;
alter default privileges for role postgres in schema public revoke usage, select on sequences from anon, authenticated, service_role;

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------- tables
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null unique,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  status text not null default 'active' check (status in ('active','blocked')),
  active_session uuid,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.allowed_phones (
  phone text primary key check (phone ~ '^\+[0-9]{8,15}$'),
  note text,
  added_at timestamptz not null default now(),
  added_by uuid references public.profiles(id) on delete set null
);

create table public.chapters (
  id smallint primary key,
  title_da text not null,
  description_ua text not null,
  intro_ua text not null
);

create table public.phrases (
  id serial primary key,
  chapter_id smallint not null references public.chapters(id) on delete cascade,
  sort smallint not null,
  da text not null,
  ua text not null,
  explanation_ua text,
  keywords text
);
create index on public.phrases (chapter_id, sort);

create table public.dialogues (
  id serial primary key,
  chapter_id smallint not null references public.chapters(id) on delete cascade,
  sort smallint not null default 1,
  title_ua text not null,
  lines jsonb not null -- [{ "who": "Anna", "me": true, "da": "...", "ua": "..." }]
);

create table public.notes (
  id serial primary key,
  chapter_id smallint not null references public.chapters(id) on delete cascade,
  sort smallint not null default 1,
  body_ua text not null
);

create table public.mistakes (
  id serial primary key,
  chapter_id smallint not null references public.chapters(id) on delete cascade,
  sort smallint not null default 1,
  wrong text not null,
  better text not null,
  why_ua text not null
);

create table public.messages (
  id serial primary key,
  chapter_id smallint not null references public.chapters(id) on delete cascade,
  sort smallint not null default 1,
  audience_ua text not null,
  da text not null,
  ua text not null
);

create table public.exercises (
  id serial primary key,
  chapter_id smallint not null references public.chapters(id) on delete cascade,
  sort smallint not null default 1,
  question_ua text not null,
  options jsonb not null,  -- ["...", "...", "..."]
  correct smallint not null,
  explain_ua text
);

create table public.vocab (
  id serial primary key,
  chapter_id smallint not null references public.chapters(id) on delete cascade,
  sort smallint not null default 1,
  da text not null,
  ua text not null
);

create table public.saved_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('phrase','message')),
  item_id int not null,
  created_at timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);

create table public.progress (
  user_id uuid not null references public.profiles(id) on delete cascade,
  chapter_id smallint not null references public.chapters(id) on delete cascade,
  visited_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (user_id, chapter_id)
);

create table public.login_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  at timestamptz not null default now(),
  user_agent text
);
create index on public.login_events (user_id, at desc);

create table private.reset_codes (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts smallint not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers
create or replace function private.request_session() returns text
language sql stable as $$
  select coalesce(current_setting('request.headers', true)::json->>'x-session-id', '')
$$;

-- True while the caller is an active account on its current session.
create or replace function private.has_access() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'
      and p.active_session is not null
      and p.active_session::text = private.request_session()
  )
$$;

create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.has_access() and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  )
$$;

create or replace function private.normalize_phone(raw text) returns text
language sql immutable as $$
  select case
    when regexp_replace(coalesce(raw,''), '[^0-9+]', '', 'g') ~ '^\+' then regexp_replace(raw, '[^0-9+]', '', 'g')
    when regexp_replace(coalesce(raw,''), '[^0-9]', '', 'g') ~ '^00' then '+' || substr(regexp_replace(raw, '[^0-9]', '', 'g'), 3)
    when length(regexp_replace(coalesce(raw,''), '[^0-9]', '', 'g')) = 8 then '+45' || regexp_replace(raw, '[^0-9]', '', 'g')
    else '+' || regexp_replace(coalesce(raw,''), '[^0-9]', '', 'g')
  end
$$;

grant usage on schema private to authenticated, service_role;
grant execute on function private.has_access(), private.is_admin(), private.request_session() to authenticated;
grant execute on function private.normalize_phone(text) to service_role;

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.allowed_phones enable row level security;
alter table public.chapters enable row level security;
alter table public.phrases enable row level security;
alter table public.dialogues enable row level security;
alter table public.notes enable row level security;
alter table public.mistakes enable row level security;
alter table public.messages enable row level security;
alter table public.exercises enable row level security;
alter table public.vocab enable row level security;
alter table public.saved_items enable row level security;
alter table public.progress enable row level security;
alter table public.login_events enable row level security;

-- Own profile is always readable (the app needs it to explain a block or a replaced session).
create policy "own profile" on public.profiles for select to authenticated using (id = (select auth.uid()));

-- Paid content: active account on its current session only.
create policy "content" on public.chapters  for select to authenticated using ((select private.has_access()));
create policy "content" on public.phrases   for select to authenticated using ((select private.has_access()));
create policy "content" on public.dialogues for select to authenticated using ((select private.has_access()));
create policy "content" on public.notes     for select to authenticated using ((select private.has_access()));
create policy "content" on public.mistakes  for select to authenticated using ((select private.has_access()));
create policy "content" on public.messages  for select to authenticated using ((select private.has_access()));
create policy "content" on public.exercises for select to authenticated using ((select private.has_access()));
create policy "content" on public.vocab     for select to authenticated using ((select private.has_access()));

create policy "own saved" on public.saved_items for all to authenticated
  using (user_id = (select auth.uid()) and (select private.has_access()))
  with check (user_id = (select auth.uid()) and (select private.has_access()));
create policy "own progress" on public.progress for all to authenticated
  using (user_id = (select auth.uid()) and (select private.has_access()))
  with check (user_id = (select auth.uid()) and (select private.has_access()));

grant select on public.profiles to authenticated;
grant select on public.chapters, public.phrases, public.dialogues, public.notes, public.mistakes, public.messages, public.exercises, public.vocab to authenticated;
grant select, insert, update, delete on public.saved_items, public.progress to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on private.reset_codes to service_role;

-- ---------------------------------------------------------------- sessions
-- Called right after sign-in. Makes this device the only active session:
-- other refresh tokens are revoked and the old device fails the header check.
create or replace function public.claim_session(user_agent text default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  sid uuid := gen_random_uuid();
  st text;
begin
  select status into st from public.profiles where id = auth.uid();
  if st is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  if st = 'blocked' then raise exception 'blocked' using errcode = 'P0001'; end if;

  update public.profiles set active_session = sid, last_login_at = now() where id = auth.uid();
  insert into public.login_events (user_id, user_agent) values (auth.uid(), left(user_agent, 300));
  delete from auth.sessions
   where user_id = auth.uid()
     and id is distinct from nullif(auth.jwt()->>'session_id','')::uuid;
  return sid;
end $$;

-- 'ok' | 'replaced' (signed in elsewhere or ended by admin) | 'blocked'
create or replace function public.session_status(sid uuid) returns text
language sql stable security definer set search_path = '' as $$
  select case
    when p.status = 'blocked' then 'blocked'
    when p.active_session is distinct from sid then 'replaced'
    else 'ok' end
  from public.profiles p where p.id = auth.uid()
$$;

grant execute on function public.claim_session(text), public.session_status(uuid) to authenticated;

-- ---------------------------------------------------------------- registration (service role only)
-- The first profile ever becomes admin; later ones need an allowed phone.
create or replace function public.register_profile(uid uuid, phone text, display_name text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  is_first boolean;
begin
  lock table public.profiles in share row exclusive mode;
  select not exists (select 1 from public.profiles) into is_first;
  if not is_first and not exists (select 1 from public.allowed_phones a where a.phone = register_profile.phone) then
    raise exception 'phone_not_allowed' using errcode = 'P0001';
  end if;
  insert into public.profiles (id, phone, display_name, role)
  values (uid, register_profile.phone, nullif(trim(display_name), ''), case when is_first then 'admin' else 'user' end);
  return case when is_first then 'admin' else 'user' end;
end $$;

create or replace function public.can_register(phone text) returns text
language sql stable security definer set search_path = '' as $$
  select case
    when exists (select 1 from public.profiles p where p.phone = can_register.phone) then 'exists'
    when not exists (select 1 from public.profiles) then 'first'
    when exists (select 1 from public.allowed_phones a where a.phone = can_register.phone) then 'allowed'
    else 'not_allowed' end
$$;

-- Reset code check: returns the user id when the code matches, else null.
create or replace function public.consume_reset_code(phone text, code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid;
  rc private.reset_codes;
begin
  select p.id into uid from public.profiles p where p.phone = consume_reset_code.phone;
  if uid is null then return null; end if;
  select * into rc from private.reset_codes r where r.user_id = uid for update;
  if rc is null or rc.expires_at < now() or rc.attempts >= 5 then return null; end if;
  if rc.code_hash <> extensions.crypt(code, rc.code_hash) then
    update private.reset_codes set attempts = attempts + 1 where user_id = uid;
    return null;
  end if;
  delete from private.reset_codes where user_id = uid;
  update public.profiles set active_session = null where id = uid;
  delete from auth.sessions where user_id = uid;
  return uid;
end $$;

revoke execute on function public.register_profile(uuid, text, text), public.can_register(text), public.consume_reset_code(text, text) from public, anon, authenticated;
grant execute on function public.register_profile(uuid, text, text), public.can_register(text), public.consume_reset_code(text, text) to service_role;

-- ---------------------------------------------------------------- admin API
create or replace function private.assert_admin() returns void
language plpgsql stable security definer set search_path = '' as $$
begin
  if not private.is_admin() then raise exception 'not_admin' using errcode = '42501'; end if;
end $$;

create or replace function public.admin_users() returns table (
  id uuid, phone text, display_name text, role text, status text, online boolean,
  last_login_at timestamptz, created_at timestamptz, chapters_done int, saved int, logins int)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  return query
  select p.id, p.phone, p.display_name, p.role, p.status, p.active_session is not null,
         p.last_login_at, p.created_at,
         (select count(*)::int from public.progress g where g.user_id = p.id and g.completed_at is not null),
         (select count(*)::int from public.saved_items s where s.user_id = p.id),
         (select count(*)::int from public.login_events l where l.user_id = p.id)
  from public.profiles p order by p.created_at desc;
end $$;

create or replace function public.admin_allowed_phones() returns table (phone text, note text, added_at timestamptz, registered boolean)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  return query select a.phone, a.note, a.added_at, exists (select 1 from public.profiles p where p.phone = a.phone)
  from public.allowed_phones a order by a.added_at desc;
end $$;

create or replace function public.admin_add_phone(raw_phone text, note text default null) returns text
language plpgsql security definer set search_path = '' as $$
declare ph text := private.normalize_phone(raw_phone);
begin
  perform private.assert_admin();
  if ph !~ '^\+[0-9]{8,15}$' then raise exception 'bad_phone' using errcode = 'P0001'; end if;
  insert into public.allowed_phones (phone, note, added_by) values (ph, nullif(trim(note), ''), auth.uid())
  on conflict (phone) do update set note = coalesce(excluded.note, public.allowed_phones.note);
  return ph;
end $$;

create or replace function public.admin_remove_phone(phone text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  delete from public.allowed_phones a where a.phone = admin_remove_phone.phone;
end $$;

create or replace function public.admin_set_status(uid uuid, new_status text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  if uid = auth.uid() then raise exception 'not_self' using errcode = 'P0001'; end if;
  update public.profiles set status = new_status,
    active_session = case when new_status = 'blocked' then null else active_session end
  where id = uid;
  if new_status = 'blocked' then delete from auth.sessions where user_id = uid; end if;
end $$;

create or replace function public.admin_end_session(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  update public.profiles set active_session = null where id = uid;
  delete from auth.sessions where user_id = uid;
end $$;

-- Deletes the account and its access. The phone is removed from allowed_phones too.
create or replace function public.admin_delete_user(uid uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare ph text;
begin
  perform private.assert_admin();
  if uid = auth.uid() then raise exception 'not_self' using errcode = 'P0001'; end if;
  select phone into ph from public.profiles where id = uid;
  delete from public.allowed_phones where phone = ph;
  delete from auth.users where id = uid;
end $$;

-- Returns a fresh 6-digit code for Anna to send; valid 48 hours, 5 attempts.
create or replace function public.admin_create_reset_code(uid uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare code text := lpad((floor(random() * 1000000))::int::text, 6, '0');
begin
  perform private.assert_admin();
  insert into private.reset_codes (user_id, code_hash, expires_at)
  values (uid, extensions.crypt(code, extensions.gen_salt('bf')), now() + interval '48 hours')
  on conflict (user_id) do update set code_hash = excluded.code_hash, expires_at = excluded.expires_at, attempts = 0, created_at = now();
  return code;
end $$;

create or replace function public.admin_user_detail(uid uuid) returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  return json_build_object(
    'profile', (select row_to_json(p) from (select id, phone, display_name, role, status, active_session is not null as online, last_login_at, created_at from public.profiles where id = uid) p),
    'progress', (select coalesce(json_agg(g order by g.chapter_id), '[]') from (select chapter_id, visited_at, completed_at from public.progress where user_id = uid) g),
    'logins', (select coalesce(json_agg(l), '[]') from (select at, user_agent from public.login_events where user_id = uid order by at desc limit 10) l),
    'saved', (select count(*) from public.saved_items where user_id = uid),
    'reset_pending', exists (select 1 from private.reset_codes r where r.user_id = uid and r.expires_at > now())
  );
end $$;

create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  return json_build_object(
    'users', (select count(*) from public.profiles where role = 'user'),
    'blocked', (select count(*) from public.profiles where status = 'blocked'),
    'waiting', (select count(*) from public.allowed_phones a where not exists (select 1 from public.profiles p where p.phone = a.phone)),
    'active_7d', (select count(distinct user_id) from public.login_events where at > now() - interval '7 days'),
    'logins_30d', (select count(*) from public.login_events where at > now() - interval '30 days'),
    'finished_all', (select count(*) from (select user_id from public.progress where completed_at is not null group by user_id having count(*) >= 12) f),
    'saved_total', (select count(*) from public.saved_items),
    'chapters', (select coalesce(json_agg(c order by c.id), '[]') from (
        select ch.id, ch.title_da,
          (select count(*) from public.progress g where g.chapter_id = ch.id) as visited,
          (select count(*) from public.progress g where g.chapter_id = ch.id and g.completed_at is not null) as completed
        from public.chapters ch) c)
  );
end $$;

grant execute on function
  public.admin_users(), public.admin_allowed_phones(), public.admin_add_phone(text, text), public.admin_remove_phone(text),
  public.admin_set_status(uuid, text), public.admin_end_session(uuid), public.admin_delete_user(uuid),
  public.admin_create_reset_code(uuid), public.admin_user_detail(uuid), public.admin_stats()
to authenticated;
