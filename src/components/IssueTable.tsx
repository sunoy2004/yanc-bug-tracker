import { useState, useRef, useEffect } from 'react';
import { useIssues } from '@/context/IssueContext';
import { StatusBadge, SeverityLabel } from '@/components/StatusBadge';
import { STATUSES, Status } from '@/types/issue';
import { ChevronDown, ArrowUpDown, FileWarning, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type SortKey = 'createdAt' | 'severity' | 'title';
type SortDir = 'asc' | 'desc';

const severityOrder: Record<string, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };
const legacySeverityMap: Record<string, string> = { Major: 'High', Showstopper: 'Critical' };

export function IssueTable({
  search,
  filterStatus,
  sortKey,
  sortDir,
  onSort,
}: {
  search: string;
  filterStatus: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const { issues, updateIssue, deleteIssue } = useIssues();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = issues
    .filter(issue => {
      const matchesSearch =
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.reporter.toLowerCase().includes(search.toLowerCase()) ||
        issue.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
        issue.id.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterStatus === 'All' || issue.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'createdAt') return dir * a.createdAt.localeCompare(b.createdAt);
      if (sortKey === 'severity') {
        const aKey = a.severity in severityOrder ? a.severity : (legacySeverityMap[a.severity] ?? 'Low');
        const bKey = b.severity in severityOrder ? b.severity : (legacySeverityMap[b.severity] ?? 'Low');
        return dir * (severityOrder[aKey] - severityOrder[bKey]);
      }
      return dir * a.title.localeCompare(b.title);
    });

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1 hover:text-foreground transition-colors group"
    >
      {label}
      <ArrowUpDown size={12} className={`transition-colors ${sortKey === field ? 'text-primary' : 'opacity-0 group-hover:opacity-50'}`} />
    </button>
  );

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      {/* Desktop / Tablet table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3.5 text-table-header uppercase text-muted-foreground">
                <SortButton label="Issue" field="title" />
              </th>
              <th className="text-left px-5 py-3.5 text-table-header uppercase text-muted-foreground">Version</th>
              <th className="text-left px-5 py-3.5 text-table-header uppercase text-muted-foreground">Reporter</th>
              <th className="text-left px-5 py-3.5 text-table-header uppercase text-muted-foreground">
                <SortButton label="Created" field="createdAt" />
              </th>
              <th className="text-left px-5 py-3.5 text-table-header uppercase text-muted-foreground">Status</th>
              <th className="text-left px-5 py-3.5 text-table-header uppercase text-muted-foreground">Assignee</th>
              <th className="text-left px-5 py-3.5 text-table-header uppercase text-muted-foreground">
                <SortButton label="Severity" field="severity" />
              </th>
              <th className="text-left px-5 py-3.5 text-table-header uppercase text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue, idx) => (
              <motion.tr
                key={issue.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`border-b border-border last:border-0 transition-colors hover:bg-primary/[0.02] ${
                  idx % 2 === 1 ? 'bg-muted/30' : ''
                }`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-body-lg text-foreground">{issue.title}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">{issue.id}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-body text-foreground">{issue.version}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-accent-foreground">
                      {issue.reporter ? issue.reporter.charAt(0) : '?'}
                    </div>
                    <span className="text-body text-foreground">{issue.reporter}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-body text-muted-foreground">{issue.createdAt}</td>
                <td className="px-5 py-4 relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === issue.id ? null : issue.id)}
                    className="flex items-center gap-1.5 group focus-ring rounded-full"
                    aria-label={`Change status for ${issue.title}, currently ${issue.status}`}
                    aria-haspopup="listbox"
                  >
                    <StatusBadge status={issue.status} />
                    <ChevronDown
                      size={12}
                      className={`text-muted-foreground transition-all ${
                        openDropdown === issue.id ? 'rotate-180 opacity-100' : 'opacity-0 group-hover:opacity-60'
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openDropdown === issue.id && (
                      <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1.5 z-20 bg-card border border-border rounded-xl shadow-dropdown py-1.5 min-w-[160px]"
                        role="listbox"
                        aria-label="Select status"
                      >
                        {STATUSES.map(s => (
                          <button
                            key={s}
                            role="option"
                            aria-selected={issue.status === s}
                            onClick={async () => { await updateIssue(issue.id, { status: s }); setOpenDropdown(null); }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                              issue.status === s ? 'bg-accent' : 'hover:bg-muted'
                            }`}
                          >
                            <StatusBadge status={s} size="sm" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                      {(() => {
                        const name = issue.assignedTo ?? '';
                        const parts = name.split(' ').filter(Boolean);
                        if (parts.length === 0) return '?';
                        return parts.map(w => w[0]).join('');
                      })()}
                    </div>
                    <span className="text-body text-foreground">{issue.assignedTo || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><SeverityLabel severity={issue.severity} /></td>
                <td className="px-5 py-4">
                  <button
                    aria-label={`Delete ${issue.title}`}
                    onClick={async () => {
                      if (!confirm(`Delete "${issue.title}"? This cannot be undone.`)) return;
                      try {
                        await deleteIssue(issue.id);
                      } catch (err) {
                        // handled in context
                      }
                    }}
                    className="text-destructive hover:opacity-80 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden p-3 space-y-3">
        {filtered.map((issue) => (
          <div key={issue.id} className="bg-card p-3 rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="font-medium text-body-lg text-foreground truncate block min-w-0">{issue.title}</span>
                  <span className="text-[11px] font-mono text-muted-foreground truncate">{issue.id}</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-2">
                  <span className="truncate">Version: <span className="text-foreground">{issue.version}</span></span>
                  <span className="truncate">Reporter: <span className="text-foreground">{issue.reporter}</span></span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="max-w-[120px] text-right">
                  <StatusBadge status={issue.status} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <SeverityLabel severity={issue.severity} />
                  <button
                    aria-label={`Delete ${issue.title}`}
                    onClick={async () => {
                      if (!confirm(`Delete "${issue.title}"? This cannot be undone.`)) return;
                      try {
                        await deleteIssue(issue.id);
                      } catch (err) {
                        // handled in context
                      }
                    }}
                    className="text-destructive hover:opacity-80 transition-opacity ml-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span className="truncate">{issue.createdAt}</span>
              <span className="text-foreground truncate">{issue.assignedTo}</span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileWarning size={40} className="mb-3 opacity-40" />
          <p className="text-body-lg font-medium">No issues found</p>
          <p className="text-body mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
