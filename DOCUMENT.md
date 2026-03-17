# YANC Bug Tracker – Project Documentation

## 1. High-level overview

YANC Bug Tracker is a React + TypeScript single-page application (SPA) built with Vite and Tailwind (via shadcn/ui). It is a multi-project bug tracking system backed by Supabase, with:

- Authentication-like **project selection** on a dedicated login screen.
- A shared UI for:
  - Dashboard (high-level metrics + charts).
  - Issues (submit, list, update status/assignee, delete).
  - Backlog (submit, list, update status/version, delete).
- A project-aware service layer so each project reads/writes its **own Supabase tables**.
- A React Query client for future data-fetching integration (currently used mainly as an app shell).

Supabase provides:

- Separate `issues_*` and `backlog_items_*` tables per project.
- RLS policies, open for `anon` and `authenticated` roles in a dev-style environment.
- A shared `set_updated_at()` trigger to keep `updated_at` timestamps in sync.

The app is structured to let you add new projects by:

1. Adding an entry to `src/config/projects.ts`.
2. Creating the corresponding `issues_*` and `backlog_items_*` tables in Supabase.

## 2. Tech stack

- **Language**: TypeScript
- **Framework**: React 18
- **Build tool**: Vite
- **Routing**: `react-router-dom` v6
- **State / data**:
  - React Query (`@tanstack/react-query`) for global query client.
  - Custom React contexts (`IssueContext`, `BacklogContext`, `ProjectContext`) for app data.
- **UI**:
  - Tailwind CSS
  - shadcn/ui components (Radix-based primitives) in `src/components/ui`
  - Framer Motion for animations
  - Lucide React icons
- **Backend**: Supabase (Postgres + RLS + `@supabase/supabase-js`)
- **Testing**: Vitest + Testing Library (set up in `src/test`)

## 3. Project structure

Top-level layout (important entries only):

```text
/
├─ package.json               # Scripts & dependencies
├─ vite.config.ts             # Vite configuration
├─ tailwind.config.ts         # Tailwind theme & tokens
├─ index.html                 # App shell, runtime-config loader, main.tsx entry
├─ Dockerfile, docker-entrypoint.sh, nginx.conf  # Container / deploy setup
├─ README.md / README-GCP.md  # Existing README & GCP info
├─ supabase/
│  ├─ create_issues_table.sql             # Base issues table schema (YANC Website)
│  ├─ create_backlog_items_table.sql      # Base backlog table schema
│  └─ migrations/
│     └─ create_multi_project_tables.sql  # Multi-project issues/backlog tables
└─ src/
   ├─ main.tsx              # React root render
   ├─ App.tsx               # App shell, routing, providers
   ├─ App.css               # Global app-specific styles
   ├─ index.css             # Tailwind/base CSS & design tokens
   ├─ config/
   │  ├─ app.ts             # Product-level constants (e.g., PRODUCT_VERSION_YEAR)
   │  └─ projects.ts        # Multi-project configuration
   ├─ context/
   │  ├─ IssueContext.tsx   # Issues data context
   │  ├─ BacklogContext.tsx # Backlog data context
   │  └─ ProjectContext.tsx # Selected project context
   ├─ lib/
   │  ├─ supabase.ts        # Lazy Supabase client initialization
   │  └─ utils.ts           # General utilities (cn, etc.)
   ├─ types/
   │  ├─ issue.ts           # Issue domain types & enums
   │  └─ backlog.ts         # Backlog domain types & enums
   ├─ services/
   │  ├─ issueService.ts    # Project-aware Supabase calls for issues
   │  └─ backlogService.ts  # Project-aware Supabase calls for backlog
   ├─ pages/
   │  ├─ Login.tsx          # Project selection + password "login" screen
   │  ├─ Dashboard.tsx      # Dashboard entry
   │  ├─ Issues.tsx         # Issues page
   │  ├─ Backlog.tsx        # Backlog page
   │  ├─ Status.tsx         # Static status definitions page
   │  ├─ NotFound.tsx       # 404 page
   │  └─ Index.tsx          # (If used) landing or legacy entry
   ├─ components/
   │  ├─ Sidebar.tsx        # App sidebar navigation + project label/logout
   │  ├─ MobileHeader.tsx   # Mobile top bar to open sidebar
   │  ├─ IssueTable.tsx     # Issues table & mobile cards, editing & deletion
   │  ├─ IssueModal.tsx     # Submit Issue form modal
   │  ├─ BacklogTable.tsx   # Backlog table & mobile cards, edit/delete
   │  ├─ BacklogModal.tsx   # Submit/Edit Backlog form modal
   │  ├─ DashboardCards.tsx # Metric cards
   │  ├─ Charts.tsx         # Charts for issues/device/etc.
   │  ├─ StatusBadge.tsx    # Status & severity badges
   │  └─ ui/                # shadcn/ui primitives (Button, Input, Dialog, etc.)
   └─ test/
      ├─ setup.ts           # Vitest / RTL setup
      └─ example.test.ts    # Example unit test
```

