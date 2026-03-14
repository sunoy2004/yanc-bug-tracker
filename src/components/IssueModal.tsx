import { useState } from 'react';
import { useIssues } from '@/context/IssueContext';
import {
  ISSUE_TYPES,
  DEVICES,
  OS_OPTIONS,
  BROWSERS,
  SEVERITIES_FORM,
  DEVELOPERS,
  type IssueType,
  type Device,
  type OS,
  type Browser,
  type SeverityForm,
} from '@/types/issue';
import { PRODUCT_VERSION_YEAR } from '@/config/app';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export function IssueModal({ onClose }: { onClose: () => void }) {
  const { addIssue } = useIssues();
  const [issueType, setIssueType] = useState<IssueType>('Bug');
  const [issueDescription, setIssueDescription] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [versionSuffix, setVersionSuffix] = useState(''); // User enters MM.DD
  const [device, setDevice] = useState<Device>('Desktop');
  const [os, setOs] = useState<OS>('Windows');
  const [browser, setBrowser] = useState<Browser>('Chrome');
  const [otherBrowser, setOtherBrowser] = useState('');
  const [reporter, setReporter] = useState('');
  const [reportedAt] = useState(() => new Date().toISOString());
  const [severity, setSeverity] = useState<SeverityForm>('Low');
  const [assignedTo, setAssignedTo] = useState(DEVELOPERS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!issueType) e.issueType = 'Issue type is required';
    if (!issueDescription.trim()) e.issueDescription = 'Issue description is required';
    if (!expectedResult.trim()) e.expectedResult = 'Expected result is required';
    if (!stepsToReproduce.trim()) e.stepsToReproduce = 'Steps to reproduce are required';
    if (!versionSuffix.trim()) e.version = 'Version (MM.DD) is required';
    else {
      const m = versionSuffix.trim();
      if (!/^\d{1,2}\.\d{1,2}$/.test(m)) e.version = 'Use MM.DD format (e.g. 01.15)';
    }
    if (!device) e.device = 'Device is required';
    if (!os) e.os = 'OS is required';
    if (!browser) e.browser = 'Browser is required';
    if (browser === 'Other' && !otherBrowser.trim()) e.otherBrowser = 'Please specify the browser name';
    if (!reporter.trim()) e.reporter = 'Reporter is required';
    if (!reportedAt) e.reportedAt = 'Date is required';
    if (!severity) e.severity = 'Severity is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    (async () => {
      setIsSubmitting(true);
      try {
        await addIssue({
          title: issueDescription.slice(0, 80) + (issueDescription.length > 80 ? '…' : ''),
          issueType,
          issueDescription: issueDescription.trim(),
          expectedResult: expectedResult.trim(),
          stepsToReproduce: stepsToReproduce.trim(),
          version: `${PRODUCT_VERSION_YEAR}.${versionSuffix.trim()}`,
          device,
          os,
          browser,
          otherBrowser: browser === 'Other' ? otherBrowser.trim() || null : null,
          reporter: reporter.trim(),
          reportedAt,
          severity: severity as 'High' | 'Medium' | 'Low',
          status: 'Open',
          assignedTo,
        });
        toast.success('Issue created successfully!', { description: 'The issue has been added to the tracker.' });
        onClose();
      } catch {
        // error toast handled by context
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const inputClass = (field?: string) =>
    `w-full px-3 py-2.5 sm:px-3.5 rounded-xl border text-body bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${field && errors[field] ? 'border-destructive ring-1 ring-destructive/30' : 'border-input hover:border-muted-foreground/30'}`;

  const labelClass = 'block text-sm sm:text-body font-medium text-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-4 md:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-title">
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
        className="relative z-50 bg-card shadow-modal w-full max-w-[min(100%,calc(100vw-2rem))] sm:max-w-md md:max-w-lg lg:max-w-xl h-[92vh] sm:h-[90vh] sm:max-h-[90vh] md:h-auto md:max-h-[90vh] border border-border rounded-t-2xl sm:rounded-2xl mx-auto flex flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5 border-b border-border flex-shrink-0 bg-card z-10">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-lg sm:text-xl font-semibold text-foreground truncate">Submit New Issue</h2>
            <p className="text-sm sm:text-body text-muted-foreground mt-0.5 hidden sm:block">Fill in the details to create a new bug report</p>
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
          <div className="flex-1 space-y-4 sm:space-y-5 overflow-y-auto overflow-x-auto py-4 pb-6 px-5 sm:px-6 sm:py-6 sm:pb-6" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
            <div>
              <label htmlFor="issue-type" className={labelClass}>Issue Type <span className="text-destructive">*</span></label>
              <select id="issue-type" value={issueType} onChange={e => { setIssueType(e.target.value as IssueType); setErrors(prev => ({ ...prev, issueType: '' })); }} className={inputClass('issueType')}>
                {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.issueType && <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.issueType}</p>}
            </div>

            <div>
              <label htmlFor="issue-description" className={labelClass}>Issue Description <span className="text-destructive">*</span></label>
              <textarea id="issue-description" rows={3} value={issueDescription} onChange={e => { setIssueDescription(e.target.value); setErrors(prev => ({ ...prev, issueDescription: '' })); }} placeholder="Describe the issue..." className={inputClass('issueDescription')} />
              {errors.issueDescription && <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.issueDescription}</p>}
            </div>

            <div>
              <label htmlFor="expected-result" className={labelClass}>Expected Result <span className="text-destructive">*</span></label>
              <textarea id="expected-result" rows={2} value={expectedResult} onChange={e => { setExpectedResult(e.target.value); setErrors(prev => ({ ...prev, expectedResult: '' })); }} placeholder="What should happen?" className={inputClass('expectedResult')} />
              {errors.expectedResult && <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.expectedResult}</p>}
            </div>

            <div>
              <label htmlFor="steps-to-reproduce" className={labelClass}>Steps to Reproduce <span className="text-destructive">*</span></label>
              <textarea id="steps-to-reproduce" rows={3} value={stepsToReproduce} onChange={e => { setStepsToReproduce(e.target.value); setErrors(prev => ({ ...prev, stepsToReproduce: '' })); }} placeholder="1. Go to... 2. Click..." className={inputClass('stepsToReproduce')} />
              {errors.stepsToReproduce && <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.stepsToReproduce}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="version" className={labelClass}>Version <span className="text-destructive">*</span></label>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex-shrink-0 px-3 py-2.5 rounded-xl border border-input bg-muted/50 text-body text-muted-foreground">{PRODUCT_VERSION_YEAR}</span>
                  <input
                    id="version"
                    value={versionSuffix}
                    onChange={e => { setVersionSuffix(e.target.value); setErrors(prev => ({ ...prev, version: '' })); }}
                    placeholder="MM.DD"
                    className={inputClass('version')}
                    aria-describedby="version-format"
                  />
                </div>
                <p id="version-format" className="text-xs text-muted-foreground mt-1">Enter month and day (e.g. 01.15)</p>
                {errors.version && <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.version}</p>}
              </div>
              <div>
                <label htmlFor="reporter" className={labelClass}>Reporter <span className="text-destructive">*</span></label>
                <input id="reporter" value={reporter} onChange={e => { setReporter(e.target.value); setErrors(prev => ({ ...prev, reporter: '' })); }} placeholder="Your name" className={inputClass('reporter')} />
                {errors.reporter && <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.reporter}</p>}
              </div>
            </div>

            <div>
              <label className={labelClass}>Date <span className="text-destructive">*</span></label>
              <input value={new Date(reportedAt).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })} readOnly className={`${inputClass()} opacity-80 cursor-not-allowed`} aria-readonly />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="device" className={labelClass}>Device <span className="text-destructive">*</span></label>
                <select id="device" value={device} onChange={e => { setDevice(e.target.value as Device); setErrors(prev => ({ ...prev, device: '' })); }} className={inputClass('device')}>
                  {DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="os" className={labelClass}>OS <span className="text-destructive">*</span></label>
                <select id="os" value={os} onChange={e => { setOs(e.target.value as OS); setErrors(prev => ({ ...prev, os: '' })); }} className={inputClass('os')}>
                  {OS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="browser" className={labelClass}>Browser <span className="text-destructive">*</span></label>
                <select id="browser" value={browser} onChange={e => { setBrowser(e.target.value as Browser); setErrors(prev => ({ ...prev, browser: '', otherBrowser: '' })); }} className={inputClass('browser')}>
                  {BROWSERS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            {browser === 'Other' && (
              <div>
                <label htmlFor="other-browser" className={labelClass}>Other Browser <span className="text-destructive">*</span></label>
                <input id="other-browser" value={otherBrowser} onChange={e => { setOtherBrowser(e.target.value); setErrors(prev => ({ ...prev, otherBrowser: '' })); }} placeholder="e.g. Edge, Opera" className={inputClass('otherBrowser')} />
                {errors.otherBrowser && <p className="flex items-center gap-1 mt-1.5 text-xs text-destructive"><AlertCircle size={12} />{errors.otherBrowser}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="assignee" className={labelClass}>Assigned To</label>
                <select id="assignee" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className={inputClass()}>
                  {DEVELOPERS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="severity" className={labelClass}>Severity <span className="text-destructive">*</span></label>
                <select id="severity" value={severity} onChange={e => { setSeverity(e.target.value as SeverityForm); setErrors(prev => ({ ...prev, severity: '' })); }} className={inputClass('severity')}>
                  {SEVERITIES_FORM.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Footer: buttons on the right; adjust bottom gap with pb-* and mb-* */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 pb-2 sm:pb-2 border-t border-border px-5 sm:px-6 mt-4 mb-2 sm:mb-2 bg-card shrink-0">
            <button type="button" onClick={onClose} className="w-full sm:w-auto px-4 py-3 sm:py-2.5 text-body font-medium rounded-xl border border-border text-foreground hover:bg-muted transition-colors focus-ring touch-manipulation">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`w-full sm:w-auto px-5 py-3 sm:py-2.5 text-body font-medium rounded-xl bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 focus-ring touch-manipulation ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}>
              {isSubmitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
