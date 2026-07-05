-- Micro SaaS Validator — Supabase schema
-- Run this in the Supabase SQL editor.

create table if not exists public.ideas (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  input jsonb not null,
  report jsonb not null,
  created_at timestamptz not null default now(),
  status text not null default 'Validated',
  industry text not null default '',
  tags text[] not null default '{}',
  build jsonb -- "Build My Startup" kit (nullable)
);

-- Existing installs: add the column with
--   alter table public.ideas add column if not exists build jsonb;

alter table public.ideas enable row level security;

create policy "Users can read own ideas"
  on public.ideas for select
  using (auth.uid() = user_id);

create policy "Users can insert own ideas"
  on public.ideas for insert
  with check (auth.uid() = user_id);

create policy "Users can update own ideas"
  on public.ideas for update
  using (auth.uid() = user_id);

create policy "Users can delete own ideas"
  on public.ideas for delete
  using (auth.uid() = user_id);

create index if not exists ideas_user_created_idx
  on public.ideas (user_id, created_at desc);
