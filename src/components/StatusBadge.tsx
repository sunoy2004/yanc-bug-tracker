import { Status, Severity } from '@/types/issue';
import { Circle, Clock, CheckCircle2, RotateCcw, ListTodo } from 'lucide-react';

const statusConfig: Record<Status, { bg: string; text: string; border: string; icon: React.ElementType }> = {
  'Open': { bg: 'bg-status-open/10', text: 'text-status-open', border: 'border-status-open/20', icon: Circle },
  'In Progress': { bg: 'bg-status-in-progress/10', text: 'text-status-in-progress', border: 'border-status-in-progress/20', icon: Clock },
  'Resolved': { bg: 'bg-status-resolved/10', text: 'text-status-resolved', border: 'border-status-resolved/20', icon: CheckCircle2 },
  'Reopen': { bg: 'bg-status-reopen/10', text: 'text-status-reopen', border: 'border-status-reopen/20', icon: RotateCcw },
  'To Do': { bg: 'bg-status-todo/10', text: 'text-status-todo', border: 'border-status-todo/20', icon: ListTodo },
};

export function StatusBadge({ status, size = 'default' }: { status: Status; size?: 'default' | 'sm' }) {
  const config = statusConfig[status];
  // Fallback for unknown/invalid status
  const safeConfig = config ?? { bg: 'bg-muted/10', text: 'text-muted-foreground', border: 'border-muted/20', icon: Circle };
  const Icon = safeConfig.icon;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${safeConfig.bg} ${safeConfig.text} ${safeConfig.border} ${sizeClass} transition-colors`}>
      <Icon size={size === 'sm' ? 10 : 12} />
      {status}
    </span>
  );
}

const severityConfig: Record<Severity, { dot: string; text: string }> = {
  'Low': { dot: 'bg-severity-low', text: 'text-severity-low' },
  'Medium': { dot: 'bg-severity-medium', text: 'text-severity-medium' },
  'Major': { dot: 'bg-severity-major', text: 'text-severity-major font-semibold' },
  'Showstopper': { dot: 'bg-severity-showstopper', text: 'text-severity-showstopper font-bold' },
};

export function SeverityLabel({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];
  const safe = config ?? { dot: 'bg-muted', text: 'text-muted-foreground' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-body ${safe.text}`}>
      <span className={`w-2 h-2 rounded-full ${safe.dot}`} />
      {severity}
    </span>
  );
}
