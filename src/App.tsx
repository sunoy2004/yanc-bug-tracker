import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { IssueProvider } from "@/context/IssueContext";
import { AppSidebar } from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import Status from "./pages/Status";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <IssueProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </IssueProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

function AppContent() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <MobileHeader onOpen={() => setMobileOpen(true)} />
      <AppSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 min-w-0 overflow-auto pt-16 md:pt-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/status" element={<Status />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
