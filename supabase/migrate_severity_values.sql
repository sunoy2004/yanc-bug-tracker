-- Migration: Normalize severity values to match frontend ('High' and 'Critical')
-- Run this in Supabase SQL Editor to update existing rows.

begin;

-- Update legacy values
update public.issues set severity = 'High' where severity = 'Major';
update public.issues set severity = 'Critical' where severity = 'Showstopper';

commit;

