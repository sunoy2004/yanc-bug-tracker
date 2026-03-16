export type ProjectKey =
  | 'yanc_website'
  | 'yanc_cote'
  | 'yanc_cms'
  | 'yanc_mentor_mentee';

export interface ProjectTables {
  issues: string;
  backlog: string;
}

export interface ProjectConfig {
  key: ProjectKey;
  label: string;
  tables: ProjectTables;
}

export const PROJECTS: ProjectConfig[] = [
  {
    key: 'yanc_website',
    label: 'YANC-Website',
    tables: {
      // Use existing base tables so we don’t break current data
      issues: 'issues',
      backlog: 'backlog_items',
    },
  },
  {
    key: 'yanc_cote',
    label: 'YANC-CoTE',
    tables: {
      issues: 'issues_yanc_cote',
      backlog: 'backlog_items_yanc_cote',
    },
  },
  {
    key: 'yanc_cms',
    label: 'YANC-CMS',
    tables: {
      issues: 'issues_yanc_cms',
      backlog: 'backlog_items_yanc_cms',
    },
  },
  {
    key: 'yanc_mentor_mentee',
    label: 'YANC-Mentor-Mentee',
    tables: {
      issues: 'issues_yanc_mentor_mentee',
      backlog: 'backlog_items_yanc_mentor_mentee',
    },
  },
];

export const DEFAULT_PROJECT_KEY: ProjectKey = 'yanc_website';

export function getProjectByKey(key: string | null | undefined): ProjectConfig {
  const found = PROJECTS.find(p => p.key === key);
  return found ?? PROJECTS[0];
}

