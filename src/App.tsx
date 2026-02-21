import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { IssueProvider } from "@/context/IssueContext";
import { AppSidebar } from "@/components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Issues from "./pages/Issues";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <IssueProvider>
        <BrowserRouter>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 min-w-0 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/issues" element={<Issues />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </IssueProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
