import { useState } from 'react';
import { useIssues } from '@/context/IssueContext';
import { SEVERITIES, DEVELOPERS, Severity } from '@/types/issue';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function IssueModal({ onClose }: { onClose: () => void }) {
  const { addIssue } = useIssues();
  const [title, setTitle] = useState('');
  // Split version into year prefix (auto) and user-entered month.date suffix
  const yearPrefix = `v${new Date().getFullYear()}.`;
  const [versionSuffix, setVersionSuffix] = useState('');
  const [reporter, setReporter] = useState('');
  const [assignedTo, setAssignedTo] = useState(DEVELOPERS[0]);
  const [severity, setSeverity] = useState<Severity>('Low');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Issue title is required';
    if (!reporter.trim()) e.reporter = 'Reporter name is required';
    if (!versionSuffix.trim()) e.version = 'Version (MM.DD) is required';
    else {
      // simple format check mm.dd where mm and dd are 1-2 digits
      const m = versionSuffix.trim();
      if (!/^\d{1,2}\.\d{1,2}$/.test(m)) e.version = 'Version must be in MM.DD format';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    (async () => {
      setIsSubmitting(true);
      try {
        const combinedVersion = `${yearPrefix}${versionSuffix.trim()}`;
        await addIssue({ title: title.trim(), version: combinedVersion, reporter: reporter.trim(), assignedTo, severity });
        toast.success('Issue created successfully!', { description: `"${title}" has been added to the tracker.` });
        onClose();
      } catch (err) {
        // error toast handled by context
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const inputClass = (field?: string) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-body bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
      field && errors[field] ? 'border-destructive ring-1 ring-destructive/30' : 'border-input hover:border-muted-foreground/30'
    }`;

  const labelClass = "block text-body font-medium text-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-foreground/25 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="relative bg-card shadow-modal w-full h-full max-w-none md:max-w-lg md:h-auto border border-border overflow-hidden rounded-none md:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 id="modal-title" className="text-section-header text-foreground">Submit New Issue</h2>
            <p className="text-body text-muted-foreground mt-0.5">Fill in the details to create a new bug report</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground focus-ring"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="issue-title" className={labelClass}>Issue Title <span className="text-destructive">*</span></label>
            <input id="issue-title" value={title} onChange={e => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); }} placeholder="Describe the bug briefly..." className={inputClass('title')} />
            {errors.title && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="version-suffix" className={labelClass}>Version</label>
            <div className="flex items-center gap-2">
              <input value={yearPrefix} disabled className={`${inputClass()} w-28`} />
              <input id="version-suffix" value={versionSuffix} onChange={e => { setVersionSuffix(e.target.value); setErrors(prev => ({ ...prev, version: '' })); }} placeholder="MM.DD" className={`${inputClass()} flex-1`} />
            </div>
            {errors.version && (
              <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.version}</p>
            )}
          </div>
            <div>
              <label htmlFor="reporter" className={labelClass}>Reporter <span className="text-destructive">*</span></label>
              <input id="reporter" value={reporter} onChange={e => { setReporter(e.target.value); setErrors(prev => ({ ...prev, reporter: '' })); }} placeholder="Your name" className={inputClass('reporter')} />
              {errors.reporter && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.reporter}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Created Date</label>
            <input value={new Date().toLocaleDateString('en-CA')} disabled className={`${inputClass()} opacity-50 cursor-not-allowed`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="assignee" className={labelClass}>Assigned To</label>
              <select id="assignee" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputClass()}>
                {DEVELOPERS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="severity" className={labelClass}>Severity</label>
              <select id="severity" value={severity} onChange={e => setSeverity(e.target.value as Severity)} className={inputClass()}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border -mx-6 px-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-body font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors focus-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 text-body font-medium rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 focus-ring ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
