import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Issue, Status } from '@/types/issue';
import * as issueService from '@/services/issueService';
import { toast } from 'sonner';

interface IssueContextType {
  issues: Issue[];
  loading: boolean;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<void>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export function IssueProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await issueService.fetchIssues();
      setIssues(data);
    } catch (err: any) {
      console.error('Failed to load issues', err);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addIssue = useCallback(async (data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await issueService.createIssue({ ...data, status: 'Open' });
      setIssues(prev => [created, ...prev]);
      toast.success('Issue created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create issue');
      throw err;
    }
  }, []);

  const updateIssue = useCallback(async (id: string, updates: Partial<Issue>) => {
    try {
      const updated = await issueService.updateIssue(id, updates);
      setIssues(prev => prev.map(i => (i.id === id ? updated : i)));
      toast.success('Issue updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update issue');
      throw err;
    }
  }, []);

  const deleteIssue = useCallback(async (id: string) => {
    try {
      await issueService.deleteIssue(id);
      setIssues(prev => prev.filter(i => i.id !== id));
      toast.success('Issue deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete issue');
      throw err;
    }
  }, []);

  return (
    <IssueContext.Provider value={{ issues, loading, addIssue, updateIssue, deleteIssue, refetch: load }}>
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const ctx = useContext(IssueContext);
  if (!ctx) throw new Error('useIssues must be used within IssueProvider');
  return ctx;
}
