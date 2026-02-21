import React from 'react';
import { motion } from 'framer-motion';
import { List, Eye, Loader2, CheckCircle, RotateCcw } from 'lucide-react';

const statuses: { key: string; description: string; icon: React.ElementType }[] = [
  {
    key: 'To Do',
    icon: List,
    description: 'Issue recorded in the backlog or planned work; not yet started.',
  },
  {
    key: 'Open',
    icon: Eye,
    description: 'Issue confirmed and available for assignment or scheduling.',
  },
  {
    key: 'In Progress',
    icon: Loader2,
    description: 'Someone is actively working on the issue.',
  },
  {
    key: 'Resolved',
    icon: CheckCircle,
    description: 'A fix or mitigation has been implemented; awaiting verification or deployment.',
  },
  {
    key: 'Reopen',
    icon: RotateCcw,
    description: 'Previously resolved but reopened because the problem persists or the fix failed verification.',
  },
];

const Status = () => {
  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-6 max-w-[900px]">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-page-title text-foreground">Status</h1>
          <p className="text-body-lg text-muted-foreground mt-1">Definitions for issue workflow statuses</p>
        </div>
      </motion.div>

      <div className="grid gap-4">
        {statuses.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.key} className="p-4 rounded-xl border border-muted-foreground/10 bg-card flex items-start gap-3">
            <div className="mt-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon size={16} className="inline-block" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{s.key}</h3>
                <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Status;