## 4. Configuration and environment

### 4.1. How multi-project switching actually works

It is very important to understand that **changing the project does NOT change the React interface** – it only changes **which Supabase tables the shared UI reads/writes**.

The flow is:

1. **User selects a project on the Login page**

   - `src/pages/Login.tsx`:

     ```ts
     const { setProjectKey } = useProject();

     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       // password check omitted for brevity
       setProjectKey(selectedKey);   // e.g. 'yanc_website', 'yanc_cote', ...
       navigate('/');
     };
     ```

2. **`setProjectKey` stores the project config**

   - `src/context/ProjectContext.tsx`:

     ```ts
     const [project, setProject] = useState<ProjectConfig>(...);
     const [initialized, setInitialized] = useState<boolean>(...);

     const setProjectKey = useCallback((key: ProjectKey) => {
       const found = PROJECTS.find(p => p.key === key);
       if (found) {
         setProject(found);        // <- stores label + tables
         setInitialized(true);
         localStorage.setItem('yanc.selectedProjectKey', key);
         localStorage.setItem('yanc.projectInitialized', '1');
       }
     }, []);
     ```

   - Each `ProjectConfig` in `src/config/projects.ts` contains **table names**:

     ```ts
     {
       key: 'yanc_website',
       label: 'YANC-Website',
       tables: {
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
     }
     // ...
     ```

3. **IssueContext and BacklogContext use the active project tables**

   - `IssueContext`:

     ```ts
     const { project } = useProject();

     const load = useCallback(async () => {
       setLoading(true);
       setIssues([]);
       const data = await issueService.fetchIssues(project.tables.issues);
       setIssues(data);
       setLoading(false);
     }, [project.tables.issues]);

     const addIssue = useCallback(async (data: ...) => {
       const created = await issueService.createIssue(project.tables.issues, { ...data, status: data.status ?? 'Open' });
       setIssues(prev => [created, ...prev]);
     }, [project.tables.issues]);

     const deleteIssue = useCallback(async (id: string) => {
       await issueService.deleteIssue(project.tables.issues, id);
       setIssues(prev => prev.filter(i => i.id !== id));
     }, [project.tables.issues]);
     ```

   - `BacklogContext` uses `project.tables.backlog` in exactly the same way.

   - Whenever the user picks a different project on Login (or logs out and selects a new one), `project.tables.issues` and `project.tables.backlog` **change**, so the contexts automatically reload from the new tables.

4. **Services are table-name aware**

   - `src/services/issueService.ts`:

     ```ts
     export const fetchIssues = async (tableName: string): Promise<Issue[]> => {
       const client = await getSupabase();
       const { data } = await client
         .from<DbIssue>(tableName)    // <- tableName is dynamic
         .select('*')
         .order('created_at', { ascending: false });
       return (data ?? []).map(mapDbToIssue);
     };
     ```

   - `createIssue`, `updateIssue`, `deleteIssue` (and all backlog service functions) follow the same pattern: they accept `tableName` and never hard-code `'issues'` or `'backlog_items'`.

5. **The UI is shared**

   - Pages like `Issues.tsx`, `Backlog.tsx`, `Dashboard.tsx` and components like `IssueTable`, `BacklogTable`, `DashboardCards` only ever call `useIssues()` / `useBacklog()`.
   - They do **not** know which project is active or which table is being used.
   - Because the contexts are wired to `project.tables.*`, a single UI code path provides interfaces for all projects; only the **data source** changes when you switch the project.

