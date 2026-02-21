import { useState } from 'react';
import { useIssues } from '@/context/IssueContext';
import { SEVERITIES, DEVELOPERS, Severity } from '@/types/issue';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export function IssueModal({ onClose }: { onClose: () => void }) {
  const { addIssue } = useIssues();
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('');
  const [reporter, setReporter] = useState('');
  const [assignedTo, setAssignedTo] = useState(DEVELOPERS[0]);
  const [severity, setSeverity] = useState<Severity>('Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !reporter.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    addIssue({ title: title.trim(), version: version.trim(), reporter: reporter.trim(), assignedTo, severity });
    toast.success('Issue created successfully!');
    onClose();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 animate-modal-in border border-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Submit New Issue</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Issue Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Describe the bug..." className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Version</label>
              <input value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0.0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Reporter *</label>
              <input value={reporter} onChange={e => setReporter(e.target.value)} placeholder="Your name" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Created Date</label>
            <input value={new Date().toISOString().split('T')[0]} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Assigned To</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputClass}>
                {DEVELOPERS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Severity</label>
              <select value={severity} onChange={e => setSeverity(e.target.value as Severity)} className={inputClass}>
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Submit Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
