-- 1. Admins may be signed in on several devices at once; the one-session
--    rule applies to customers only.
-- 2. Test accounts (profiles.is_test) are hidden from the admin panel and
--    statistics and never count as "the first account".

alter table public.profiles add column is_test boolean not null default false;

create or replace function private.has_access() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'active'
      and (p.role = 'admin' or (p.active_session is not null and p.active_session::text = private.request_session()))
  )
$$;

create or replace function public.claim_session(user_agent text default null) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  sid uuid := gen_random_uuid();
  st text;
  r text;
begin
  select status, role into st, r from public.profiles where id = auth.uid();
  if st is null then raise exception 'no_profile' using errcode = 'P0001'; end if;
  if st = 'blocked' then raise exception 'blocked' using errcode = 'P0001'; end if;
  update public.profiles set active_session = sid, last_login_at = now() where id = auth.uid();
  insert into public.login_events (user_id, user_agent) values (auth.uid(), left(user_agent, 300));
  if r <> 'admin' then
    delete from auth.sessions
     where user_id = auth.uid()
       and id is distinct from nullif(auth.jwt()->>'session_id','')::uuid;
  end if;
  return sid;
end $$;

create or replace function public.session_status(sid uuid) returns text
language sql stable security definer set search_path = '' as $$
  select case
    when p.status = 'blocked' then 'blocked'
    when p.role = 'admin' then 'ok'
    when p.active_session is distinct from sid then 'replaced'
    else 'ok' end
  from public.profiles p where p.id = auth.uid()
$$;

create or replace function public.register_profile(uid uuid, phone text, display_name text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  is_first boolean;
begin
  lock table public.profiles in share row exclusive mode;
  select not exists (select 1 from public.profiles where not is_test) into is_first;
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
    when not exists (select 1 from public.profiles where not is_test) then 'first'
    when exists (select 1 from public.allowed_phones a where a.phone = can_register.phone) then 'allowed'
    else 'not_allowed' end
$$;

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
  from public.profiles p where not p.is_test order by p.created_at desc;
end $$;

create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  return json_build_object(
    'users', (select count(*) from public.profiles where role = 'user' and not is_test),
    'blocked', (select count(*) from public.profiles where status = 'blocked' and not is_test),
    'waiting', (select count(*) from public.allowed_phones a where not exists (select 1 from public.profiles p where p.phone = a.phone)),
    'active_7d', (select count(distinct l.user_id) from public.login_events l join public.profiles p on p.id = l.user_id where not p.is_test and l.at > now() - interval '7 days'),
    'logins_30d', (select count(*) from public.login_events l join public.profiles p on p.id = l.user_id where not p.is_test and l.at > now() - interval '30 days'),
    'finished_all', (select count(*) from (select g.user_id from public.progress g join public.profiles p on p.id = g.user_id where not p.is_test and g.completed_at is not null group by g.user_id having count(*) >= 12) f),
    'saved_total', (select count(*) from public.saved_items s join public.profiles p on p.id = s.user_id where not p.is_test),
    'chapters', (select coalesce(json_agg(c order by c.id), '[]') from (
        select ch.id, ch.title_da,
          (select count(*) from public.progress g join public.profiles p on p.id = g.user_id where not p.is_test and g.chapter_id = ch.id) as visited,
          (select count(*) from public.progress g join public.profiles p on p.id = g.user_id where not p.is_test and g.chapter_id = ch.id and g.completed_at is not null) as completed
        from public.chapters ch) c)
  );
end $$;

-- Test accounts are managed from SQL, never from the admin panel.
create or replace function public.admin_user_detail(uid uuid) returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  if exists (select 1 from public.profiles where id = uid and is_test) then return json_build_object('profile', null); end if;
  return json_build_object(
    'profile', (select row_to_json(p) from (select id, phone, display_name, role, status, active_session is not null as online, last_login_at, created_at from public.profiles where id = uid) p),
    'progress', (select coalesce(json_agg(g order by g.chapter_id), '[]') from (select chapter_id, visited_at, completed_at from public.progress where user_id = uid) g),
    'logins', (select coalesce(json_agg(l), '[]') from (select at, user_agent from public.login_events where user_id = uid order by at desc limit 10) l),
    'saved', (select count(*) from public.saved_items where user_id = uid),
    'reset_pending', exists (select 1 from private.reset_codes r where r.user_id = uid and r.expires_at > now())
  );
end $$;
