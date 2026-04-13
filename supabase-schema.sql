-- Run this ONCE in Supabase Dashboard -> SQL Editor -> New query

create table if not exists public.app_data (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_data enable row level security;

drop policy if exists "anon full access" on public.app_data;
create policy "anon full access" on public.app_data
  for all to anon using (true) with check (true);

drop policy if exists "auth full access" on public.app_data;
create policy "auth full access" on public.app_data
  for all to authenticated using (true) with check (true);

-- Enable realtime so all clients see changes live
alter publication supabase_realtime add table public.app_data;

-- ========== FILE STORAGE ==========
insert into storage.buckets (id, name, public)
values ('files', 'files', true)
on conflict (id) do nothing;

drop policy if exists "anon upload files" on storage.objects;
create policy "anon upload files" on storage.objects for insert to anon with check (bucket_id = 'files');

drop policy if exists "anon read files" on storage.objects;
create policy "anon read files" on storage.objects for select to anon using (bucket_id = 'files');

drop policy if exists "anon update files" on storage.objects;
create policy "anon update files" on storage.objects for update to anon using (bucket_id = 'files');

drop policy if exists "anon delete files" on storage.objects;
create policy "anon delete files" on storage.objects for delete to anon using (bucket_id = 'files');
