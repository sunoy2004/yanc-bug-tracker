import { useState } from 'react';
import { useBacklog } from '@/context/BacklogContext';
import { BACKLOG_PRIORITIES, BacklogPriority, BacklogStatus } from '@/types/backlog';
import { PRODUCT_VERSION_YEAR } from '@/config/app';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function BacklogModal({ onClose, initial }: { onClose: () => void; initial?: { id?: string; title: string; description: string; reporter: string; priority: BacklogPriority; status: BacklogStatus; version: string | null } }) {
  const isEdit = Boolean(initial?.id);
  const { addItem, updateItem } = useBacklog();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [reporter, setReporter] = useState(initial?.reporter ?? '');
  const [priority, setPriority] = useState<BacklogPriority>(initial?.priority ?? 'Low');
  const [status, setStatus] = useState<BacklogStatus>(initial?.status ?? 'To do');
  const [versionSuffix, setVersionSuffix] = useState(() => {
    if (initial?.version?.startsWith(PRODUCT_VERSION_YEAR + '.')) {
      return initial.version.slice(PRODUCT_VERSION_YEAR.length + 1);
    }
    return '';
  });
  const [freeVersion, setFreeVersion] = useState(() => {
    if (initial?.version && !initial.version.startsWith(PRODUCT_VERSION_YEAR + '.')) {
      return initial.version;
    }
    return '';
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!description.trim()) e.description = 'Description is required';
    if (!reporter.trim()) e.reporter = 'Reporter is required';
    if (!priority) e.priority = 'Priority is required';
    if (status && (versionSuffix || freeVersion)) {
      // ok: version optional but when provided must be non-empty string
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const computeVersion = () => {
    if (versionSuffix.trim()) return `${PRODUCT_VERSION_YEAR}.${versionSuffix.trim()}`;
    if (freeVersion.trim()) return freeVersion.trim();
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    (async () => {
      setIsSubmitting(true);
      try {
        const version = computeVersion();
        if (isEdit && initial?.id) {
          await updateItem(initial.id, {
            title: title.trim(),
            description: description.trim(),
            reporter: reporter.trim(),
            priority,
            status,
            version,
          });
          toast.success('Backlog item updated');
        } else {
          await addItem({
            id: '', // ignored
            title: title.trim(),
            description: description.trim(),
            reporter: reporter.trim(),
            priority,
            status: status ?? 'To do',
            version,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          toast.success('Backlog item created');
        }
        onClose();
      } catch {
        // toasts handled in context/service
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const inputClass = (field?: string) =>
    `w-full px-3 py-2.5 sm:px-3.5 rounded-xl border text-body bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
      field && errors[field] ? 'border-destructive ring-1 ring-destructive/30' : 'border-input hover:border-muted-foreground/30'
    }`;

  const labelClass = 'block text-sm sm:text-body font-medium text-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 md:p-6" role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-foreground/15 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="relative z-50 bg-card shadow-modal w-full max-w-[min(100%,calc(100vw-2rem))] sm:max-w-md md:max-w-lg lg:max-w-xl h-[92vh] sm:h-[90vh] sm:max-h-[90vh] md:h-auto md:max-h-[90vh] border border-border rounded-t-2xl sm:rounded-2xl mx-auto flex flex-col overflow-hidden min-w-0"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5 border-b border-border flex-shrink-0 bg-card z-10">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">
              {isEdit ? 'Edit Backlog Item' : 'Submit Backlog Item'}
            </h2>
            <p className="text-sm sm:text-body text-muted-foreground mt-0.5 hidden sm:block">
              {isEdit ? 'Update details, status, and version for this item.' : 'Capture upcoming work or ideas for future releases.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground focus-ring flex-shrink-0 touch-manipulation"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 space-y-4 sm:space-y-5 overflow-y-auto py-4 pb-6 px-5 sm:px-6 sm:py-6" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            <div>
              <label htmlFor="backlog-title" className={labelClass}>
                Backlog Item Title <span className="text-destructive">*</span>
              </label>
              <input
                id="backlog-title"
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  setErrors(prev => ({ ...prev, title: '' }));
                }}
                className={inputClass('title')}
                placeholder="Short name for this item"
              />
              {errors.title && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive">
                  <AlertCircle size={12} />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="backlog-description" className={labelClass}>
                Item Description <span className="text-destructive">*</span>
              </label>
              <textarea
                id="backlog-description"
                rows={4}
                value={description}
                onChange={e => {
                  setDescription(e.target.value);
                  setErrors(prev => ({ ...prev, description: '' }));
                }}
                placeholder="Describe the work, context, or goal for this backlog item..."
                className={inputClass('description')}
              />
              {errors.description && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive">
                  <AlertCircle size={12} />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="backlog-reporter" className={labelClass}>
                  Reporter <span className="text-destructive">*</span>
                </label>
                <input
                  id="backlog-reporter"
                  value={reporter}
                  onChange={e => {
                    setReporter(e.target.value);
                    setErrors(prev => ({ ...prev, reporter: '' }));
                  }}
                  placeholder="Your name"
                  className={inputClass('reporter')}
                />
                {errors.reporter && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive">
                    <AlertCircle size={12} />
                    {errors.reporter}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="backlog-priority" className={labelClass}>
                  Priority <span className="text-destructive">*</span>
                </label>
                <select
                  id="backlog-priority"
                  value={priority}
                  onChange={e => {
                    setPriority(e.target.value as BacklogPriority);
                    setErrors(prev => ({ ...prev, priority: '' }));
                  }}
                  className={inputClass('priority')}
                >
                  {BACKLOG_PRIORITIES.map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="backlog-status" className={labelClass}>
                  Status
                </label>
                <select
                  id="backlog-status"
                  value={status}
                  onChange={e => setStatus(e.target.value as BacklogStatus)}
                  className={inputClass()}
                >
                  <option value="To do">To do</option>
                  <option value="In progress">In progress</option>
                  <option value="Done">Done</option>
                  <option value="Deferred">Deferred</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Version (optional)</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-input bg-muted/50 text-body text-muted-foreground">
                      {PRODUCT_VERSION_YEAR}
                    </span>
                    <input
                      value={versionSuffix}
                      onChange={e => {
                        setVersionSuffix(e.target.value);
                        if (e.target.value) setFreeVersion('');
                      }}
                      placeholder="MM.DD"
                      className={inputClass()}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">Or use a free-form version:</div>
                  <input
                    value={freeVersion}
                    onChange={e => {
                      setFreeVersion(e.target.value);
                      if (e.target.value) setVersionSuffix('');
                    }}
                    placeholder="e.g. v2026.05 or Sprint 14"
                    className={inputClass()}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 pb-2 border-t border-border px-5 sm:px-6 mt-4 mb-2 bg-card shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 sm:py-2.5 text-body font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors focus-ring touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-5 py-3 sm:py-2.5 text-body font-medium rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 focus-ring touch-manipulation ${
                isSubmitting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isEdit ? (isSubmitting ? 'Saving...' : 'Save Changes') : isSubmitting ? 'Submitting...' : 'Submit Backlog'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

