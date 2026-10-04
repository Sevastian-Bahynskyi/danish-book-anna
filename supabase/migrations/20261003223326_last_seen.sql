-- "Last visit" in the admin panel used last_login_at, which only changes on a
-- fresh sign-in. Sessions persist, so a learner who opens the app every day
-- looked inactive for weeks. Track real activity instead: session_status runs
-- on app start, every minute and on focus, so it stamps last_seen_at (at most
-- once a minute to keep writes cheap).

alter table public.profiles add column last_seen_at timestamptz;
update public.profiles set last_seen_at = last_login_at;

create or replace function public.session_status(sid uuid) returns text
language plpgsql volatile security definer set search_path = '' as $$
declare
  st text;
  r text;
  cur uuid;
begin
  select status, role, active_session into st, r, cur from public.profiles where id = auth.uid();
  if st is null then return null; end if;
  if st = 'blocked' then return 'blocked'; end if;
  if r <> 'admin' and cur is distinct from sid then return 'replaced'; end if;
  update public.profiles set last_seen_at = now()
   where id = auth.uid() and (last_seen_at is null or last_seen_at < now() - interval '1 minute');
  return 'ok';
end $$;

drop function public.admin_users();
create function public.admin_users() returns table (
  id uuid, phone text, display_name text, role text, status text, online boolean,
  last_login_at timestamptz, last_seen_at timestamptz, created_at timestamptz, chapters_done int, saved int, logins int)
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  return query
  select p.id, p.phone, p.display_name, p.role, p.status, p.active_session is not null,
         p.last_login_at, p.last_seen_at, p.created_at,
         (select count(*)::int from public.progress g where g.user_id = p.id and g.completed_at is not null),
         (select count(*)::int from public.saved_items s where s.user_id = p.id)
           + (select count(*)::int from public.grammar_saved s where s.user_id = p.id),
         (select count(*)::int from public.login_events l where l.user_id = p.id)
  from public.profiles p where not p.is_test order by p.created_at desc;
end $$;
revoke execute on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;

create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  return json_build_object(
    'users', (select count(*) from public.profiles where role = 'user' and not is_test),
    'blocked', (select count(*) from public.profiles where status = 'blocked' and not is_test),
    'waiting', (select count(*) from public.allowed_phones a where not exists (select 1 from public.profiles p where p.phone = a.phone)),
    'active_7d', (select count(*) from public.profiles p where not p.is_test and p.last_seen_at > now() - interval '7 days'),
    'logins_30d', (select count(*) from public.login_events l join public.profiles p on p.id = l.user_id where not p.is_test and l.at > now() - interval '30 days'),
    'finished_all', (select count(*) from (select g.user_id from public.progress g join public.profiles p on p.id = g.user_id where not p.is_test and g.completed_at is not null group by g.user_id having count(*) >= (select count(*) from public.chapters)) f),
    'saved_total', (select count(*) from public.saved_items s join public.profiles p on p.id = s.user_id where not p.is_test)
      + (select count(*) from public.grammar_saved s join public.profiles p on p.id = s.user_id where not p.is_test),
    'chapters', (select coalesce(json_agg(c order by c.id), '[]') from (
        select ch.id, ch.title_da,
          (select count(*) from public.progress g join public.profiles p on p.id = g.user_id where not p.is_test and g.chapter_id = ch.id) as visited,
          (select count(*) from public.progress g join public.profiles p on p.id = g.user_id where not p.is_test and g.chapter_id = ch.id and g.completed_at is not null) as completed
        from public.chapters ch) c)
  );
end $$;

create or replace function public.admin_user_detail(uid uuid) returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  perform private.assert_admin();
  if exists (select 1 from public.profiles where id = uid and is_test) then return json_build_object('profile', null); end if;
  return json_build_object(
    'profile', (select row_to_json(p) from (select id, phone, display_name, role, status, active_session is not null as online, last_login_at, last_seen_at, created_at from public.profiles where id = uid) p),
    'progress', (select coalesce(json_agg(g order by g.chapter_id), '[]') from (select chapter_id, visited_at, completed_at from public.progress where user_id = uid) g),
    'logins', (select coalesce(json_agg(l), '[]') from (select at, user_agent from public.login_events where user_id = uid order by at desc limit 10) l),
    'saved', (select count(*) from public.saved_items where user_id = uid) + (select count(*) from public.grammar_saved where user_id = uid),
    'reset_pending', exists (select 1 from private.reset_codes r where r.user_id = uid and r.expires_at > now())
  );
end $$;