In summary:

- **Changing the project** at login picks a different `ProjectConfig` (label + tables).
- Contexts then use the new `tables.issues`/`tables.backlog` when talking to Supabase.
- The React UI remains the same; **only the backend tables change**, which is exactly what allows multi-project behavior without duplicating interfaces.

### 4.2. Supabase configuration

Supabase URL and anon key are loaded via:

- `import.meta.env.VITE_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_ANON_KEY`

and optionally from a `runtime-config.js` injected before `main.tsx` in `index.html`:

```html
<!-- Runtime config (generated by host) -->
<script src="/runtime-config.js"></script>
<script type="module" src="/src/main.tsx"></script>
```

`src/lib/supabase.ts`:

- Reads build-time envs first.
- Falls back to `window.__RUNTIME_SUPABASE_URL` / `window.__RUNTIME_SUPABASE_ANON_KEY` if present.
- Lazily initializes a single Supabase client (with retries) and caches it on `window.__SUPABASE_CLIENT__`.

### 4.2. Project configuration

`src/config/projects.ts`:

- Defines the available projects:

  ```ts
  export type ProjectKey = 'yanc_website' | 'yanc_cote' | 'yanc_cms' | 'yanc_mentor_mentee';

  export interface ProjectConfig {
    key: ProjectKey;
    label: string;
    tables: { issues: string; backlog: string };
  }

  export const PROJECTS: ProjectConfig[] = [
    {
      key: 'yanc_website',
      label: 'YANC-Website',
      tables: {
        issues: 'issues',           // base issues table
        backlog: 'backlog_items',   // base backlog table
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
  ```

- `DEFAULT_PROJECT_KEY` is `yanc_website`, mapping to the base tables `issues` and `backlog_items`.

To add a new project:

1. Add a new key/label/tables mapping to `PROJECTS`.
2. Create the corresponding tables in Supabase (copy schema from `create_multi_project_tables.sql` or base scripts).

## 5. Contexts and global state

### 5.1. ProjectContext

`src/context/ProjectContext.tsx`:

- Holds the **currently selected project** and whether the user has gone through project selection:

  ```ts
  interface ProjectContextValue {
    project: ProjectConfig;
    setProjectKey: (key: ProjectKey) => void;
    initialized: boolean;
    resetProject: () => void;
  }
  ```

- Persists `project.key` and `initialized` flag to `localStorage`:
  - `yanc.selectedProjectKey`
  - `yanc.projectInitialized`
- `setProjectKey`:
  - Looks up the config.
  - Updates `project` state and sets `initialized = true`.
  - Writes to localStorage.
- `resetProject`:
  - Clears stored key and initialization flag.
  - Resets to default project.

Usage:

- `ProjectProvider` wraps the whole app in `App.tsx`.
- `useProject()` returns `{ project, setProjectKey, initialized, resetProject }`.

### 5.2. IssueContext

`src/context/IssueContext.tsx`:

- Manages issues for the **currently selected project**:

  ```ts
  interface IssueContextType {
    issues: Issue[];
    loading: boolean;
    addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateIssue: (id: string, updates: Partial<Issue>) => Promise<void>;
    deleteIssue: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
  }
  ```

- On mount and whenever `project.tables.issues` changes:
  - Clears `issues` to avoid flashing data from another project.
  - Calls `issueService.fetchIssues(project.tables.issues)`.

- `addIssue`:
  - Calls `issueService.createIssue(project.tables.issues, dataWithStatus)`.
  - Prepends the created issue to the list and shows a toast.

- `updateIssue`:
  - Calls `issueService.updateIssue(project.tables.issues, id, updates)`.
  - Replaces the updated issue in the list.

- `deleteIssue`:
  - Calls `issueService.deleteIssue(project.tables.issues, id)`.
  - Filters it out of the list and shows a toast.

Use `useIssues()` in components like `IssueTable`, `DashboardCards` and others needing issue data.

### 5.3. BacklogContext

`src/context/BacklogContext.tsx`:

