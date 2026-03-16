import { getSupabase } from '@/lib/supabase';
import { BacklogItem, BacklogPriority, BacklogStatus, BACKLOG_PRIORITIES, BACKLOG_STATUSES } from '@/types/backlog';

type DbBacklogItem = {
  id: string;
  title: string;
  description: string;
  reporter: string;
  priority: string;
  status: string;
  version: string | null;
  created_at: string;
  updated_at: string;
};

function safeEnum<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function mapDbToBacklog(row: DbBacklogItem): BacklogItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    reporter: row.reporter,
    priority: safeEnum<BacklogPriority>(row.priority, BACKLOG_PRIORITIES, 'Low'),
    status: safeEnum<BacklogStatus>(row.status, BACKLOG_STATUSES, 'To do'),
    version: row.version,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export type CreateBacklogInput = {
  title: string;
  description: string;
  reporter: string;
  priority: BacklogPriority;
  status?: BacklogStatus;
  version?: string | null;
};

export type UpdateBacklogInput = Partial<{
  title: string;
  description: string;
  reporter: string;
  priority: BacklogPriority;
  status: BacklogStatus;
  version: string | null;
}>;

export const fetchBacklogItems = async (): Promise<BacklogItem[]> => {
  const client = await getSupabase();
  if (!client) {
    console.info('fetchBacklogItems: no supabase client, returning empty list');
    return [];
  }

  const { data, error } = await client
    .from<DbBacklogItem>('backlog_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDbToBacklog);
};

export const createBacklogItem = async (input: CreateBacklogInput): Promise<BacklogItem> => {
  const client = await getSupabase();
  if (!client) throw new Error('No Supabase client');

  const payload = {
    title: input.title,
    description: input.description,
    reporter: input.reporter,
    priority: input.priority,
    status: input.status ?? 'To do',
    version: input.version ?? null,
  };

  const { data, error } = await client
    .from<DbBacklogItem>('backlog_items')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return mapDbToBacklog(data);
};

export const updateBacklogItem = async (id: string, updates: UpdateBacklogInput): Promise<BacklogItem> => {
  const client = await getSupabase();
  if (!client) throw new Error('No Supabase client');

  const payload: Partial<DbBacklogItem> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.reporter !== undefined) payload.reporter = updates.reporter;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.version !== undefined) payload.version = updates.version;

  const { data, error } = await client
    .from<DbBacklogItem>('backlog_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbToBacklog(data);
};

export const deleteBacklogItem = async (id: string): Promise<void> => {
  const client = await getSupabase();
  if (!client) throw new Error('No Supabase client');

  const { error } = await client.from('backlog_items').delete().eq('id', id);
  if (error) throw error;
};

