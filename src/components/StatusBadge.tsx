import { Status, Severity } from '@/types/issue';

const statusMap: Record<Status, string> = {
  'Open': 'bg-status-open/15 text-status-open border-status-open/30',
  'In Progress': 'bg-status-in-progress/15 text-status-in-progress border-status-in-progress/30',
  'Resolved': 'bg-status-resolved/15 text-status-resolved border-status-resolved/30',
  'Reopen': 'bg-status-reopen/15 text-status-reopen border-status-reopen/30',
  'To Do': 'bg-status-todo/15 text-status-todo border-status-todo/30',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusMap[status]}`}>
      {status}
    </span>
  );
}

const severityMap: Record<Severity, string> = {
  'Low': 'text-severity-low',
  'Medium': 'text-severity-medium',
  'Major': 'text-severity-major font-semibold',
  'Showstopper': 'text-severity-showstopper font-bold',
};

export function SeverityLabel({ severity }: { severity: Severity }) {
  return <span className={`text-sm ${severityMap[severity]}`}>{severity}</span>;
}
