import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBacklog } from '@/context/BacklogContext';
import { BacklogItem, BACKLOG_STATUSES } from '@/types/backlog';
import { ChevronDown, ArrowUpDown, FileWarning, Trash2, Edit3, X, ListTodo, Clock, CheckCircle2, PauseCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BacklogModal } from '@/components/BacklogModal';

type SortKey = 'created_at' | 'title' | 'priority' | 'status';
type SortDir = 'asc' | 'desc';

const truncate = (s: string, len: number) => (s?.length > len ? s.slice(0, len) + '…' : s ?? '—');

type BacklogStatusConfig = {
  bg: string;
  text: string;
  border: string;
  icon: React.ElementType;
};

const BACKLOG_STATUS_CONFIG: Record<BacklogItem['status'], BacklogStatusConfig> = {
  'To do': {
    bg: 'bg-status-todo/10',
    text: 'text-status-todo',
    border: 'border-status-todo/20',
    icon: ListTodo,
  },
  'In progress': {
    bg: 'bg-status-in-progress/10',
    text: 'text-status-in-progress',
    border: 'border-status-in-progress/20',
    icon: Clock,
  },
  Done: {
    bg: 'bg-status-resolved/10',
    text: 'text-status-resolved',
    border: 'border-status-resolved/20',
    icon: CheckCircle2,
  },
  Deferred: {
    bg: 'bg-muted/10',
    text: 'text-muted-foreground',
    border: 'border-muted/30',
    icon: PauseCircle,
  },
};