- Mirrors `IssueContext` but for backlog items:

  ```ts
  interface BacklogContextType {
    items: BacklogItem[];
    loading: boolean;
    addItem: (input: Omit<BacklogItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateItem: (id: string, updates: Partial<BacklogItem>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    refetch: () => Promise<void>;
  }
  ```

- Uses `project.tables.backlog` for table name.
- Loads items on mount and when project changes, clearing previous items first.
- `addItem`, `updateItem`, `deleteItem` delegate to `backlogService` and update local state with toasts.

Use `useBacklog()` in `BacklogTable` and `BacklogModal`.

## 6. Services (Supabase access)

### 6.1. issueService

`src/services/issueService.ts`:

- Defines `DbIssue` matching the Supabase rows.
- Maps rows to `Issue` domain objects with:
  - Friendly defaults for display (`'—'`), enum-safe status/severity.
  - Conversion of schema fields: `issue_description`, `device`, `os`, etc.

Key functions (all now **project-aware via table name argument**):

- `fetchIssues(tableName: string): Promise<Issue[]>`
  - `client.from<DbIssue>(tableName).select('*').order('created_at', { ascending: false })`
  - Maps each row with `mapDbToIssue`.

- `createIssue(tableName: string, input: CreateIssueInput): Promise<Issue>`
  - Builds a short `title` from `issueDescription`.
  - Inserts into `tableName` and returns mapped `Issue`.

- `updateIssue(tableName: string, id: string, updates: Partial<Issue>): Promise<Issue>`
  - Constructs a partial payload mapping domain fields → DB columns.
  - `update(...).eq('id', id).select().single()`.

- `deleteIssue(tableName: string, id: string): Promise<void>`
  - Deletes by id from the given table.

### 6.2. backlogService

`src/services/backlogService.ts`:

- Similar to `issueService` but for `BacklogItem`.

Main functions:

- `fetchBacklogItems(tableName: string)`
- `createBacklogItem(tableName: string, input: CreateBacklogInput)`
- `updateBacklogItem(tableName: string, id: string, updates: UpdateBacklogInput)`
- `deleteBacklogItem(tableName: string, id: string)`

All functions accept `tableName` so they work with any project’s backlog table.

## 7. Pages

### 7.1. App shell and routing (`App.tsx`)

- Wraps the app with providers:

  ```tsx
  <QueryClientProvider>
    <TooltipProvider>
      <Sonner />
      <ProjectProvider>
        <IssueProvider>
          <BacklogProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </BacklogProvider>
        </IssueProvider>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
  ```

- `AppContent`:
  - Reads `initialized` from `ProjectContext`.
  - If not initialized and not on `/login`, redirects to `/login`.
  - For `/login`, renders only the login routes (no sidebar/header).
  - For other routes, renders:
    - `MobileHeader` (mobile nav toggle).
    - `AppSidebar`.
    - `<Routes>` for:
      - `/` → `Dashboard`
      - `/issues` → `Issues`
      - `/backlog` → `Backlog`
      - `/status` → `Status`
      - `*` → `NotFound`

### 7.2. Login page (`pages/Login.tsx`)

Implements a full-screen split layout:

- **Left panel (desktop only, `md:flex`):**
  - Dark blue gradient background.
  - Logo + “Welcome to YANC Bug Tracker” heading.
  - Intro text about tracking/prioritizing issues.
  - Footer line with `© YEAR YANC • Bug Tracking Workspace`.

- **Right panel (always visible):**
  - On small screens, includes a compact “Welcome to YANC Bug Tracker” strip at the top.
  - Then:
    - Heading: “Select project”.
    - Helper text: “Choose which YANC workspace...”.
    - **Project** dropdown (bound to `selectedKey`, using `PROJECTS`).
    - **Password** field with eye icon toggle (`showPassword` state).
    - “Continue to workspace” button.

- On submit:
  - Validates password against project-specific expected values (demo-style auth).
  - Calls `setProjectKey(selectedKey)` and navigates to `/`.

### 7.3. Dashboard (`pages/Dashboard.tsx`)

- Renders:
  - `DashboardCards` – metrics derived from `useIssues()`.
  - `Charts` – visualizations (e.g., by type, device, status) based on issues.

