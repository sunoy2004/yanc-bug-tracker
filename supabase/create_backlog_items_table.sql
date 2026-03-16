-- Master script: create `backlog_items` table with final schema
-- Run this in the Supabase SQL editor for the YANC Bug Tracker project.

-- Create table
CREATE TABLE IF NOT EXISTS public.backlog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reporter text NOT NULL,
  priority text NOT NULL,
  status text NOT NULL DEFAULT 'To do',
  version text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Priority constraint
ALTER TABLE public.backlog_items
  DROP CONSTRAINT IF EXISTS backlog_items_priority_check;

ALTER TABLE public.backlog_items
  ADD CONSTRAINT backlog_items_priority_check
  CHECK (priority IN ('High', 'Medium', 'Low'));

COMMENT ON COLUMN public.backlog_items.priority IS 'Backlog priority: High, Medium, or Low';

-- Status constraint
ALTER TABLE public.backlog_items
  DROP CONSTRAINT IF EXISTS backlog_items_status_check;

ALTER TABLE public.backlog_items
  ADD CONSTRAINT backlog_items_status_check
  CHECK (status IN ('To do', 'In progress', 'Done', 'Deferred'));

COMMENT ON COLUMN public.backlog_items.status IS 'Backlog status: To do, In progress, Done, or Deferred';

-- Ensure pgcrypto extension for gen_random_uuid (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Keep created_at as original insertion time; updated_at maintained by trigger.

-- Updated_at trigger function (reused if already present)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to backlog_items
DROP TRIGGER IF EXISTS set_backlog_items_updated_at ON public.backlog_items;

CREATE TRIGGER set_backlog_items_updated_at
BEFORE UPDATE ON public.backlog_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.backlog_items ENABLE ROW LEVEL SECURITY;

-- Development policy: allow full access to both anon and authenticated users
-- (matches open dev style used for issues so the browser client can read/write)
DROP POLICY IF EXISTS "Allow all operations for authenticated users on backlog_items" ON public.backlog_items;
DROP POLICY IF EXISTS "Allow all operations for anon and authenticated on backlog_items" ON public.backlog_items;

CREATE POLICY "Allow all operations for anon and authenticated on backlog_items"
ON public.backlog_items
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

