import { getSupabase } from '@/lib/supabase';
import { Issue, IssueType, Device, OS, Browser, Severity, Status } from '@/types/issue';

type DbIssue = {
  id: string;
  title: string | null;
  version: string | null;
  remarks: string | null;
  reporter: string | null;
  created_at: string | null;
  assigned_to: string | null;
  severity: string | null;
  status: string | null;
  updated_at: string | null;
  issue_type: string | null;
  issue_description: string | null;
  expected_result: string | null;
  steps_to_reproduce: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  other_browser: string | null;
  reported_at: string | null;
};

const ISSUE_TYPE_VALUES: IssueType[] = ['Bug', 'Enhancement', 'Working as Expected'];
const DEVICE_VALUES: Device[] = ['Desktop', 'Laptop', 'Tablet', 'Mobile'];
const OS_VALUES: OS[] = ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Chrome OS'];
const BROWSER_VALUES: Browser[] = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera', 'Brave', 'Samsung Internet', 'Other'];
const SEVERITY_VALUES: Severity[] = ['Low', 'Medium', 'High', 'Critical'];
const STATUS_VALUES: Status[] = ['Open', 'In Progress', 'Resolved', 'Reopen', 'To Do'];

function safeEnum<T extends string>(value: string | null | undefined, allowed: readonly T[]): T {
  if (value != null && allowed.includes(value as T)) return value as T;
  return allowed[0] as T;
}

/** Return null for new schema fields when DB has null (legacy rows show "—" in UI). */
function optionalEnum<T extends string>(value: string | null | undefined, allowed: readonly T[]): T | null {
  if (value != null && allowed.includes(value as T)) return value as T;
  return null;
}

function mapDbToIssue(row: Partial<DbIssue>): Issue {
  const issueDescription = row.issue_description ?? row.title ?? '';
  const title = row.title?.trim() || (issueDescription ? issueDescription.slice(0, 80) + (issueDescription.length > 80 ? '…' : '') : 'Untitled');
  return {
    id: row.id ?? '',
    title,
    issueType: optionalEnum(row.issue_type, ISSUE_TYPE_VALUES),
    issueDescription: issueDescription || null,
    expectedResult: row.expected_result ?? null,
    stepsToReproduce: row.steps_to_reproduce ?? null,
    version: row.version ?? '—',
    device: optionalEnum(row.device, DEVICE_VALUES),
    os: optionalEnum(row.os, OS_VALUES),
    browser: optionalEnum(row.browser, BROWSER_VALUES),
    otherBrowser: row.other_browser ?? null,
    remarks: row.remarks ?? null,
    reporter: row.reporter ?? 'Unknown',
    reportedAt: row.reported_at ?? row.created_at ?? undefined,
    severity: safeEnum(row.severity, SEVERITY_VALUES),
    status: safeEnum(row.status, STATUS_VALUES),
    assignedTo: row.assigned_to ?? 'Unassigned',
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

export const fetchIssues = async (tableName: string): Promise<Issue[]> => {
  const client = await getSupabase();
  if (!client) {
    console.info('fetchIssues: no supabase client, returning empty list');
    return [];
  }

  const { data, error } = await client
    .from<DbIssue>(tableName)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapDbToIssue);
};

/** Payload for creating an issue; new schema fields are required. */
export type CreateIssueInput = Omit<Issue, 'id' | 'createdAt' | 'updatedAt'> & Required<Pick<Issue, 'issueType' | 'issueDescription' | 'expectedResult' | 'stepsToReproduce' | 'device' | 'os' | 'browser' | 'reportedAt'>>;

export const createIssue = async (tableName: string, issueData: CreateIssueInput): Promise<Issue> => {
  const client = await getSupabase();
  if (!client) {
    throw new Error('No Supabase client');
  }

  const shortTitle = issueData.issueDescription
    ? issueData.issueDescription.slice(0, 80) + (issueData.issueDescription.length > 80 ? '…' : '')
    : issueData.title;

  const payload = {
    title: shortTitle,
    version: issueData.version,
    reporter: issueData.reporter,
    assigned_to: issueData.assignedTo || 'Unassigned',
    severity: issueData.severity,
    status: issueData.status ?? 'Open',
    issue_type: issueData.issueType,
    issue_description: issueData.issueDescription,
    expected_result: issueData.expectedResult,
    steps_to_reproduce: issueData.stepsToReproduce,
    device: issueData.device,
    os: issueData.os,
    browser: issueData.browser,
    other_browser: issueData.browser === 'Other' ? (issueData.otherBrowser ?? null) : null,
    remarks: issueData.remarks ?? null,
    reported_at: issueData.reportedAt,
  };

  const { data, error } = await client
    .from<DbIssue>(tableName)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return mapDbToIssue(data);
};

export const updateIssue = async (tableName: string, id: string, updates: Partial<Issue>): Promise<Issue> => {
  const client = await getSupabase();
  if (!client) {
    throw new Error('No Supabase client');
  }

  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.version !== undefined) payload.version = updates.version;
  if (updates.reporter !== undefined) payload.reporter = updates.reporter;
  if (updates.assignedTo !== undefined) payload.assigned_to = updates.assignedTo;
  if (updates.severity !== undefined) payload.severity = updates.severity;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.issueType !== undefined) payload.issue_type = updates.issueType;
  if (updates.issueDescription !== undefined) payload.issue_description = updates.issueDescription;
  if (updates.expectedResult !== undefined) payload.expected_result = updates.expectedResult;
  if (updates.stepsToReproduce !== undefined) payload.steps_to_reproduce = updates.stepsToReproduce;
  if (updates.device !== undefined) payload.device = updates.device;
  if (updates.os !== undefined) payload.os = updates.os;
  if (updates.browser !== undefined) payload.browser = updates.browser;
  if (updates.otherBrowser !== undefined) payload.other_browser = updates.otherBrowser;
  if (updates.remarks !== undefined) payload.remarks = updates.remarks;
  if (updates.reportedAt !== undefined) payload.reported_at = updates.reportedAt;

  const { data, error } = await client
    .from<DbIssue>(tableName)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbToIssue(data);
};

export const deleteIssue = async (tableName: string, id: string): Promise<void> => {
  const client = await getSupabase();
  if (!client) {
    throw new Error('No Supabase client');
  }

  const { error } = await client.from(tableName).delete().eq('id', id);
  if (error) throw error;
};