Dashboard always reflects the **currently selected project** because it uses `IssueContext`.

### 7.4. Issues (`pages/Issues.tsx`)

- Local state for:
  - `modalOpen` – whether the submit Issue modal is open.
  - `search`, `filterStatus`, `sortKey`, `sortDir`.
- Renders:
  - Header with page title + “Submit Issue” button → opens `IssueModal`.
  - Search input and status filter dropdown.
  - `IssueTable` with props:
    - `search`, `filterStatus`, `sortKey`, `sortDir`, `onSort`.
  - `IssueModal` rendered via `AnimatePresence` when `modalOpen` is true.

### 7.5. Backlog (`pages/Backlog.tsx`)

- Similar to Issues page:
  - Local `modalOpen`, `search`, `filterStatus`, sorting.
  - `BacklogTable` and `BacklogModal`.

### 7.6. Status (`pages/Status.tsx`)

- Static documentation page describing the meaning of each issue status (To Do, Open, In Progress, Resolved, Reopen).

### 7.7. NotFound (`pages/NotFound.tsx`)

- Simple 404 page used for unmatched routes.

## 8. Components (high level)

### 8.1. Sidebar (`components/Sidebar.tsx`)

- Uses `useProject()` to get the current project.
- Renders:
  - Logo and app title (`BugTracker`).
  - For `md+` screens, a badge showing the current `project.label`.
  - Navigation links: Dashboard, Issues, Backlog, Status.
  - User section with “Admin User” and project label.
  - Logout button:
    - Calls `resetProject()` and navigates back to `/login`.

### 8.2. MobileHeader (`components/MobileHeader.tsx`)

- On mobile:
  - Fixed header with a menu button that toggles the sidebar open.

### 8.3. IssueModal (`components/IssueModal.tsx`)

- Full-screen/centered modal for creating a new issue.
- Fields include:
  - Issue Type, Description, Expected Result, Steps to Reproduce.
  - Version (composed from `PRODUCT_VERSION_YEAR` + `MM.DD` suffix).
  - Device, OS, Browser (with “Other” + `otherBrowser`).
  - Reporter, date (reportedAt), severity, assignedTo.
- Validation: ensures all required fields are filled and version suffix is a valid `MM.DD`.
- On submit:
  - Calls `addIssue` from `IssueContext`.
  - Shows success toast; closes on success.

### 8.4. IssueTable (`components/IssueTable.tsx`)

Responsibilities:

- Displays a responsive issues list:
  - Desktop: table with many columns (Type, Description, Expected, Steps, Reporter, Version, Device, OS, Browser, Severity, Status, Assignee, Reported, Actions).
  - Mobile: card list with key information.
- Sorting, filtering and search (driven by props).
- Status dropdown:
  - Inline status chip with dropdown for quick status changes (desktop).
  - Mobile bottom sheet for status changes.
- Assignee dropdown:
  - Inline dropdown with “Unassigned”, “Ram Charan”, “Sunoy Roy”.
- Detail overlay (mobile):
  - Shows full issue details and allows status/assignee changes and delete.
- Delete behavior:
  - Desktop Actions + mobile card + mobile detail overlay all:
    - Ask `window.confirm` before deleting.
    - Call `deleteIssue(id)` from `IssueContext`.

### 8.5. BacklogModal / BacklogTable

- `BacklogModal`:
  - Fields: Title, Description, Reporter, Priority (High/Medium/Low), Status, Version (using `PRODUCT_VERSION_YEAR` suffix or free-form).
  - Used for both create and edit (when `initial` props are passed).

- `BacklogTable`:
  - Similar desktop/mobile dual layout.
  - Shows Title, Description, Reporter, Priority, Status, Version, Created, Actions.
  - Status dropdown (with backlog statuses: To do, In progress, Done, Deferred).
  - Edit opens `BacklogModal`; delete asks for confirmation and calls `deleteItem`.

### 8.6. DashboardCards / Charts

- `DashboardCards`:
  - Uses `useIssues()` to compute counts:
    - Total, Open, In Progress, Resolved, Reopen, To Do.
  - Animated numbers and gradient cards.

