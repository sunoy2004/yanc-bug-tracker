-- Migration: Update issues table for detailed issue reporting
-- Run this in Supabase SQL Editor. Safe to run on existing data; new columns are nullable
-- with defaults where appropriate so existing rows are preserved.

-- Step 1: Add issue_type with check constraint (nullable for existing rows)
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS issue_type text;

ALTER TABLE public.issues
  DROP CONSTRAINT IF EXISTS issues_issue_type_check;

ALTER TABLE public.issues
  ADD CONSTRAINT issues_issue_type_check
  CHECK (issue_type IS NULL OR issue_type IN ('Bug', 'Enhancement', 'Working as Expected'));

COMMENT ON COLUMN public.issues.issue_type IS 'Type of issue: Bug, Enhancement, or Working as Expected';

-- Step 2: Add issue_description (nullable for existing rows)
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS issue_description text;

COMMENT ON COLUMN public.issues.issue_description IS 'Full description of the issue';

-- Step 3: Add expected_result (nullable for existing rows)
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS expected_result text;

COMMENT ON COLUMN public.issues.expected_result IS 'Expected behavior or result';

-- Step 4: Add steps_to_reproduce (nullable for existing rows)
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS steps_to_reproduce text;

COMMENT ON COLUMN public.issues.steps_to_reproduce IS 'Steps to reproduce the issue';

-- Step 5: Add device with check constraint (nullable for existing rows)
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS device text;

ALTER TABLE public.issues
  DROP CONSTRAINT IF EXISTS issues_device_check;

ALTER TABLE public.issues
  ADD CONSTRAINT issues_device_check
  CHECK (device IS NULL OR device IN ('Desktop', 'Tablet', 'Mobile'));

COMMENT ON COLUMN public.issues.device IS 'Device type: Desktop, Tablet, or Mobile';

-- Step 6: Add os with check constraint (nullable for existing rows)
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS os text;

ALTER TABLE public.issues
  DROP CONSTRAINT IF EXISTS issues_os_check;

ALTER TABLE public.issues
  ADD CONSTRAINT issues_os_check
  CHECK (os IS NULL OR os IN ('iOS', 'Windows', 'Android'));

COMMENT ON COLUMN public.issues.os IS 'Operating system';

-- Step 7: Add browser with check constraint (nullable for existing rows)
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS browser text;

ALTER TABLE public.issues
  DROP CONSTRAINT IF EXISTS issues_browser_check;

ALTER TABLE public.issues
  ADD CONSTRAINT issues_browser_check
  CHECK (browser IS NULL OR browser IN ('Chrome', 'Safari', 'Firefox', 'Other'));

COMMENT ON COLUMN public.issues.browser IS 'Browser used';

-- Step 8: Add other_browser nullable text (required when browser = Other)
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS other_browser text;

COMMENT ON COLUMN public.issues.other_browser IS 'Browser name when browser is Other';

-- Step 9: Add reported_at with default now() for new rows; backfill from created_at for existing
ALTER TABLE public.issues
  ADD COLUMN IF NOT EXISTS reported_at timestamptz DEFAULT now();

COMMENT ON COLUMN public.issues.reported_at IS 'When the issue was reported; defaults to submission time';

-- Backfill reported_at from created_at where reported_at is null (existing rows)
UPDATE public.issues
SET reported_at = created_at
WHERE reported_at IS NULL;

-- Step 10: Ensure severity constraint allows existing values (Low, Medium, High, Critical)
-- Existing table already has check (severity in ('Low','Medium','High','Critical')); no change needed.

-- Step 11: updated_at is already maintained by trigger set_updated_at; no change.

-- Optional: If you need to make assigned_to nullable for "Unassigned", uncomment below.
-- ALTER TABLE public.issues ALTER COLUMN assigned_to DROP NOT NULL;
-- For this migration we keep assigned_to as-is; use empty string or 'Unassigned' in app.
