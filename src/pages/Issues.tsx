import { useState } from 'react';
import { IssueTable } from '@/components/IssueTable';
import { IssueModal } from '@/components/IssueModal';
import { STATUSES } from '@/types/issue';
import { Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SortKey = 'createdAt' | 'severity' | 'title';
type SortDir = 'asc' | 'desc';

const Issues = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
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
    <div className="p-6 md:p-8 lg:p-10 space-y-6 max-w-[1400px]">
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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-body font-medium hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 focus-ring"
        >
          <Plus size={16} />
          Submit Issue
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, reporter, or assignee..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-body placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-muted-foreground/30 transition-all duration-200"
            aria-label="Search issues"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-body focus:outline-none focus:ring-2 focus:ring-ring hover:border-muted-foreground/30 transition-all duration-200"
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
