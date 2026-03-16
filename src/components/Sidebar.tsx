import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bug, ListTodo, BarChart3, Zap, PanelLeftClose, PanelLeft, User, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { motion, AnimatePresence } from 'framer-motion';

const mainNav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/issues', label: 'Issues', icon: Bug },
  { to: '/backlog', label: 'Backlog', icon: ListTodo },
];

// Secondary nav temporarily disabled — may be re-enabled later
const secondaryNav = [
  {
    to: '/status',
    label: 'Status',
    icon: BarChart3,
    description:
      'To Do — Issue recorded in the backlog or planned work; not yet started. ' +
      'Open — Issue confirmed and available for assignment or scheduling. ' +
      'In Progress — Someone is actively working on the issue. ' +
      'Resolved — A fix or mitigation has been implemented; awaiting verification or deployment. ' +
      'Reopen — Previously resolved but reopened because the problem persists or the fix failed verification.',
  },
];

export function AppSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean; setMobileOpen: (v: boolean) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { project, resetProject } = useProject();

  const isActive = (path: string) => location.pathname === path;

  const renderNavItem = (item: { to: string; label: string; icon: React.ElementType; description?: string }) => (
    <NavLink
      key={item.label}
      to={item.to}
      end
      onClick={() => setMobileOpen(false)}
      className="group relative flex items-center gap-3 rounded-xl transition-all duration-200"
      title={item.description}
    >
      {({ isActive: active }) => (
        <div className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${
          active
            ? 'bg-sidebar-primary/15 text-sidebar-primary'
            : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-accent-foreground'
        } ${collapsed ? 'justify-center' : ''}`}>
          <item.icon size={19} className={`shrink-0 transition-colors ${active ? 'text-sidebar-primary' : ''}`} />
          {!collapsed && (
            <span className="text-sm font-medium truncate">{item.label}</span>
          )}
          {active && !collapsed && (
            <motion.div
              layoutId="sidebar-indicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-sidebar-primary"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
        </div>
      )}
    </NavLink>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + project label */}
      <div className={`flex items-center gap-3 px-5 py-5 ${collapsed ? 'justify-center px-3' : ''}`}>
        <img
          src="/favicon2.png"
          alt="BugTracker"
          className="w-9 h-9 rounded-xl object-cover shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/favicon.png';
          }}
        />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[15px] font-bold text-sidebar-accent-foreground tracking-tight truncate"
            >
              BugTracker
            </motion.span>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-sidebar-accent/20 text-[11px] text-sidebar-accent-foreground truncate max-w-[180px]">
                {project.label}
              </span>
            </div>
          </div>
        )}
        {/* Mobile close button */}
        <div className="ml-auto md:hidden">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-1">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
              Main
            </p>
          )}
          {mainNav.map(renderNavItem)}
        </div>

        <div className="my-4 mx-3 border-t border-sidebar-border" />

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted">
              FAQ & Help
            </p>
          )}
          {secondaryNav.map(renderNavItem)}
        </div>
      </nav>

      {/* User / logout section */}
      <div className="border-t border-sidebar-border p-3">
        <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-hover transition-colors ${collapsed ? 'justify-center px-0' : ''}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
                <User size={15} className="text-sidebar-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground">User</p>
                <p className="text-[11px] text-sidebar-muted break-words">Project: {project.label}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              resetProject();
              navigate('/login');
            }}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-accent-foreground"
            aria-label="Log out to project selection"
          >
            <LogOut size={12} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Collapse toggle - desktop only */}
      <div className="hidden md:block border-t border-sidebar-border p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-xl text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-accent-foreground transition-all duration-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-auto h-screen bg-sidebar transition-all duration-300 ease-in-out border-r border-sidebar-border ${
          collapsed ? 'w-[72px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
