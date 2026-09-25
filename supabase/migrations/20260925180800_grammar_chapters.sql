-- Grammar becomes chapters 13 and 14 of the book, synced like the others.
-- The grammar text itself ships with the app (client/src/content/grammar.json);
-- these rows let `progress` and the admin statistics count 13 and 14.
insert into public.chapters (id, title_da, description_ua, intro_ua) values
  (13, 'Sådan bygger man sætninger på dansk', 'Як будувати речення данською', ''),
  (14, 'Små ord, man tit blander sammen', 'Маленькі слова, які постійно плутають', '')
on conflict (id) do update set title_da = excluded.title_da, description_ua = excluded.description_ua;

-- Grammar topics a reader has opened ("13.1" … "14.11").
create table public.grammar_topics_read (
  user_id uuid not null references public.profiles(id) on delete cascade,
  topic_id text not null check (topic_id ~ '^1[34]\.[0-9]{1,2}$'),
  read_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

-- Saved grammar topics ("topic:13.1") and examples ("example:13.1:4").
create table public.grammar_saved (
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null check (item_id ~ '^(topic:1[34]\.[0-9]{1,2}|example:1[34]\.[0-9]{1,2}:[0-9]{1,3})$'),
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.grammar_topics_read enable row level security;
alter table public.grammar_saved enable row level security;

create policy "own grammar read" on public.grammar_topics_read for all to authenticated
  using (user_id = (select auth.uid()) and (select private.has_access()))
  with check (user_id = (select auth.uid()) and (select private.has_access()));
create policy "own grammar saved" on public.grammar_saved for all to authenticated
  using (user_id = (select auth.uid()) and (select private.has_access()))
  with check (user_id = (select auth.uid()) and (select private.has_access()));

grant select, insert, update, delete on public.grammar_topics_read, public.grammar_saved to authenticated;
grant all on public.grammar_topics_read, public.grammar_saved to service_role;

-- Admin numbers: "finished all" means every chapter (now 14), and saved counts
-- include grammar saves.
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
         (select count(*)::int from public.saved_items s where s.user_id = p.id)
           + (select count(*)::int from public.grammar_saved s where s.user_id = p.id),
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
    'profile', (select row_to_json(p) from (select id, phone, display_name, role, status, active_session is not null as online, last_login_at, created_at from public.profiles where id = uid) p),
    'progress', (select coalesce(json_agg(g order by g.chapter_id), '[]') from (select chapter_id, visited_at, completed_at from public.progress where user_id = uid) g),
    'logins', (select coalesce(json_agg(l), '[]') from (select at, user_agent from public.login_events where user_id = uid order by at desc limit 10) l),
    'saved', (select count(*) from public.saved_items where user_id = uid) + (select count(*) from public.grammar_saved where user_id = uid),
    'reset_pending', exists (select 1 from private.reset_codes r where r.user_id = uid and r.expires_at > now())
  );
end $$;
