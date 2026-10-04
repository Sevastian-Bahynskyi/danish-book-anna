-- last_seen_at was backfilled only from last_login_at, so visits made before
-- the column existed (sessions persist, no new sign-in) were lost. Backfill
-- from the learner's own activity too, and stamp last_seen_at whenever they
-- read a chapter or save something, so it never depends on session_status alone.

update public.profiles p set last_seen_at = greatest(
  p.last_seen_at,
  (select max(greatest(g.visited_at, g.completed_at)) from public.progress g where g.user_id = p.id),
  (select max(s.created_at) from public.saved_items s where s.user_id = p.id),
  (select max(s.created_at) from public.grammar_saved s where s.user_id = p.id),
  (select max(l.at) from public.login_events l where l.user_id = p.id)
);

create or replace function private.touch_last_seen() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set last_seen_at = now()
   where id = new.user_id and (last_seen_at is null or last_seen_at < now() - interval '1 minute');
  return null;
end $$;
revoke execute on function private.touch_last_seen() from public, anon, authenticated;

create trigger progress_touch_last_seen after insert or update on public.progress
  for each row execute function private.touch_last_seen();
create trigger saved_items_touch_last_seen after insert on public.saved_items
  for each row execute function private.touch_last_seen();
create trigger grammar_saved_touch_last_seen after insert on public.grammar_saved
  for each row execute function private.touch_last_seen();
