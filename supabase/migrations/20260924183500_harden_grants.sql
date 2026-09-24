-- Functions get EXECUTE for PUBLIC by default; make every grant explicit.
revoke execute on all functions in schema public from public, anon;
grant execute on function
  public.claim_session(text), public.session_status(uuid),
  public.admin_users(), public.admin_allowed_phones(), public.admin_add_phone(text, text), public.admin_remove_phone(text),
  public.admin_set_status(uuid, text), public.admin_end_session(uuid), public.admin_delete_user(uuid),
  public.admin_create_reset_code(uuid), public.admin_user_detail(uuid), public.admin_stats()
to authenticated;
revoke execute on function public.register_profile(uuid, text, text), public.can_register(text), public.consume_reset_code(text, text) from authenticated;
revoke execute on all functions in schema private from public, anon;

alter function private.request_session() set search_path = '';
alter function private.normalize_phone(text) set search_path = '';

-- allowed_phones and login_events are reached only through admin functions:
-- RLS is on with no policies on purpose (deny all direct access).
comment on table public.allowed_phones is 'Phones allowed to register. Read and written only via admin_* functions.';
comment on table public.login_events is 'Sign-in log. Written by claim_session, read via admin_* functions.';
