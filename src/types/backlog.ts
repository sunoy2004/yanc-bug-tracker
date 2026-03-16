export type BacklogPriority = 'High' | 'Medium' | 'Low';
export type BacklogStatus = 'To do' | 'In progress' | 'Done' | 'Deferred';

export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  reporter: string;
  priority: BacklogPriority;
  status: BacklogStatus;
  version: string | null;
  created_at: string;
  updated_at: string;
}

export const BACKLOG_PRIORITIES: BacklogPriority[] = ['High', 'Medium', 'Low'];
export const BACKLOG_STATUSES: BacklogStatus[] = ['To do', 'In progress', 'Done', 'Deferred'];

