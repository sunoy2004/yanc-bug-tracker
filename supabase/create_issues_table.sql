-- Master script: create `issues` table with final schema
-- Run this in the Supabase SQL editor for the YANC Bug Tracker project.

-- Ensure pgcrypto extension is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Shared updated_at trigger function (reused across tables)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create issues table with all final columns and constraints
CREATE TABLE IF NOT EXISTS public.issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  version text NOT NULL,
  reporter text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  assigned_to text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL DEFAULT 'Open',
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Detailed reporting fields
  issue_type text,
  issue_description text,
  expected_result text,
  steps_to_reproduce text,
  device text,
  os text,
  browser text,
  other_browser text,
  reported_at timestamptz DEFAULT now(),
);

-- Column comments for documentation
COMMENT ON COLUMN public.issues.issue_type IS 'Type of issue: Bug, Enhancement, or Working as Expected';
COMMENT ON COLUMN public.issues.issue_description IS 'Full description of the issue';
COMMENT ON COLUMN public.issues.expected_result IS 'Expected behavior or result';
COMMENT ON COLUMN public.issues.steps_to_reproduce IS 'Steps to reproduce the issue';
COMMENT ON COLUMN public.issues.device IS 'Device type: Desktop, Tablet, or Mobile';
COMMENT ON COLUMN public.issues.os IS 'Operating system';
COMMENT ON COLUMN public.issues.browser IS 'Browser used';
COMMENT ON COLUMN public.issues.other_browser IS 'Browser name when browser is Other';
COMMENT ON COLUMN public.issues.reported_at IS 'When the issue was reported; defaults to submission time';

-- Trigger to keep updated_at current on updates
DROP TRIGGER IF EXISTS set_issues_updated_at ON public.issues;

CREATE TRIGGER set_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Development-only permissive policy (DO NOT use in production)
DROP POLICY IF EXISTS "Allow all operations" ON public.issues;

CREATE POLICY "Allow all operations"
  ON public.issues
  FOR ALL
  USING (true)
  WITH CHECK (true);

