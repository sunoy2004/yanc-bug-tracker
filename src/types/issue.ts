export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Open' | 'In Progress' | 'Resolved' | 'Reopen' | 'To Do';

export type IssueType = 'Bug' | 'Enhancement' | 'Working as Expected';
export type Device = 'Desktop' | 'Laptop' | 'Tablet' | 'Mobile';
export type OS = 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'Chrome OS';
export type Browser =
  | 'Chrome'
  | 'Safari'
  | 'Firefox'
  | 'Edge'
  | 'Opera'
  | 'Brave'
  | 'Samsung Internet'
  | 'Other';

/** Form severity (required); Critical kept for legacy records. */
export type SeverityForm = 'High' | 'Medium' | 'Low';

export interface Issue {
  id: string;
  /** Legacy/short title; derived from issueDescription (truncated) for new issues. */
  title: string;
  issueType?: IssueType | null;
  issueDescription?: string | null;
  expectedResult?: string | null;
  stepsToReproduce?: string | null;
  version: string;
  device?: Device | null;
  os?: OS | null;
  browser?: Browser | null;
  otherBrowser?: string | null;
  reporter: string;
  reportedAt?: string | null;
  severity: Severity;
  status: Status;
  assignedTo: string;
  createdAt: string;
  updatedAt?: string;
}

export const STATUSES: Status[] = ['Open', 'In Progress', 'Resolved', 'Reopen', 'To Do'];
export const SEVERITIES: Severity[] = ['Low', 'Medium', 'High', 'Critical'];
export const SEVERITIES_FORM: SeverityForm[] = ['High', 'Medium', 'Low'];
export const ISSUE_TYPES: IssueType[] = ['Bug', 'Enhancement', 'Working as Expected'];
export const DEVICES: Device[] = ['Desktop', 'Laptop', 'Tablet', 'Mobile'];
export const OS_OPTIONS: OS[] = ['Windows', 'macOS', 'Linux', 'Android', 'iOS', 'Chrome OS'];
export const BROWSERS: Browser[] = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera', 'Brave', 'Samsung Internet', 'Other'];
export const DEVELOPERS = ['Unassigned', 'Ram Charan', 'Sunoy Roy'];
