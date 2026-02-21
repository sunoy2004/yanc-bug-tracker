import { useIssues } from '@/context/IssueContext';
import { Status } from '@/types/issue';
import { Bug, AlertCircle, Clock, CheckCircle2, RotateCcw, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const cardConfig: { label: string; status: Status | 'Total'; icon: React.ElementType; gradient: string }[] = [
  { label: 'Total Issues', status: 'Total', icon: Bug, gradient: 'from-primary/10 to-primary/5 border-l-primary' },
  { label: 'Open', status: 'Open', icon: AlertCircle, gradient: 'from-status-open/10 to-status-open/5 border-l-status-open' },
  { label: 'In Progress', status: 'In Progress', icon: Clock, gradient: 'from-status-in-progress/10 to-status-in-progress/5 border-l-status-in-progress' },
  { label: 'Resolved', status: 'Resolved', icon: CheckCircle2, gradient: 'from-status-resolved/10 to-status-resolved/5 border-l-status-resolved' },
  { label: 'Reopen', status: 'Reopen', icon: RotateCcw, gradient: 'from-status-reopen/10 to-status-reopen/5 border-l-status-reopen' },
  { label: 'To Do', status: 'To Do', icon: ListTodo, gradient: 'from-status-todo/10 to-status-todo/5 border-l-status-todo' },
];

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 600;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / duration, 1);
      setDisplayed(Math.round(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    let startTs: number | null = null;
    requestAnimationFrame(step);
  }, [value]);
  return <>{displayed}</>;
}

export function DashboardCards() {
  const { issues } = useIssues();

  const getCount = (status: Status | 'Total') =>
    status === 'Total' ? issues.length : issues.filter(i => i.status === status).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cardConfig.map(({ label, status, icon: Icon, gradient }, idx) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.06, duration: 0.4 }}
          className={`group relative bg-card rounded-2xl border border-border border-l-[3px] p-5 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 overflow-hidden bg-gradient-to-br ${gradient}`}
        >
          <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity">
            <Icon size={16} className="text-muted-foreground" />
          </div>
          <p className="text-metric text-foreground mt-1">
            <AnimatedNumber value={getCount(status)} />
          </p>
          <p className="text-body text-muted-foreground mt-1">{label}</p>
        </motion.div>
      ))}
    </div>
  );
}
