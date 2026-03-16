import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { IssueProvider } from "@/context/IssueContext";
import { BacklogProvider } from "@/context/BacklogContext";
import { ProjectProvider } from "@/context/ProjectContext";
import { AppSidebar } from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import Status from "./pages/Status";
import NotFound from "./pages/NotFound";
import Backlog from "./pages/Backlog";
import Login from "./pages/Login";
import { useProject } from "@/context/ProjectContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
);

export default App;

function AppContent() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const { initialized } = useProject();

  if (!initialized && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // Login route: no sidebar / mobile header, just the login page
  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <MobileHeader onOpen={() => setMobileOpen(true)} />
      <AppSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 min-w-0 overflow-auto pt-16 md:pt-0">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/backlog" element={<Backlog />} />
          <Route path="/status" element={<Status />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