- `Charts`:
  - Visualizations of issues by status, type, device, etc.

## 9. Types

### 9.1. Issue types (`types/issue.ts`)

- Defines:
  - Union types: `Severity`, `Status`, `IssueType`, `Device`, `OS`, `Browser`.
  - `Issue` interface – the canonical in-app representation.
  - `STATUSES`, `SEVERITIES`, `ISSUE_TYPES`, `DEVICES`, `OS_OPTIONS`, `BROWSERS`, etc.

### 9.2. Backlog types (`types/backlog.ts`)

- Defines:

  ```ts
  export type BacklogPriority = 'High' | 'Medium' | 'Low';
  export type BacklogStatus = 'To do' | 'In progress' | 'Done' | 'Deferred';

  export interface BacklogItem {
    id: string;
    title: string;
    description: string;
    reporter: string;
    priority: BacklogPriority;
    status: BacklogStatus;
    version: string | null;
    created_at: string;
    updated_at: string;
  }
  ```

## 10. Supabase schema (multi-project)

`supabase/create_issues_table.sql` and `create_backlog_items_table.sql` define the **base** tables:

- `public.issues`
- `public.backlog_items`

`supabase/migrations/create_multi_project_tables.sql` creates the project-specific tables:

- Issues:
  - `issues_yanc_website`
  - `issues_yanc_cote` (+ `title` column)
  - `issues_yanc_cms` (+ `title` column)
  - `issues_yanc_mentor_mentee` (+ `title` column)

- Backlog:
  - `backlog_items_yanc_website`
  - `backlog_items_yanc_cote`
  - `backlog_items_yanc_cms`
  - `backlog_items_yanc_mentor_mentee`

All issue tables share the same schema (id, issue_type, issue_description, expected_result, steps_to_reproduce, version, device, os, browser, other_browser, reporter, reported_at, severity, status, assigned_to, created_at, updated_at, and in some cases `title`).

All backlog tables share: id, title, description, reporter, priority, status, version, created_at, updated_at.

Each table:

- Enables RLS.
- Has a policy allowing all operations for `anon` and `authenticated` (dev-style openness).
- Attaches `set_updated_at()` trigger.

## 11. How to extend or work on this codebase as a new dev

1. **Run the app locally**
   - Ensure `.env` or `runtime-config.js` has valid Supabase URL and anon key.
   - `npm install`
   - `npm run dev`
   - Visit `/login`, choose a project (e.g. YANC-Website), enter its configured password, and proceed.

2. **Add a new project**
   - Update `src/config/projects.ts` with a new `ProjectConfig`.
   - Create `issues_<new>` and `backlog_items_<new>` tables in Supabase using existing schemas.
   - The UI will automatically pick up the new project option via the dropdown.

3. **Change issue/backlog behavior**
   - For data flow: edit `issueService.ts` / `backlogService.ts` + corresponding contexts.
   - For UI: adjust `IssueModal`, `IssueTable`, `BacklogModal`, `BacklogTable`.

4. **Adjust Supabase mappings**
   - Keep `DbIssue` / `BacklogItem` aligned with Supabase columns.
   - Any schema change in Supabase must be reflected in:
     - The `DbIssue`/`DbBacklogItem` types in services.
     - Mapping functions and possibly in `Issue` / `BacklogItem` types.

5. **Styling / theming**
   - Tailwind base tokens in `tailwind.config.ts` + `index.css`.
   - Most layout styling is via Tailwind utility classes in JSX.
   - shadcn/ui components live under `src/components/ui` and are theme-aware via CSS variables.

6. **Where to look for bugs**
   - Blank/white screen: check Vite terminal for SWC/errors; most often JSX syntax.
   - Supabase errors:
     - HTTP 400/42501 → missing columns, RLS, or misnamed tables – check SQL migrations and `PROJECTS` mapping.
   - Data not updating when switching projects:
     - Confirm `project.tables.*` is correct in `projects.ts`.
     - Confirm contexts are re-running `load()` on project change (they are keyed by `project.tables.*`).

This document should give a new developer enough structure and file-by-file orientation to extend the YANC Bug Tracker, add new projects, tweak UI/UX, or adjust Supabase schemas without needing prior context.

