-- Multi-project issues and backlog tables for YANC Bug Tracker
-- Run this once in Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

------------------------------------------------------------
-- 1) issues_yanc_website
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.issues_yanc_website (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type text NOT NULL CHECK (issue_type IN ('Bug', 'Enhancement', 'Working as Expected')),
  issue_description text NOT NULL,
  expected_result text NOT NULL,
  steps_to_reproduce text NOT NULL,
  version text NOT NULL,
  device text NOT NULL CHECK (device IN ('Desktop', 'Tablet', 'Mobile')),
  os text NOT NULL CHECK (os IN ('iOS', 'Windows', 'Android')),
  browser text NOT NULL CHECK (browser IN ('Chrome', 'Safari', 'Firefox', 'Other')),
  other_browser text,
  reporter text NOT NULL,
  reported_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Reopen', 'To Do')),
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.issues_yanc_website ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on issues_yanc_website" ON public.issues_yanc_website;
CREATE POLICY "Allow all operations on issues_yanc_website"
ON public.issues_yanc_website
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_issues_yanc_website ON public.issues_yanc_website;
CREATE TRIGGER set_updated_at_issues_yanc_website
BEFORE UPDATE ON public.issues_yanc_website
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

------------------------------------------------------------
-- 2) backlog_items_yanc_website
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.backlog_items_yanc_website (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reporter text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  status text NOT NULL DEFAULT 'To do' CHECK (status IN ('To do', 'In progress', 'Done', 'Deferred')),
  version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.backlog_items_yanc_website ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on backlog_items_yanc_website" ON public.backlog_items_yanc_website;
CREATE POLICY "Allow all operations on backlog_items_yanc_website"
ON public.backlog_items_yanc_website
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_backlog_items_yanc_website ON public.backlog_items_yanc_website;
CREATE TRIGGER set_updated_at_backlog_items_yanc_website
BEFORE UPDATE ON public.backlog_items_yanc_website
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

------------------------------------------------------------
-- 3) issues_yanc_cote
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.issues_yanc_cote (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  issue_type text NOT NULL CHECK (issue_type IN ('Bug', 'Enhancement', 'Working as Expected')),
  issue_description text NOT NULL,
  expected_result text NOT NULL,
  steps_to_reproduce text NOT NULL,
  version text NOT NULL,
  device text NOT NULL CHECK (device IN ('Desktop', 'Tablet', 'Mobile')),
  os text NOT NULL CHECK (os IN ('iOS', 'Windows', 'Android')),
  browser text NOT NULL CHECK (browser IN ('Chrome', 'Safari', 'Firefox', 'Other')),
  other_browser text,
  reporter text NOT NULL,
  reported_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Reopen', 'To Do')),
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.issues_yanc_cote ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on issues_yanc_cote" ON public.issues_yanc_cote;
CREATE POLICY "Allow all operations on issues_yanc_cote"
ON public.issues_yanc_cote
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_issues_yanc_cote ON public.issues_yanc_cote;
CREATE TRIGGER set_updated_at_issues_yanc_cote
BEFORE UPDATE ON public.issues_yanc_cote
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

------------------------------------------------------------
-- 4) backlog_items_yanc_cote
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.backlog_items_yanc_cote (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reporter text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  status text NOT NULL DEFAULT 'To do' CHECK (status IN ('To do', 'In progress', 'Done', 'Deferred')),
  version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.backlog_items_yanc_cote ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on backlog_items_yanc_cote" ON public.backlog_items_yanc_cote;
CREATE POLICY "Allow all operations on backlog_items_yanc_cote"
ON public.backlog_items_yanc_cote
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_backlog_items_yanc_cote ON public.backlog_items_yanc_cote;
CREATE TRIGGER set_updated_at_backlog_items_yanc_cote
BEFORE UPDATE ON public.backlog_items_yanc_cote
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

------------------------------------------------------------
-- 5) issues_yanc_cms
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.issues_yanc_cms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  issue_type text NOT NULL CHECK (issue_type IN ('Bug', 'Enhancement', 'Working as Expected')),
  issue_description text NOT NULL,
  expected_result text NOT NULL,
  steps_to_reproduce text NOT NULL,
  version text NOT NULL,
  device text NOT NULL CHECK (device IN ('Desktop', 'Tablet', 'Mobile')),
  os text NOT NULL CHECK (os IN ('iOS', 'Windows', 'Android')),
  browser text NOT NULL CHECK (browser IN ('Chrome', 'Safari', 'Firefox', 'Other')),
  other_browser text,
  reporter text NOT NULL,
  reported_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Reopen', 'To Do')),
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.issues_yanc_cms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on issues_yanc_cms" ON public.issues_yanc_cms;
CREATE POLICY "Allow all operations on issues_yanc_cms"
ON public.issues_yanc_cms
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_issues_yanc_cms ON public.issues_yanc_cms;
CREATE TRIGGER set_updated_at_issues_yanc_cms
BEFORE UPDATE ON public.issues_yanc_cms
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

