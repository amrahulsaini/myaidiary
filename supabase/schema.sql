-- Run this in Supabase SQL Editor.
-- Requires: pgcrypto (for gen_random_uuid)
create extension if not exists pgcrypto;

-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- NOTES
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  theme text not null default 'default',
  font text not null default 'sans',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If you already ran the schema once, these keep upgrades safe.
alter table public.notes add column if not exists theme text not null default 'default';
alter table public.notes add column if not exists font text not null default 'sans';

create trigger notes_set_updated_at
before update on public.notes
for each row execute procedure public.set_updated_at();

alter table public.notes enable row level security;

create policy "notes_select_own" on public.notes
for select using (auth.uid() = user_id);

create policy "notes_insert_own" on public.notes
for insert with check (auth.uid() = user_id);

create policy "notes_update_own" on public.notes
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notes_delete_own" on public.notes
for delete using (auth.uid() = user_id);

-- NOTE ATTACHMENTS (metadata)
create table if not exists public.note_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references public.notes(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  mime_type text not null default 'application/octet-stream',
  size_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

alter table public.note_attachments enable row level security;

create policy "note_attachments_select_own" on public.note_attachments
for select using (
  auth.uid() = user_id
  and exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
);

create policy "note_attachments_insert_own" on public.note_attachments
for insert with check (
  auth.uid() = user_id
  and exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
);

create policy "note_attachments_delete_own" on public.note_attachments
for delete using (
  auth.uid() = user_id
  and exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid())
);

-- STORAGE BUCKET for attachments (private)
-- This creates a private bucket named 'note-attachments' if it doesn't exist.
insert into storage.buckets (id, name, public)
values ('note-attachments', 'note-attachments', false)
on conflict (id) do nothing;

-- Storage RLS policies for the bucket.
-- Supabase Storage uses storage.objects.owner as the uploader's user id.
create policy "note_attachments_storage_read_own" on storage.objects
for select to authenticated
using (bucket_id = 'note-attachments' and owner = auth.uid());

create policy "note_attachments_storage_insert_own" on storage.objects
for insert to authenticated
with check (bucket_id = 'note-attachments' and owner = auth.uid());

create policy "note_attachments_storage_delete_own" on storage.objects
for delete to authenticated
using (bucket_id = 'note-attachments' and owner = auth.uid());

-- EXPENSES
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null default 'INR',
  category text not null default 'general',
  description text not null default '',
  spent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger expenses_set_updated_at
before update on public.expenses
for each row execute procedure public.set_updated_at();

alter table public.expenses enable row level security;

create policy "expenses_select_own" on public.expenses
for select using (auth.uid() = user_id);

create policy "expenses_insert_own" on public.expenses
for insert with check (auth.uid() = user_id);

create policy "expenses_update_own" on public.expenses
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "expenses_delete_own" on public.expenses
for delete using (auth.uid() = user_id);

-- LENA-DENA (debts)
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person text not null,
  direction text not null check (direction in ('lent','borrowed')),
  amount numeric(12,2) not null,
  currency text not null default 'INR',
  note text not null default '',
  status text not null default 'open' check (status in ('open','settled')),
  occurred_at timestamptz not null default now(),
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger debts_set_updated_at
before update on public.debts
for each row execute procedure public.set_updated_at();

alter table public.debts enable row level security;

create policy "debts_select_own" on public.debts
for select using (auth.uid() = user_id);

create policy "debts_insert_own" on public.debts
for insert with check (auth.uid() = user_id);

create policy "debts_update_own" on public.debts
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "debts_delete_own" on public.debts
for delete using (auth.uid() = user_id);

-- TODOS
create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'open' check (status in ('open','done','canceled')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger todos_set_updated_at
before update on public.todos
for each row execute procedure public.set_updated_at();

alter table public.todos enable row level security;

create policy "todos_select_own" on public.todos
for select using (auth.uid() = user_id);

create policy "todos_insert_own" on public.todos
for insert with check (auth.uid() = user_id);

create policy "todos_update_own" on public.todos
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "todos_delete_own" on public.todos
for delete using (auth.uid() = user_id);

-- Realtime (optional but recommended):
-- Ensure these tables are in the supabase_realtime publication.
-- You may need to run this once per project.
alter publication supabase_realtime add table public.notes;
alter publication supabase_realtime add table public.note_attachments;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.debts;
alter publication supabase_realtime add table public.todos;
