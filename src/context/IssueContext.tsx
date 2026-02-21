import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Issue, Status } from '@/types/issue';

const STORAGE_KEY = 'bugtracker-issues';

const seedIssues: Issue[] = [
  { id: 'BUG-001', title: 'Login page not responsive on mobile', version: '1.2.0', reporter: 'Charles', createdAt: '2024-01-09', assignedTo: 'Developer 1', severity: 'Major', status: 'Reopen' },
  { id: 'BUG-002', title: 'Live chat feature crashes on load', version: '1.1.5', reporter: 'Aravind', createdAt: '2024-01-12', assignedTo: 'Developer 2', severity: 'Medium', status: 'Reopen' },
  { id: 'BUG-003', title: 'Dashboard charts not rendering data', version: '1.3.0', reporter: 'Kevin', createdAt: '2024-01-12', assignedTo: 'Developer 3', severity: 'Major', status: 'Open' },
  { id: 'BUG-004', title: 'Marketing video review workflow broken', version: '1.2.1', reporter: 'Scott', createdAt: '2024-01-19', assignedTo: 'Developer 4', severity: 'Low', status: 'In Progress' },
  { id: 'BUG-005', title: 'File upload timeout on large files', version: '1.1.0', reporter: 'Monica', createdAt: '2024-01-20', assignedTo: 'Developer 1', severity: 'Low', status: 'In Progress' },
  { id: 'BUG-006', title: 'Like button not working on posts', version: '1.3.1', reporter: 'Charles', createdAt: '2024-01-23', assignedTo: 'Developer 2', severity: 'Showstopper', status: 'In Progress' },
  { id: 'BUG-007', title: 'Mobile friendly screens missing icons', version: '1.2.0', reporter: 'Amritha', createdAt: '2024-01-23', assignedTo: 'Developer 3', severity: 'Medium', status: 'To Do' },
  { id: 'BUG-008', title: 'Search results returning stale data', version: '1.3.0', reporter: 'Chaitanya', createdAt: '2024-01-23', assignedTo: 'Developer 4', severity: 'Medium', status: 'Open' },
];

function loadIssues(): Issue[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* corrupted data */ }
  return seedIssues;
}

interface IssueContextType {
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id' | 'status' | 'createdAt'>) => void;
  updateStatus: (id: string, status: Status) => void;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export function IssueProvider({ children }: { children: React.ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>(loadIssues);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  const addIssue = useCallback((data: Omit<Issue, 'id' | 'status' | 'createdAt'>) => {
    const id = `BUG-${String(Date.now()).slice(-4)}`;
    const newIssue: Issue = {
      ...data,
      id,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setIssues(prev => [newIssue, ...prev]);
  }, []);

  const updateStatus = useCallback((id: string, status: Status) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }, []);

  return (
    <IssueContext.Provider value={{ issues, addIssue, updateStatus }}>
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const ctx = useContext(IssueContext);
  if (!ctx) throw new Error('useIssues must be used within IssueProvider');
  return ctx;
}