function StatusBadge({ status, size = 'default' }: { status: BacklogItem['status']; size?: 'default' | 'sm' }) {
  const cfg = BACKLOG_STATUS_CONFIG[status];
  const safe = cfg ?? BACKLOG_STATUS_CONFIG['To do'];
  const Icon = safe.icon;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${safe.bg} ${safe.text} ${safe.border} ${sizeClass} transition-colors`}
    >
      <Icon size={iconSize} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: BacklogItem['priority'] }) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border';
  const map: Record<BacklogItem['priority'], string> = {
    High: 'bg-danger/10 text-danger border-danger/30',
    Medium: 'bg-warning/10 text-warning border-warning/30',
    Low: 'bg-success/10 text-success border-success/30',
  };
  return <span className={`${base} ${map[priority]}`}>{priority}</span>;
}

export function BacklogTable({
  search,
  statusFilter,
  sortKey,
  sortDir,
  onSort,
}: {
  search: string;
  statusFilter: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const { items, deleteItem, updateItem } = useBacklog();
  const [editing, setEditing] = useState<BacklogItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BacklogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const [statusCoords, setStatusCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [detailItem, setDetailItem] = useState<BacklogItem | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = items
    .filter(item => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.reporter.toLowerCase().includes(q) ||
        (item.version ?? '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'created_at') return dir * a.created_at.localeCompare(b.created_at);
      if (sortKey === 'title') return dir * a.title.localeCompare(b.title);
      if (sortKey === 'priority') {
        const order: Record<string, number> = { High: 2, Medium: 1, Low: 0 };
        return dir * (order[a.priority] - order[b.priority]);
      }
      if (sortKey === 'status') return dir * a.status.localeCompare(b.status);
      return 0;
    });

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button onClick={() => onSort(field)} className="inline-flex items-center gap-1 hover:text-foreground transition-colors group">
      {label}
      <ArrowUpDown size={12} className={`transition-colors ${sortKey === field ? 'text-primary' : 'opacity-0 group-hover:opacity-50'}`} />
    </button>
  );

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-visible w-full min-w-0 max-w-full">
      <div className="hidden md:block overflow-x-auto overflow-y-auto min-w-0 w-full" style={{ maxHeight: '70vh' }}>
        <table className="w-full table-auto min-w-[900px]" style={{ width: 'max(100%, 900px)', tableLayout: 'auto' }}>
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap">
                <SortButton label="Title" field="title" />
              </th>
              <th className="text-left px-3 py-2 text-table-header text-muted-foreground text-xs md:text-sm">Description</th>
              <th className="text-left px-3 py-2 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap">
                Reporter
              </th>
              <th className="text-left px-3 py-2 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap">
                <SortButton label="Priority" field="priority" />
              </th>
              <th className="text-left px-3 py-2 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap">
                <SortButton label="Status" field="status" />
              </th>
              <th className="text-left px-3 py-2 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap">
                Version
              </th>
              <th className="text-left px-3 py-2 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap">
                Created
              </th>
              <th className="text-left px-3 py-2 text-table-header text-muted-foreground text-xs md:text-sm whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => {
              const createdDate = new Date(item.created_at);
              const createdStr = isNaN(createdDate.getTime()) ? item.created_at : createdDate.toLocaleDateString('en-CA');
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setDetailItem(item)}
                  className={`border-b border-border last:border-0 transition-colors hover:bg-primary/[0.02] cursor-pointer ${
                    idx % 2 === 1 ? 'bg-muted/30' : ''
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setDetailItem(item);
                    }
                  }}
                >
                  <td className="px-3 py-2.5 text-body text-foreground align-top text-xs md:text-sm max-w-[200px] min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate" title={item.title}>
                        {item.title}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">{item.id}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs md:text-sm text-foreground max-w-[260px] min-w-0" title={item.description}>
                    <span className="truncate block">{truncate(item.description, 80)}</span>
                  </td>
                  <td className="px-3 py-2.5 text-body text-foreground align-top whitespace-nowrap text-xs md:text-sm" title={item.reporter}>
                    {item.reporter}
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs md:text-sm">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs md:text-sm" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        const id = statusDropdownId === item.id ? null : item.id;
                        setStatusDropdownId(id);
                        if (id) {
                          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                          setStatusCoords({
                            top: rect.bottom + window.scrollY,
                            left: rect.left + window.scrollX,
                            width: rect.width,
                          });
                        } else {
                          setStatusCoords(null);
                        }
                      }}
                      className="relative z-40 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-card border border-border hover:bg-muted focus-ring"
                      aria-haspopup="listbox"
                      aria-label={`Change status for ${item.title}, currently ${item.status}`}
                    >
                      <StatusBadge status={item.status} />
                      <ChevronDown size={12} className="text-muted-foreground" />
                    </button>
                    {statusDropdownId === item.id &&
                      statusCoords &&
                      createPortal(
                        <div
                          ref={statusDropdownRef}
                          className="bg-card border border-border rounded-xl shadow-dropdown py-1.5"
                          role="listbox"
                          aria-label="Select status"
                          style={{
                            position: 'absolute',
                            top: statusCoords.top,
                            left: statusCoords.left,
                            transform: 'translateY(6px)',
                            minWidth: Math.max(180, statusCoords.width),
                            zIndex: 9999,
                          }}
                        >
                          {BACKLOG_STATUSES.map(s => (
                            <button
                              key={s}
                              role="option"
                              aria-selected={item.status === s}
                              onClick={async () => {
                                try {
                                  await updateItem(item.id, { status: s });
                                } catch {
                                  // toast handled in context
                                }
                                setStatusDropdownId(null);
                                setStatusCoords(null);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between gap-3 ${
                                item.status === s ? 'bg-accent' : 'hover:bg-muted'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <StatusBadge status={s} size="sm" />
                              </span>
                            </button>
                          ))}
                        </div>,
                        document.body
                      )}
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs md:text-sm whitespace-nowrap">
                    {item.version ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-2.5 text-body text-muted-foreground align-top whitespace-nowrap text-xs md:text-sm">
                    {createdStr}
                  </td>
                  <td className="px-3 py-2.5 align-top text-xs md:text-sm whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setEditing(item);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border text-foreground hover:bg-muted text-[11px]"
                      >
                        <Edit3 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setDeleteTarget(item);
                        }}
                        className="p-1.5 rounded-xl text-destructive hover:bg-destructive/10"
                        aria-label="Delete backlog item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div
        className="md:hidden p-2 sm:p-3 space-y-2 sm:space-y-3 min-w-0"
        style={{ maxHeight: '70vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {filtered.map(item => {
          const createdDate = new Date(item.created_at);
          const createdStr = isNaN(createdDate.getTime()) ? item.created_at : createdDate.toLocaleDateString('en-CA', {
            dateStyle: 'medium',
          });
          return (
            <div
              key={item.id}
              className="bg-card p-3 sm:p-3 rounded-xl border border-border shadow-sm overflow-hidden cursor-pointer active:bg-muted/30 transition-colors"
              onClick={() => setDetailItem(item)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-body-lg text-foreground truncate block min-w-0">{item.title}</span>
                    <span className="text-[11px] font-mono text-muted-foreground mt-1 truncate break-words">{item.id}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.description}</div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>
                      Reporter: <span className="text-foreground">{item.reporter}</span>
                    </span>
                    <span>
                      Version: <span className="text-foreground">{item.version ?? '—'}</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <PriorityBadge priority={item.priority} />
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{createdStr}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setEditing(item);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-border text-foreground hover:bg-muted text-[11px]"
                  >
                    <Edit3 size={12} />
                    Edit
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setDeleteTarget(item);
                    }}
                    className="p-1.5 rounded-xl text-destructive hover:bg-destructive/10"
                    aria-label="Delete backlog item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileWarning size={40} className="mb-3 opacity-40" />
          <p className="text-body-lg font-medium">No backlog items found</p>
          <p className="text-body mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      <AnimatePresence>
        {editing && <BacklogModal onClose={() => setEditing(null)} initial={editing} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
              onClick={() => {
                if (!isDeleting) setDeleteTarget(null);
              }}
            />
            <div className="relative bg-card rounded-xl border border-border p-6 w-full max-w-sm shadow-modal">
              <h3 className="text-section-header text-foreground mb-2">Delete backlog item</h3>
              <p className="text-body text-muted-foreground mb-4">
                Are you sure you want to delete "<span className="font-medium text-foreground">{deleteTarget.title}</span>"?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    if (!isDeleting) setDeleteTarget(null);
                  }}
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
                      await deleteItem(deleteTarget.id);
                      setDeleteTarget(null);
                    } catch {
                      // toast handled in context
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
      </AnimatePresence>

      <AnimatePresence>
        {detailItem && (
          <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4" aria-modal="true">
            <div className="absolute inset-0 bg-foreground/30" onClick={() => setDetailItem(null)} />
            <div className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl h-[80vh] sm:max-h-[90vh] sm:h-auto bg-card rounded-t-xl sm:rounded-xl border-t border-border sm:border p-4 sm:p-6 shadow-modal overflow-auto min-w-0">
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Close details"
              >
                <X size={16} />
              </button>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground">Backlog</span>
                  <h3 className="text-section-header text-foreground">{detailItem.title}</h3>
                  <div className="text-[11px] font-mono text-muted-foreground mt-1 break-all">{detailItem.id}</div>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <PriorityBadge priority={detailItem.priority} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <StatusBadge status={detailItem.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Version:</span>
                    <span className="text-foreground">{detailItem.version ?? '—'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Reporter: </span>
                  <span className="text-foreground">{detailItem.reporter}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Created: </span>
                  <span className="text-foreground">{detailItem.created_at}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated: </span>
                  <span className="text-foreground">{detailItem.updated_at}</span>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <p className="text-muted-foreground mb-1">Description</p>
                <p className="text-foreground whitespace-pre-wrap">{detailItem.description}</p>
              </div>
              <div className="mt-5 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={() => setDetailItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setEditing(detailItem);
                    setDetailItem(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Edit item
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

