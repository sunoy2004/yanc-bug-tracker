import { getSupabase } from '@/lib/supabase';
import { Issue } from '@/types/issue';

type DbIssue = {
  id: string;
  title: string;
  version: string;
  reporter: string;
  created_at: string;
  assigned_to: string;
  severity: string;
  status: string;
  updated_at: string;
};

function mapDbToIssue(row: Partial<DbIssue>): Issue {
  // Defensive mapping: ensure we always return valid strings/defaults so UI won't crash
  const id = row.id ?? '';
  const title = row.title ?? 'Untitled';
  const version = row.version ?? '-';
  const reporter = row.reporter ?? 'Unknown';
  const createdAt = row.created_at ?? new Date().toISOString();
  const assignedTo = row.assigned_to ?? 'Unassigned';
  const severity = (row.severity as Issue['severity']) ?? 'Low';
  const status = (row.status as Issue['status']) ?? 'Open';
  const updatedAt = row.updated_at;

  return {
    id,
    title,
    version,
    reporter,
    createdAt,
    assignedTo,
    severity,
    status,
    updatedAt,
  };
}

export const fetchIssues = async (): Promise<Issue[]> => {
  const client = await getSupabase();
  if (!client) {
    console.info('fetchIssues: no supabase client, returning empty list');
    return [];
  }

  const { data, error } = await client
    .from<DbIssue>('issues')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDbToIssue);
};

export const createIssue = async (issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Promise<Issue> => {
  const client = await getSupabase();
  if (!client) {
    console.warn('createIssue: no supabase client available');
    throw new Error('No Supabase client');
  }

  const payload = {
    title: issueData.title,
    version: issueData.version,
    reporter: issueData.reporter,
    assigned_to: issueData.assignedTo,
    severity: issueData.severity,
    status: issueData.status ?? 'Open',
  };

  const { data, error } = await client
    .from<DbIssue>('issues')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return mapDbToIssue(data);
};

export const updateIssue = async (id: string, updates: Partial<Issue>): Promise<Issue> => {
  const client = await getSupabase();
  if (!client) {
    console.warn('updateIssue: no supabase client available');
    throw new Error('No Supabase client');
  }

  const payload: any = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.version !== undefined) payload.version = updates.version;
  if (updates.reporter !== undefined) payload.reporter = updates.reporter;
  if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
  if (updates.severity !== undefined) payload.severity = updates.severity;
  if (updates.status !== undefined) payload.status = updates.status;

  const { data, error } = await client
    .from<DbIssue>('issues')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbToIssue(data);
};

export const deleteIssue = async (id: string): Promise<void> => {
  const client = await getSupabase();
  if (!client) {
    console.warn('deleteIssue: no supabase client available');
    throw new Error('No Supabase client');
  }

  const { error } = await client
    .from('issues')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

