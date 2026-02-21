import { useState, useRef, useEffect } from 'react';
import { useIssues } from '@/context/IssueContext';
import { StatusBadge, SeverityLabel } from '@/components/StatusBadge';
import { STATUSES, Status } from '@/types/issue';
import { ChevronDown } from 'lucide-react';

export function IssueTable({ search, filterStatus }: { search: string; filterStatus: string }) {
  const { issues, updateStatus } = useIssues();
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

  const filtered = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.reporter.toLowerCase().includes(search.toLowerCase()) ||
      issue.assignedTo.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'All' || issue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Issue</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Reporter</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Created</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Assignee</th>
            <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Severity</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((issue) => (
            <tr key={issue.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <div>
                  <span className="font-medium text-foreground">{issue.title}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{issue.id}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-foreground">{issue.reporter}</td>
              <td className="px-4 py-3 text-muted-foreground">{issue.createdAt}</td>
              <td className="px-4 py-3 relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === issue.id ? null : issue.id)}
                  className="flex items-center gap-1 group"
                >
                  <StatusBadge status={issue.status} />
                  <ChevronDown size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                {openDropdown === issue.id && (
                  <div ref={dropdownRef} className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[140px] animate-fade-in">
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => { updateStatus(issue.id, s); setOpenDropdown(null); }}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                      >
                        <StatusBadge status={s} />
                      </button>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-foreground">{issue.assignedTo}</td>
              <td className="px-4 py-3"><SeverityLabel severity={issue.severity} /></td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                No issues found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
