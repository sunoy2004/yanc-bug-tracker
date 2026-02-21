export type Severity = 'Low' | 'Medium' | 'Major' | 'Showstopper';
export type Status = 'Open' | 'In Progress' | 'Resolved' | 'Reopen' | 'To Do';

export interface Issue {
  id: string;
  title: string;
  version: string;
  reporter: string;
  createdAt: string;
  assignedTo: string;
  severity: Severity;
  status: Status;
}

export const STATUSES: Status[] = ['Open', 'In Progress', 'Resolved', 'Reopen', 'To Do'];
export const SEVERITIES: Severity[] = ['Low', 'Medium', 'Major', 'Showstopper'];
export const DEVELOPERS = ['Developer 1', 'Developer 2', 'Developer 3', 'Developer 4'];
