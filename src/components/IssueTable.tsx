import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useIssues } from '@/context/IssueContext';
import { StatusBadge, SeverityLabel } from '@/components/StatusBadge';
import { STATUSES, Status } from '@/types/issue';
import { ChevronDown, ArrowUpDown, FileWarning, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type SortKey = 'reportedAt' | 'severity' | 'title' | 'issueType';
type SortDir = 'asc' | 'desc';

const truncate = (s: string, len: number) => (s?.length > len ? s.slice(0, len) + '…' : s ?? '—');

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
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  // Assignee dropdown state
  const [openAssignee, setOpenAssignee] = useState<string | null>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const [assigneeDropdownCoords, setAssigneeDropdownCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileStatusTarget, setMobileStatusTarget] = useState<{ id: string; title: string } | null>(null);
  const [mobileDetailTarget, setMobileDetailTarget] = useState<any | null>(null);
  const touchHandledRef = useRef(false);
  const lastTouchRef = useRef<number | null>(null);
  const lastPointerType = useRef<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target as Node)) {
        setOpenAssignee(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Track mobile breakpoint
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const filtered = issues
    .filter(issue => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (issue.title?.toLowerCase().includes(q)) ||
        (issue.issueDescription?.toLowerCase().includes(q)) ||
        (issue.reporter?.toLowerCase().includes(q)) ||
        (issue.assignedTo?.toLowerCase().includes(q)) ||
        (issue.id?.toLowerCase().includes(q)) ||
        (issue.issueType?.toLowerCase().includes(q)) ||
        (issue.device?.toLowerCase().includes(q)) ||
        (issue.os?.toLowerCase().includes(q)) ||
        (issue.browser?.toLowerCase().includes(q)) ||
        (issue.otherBrowser?.toLowerCase().includes(q));
      const matchesFilter = filterStatus === 'All' || issue.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'reportedAt') return dir * (a.reportedAt ?? a.createdAt).localeCompare(b.reportedAt ?? b.createdAt);
      if (sortKey === 'severity') {
        const aKey = a.severity in severityOrder ? a.severity : (legacySeverityMap[a.severity] ?? 'Low');
        const bKey = b.severity in severityOrder ? b.severity : (legacySeverityMap[b.severity] ?? 'Low');
        return dir * (severityOrder[aKey] - severityOrder[bKey]);
      }
      if (sortKey === 'issueType') return dir * (a.issueType ?? '').localeCompare(b.issueType ?? '');
      return dir * (a.title ?? '').localeCompare(b.title ?? '');
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
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-visible w-full min-w-0 max-w-full">
      {/* Desktop / Tablet table: horizontal scroll on narrow viewports */}
      <div className="hidden md:block overflow-x-auto overflow-y-auto min-w-0 w-full" style={{ maxHeight: '70vh' }}>
        <table className="w-full table-auto min-w-[1100px]" style={{ width: 'max(100%, 1100px)', tableLayout: 'auto' }}>
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 88 }}><SortButton label="Type" field="issueType" /></th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm" style={{ minWidth: 110, maxWidth: 180 }}><SortButton label="Description" field="title" /></th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm" style={{ minWidth: 90, maxWidth: 140 }}>Expected</th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm" style={{ minWidth: 90, maxWidth: 140 }}>Steps</th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 80 }}>Reporter</th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 70 }}>Version</th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 64 }}>Device</th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 66 }}>OS</th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 72 }}>Browser</th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 68 }}><SortButton label="Severity" field="severity" /></th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 90 }}>Status</th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 88 }}>Assignee</th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 88 }}><SortButton label="Reported" field="reportedAt" /></th>
              <th className="text-left px-2 py-2 md:px-3 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap" style={{ width: 64 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue, idx) => {
              const reportedAt = issue.reportedAt ?? issue.createdAt;
              const d = new Date(reportedAt);
              const dateStr = isNaN(d.getTime()) ? reportedAt : d.toLocaleDateString('en-CA');
              const assigneeRaw = issue.assignedTo ?? '';
              const assignee = assigneeRaw === 'YANC Developers' ? '' : assigneeRaw;
              const browserDisplay = issue.browser === 'Other' ? (issue.otherBrowser || 'Other') : (issue.browser ?? '—');
              return (
              <motion.tr
                key={issue.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => setMobileDetailTarget(issue)}
                className={`border-b border-border last:border-0 transition-colors hover:bg-primary/[0.02] cursor-pointer ${
                  idx % 2 === 1 ? 'bg-muted/30' : ''
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMobileDetailTarget(issue); } }}
                aria-label={`View details for ${issue.issueDescription || issue.title || 'Issue'}`}
              >
                <td className="px-2 py-2.5 md:px-3 md:py-3 text-body text-foreground align-top whitespace-nowrap text-xs md:text-sm">{issue.issueType ?? '—'}</td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 align-top max-w-[180px] min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-body text-foreground truncate text-xs md:text-sm" title={issue.issueDescription || issue.title}>{truncate(issue.issueDescription || issue.title, 45)}</span>
                    <span className="text-[10px] md:text-[11px] font-mono text-muted-foreground mt-0.5 truncate">{issue.id}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 align-top max-w-[140px] min-w-0 text-xs md:text-sm text-foreground" title={issue.expectedResult ?? undefined}>
                  <span className="truncate block">{truncate(issue.expectedResult ?? '—', 35)}</span>
                </td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 align-top max-w-[140px] min-w-0 text-xs md:text-sm text-foreground" title={issue.stepsToReproduce ?? undefined}>
                  <span className="truncate block">{truncate(issue.stepsToReproduce ?? '—', 35)}</span>
                </td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 text-body text-foreground align-top truncate max-w-[80px] text-xs md:text-sm" title={issue.reporter}>{issue.reporter ?? '—'}</td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 text-body text-foreground align-top whitespace-nowrap text-xs md:text-sm">{issue.version ?? '—'}</td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 text-body text-foreground align-top whitespace-nowrap text-xs md:text-sm">{issue.device ?? '—'}</td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 text-body text-foreground align-top whitespace-nowrap text-xs md:text-sm">{issue.os ?? '—'}</td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 text-body text-foreground align-top truncate max-w-[76px] text-xs md:text-sm" title={browserDisplay}>{browserDisplay}</td>
                <td className="px-2 py-2.5 md:px-3 md:py-3"><SeverityLabel severity={issue.severity} /></td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onPointerDown={(e: React.PointerEvent) => {
                      e.stopPropagation();
                      // remember pointer type
                      lastPointerType.current = (e as any).pointerType ?? null;
                      const isTouch = lastPointerType.current === 'touch' || navigator.maxTouchPoints > 0 && window.matchMedia('(hover: none)').matches;
                      if (isTouch) {
                        // open mobile bottom sheet
                        e.preventDefault();
                        setMobileStatusTarget({ id: issue.id, title: issue.title });
                        return;
                      }
                      // mouse/pen: toggle dropdown
                      const newOpen = openDropdown === issue.id ? null : issue.id;
                      setOpenDropdown(newOpen);
                      if (newOpen) {
                        const btn = e.currentTarget as HTMLElement;
                        const rect = btn.getBoundingClientRect();
                        setDropdownCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
                      } else {
                        setDropdownCoords(null);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // ignore click if handled by pointerdown touch
                      if (lastPointerType.current === 'touch') {
                        lastPointerType.current = null;
                        return;
                      }
                      // fallback: if pointerdown didn't run, handle click for mouse
                      const newOpen = openDropdown === issue.id ? null : issue.id;
                      setOpenDropdown(newOpen);
                      if (newOpen) {
                        const btn = e.currentTarget as HTMLElement;
                        const rect = btn.getBoundingClientRect();
                        setDropdownCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
                      } else {
                        setDropdownCoords(null);
                      }
                    }}
                    className="relative z-50 flex items-center gap-1.5 group focus-ring rounded-full"
                    aria-label={`Change status for ${issue.title}, currently ${issue.status}`}
                    aria-haspopup="listbox"
                  >
                    <StatusBadge status={issue.status} />
                    <ChevronDown
                      size={12}
                      className={`text-muted-foreground transition-all ${openDropdown === issue.id ? 'rotate-180 opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                    />
                  </button>
                  {openDropdown === issue.id && dropdownCoords && createPortal(
                    <div
                      ref={dropdownRef}
                      className="bg-card border border-border rounded-xl shadow-dropdown py-1.5"
                      role="listbox"
                      aria-label="Select status"
                      style={{
                        position: 'absolute',
                        top: dropdownCoords.top,
                        left: dropdownCoords.left,
                        transform: 'translateY(6px)',
                        minWidth: Math.max(160, dropdownCoords.width),
                        zIndex: 9999,
                      }}
                    >
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          role="option"
                          aria-selected={issue.status === s}
                          onClick={async () => { await updateIssue(issue.id, { status: s }); setOpenDropdown(null); setDropdownCoords(null); }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${issue.status === s ? 'bg-accent' : 'hover:bg-muted'}`}
                        >
                          <StatusBadge status={s} size="sm" />
                        </button>
                      ))}
                    </div>,
                    document.body
                  )}
                </td>
                <td className="px-2 py-2.5 md:px-3 md:py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newOpen = openAssignee === issue.id ? null : issue.id;
                        setOpenAssignee(newOpen);
                        if (newOpen) {
                          const btn = e.currentTarget as HTMLElement;
                          const rect = btn.getBoundingClientRect();
                          setAssigneeDropdownCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
                        } else {
                          setAssigneeDropdownCoords(null);
                        }
                      }}
                      className="text-body text-foreground truncate whitespace-nowrap flex items-center gap-2 focus-ring"
                      aria-haspopup="listbox"
                      aria-label={`Change assignee for ${issue.title}, currently ${assignee || 'Unassigned'}`}
                    >
                      <span>{assignee || 'Unassigned'}</span>
                      <ChevronDown size={12} className={`text-muted-foreground transition-transform ${openAssignee === issue.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openAssignee === issue.id && assigneeDropdownCoords && createPortal(
                      <div
                        ref={assigneeDropdownRef}
                        className="bg-card border border-border rounded-xl shadow-dropdown py-1.5"
                        role="listbox"
                        aria-label="Select assignee"
                        style={{
                          position: 'absolute',
                          top: assigneeDropdownCoords.top,
                          left: assigneeDropdownCoords.left,
                          transform: 'translateY(6px)',
                          minWidth: Math.max(160, assigneeDropdownCoords.width),
                          zIndex: 9999,
                        }}
                      >
                        {['Unassigned', 'Ram Charan', 'Sunoy Roy'].map(name => (
                          <button
                            key={name}
                            onClick={async () => {
                              try {
                                await updateIssue(issue.id, { assignedTo: name === 'Unassigned' ? '' : name });
                              } catch {}
                              setOpenAssignee(null);
                              setAssigneeDropdownCoords(null);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${assignee === (name === 'Unassigned' ? '' : name) ? 'bg-accent' : 'hover:bg-muted'}`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>,
                      document.body
                    )}
                  </div>
                </td>
                <td className="px-2 py-2.5 md:px-3 md:py-3 text-body text-muted-foreground align-top whitespace-nowrap text-xs md:text-sm">{dateStr}</td>
                <td className="px-2 py-2.5 md:px-3 md:py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    aria-label={`Delete ${issue.title}`}
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: issue.id, title: issue.title || issue.issueDescription?.slice(0, 50) || 'Issue' }); setDeletePassword(''); }}
                    className="text-destructive hover:opacity-80 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden p-2 sm:p-3 space-y-2 sm:space-y-3 min-w-0" style={{ maxHeight: '70vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {filtered.map((issue) => {
          const reportedAt = issue.reportedAt ?? issue.createdAt;
          const browserDisplay = issue.browser === 'Other' ? (issue.otherBrowser || 'Other') : (issue.browser ?? '—');
          return (
          <div
            key={issue.id}
            className="bg-card p-3 sm:p-3 rounded-xl border border-border shadow-sm overflow-hidden cursor-pointer touch-manipulation active:bg-muted/30 transition-colors"
            onClick={() => setMobileDetailTarget(issue)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-muted-foreground">{issue.issueType ?? '—'}</span>
                  <span className="font-medium text-body-lg text-foreground truncate block min-w-0">{truncate(issue.issueDescription || issue.title, 40)}</span>
                  <span className="text-[11px] font-mono text-muted-foreground mt-1 truncate break-words">{issue.id}</span>
                </div>
                <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-2">
                  <span className="truncate">Version: <span className="text-foreground">{issue.version ?? '—'}</span></span>
                  <span className="truncate">Reporter: <span className="text-foreground">{issue.reporter ?? '—'}</span></span>
                  <span className="truncate">{issue.device ?? '—'} · {issue.os ?? '—'} · {browserDisplay}</span>
                </div>
                {(issue.expectedResult || issue.stepsToReproduce) && (
                  <div className="mt-1.5 text-xs text-muted-foreground space-y-0.5">
                    {issue.expectedResult && <div className="truncate" title={issue.expectedResult}>Expected: {truncate(issue.expectedResult, 36)}</div>}
                    {issue.stepsToReproduce && <div className="truncate" title={issue.stepsToReproduce}>Steps: {truncate(issue.stepsToReproduce, 36)}</div>}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="max-w-[120px] text-right">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMobileStatusTarget({ id: issue.id, title: issue.title || issue.issueDescription }); }}
                    className="px-2.5 py-1.5 rounded-full focus-ring bg-card border border-border touch-manipulation min-h-[36px]"
                    aria-label={`Change status, currently ${issue.status}`}
                  >
                    <StatusBadge status={issue.status} size="sm" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityLabel severity={issue.severity} />
                  <button
                    aria-label="Delete issue"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: issue.id, title: issue.title || issue.issueDescription?.slice(0, 50) || 'Issue' }); setDeletePassword(''); }}
                    className="text-destructive hover:opacity-80 transition-opacity ml-2 p-2 touch-manipulation min-h-[36px] min-w-[36px]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span className="truncate">{reportedAt}</span>
              <span className="text-foreground truncate">{issue.assignedTo === 'YANC Developers' ? 'Unassigned' : (issue.assignedTo ?? '—')}</span>
            </div>
          </div>
          );
        })}
      </div>

      {/* Mobile detail overlay */}
      {mobileDetailTarget && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4" aria-modal="true">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileDetailTarget(null)} />
          <div className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl h-[85vh] sm:max-h-[90vh] sm:h-auto bg-card rounded-t-xl sm:rounded-xl border-t border-border sm:border p-4 sm:p-6 shadow-modal overflow-auto min-w-0">
            <button
              onClick={() => setMobileDetailTarget(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Close details"
              title="Close"
            >
              <X size={16} />
            </button>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground">{mobileDetailTarget.issueType ?? '—'}</span>
                <h3 className="text-section-header text-foreground">{mobileDetailTarget.issueDescription || mobileDetailTarget.title || '—'}</h3>
                <div className="text-[11px] font-mono text-muted-foreground mt-1">{mobileDetailTarget.id}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div><span className="text-muted-foreground">Version: </span><span className="text-foreground">{mobileDetailTarget.version ?? '—'}</span></div>
                <div><span className="text-muted-foreground">Reporter: </span><span className="text-foreground">{mobileDetailTarget.reporter ?? '—'}</span></div>
                <div><span className="text-muted-foreground">Reported: </span><span className="text-foreground">{mobileDetailTarget.reportedAt ?? mobileDetailTarget.createdAt ?? '—'}</span></div>
                <div><span className="text-muted-foreground">Device: </span><span className="text-foreground">{mobileDetailTarget.device ?? '—'}</span></div>
                <div><span className="text-muted-foreground">OS: </span><span className="text-foreground">{mobileDetailTarget.os ?? '—'}</span></div>
                <div><span className="text-muted-foreground">Browser: </span><span className="text-foreground">{mobileDetailTarget.browser === 'Other' ? (mobileDetailTarget.otherBrowser || 'Other') : (mobileDetailTarget.browser ?? '—')}</span></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><span className="text-muted-foreground">Status: </span><StatusBadge status={mobileDetailTarget.status} /></div>
                <div><span className="text-muted-foreground">Assignee: </span><span className="text-foreground">{(mobileDetailTarget.assignedTo === 'YANC Developers' ? 'Unassigned' : mobileDetailTarget.assignedTo) || 'Unassigned'}</span></div>
                <div><span className="text-muted-foreground">Severity: </span><SeverityLabel severity={mobileDetailTarget.severity} /></div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div><span className="text-muted-foreground">Expected: </span><span className="text-foreground">{mobileDetailTarget.expectedResult ?? '—'}</span></div>
              <div><span className="text-muted-foreground">Steps: </span><span className="text-foreground whitespace-pre-wrap">{mobileDetailTarget.stepsToReproduce ?? '—'}</span></div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Change status</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {STATUSES.map(s => (
                    <button
                      key={s}
                      onClick={async () => {
                        try { await updateIssue(mobileDetailTarget.id, { status: s }); setMobileDetailTarget({ ...mobileDetailTarget, status: s }); }
                        catch {}
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-card border border-border hover:bg-muted"
                    >
                      <StatusBadge status={s} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Change assignee</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['Unassigned', 'Ram Charan', 'Sunoy Roy'].map(name => (
                    <button
                      key={name}
                      onClick={async () => {
                        try {
                          await updateIssue(mobileDetailTarget.id, { assignedTo: name === 'Unassigned' ? '' : name });
                          setMobileDetailTarget({ ...mobileDetailTarget, assignedTo: name === 'Unassigned' ? '' : name });
                        } catch {}
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-card border border-border hover:bg-muted"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => { setMobileDetailTarget(null); }}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Open delete confirmation modal (same security flow as desktop)
                  setDeletePassword('');
                  setDeleteTarget({ id: mobileDetailTarget.id, title: mobileDetailTarget.title });
                  setMobileDetailTarget(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileWarning size={40} className="mb-3 opacity-40" />
          <p className="text-body-lg font-medium">No issues found</p>
          <p className="text-body mt-1">Try adjusting your search or filters</p>
        </div>
      )}
      {/* Delete confirmation overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/25 backdrop-blur-sm" onClick={() => { if (!isDeleting) setDeleteTarget(null); }} />
          <div className="relative bg-card rounded-xl border border-border p-6 w-full max-w-sm shadow-modal">
            <h3 className="text-section-header text-foreground mb-2">Confirm delete</h3>
            <p className="text-body text-muted-foreground mb-4">To delete "<span className="font-medium text-foreground">{deleteTarget.title}</span>", enter the issue password.</p>
            <label className="block text-sm text-muted-foreground mb-1">Password</label>
            <input
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground mb-4"
              placeholder="Enter password"
              disabled={isDeleting}
              aria-label="Delete password"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { if (!isDeleting) setDeleteTarget(null); }}
                className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!deleteTarget) return;
                  setIsDeleting(true);
                  try {
                    if (deletePassword === deleteTarget.id) {
                      await deleteIssue(deleteTarget.id);
                      setDeleteTarget(null);
                      toast.success('Issue deleted');
                    } else {
                      toast.error('Not authorized — incorrect password');
                    }
                  } catch (err) {
                    // deleteIssue shows toast
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile status bottom sheet */}
      {mobileStatusTarget && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileStatusTarget(null)} />
          <div className="relative w-full max-w-md bg-card border-t border-border rounded-t-xl p-4 shadow-modal">
            <h3 className="text-section-header mb-2">Change status for</h3>
            <p className="text-body text-muted-foreground mb-3">{mobileStatusTarget.title}</p>
            <div className="space-y-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={async () => {
                    try {
                      await updateIssue(mobileStatusTarget.id, { status: s });
                    } catch {}
                    setMobileStatusTarget(null);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-card border border-border hover:bg-muted"
                >
                  <StatusBadge status={s} />
                </button>
              ))}
            </div>
            <div className="mt-3 text-right">
              <button onClick={() => setMobileStatusTarget(null)} className="px-4 py-2 rounded-xl border border-border">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
