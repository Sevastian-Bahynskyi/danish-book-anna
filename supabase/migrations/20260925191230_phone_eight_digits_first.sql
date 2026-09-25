-- 8 digits is a Danish number, checked before the 00 international prefix,
-- so "00 00 00 99" (the test account) becomes +4500000099, not +000099.
-- Same order as client/src/lib/phone.ts and the account Edge Function.
create or replace function private.normalize_phone(raw text) returns text
language sql immutable set search_path = '' as $$
  select case
    when regexp_replace(coalesce(raw,''), '[^0-9+]', '', 'g') ~ '^\+' then regexp_replace(raw, '[^0-9+]', '', 'g')
    when length(regexp_replace(coalesce(raw,''), '[^0-9]', '', 'g')) = 8 then '+45' || regexp_replace(raw, '[^0-9]', '', 'g')
    when regexp_replace(coalesce(raw,''), '[^0-9]', '', 'g') ~ '^00' then '+' || substr(regexp_replace(raw, '[^0-9]', '', 'g'), 3)
    else '+' || regexp_replace(coalesce(raw,''), '[^0-9]', '', 'g')
  end
$$;
