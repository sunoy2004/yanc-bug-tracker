import { useIssues } from '@/context/IssueContext';
import { Status } from '@/types/issue';
import { Bug, AlertCircle, Clock, CheckCircle, RotateCcw, ListTodo } from 'lucide-react';

const cardConfig: { label: string; status: Status | 'Total'; icon: React.ElementType; colorClass: string }[] = [
  { label: 'Total Issues', status: 'Total', icon: Bug, colorClass: 'border-l-primary' },
  { label: 'Open', status: 'Open', icon: AlertCircle, colorClass: 'border-l-status-open' },
  { label: 'In Progress', status: 'In Progress', icon: Clock, colorClass: 'border-l-status-in-progress' },
  { label: 'Resolved', status: 'Resolved', icon: CheckCircle, colorClass: 'border-l-status-resolved' },
  { label: 'Reopen', status: 'Reopen', icon: RotateCcw, colorClass: 'border-l-status-reopen' },
  { label: 'To Do', status: 'To Do', icon: ListTodo, colorClass: 'border-l-status-todo' },
];

export function DashboardCards() {
  const { issues } = useIssues();

  const getCount = (status: Status | 'Total') =>
    status === 'Total' ? issues.length : issues.filter(i => i.status === status).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardConfig.map(({ label, status, icon: Icon, colorClass }) => (
        <div key={label} className={`bg-card rounded-xl border border-border border-l-4 ${colorClass} p-4 shadow-sm hover:shadow-md transition-shadow`}>
          <div className="flex items-center justify-between mb-2">
            <Icon size={18} className="text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{getCount(status)}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      ))}
    </div>
  );
}
