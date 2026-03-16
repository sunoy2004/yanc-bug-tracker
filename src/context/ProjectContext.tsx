import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PROJECTS, DEFAULT_PROJECT_KEY, type ProjectConfig, type ProjectKey } from '@/config/projects';

interface ProjectContextValue {
  project: ProjectConfig;
  setProjectKey: (key: ProjectKey) => void;
  initialized: boolean;
  resetProject: () => void;
}

const STORAGE_KEY = 'yanc.selectedProjectKey';
const INIT_KEY = 'yanc.projectInitialized';

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<ProjectConfig>(() => {
    if (typeof window === 'undefined') return PROJECTS[0];
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as ProjectKey | null;
      const found = PROJECTS.find(p => p.key === stored);
      return found ?? PROJECTS.find(p => p.key === DEFAULT_PROJECT_KEY) ?? PROJECTS[0];
    } catch {
      return PROJECTS.find(p => p.key === DEFAULT_PROJECT_KEY) ?? PROJECTS[0];
    }
  });
  const [initialized, setInitialized] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(INIT_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, project.key);
    } catch {
      // ignore
    }
  }, [project.key]);

  const setProjectKey = useCallback((key: ProjectKey) => {
    const found = PROJECTS.find(p => p.key === key);
    if (found) {
      setProject(found);
      setInitialized(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, key);
        window.localStorage.setItem(INIT_KEY, '1');
      } catch {
        // ignore
      }
    }
  }, []);

  const resetProject = useCallback(() => {
    setInitialized(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(INIT_KEY);
    } catch {
      // ignore
    }
    const fallback = PROJECTS.find(p => p.key === DEFAULT_PROJECT_KEY) ?? PROJECTS[0];
    setProject(fallback);
  }, []);

  return (
    <ProjectContext.Provider value={{ project, setProjectKey, initialized, resetProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}

