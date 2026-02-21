-- Run this script in the Supabase SQL editor
-- It creates the `issues` table, enables RLS (development policy),
-- and adds a trigger to update `updated_at` on modifications.

-- Ensure pgcrypto extension is available for gen_random_uuid()
create extension if not exists pgcrypto;

-- Create issues table
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  version text not null,
  reporter text not null,
  created_at timestamptz default now(),
  assigned_to text not null,
  severity text check (severity in ('Low','Medium','Major','Showstopper')) not null,
  status text check (status in ('Open','In Progress','Resolved','Reopen','To Do')) not null default 'Open',
  updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.issues enable row level security;

-- Development-only permissive policy (DO NOT use in production)
create policy "Allow all operations"
  on public.issues
  for all
  using (true)
  with check (true);

-- Trigger to keep updated_at current on updates
create function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.issues
  for each row
  execute procedure public.set_updated_at();

