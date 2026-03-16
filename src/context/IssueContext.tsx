import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Issue } from '@/types/issue';
import * as issueService from '@/services/issueService';
import { toast } from 'sonner';
import { useProject } from '@/context/ProjectContext';

interface IssueContextType {
  issues: Issue[];
  loading: boolean;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
  deleteIssue: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export function IssueProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const { project } = useProject();

  const load = useCallback(async () => {
    setLoading(true);
    setIssues([]); // clear previous project data while loading new one
    try {
      const data = await issueService.fetchIssues(project.tables.issues);
      setIssues(data);
    } catch (err: any) {
      console.error('Failed to load issues', err);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [project.tables.issues]);

  useEffect(() => {
    load();
  }, [load]);

  const addIssue = useCallback(async (data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await issueService.createIssue(project.tables.issues, { ...data, status: data.status ?? 'Open' });
      setIssues(prev => [created, ...prev]);
      toast.success('Issue created');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create issue');
      throw err;
    }
  }, [project.tables.issues]);

  const updateIssue = useCallback(async (id: string, updates: Partial<Issue>) => {
    try {
      const updated = await issueService.updateIssue(project.tables.issues, id, updates);
      setIssues(prev => prev.map(i => (i.id === id ? updated : i)));
      toast.success('Issue updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update issue');
      throw err;
    }
  }, [project.tables.issues]);

  const deleteIssue = useCallback(async (id: string) => {
    try {
      await issueService.deleteIssue(project.tables.issues, id);
      setIssues(prev => prev.filter(i => i.id !== id));
      toast.success('Issue deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete issue');
      throw err;
    }
  }, [project.tables.issues]);

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
