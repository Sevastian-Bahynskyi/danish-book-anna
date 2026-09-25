insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audio', 'audio', true, 6291456, array['audio/mpeg'])
on conflict (id) do nothing;