------------------------------------------------------------
-- 6) backlog_items_yanc_cms
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.backlog_items_yanc_cms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reporter text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  status text NOT NULL DEFAULT 'To do' CHECK (status IN ('To do', 'In progress', 'Done', 'Deferred')),
  version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.backlog_items_yanc_cms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on backlog_items_yanc_cms" ON public.backlog_items_yanc_cms;
CREATE POLICY "Allow all operations on backlog_items_yanc_cms"
ON public.backlog_items_yanc_cms
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_backlog_items_yanc_cms ON public.backlog_items_yanc_cms;
CREATE TRIGGER set_updated_at_backlog_items_yanc_cms
BEFORE UPDATE ON public.backlog_items_yanc_cms
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

------------------------------------------------------------
-- 7) issues_yanc_mentor_mentee
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.issues_yanc_mentor_mentee (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  issue_type text NOT NULL CHECK (issue_type IN ('Bug', 'Enhancement', 'Working as Expected')),
  issue_description text NOT NULL,
  expected_result text NOT NULL,
  steps_to_reproduce text NOT NULL,
  version text NOT NULL,
  device text NOT NULL CHECK (device IN ('Desktop', 'Tablet', 'Mobile')),
  os text NOT NULL CHECK (os IN ('iOS', 'Windows', 'Android')),
  browser text NOT NULL CHECK (browser IN ('Chrome', 'Safari', 'Firefox', 'Other')),
  other_browser text,
  reporter text NOT NULL,
  reported_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Reopen', 'To Do')),
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.issues_yanc_mentor_mentee ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on issues_yanc_mentor_mentee" ON public.issues_yanc_mentor_mentee;
CREATE POLICY "Allow all operations on issues_yanc_mentor_mentee"
ON public.issues_yanc_mentor_mentee
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_issues_yanc_mentor_mentee ON public.issues_yanc_mentor_mentee;
CREATE TRIGGER set_updated_at_issues_yanc_mentor_mentee
BEFORE UPDATE ON public.issues_yanc_mentor_mentee
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

------------------------------------------------------------
-- 8) backlog_items_yanc_mentor_mentee
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.backlog_items_yanc_mentor_mentee (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reporter text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('High', 'Medium', 'Low')),
  status text NOT NULL DEFAULT 'To do' CHECK (status IN ('To do', 'In progress', 'Done', 'Deferred')),
  version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.backlog_items_yanc_mentor_mentee ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on backlog_items_yanc_mentor_mentee" ON public.backlog_items_yanc_mentor_mentee;
CREATE POLICY "Allow all operations on backlog_items_yanc_mentor_mentee"
ON public.backlog_items_yanc_mentor_mentee
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS set_updated_at_backlog_items_yanc_mentor_mentee ON public.backlog_items_yanc_mentor_mentee;
CREATE TRIGGER set_updated_at_backlog_items_yanc_mentor_mentee
BEFORE UPDATE ON public.backlog_items_yanc_mentor_mentee
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

