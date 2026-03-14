import { useState } from 'react';
import { IssueTable } from '@/components/IssueTable';
import { IssueModal } from '@/components/IssueModal';
import { STATUSES } from '@/types/issue';
import { Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SortKey = 'reportedAt' | 'severity' | 'title' | 'issueType';
type SortDir = 'asc' | 'desc';

const Issues = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('reportedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-4 sm:space-y-6 max-w-[2000px] w-full min-w-0">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-page-title text-foreground">Issues</h1>
          <p className="text-body-lg text-muted-foreground mt-1">Track, manage, and resolve all reported bugs</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:px-5 sm:py-2.5 rounded-xl bg-primary text-primary-foreground text-body font-medium hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 focus-ring touch-manipulation w-full sm:w-auto"
        >
          <Plus size={16} />
          Submit Issue
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-3 w-full min-w-0"
      >
        <div className="relative flex-1 w-full min-w-0 max-w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="w-full min-w-0 pl-10 pr-4 py-2.5 sm:py-2.5 rounded-xl border border-input bg-card text-foreground text-body text-sm sm:text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-muted-foreground/30 transition-all duration-200"
            aria-label="Search issues"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto min-w-0 px-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-body text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-ring hover:border-muted-foreground/30 transition-all duration-200"
          aria-label="Filter by status"
        >
          <option value="All">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="w-full min-w-0"
      >
        <IssueTable search={search} filterStatus={filterStatus} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
      </motion.div>

      <AnimatePresence>
        {modalOpen && <IssueModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Issues;
